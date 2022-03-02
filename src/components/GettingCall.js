import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Button from './Button'

export default function GettingCall(props) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/caller2.jpg')} style={styles.image} />
      <View style={styles.bConainer}>
        <Button iconName='call'
          backgroundColor='green'
          onPress={props.join}
          style={{ marginRight: 30 }} />
          <Button iconName='call'
          backgroundColor='red'
          onPress={props.hangup}
          style={{ marginLeft: 30 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',

  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',

  },
  bConainer: {
    flexDirection:'row',
    bottom:30
  }
})