import { StatusBar, StyleSheet, Text, View,TextInput,TouchableOpacity } from 'react-native'
import React,{useState} from 'react'

import firestore from '@react-native-firebase/firestore'
export default function RegisterScreen({navigation}) {
  const [name,setName]=useState('');
  var RandomNumber = Math.floor(Math.random() * 100) + 1 ;
  const registerUser=async()=>{
    if (!name) {
      alert('Please Add Fields..!!')
      return;
    }
    try {
      firestore().collection('users').doc(name).set({
        id:RandomNumber,
        name: name,
        isRequested:false
      }).then((nav)=>navigation.navigate('ConnectUserScreen',{regUserId:RandomNumber,regUserName:name}))
  
    }
    catch (error) {
      console.log(error)
      alert('something went wrong..!!!')
    }
  }
  return (
    <View style={{alignItems:'center',justifyContent:'center',flex:1}}>
      <StatusBar backgroundColor={'#9c60a2'}/>
      <TextInput
        style={styles.input}
        placeholder='Register your Name'
        onChangeText={(value) => setName(value)}
      />
      <TouchableOpacity style={{ width: 250, backgroundColor: '#9c60a2', height: 40, marginBottom: 10, marginTop: 15, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }} onPress={registerUser}>
        <Text style={[{ marginLeft: 10, color: '#fff', fontSize: 17, fontWeight: '700', }]}>Register User</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    width: 300,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 5,
}
})