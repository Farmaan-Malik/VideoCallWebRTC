// @ts-nocheck
import "../global.css";
import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";

import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
const CallActionBox = ({ switchCamera, toggleMute, toggleCamera, endCall,toggleChat }) => {
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const onToggleCamera = () => {
        toggleCamera();
        setIsCameraOn(!isCameraOn);
    };
    const onToggleMicrophone = () => {
        toggleMute();
        setIsMicOn(!isMicOn);
    };
    const onToggleChat = () => {
        toggleChat();
    };

    return (
        <LinearGradient colors={['tomato','#D84040']} start={{x:0,y:0}} end={{x:0,y:1}} style={[style.container,{backgroundColor:'#D84040'}]}
        //  className="border-2 border-gray-800 bg-gray-800 rounded-t-3xl p-5 pb-10 w-full flex-row justify-between"
         >
            <Pressable
            style={[style.pressable]}
                onPress={switchCamera}
                className="  p-3 rounded-full"
            >
                <Text>
                    <Ionicons name={'camera-reverse-outline'} size={35} color={"tomato"} />
                </Text>
            </Pressable>
            <Pressable
                        style={[style.pressable]}

                onPress={onToggleCamera}
                className="  p-3 rounded-full"
            >
                <Text>
                    <Ionicons
                        name={isCameraOn ? "videocam-outline" : "videocam-off-outline"}
                        size={35}
                        color={"tomato"}
                    />
                </Text>
            </Pressable>
            <Pressable
                        style={[style.pressable]}

                onPress={onToggleMicrophone}
                className="  p-3 rounded-full"
            >
                <Text>
                    <Ionicons name={isMicOn ? 'mic-outline' : "mic-off-outline"} size={35} color={"tomato"} />
                </Text>
            </Pressable>
            <Pressable
                        style={[style.pressable]}

                onPress={onToggleChat}
                className="  p-3 rounded-full"
            >
                <Text>
                    <Ionicons name={'chatbubbles-outline'} size={35} color={"tomato"} />
                </Text>
            </Pressable>
            <Pressable  style={{borderWidth:StyleSheet.hairlineWidth,borderColor:'white'}}
            onPress={endCall} className="bg-white p-3 rounded-full">
                <Text>
                <FontAwesome6 name="phone-slash" size={32} color="red" />
                {/* <Feather name="phone-off" size={35} color="red" /> */}
                    {/* <Ionicons name={'call'} size={35} color={"white"} /> */}
                </Text>
            </Pressable>
        </LinearGradient>
    );
};

export default CallActionBox;

const style = StyleSheet.create({
    container:{
        display:'flex',
        flexDirection:'row',
        width:'100%',
        backgroundColor:'tomato',
        justifyContent:'space-around',
        paddingVertical:15,
        borderRadius:20

        // alignItems:'center'
    },
    pressable:{
        backgroundColor:'white'
    }
})