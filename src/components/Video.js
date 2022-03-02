import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { MediaStream, RTCView } from 'react-native-webrtc';
import Button from './Button';

function ButtonContainer(props) {
    return <View style={{ flexDirection: 'row', bottom: 30 }}>
        <Button iconName="call" backgroundColor='red' onPress={() => props.hangup()} />
    </View>

}
export default function Video(props) {

    //on call we will just display the local stream
    if (props.localStream && !props.remoteStream) {
        return <View style={styles.container}>
            <RTCView streamURL={props.localStream.toURL()} objectFit={'cover'} style={styles.video} />
            <ButtonContainer hangup={() => props.hangup()} />
        </View>
    }
    //once the call is connected we will display
    // local stream on top of remote stream
    if (props.localStream && props.remoteStream) {
        return <View style={styles.container}>
            <RTCView streamURL={props.remoteStream.toURL()} objectFit={'cover'} style={styles.video} />
            <RTCView streamURL={props.localStream.toURL()} objectFit={'cover'} style={styles.videoLocal} />
            <ButtonContainer hangup={() => props.hangup()} />
        </View>
    }
    return (
        <ButtonContainer hangup={props.hangup} />
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        flex: 1,
        alignItems: 'center'
    },
    video: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    videoLocal: {
        position: 'absolute',
        width: 100,
        height: 150,
        top: 20,
        left: 20,
        elevation: 10
    },

})