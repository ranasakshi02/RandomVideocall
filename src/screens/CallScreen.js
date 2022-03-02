import { StyleSheet, Text, View, StatusBar, ImageBackground, TouchableOpacity, LogBox } from 'react-native'
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'

import firestore from '@react-native-firebase/firestore';
import { MediaStream, RTCIceCandidate, RTCPeerConnection, EventOnAddStream, RTCSessionDescription } from 'react-native-webrtc';
import GettingCall from '../components/GettingCall';
import Video from '../components/Video';
import Button from '../components/Button';
import Utils from '../Utils';
import Ionicons from 'react-native-vector-icons/Ionicons'
//LogBox.ignoreAllLogs()
const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

export default function CallScreen({route}) {
  const { regUserName } = route.params;
  const [users, setUsers] = useState('')
  useEffect(() => {
    // getUsers()
    const userRef = firestore().collection('users').where('name', '!=', regUserName)
     const unsubscribe = userRef.onSnapshot((querySnap) => {
         const allUsers = querySnap.docs.map(docSnap =>
             docSnap.data())
         setUsers(allUsers)
     })
     return () =>{unsubscribe()}
    
 }, [])
console.log(users)
  //webrtc constants
  const [localStream, setLocalStream] = useState(MediaStream | null)
  const [remoteStream, setRemoteStream] = useState(MediaStream | null)
  const [gettingCall, setGettingCall] = useState(false)
  const pc = useRef(RTCPeerConnection)
  const flagConnection = useRef(false);
  const connectedUser = useRef(null);
  var tempUser='';


  //webrtc code

  // useEffect(() => {
  //   const docId = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid
  //   const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');
  //   flagConnection.current = false;
  //   const subscribe = cRef.onSnapshot(snapshot => {
  //     const data = snapshot.data()
  //     //on answer start the call 
  //     if (pc.current && !pc.current.remoteDescription && data && data.answer) {
  //       pc.current.setRemoteDescription(new RTCSessionDescription(data.answer))
  //     }
  //     //if there is offer for chatId set the getting call flag
  //     if (data && data.offer && !flagConnection.current) {
  //       setGettingCall(true)
  //     }
  //   });
  //   //on delete of collection call hangup
  //   //the other side has clicked on hangup
  //   const subscribeDelete = cRef.collection('callee').onSnapshot(snapshot => {
  //     snapshot.docChanges().forEach(change => {
  //       if (change.type == 'removed') {
  //         hangup()
  //       }
  //     })
  //   })
  //   return () => {
  //     subscribe();
  //     subscribeDelete();
  //   }
  // }, [])
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
  // const create = async (receiverID) => {

  //   console.log('calling');
  //   flagConnection.current = true;
  //   //setup webrtc
  //   await setupwebrtc();
  //   //document for the call
  //   const otherUser = receiverID;
  //   connectedUser.current = otherUser;
  //   console.log(connectedUser)
  //   console.log("calling to->" + otherUser)

  //   const docId = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid
  //   const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');

  //   //exchange the ice candidates between the caller and callee
  //   collectIceCandidates(cRef, user.uid, 'callee');
  //   if (pc.current) {
  //     //create the offer for the call
  //     const offer = await pc.current.createOffer()
  //     pc.current.setLocalDescription(offer);
  //     const cWithOffer = {
  //       offer: {
  //         type: offer.type,
  //         sdp: offer.sdp
  //       }
  //     }
  //     cRef.set(cWithOffer)
  //   }

  // }

  // const join = async () => {
  //   console.log("joining the call")
  //   flagConnection.current = true;
  //   setGettingCall(false)
  //   const docId = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid
  //   const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');
  //   const offer = (await cRef.get()).data()?.offer;
  //   console.log('offer->', offer);
  //   if (offer) {
  //     //set webrtc
  //     await setupwebrtc();
  //     //exchange the ICE candidate  
  //     //check the parameter ,Its reversed since the joining part is callee 
  //     collectIceCandidates(cRef, 'callee', user.uid);
  //     if (pc.current) {
  //       pc.current.setRemoteDescription(new RTCSessionDescription(offer));
  //       //create the anser for the call 
  //       //update the doc with answer 
  //       const answer = await pc.current.createAnswer()
  //       pc.current.setLocalDescription(answer);
  //       const cWithAnswer = {
  //         answer: {
  //           type: answer.type,
  //           sdp: answer.sdp
  //         }
  //       };
  //       cRef.update(cWithAnswer);
  //     }
  //   }
  // }

  // const hangup = async () => {
  //   setGettingCall(false)
  //   //connecting.current = false;
  //   flagConnection.current = false;
  //   streamCleanUp();
  //   firebaseCleanUp();

  //   if (pc.current) {
  //     pc.current.close();
  //   }
  // }
  // //helper function
  // const streamCleanUp = async () => {
  //   if (localStream) {
  //     localStream.getTracks().forEach(t => t.stop());
  //     localStream.release();
  //   }
  //   setLocalStream(null);
  //   setRemoteStream(null);

  // }
  // const firebaseCleanUp = async () => {
  //   const docId = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid
  //   const cRef = firestore().collection('meet').doc(docId).collection("Calls").doc('callId');
  //   if (cRef) {
  //     const calleeCandidate = await cRef.collection('callee').get();
  //     calleeCandidate.forEach(async (candidate) => {
  //       await candidate.ref.delete()
  //     })
  //     const callerCandidate = await cRef.collection(user.uid).get();
  //     callerCandidate.forEach(async (candidate) => {
  //       await candidate.ref.delete()
  //     })
  //     cRef.delete();
  //   }
  // }

  // const collectIceCandidates = async (cRef, localName, remoteName) => {

  //   const candidateCollection = cRef.collection(localName)
  //   if (pc.current) {
  //     //on new ice candidate  add it to firestore
  //     pc.current.onicecandidate = (event) => {
  //       if (event.candidate) {
  //         candidateCollection.add(event.candidate)
  //       }
  //     };

  //   }
  //   //get  the ICE candidate added to firestore and update the local pc 
  //   cRef.collection(remoteName).onSnapshot(snapshot => {
  //     snapshot.docChanges().forEach((change) => {
  //       if (change.type == 'added') {
  //         const candidate = new RTCIceCandidate(change.doc.data());
  //         pc.current?.addIceCandidate(candidate)
  //       }
  //     })
  //   })
  // }


  // //display the getting call component
  // if (gettingCall) {
  //   return <GettingCall hangup={hangup} join={join} />
  // }
  // //displays local stream on calling
  // //display both local and reamote stream once call is connected
  // if (localStream) {
  //   return (
  //     <Video hangup={hangup}
  //       localStream={localStream}
  //       remoteStream={remoteStream} />
  //   )
  // }


  return (
    <View style={{flex:1}}>
      <Text style={{fontSize:18,fontWeight:'bold',color:'#000',marginRight:10,marginLeft:10}}>Welcome {regUserName}..!</Text>
      <View style={{flexDirection:'row',justifyContent:'space-around'}}>

        <TouchableOpacity style={{ width: 170, backgroundColor: '#9c60a2', height: 40, marginBottom: 10, marginTop: 15, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }} onPress={{}}>
          <Text style={[{ marginLeft: 10, color: '#fff', fontSize: 17, fontWeight: '700', }]}>Request User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 170, backgroundColor: '#9c60a2', height: 40, marginBottom: 10, marginTop: 15, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }} onPress={{}}>
          <Text style={[{ marginLeft: 10, color: '#fff', fontSize: 17, fontWeight: '700', }]}>Connect User</Text>
        </TouchableOpacity>
      </View>
      <View style={{backgroundColor:'#fff',justifyContent:'center',alignItems:'center',flex:1}}> 
        <Button  iconName={'videocam'} backgroundColor={'grey'} onPress={{}}/>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({})