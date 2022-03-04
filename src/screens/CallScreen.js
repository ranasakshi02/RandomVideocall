import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { MediaStream, RTCIceCandidate, RTCPeerConnection, EventOnAddStream, RTCSessionDescription } from 'react-native-webrtc';
import GettingCall from '../components/GettingCall';
import Video from '../components/Video';
import Button from '../components/Button';
import firestore from '@react-native-firebase/firestore';
import Utils from '../Utils';
const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };


export default function CallScreen({route,navigation}) {
     //webrtc constants
  const [localStream, setLocalStream] = useState(MediaStream | null)
  const [remoteStream, setRemoteStream] = useState(MediaStream | null)
  const [gettingCall, setGettingCall] = useState(false)
  const pc = useRef(RTCPeerConnection)
  const flagConnection = useRef(false);
  const connectedUser = useRef(null);

  const { callerId } = route.params;
  const { calleeId } = route.params;


  //webrtc code

  useEffect(() => {
    
    const docId = calleeId > callerId ? callerId + '-' + calleeId : calleeId + '-' + callerId
    
    const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');

    
    flagConnection.current = false;
    const subscribe = cRef.onSnapshot(snapshot => {
      const data = snapshot.data()
      //on answer start the call 
      console.log(docId)
      if (pc.current && !pc.current.remoteDescription && data && data.answer) {
        pc.current.setRemoteDescription(new RTCSessionDescription(data.answer))
      }
      //if there is offer for chatId set the getting call flag
      if (data && data.offer && !flagConnection.current) {
        setGettingCall(true)
      }
    });
    //on delete of collection call hangup
    //the other side has clicked on hangup
    const subscribeDelete = cRef.collection('callee').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type == 'removed') {
          hangup()
        }
      })
    })
    return () => {
      subscribe();
      subscribeDelete();
    }
  }, [])
  // set webrtc
  const setupwebrtc = async () => {
    pc.current = new RTCPeerConnection(configuration);
    //get the audio and video for call
    const stream = await Utils.getStream()
    console.log(stream)
    if (stream) {
      setLocalStream(stream);
      pc.current.addStream(stream);
    }
    //get the remote stream once it is available
    //let event=EventOnAddStream
    pc.current.onaddstream = (event) => {

      setRemoteStream(event.stream)
      //console.log("="+remoteStream)
    }

  };
  const create = async (receiver) => {
    if (calleeId) {
      console.log('calling');
      flagConnection.current = true;
      //setup webrtc
      await setupwebrtc();
      console.log(calleeId)
      console.log('reciever',receiver)
      //document for the call
      const otherUser = receiver;
      connectedUser.current = otherUser;
      console.log(connectedUser)
      console.log("calling to->" + otherUser)
      const docId = calleeId > callerId ? callerId + '-' + calleeId : calleeId + '-' + callerId
      const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');

      //exchange the ice candidates between the caller and callee
      collectIceCandidates(cRef,'caller','callee');
      if (pc.current) {
        //create the offer for the call
        const offer = await pc.current.createOffer()
        pc.current.setLocalDescription(offer);
        const cWithOffer = {
          offer: {
            type: offer.type,
            sdp: offer.sdp
          }
        }
        cRef.set(cWithOffer)
      }


    }
    else{
      alert("Connect User First")
    }
  }

  const join = async () => {
    console.log("joining the call")
    flagConnection.current = true;
    setGettingCall(false)
    const docId = calleeId > callerId ? callerId + '-' + calleeId : calleeId + '-' + callerId
    const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');
    const offer = (await cRef.get()).data()?.offer;
    console.log('offer->', offer);
    if (offer) {
      //set webrtc
      await setupwebrtc();
      //exchange the ICE candidate  
      //check the parameter ,Its reversed since the joining part is callee 
      collectIceCandidates(cRef,'callee','caller');
      if (pc.current) {
        pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        //create the anser for the call 
        //update the doc with answer 
        const answer = await pc.current.createAnswer()
        pc.current.setLocalDescription(answer);
        const cWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp
          }
        };
        cRef.update(cWithAnswer);
      }
    }
  }

  const hangup = async () => {
    setGettingCall(false)
    //connecting.current = false;
    flagConnection.current = false;
    streamCleanUp();
    firebaseCleanUp();
    resetUser();

    if (pc.current) {
      pc.current.close();
    }
  }
  //helper function
  const streamCleanUp = async () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream.release();
    }
    setLocalStream(null);
    setRemoteStream(null);

  }
  const firebaseCleanUp = async () => {
    
    const docId = calleeId > callerId ? callerId + '-' + calleeId : calleeId + '-' + callerId
    const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');
    if (cRef) {
      const calleeCandidate = await cRef.collection('callee').get();
      calleeCandidate.forEach(async (candidate) => {
        await candidate.ref.delete()
      })
      const callerCandidate = await cRef.collection('caller').get();
      callerCandidate.forEach(async (candidate) => {
        await candidate.ref.delete()
      })
      cRef.delete();
    }
  }

  const collectIceCandidates = async (cRef, localName, remoteName) => {

    const candidateCollection = cRef.collection(localName)
    if (pc.current) {
      //on new ice candidate  add it to firestore
      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          candidateCollection.add(event.candidate)
        }
      };

    }
    //get  the ICE candidate added to firestore and update the local pc 
    cRef.collection(remoteName).onSnapshot(snapshot => {
      snapshot.docChanges().forEach((change) => {
        if (change.type == 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current?.addIceCandidate(candidate)
        }
      })
    })
  }

const resetUser=async()=>{
  await firestore().collection('users').where('isRequested', '==', true).get()
      .then(querySnap => {
        querySnap.forEach(doc => {
          doc.ref.update({
            isRequested: false
          })
        })
      }).then(()=>navigation.popToTop())
}
  //display the getting call component
  if (gettingCall) {
    return <GettingCall hangup={hangup} join={join} />
  }
  //displays local stream on calling
  //display both local and reamote stream once call is connected
  if (localStream) {
    return (
      <Video hangup={hangup}
        localStream={localStream}
        remoteStream={remoteStream} />
    )
  }

  return (
    <View style={{ backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
    <Button iconName={'videocam'} backgroundColor={'grey'} onPress={() => create(calleeId)} />
  </View>
  )
}

