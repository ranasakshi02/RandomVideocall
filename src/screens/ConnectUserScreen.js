import { StyleSheet, Text, View, StatusBar, ImageBackground, TouchableOpacity, LogBox } from 'react-native'
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'

import firestore from '@react-native-firebase/firestore';

LogBox.ignoreAllLogs()


export default function ConnectUserScreen({ route ,navigation}) {
  const { regUserName } = route.params;
  const { regUserId } = route.params;
  const [users, setUsers] = useState('')
  var tempUser = null;
  useEffect(() => {
    // getUsers()
    const userRef = firestore().collection('users').where('id', '!=', regUserId)
    const unsubscribe = userRef.onSnapshot((querySnap) => {
      const allUsers = querySnap.docs.map(docSnap =>
        docSnap.data())
      setUsers(allUsers)
    })
    return () => { unsubscribe() }

  }, [])
  console.log(users)

  const requestUser = async () => {
    await firestore().collection('users').where('id', '==', regUserId).get()
      .then(querySnap => {
        querySnap.forEach(doc => {
          doc.ref.update({
            isRequested: true
          })
        })
      }).then(() => alert("requested successfully..!"))
    console.log('upate', users)
  }

  const connectUser = () => {
    if (users) {
      for (i = 0; i < users.length;) {
        if (users[i].isRequested == true) {
          tempUser = users[i].id;
          console.log('connect with', tempUser);
          console.log('connect with', users[i].name);
          navigation.navigate('CallScreen',{callerId:regUserId,calleeId:tempUser})
          break;
        }
        i = i + 1;

      }


    }
    if (tempUser == null) {
      alert("Request User First")
    }

  }


  return (
    <View style={{ flex: 1,justifyContent:'center',alignItems:'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginRight: 10, marginLeft: 10 }}>Welcome {regUserName}..!</Text>
      <TouchableOpacity style={{ width: 170, backgroundColor: '#9c60a2', height: 40, marginBottom: 10, marginTop: 15, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }} onPress={requestUser}>
        <Text style={[{ marginLeft: 10, color: '#fff', fontSize: 17, fontWeight: '700', }]}>Request User</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ width: 170, backgroundColor: '#9c60a2', height: 40, marginBottom: 10, marginTop: 15, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }} onPress={connectUser}>
        <Text style={[{ marginLeft: 10, color: '#fff', fontSize: 17, fontWeight: '700', }]}>Connect User</Text>
      </TouchableOpacity>
    </View>
  )
}