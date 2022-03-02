import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Button(props) {
  return (
    <View>
      <TouchableOpacity
      onPress={props.onPress}
      style={[
        {backgroundColor:props.backgroundColor},
        props.style,
        styles.button
      ]}
      >
        <Ionicons name={props.iconName} size={30} color={'#fff'}/>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
button:{
  width:60,
  height:60,
  padding:10,
  elevation:10,
  justifyContent:'center',
  alignItems:'center',
  borderRadius:100,

}

})