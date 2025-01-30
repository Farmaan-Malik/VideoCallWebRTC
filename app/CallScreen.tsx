// @ts-nocheck
import "../global.css";

import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Button, AppState, Platform, FlatList, Alert, Text, KeyboardAvoidingView, SafeAreaView } from "react-native";
import { useVideoPlayer, VideoView } from 'expo-video';

import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
    startIOSPIP,
    stopIOSPIP,
    RTCPIPView,
} from "react-native-webrtc";
import { db } from "@/firebase";
import {
    addDoc,
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    deleteField,
    deleteDoc,
    Timestamp,
    query,
    orderBy,
} from "firebase/firestore";
import CallActionBox from "@/app/CallActionBox";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomTextInput from "@/components/CustomTextInput";
import MessageBubble from "@/components/MessageBubble";

const configuration = {
    iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
    ],
    iceCandidatePoolSize: 10,
};
export default function CallScreen({ screens, setScreen }) {
    const ExpoPip = Platform.OS === 'android' ? require('expo-pip') : null;
    const { roomId } = useLocalSearchParams()
    console.log(roomId)
    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [cachedLocalPC, setCachedLocalPC] = useState();
    const [isChatVisible, setChatVisible] = useState(false)
    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);
    const [newPipMode, setNewPipMode] = useState(false);
    const [automaticEnterEnabled, setAutomaticEnterEnabled] = useState(false);
    const view = useRef()
    const [appState, setAppState] = useState(AppState.currentState);
    const [textMessage, setTextMessage] = useState('')
    const [messages, setMessages] = useState([])
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const docRef = doc(db, 'room', roomId)
        const messageRef = collection(docRef, 'messages')
        const q = query(messageRef, orderBy('createdAt', 'asc'))
        const unsub = onSnapshot(q, (snapshot) => {
            let allMessages = snapshot.docs.map(doc => {
                console.log("MessageDoc: ", doc.data())
                return doc.data()
            })
            setMessages(() => [...allMessages])
            console.log("MessageArray: ", messages)

        })
        return unsub
    }, [])

    const handleAppStateChange = nextAppState => {
        if (nextAppState === 'active') {
            setNewPipMode(false);
            console.log('App has come to the foreground!');
        } else if (nextAppState === 'background') {
            setNewPipMode(true);
            console.log('App has gone to the background!');
            if (Platform.OS === 'android') {
                ExpoPip.enterPipMode({
                    seamlessResizeEnabled: true,
                    width: 3,
                    height: 4,
                    autoEnterEnabled: true,
                })
            } else {
                // startPIP()
            }
        }
        setAppState(nextAppState);
    };


    useEffect(() => {
        startLocalStream();
    }, []);

    useEffect(() => {
        if (localStream && roomId) {
            startCall(roomId);
        }
    }, [localStream]);

    const handleSendMessage = async () => {
        if (!textMessage) {
            return
        }
        try {
            const docRef = doc(db, "room", roomId);
            const messagesRef = collection(docRef, 'messages')
            const newDoc = await addDoc(messagesRef, {
                role: 'Host',
                text: textMessage,
                createdAt: Timestamp.fromDate(new Date())
            })
            console.log("Message: ", textMessage)

        } catch (err) {
            Alert.alert("Message:", err)
        }
    }

    //End call button
    async function endCall() {
        if (cachedLocalPC) {
            const senders = cachedLocalPC.getSenders();
            senders.forEach((sender) => {
                cachedLocalPC.removeTrack(sender);
            });
            cachedLocalPC.close();
        }

        const roomRef = doc(db, "room", roomId);
        // await updateDoc(roomRef, { answer: deleteField() });
        await deleteDoc(roomRef);
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                track.stop(); // This stops the track (audio or video)
            });
        }
        setLocalStream(null);
        setRemoteStream(null); // set remoteStream to null or empty when callee leaves the call
        setCachedLocalPC(null);
        // cleanup
        router.back()//go back to room screen
    }

    //start local webcam on your device
    const startLocalStream = async () => {
        // isFront will determine if the initial camera should face user or environment
        const isFront = true;
        const devices = await mediaDevices.enumerateDevices();

        const facing = isFront ? "front" : "environment";
        const videoSourceId = devices.find(
            (device) => device.kind === "videoinput" && device.facing === facing
        );
        const facingMode = isFront ? "user" : "environment";
        const constraints = {
            audio: true,
            video: {
                mandatory: {
                    minWidth: 500, // Provide your own width, height and frame rate here
                    minHeight: 300,
                    minFrameRate: 30,
                },
                facingMode,
                optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
        };
        const newStream = await mediaDevices.getUserMedia(constraints);
        setLocalStream(newStream);
    };

    const startCall = async (id) => {
        console.log("Starting call with id:", id);
        const localPC = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach((track) => {
            localPC.addTrack(track, localStream);
        });

        const roomRef = doc(db, "room", id);
        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

        localPC.addEventListener("icecandidate", (e) => {
            if (!e.candidate) {
                console.log("Got final candidate!");
                return;
            }
            addDoc(callerCandidatesCollection, e.candidate.toJSON());
        });

        localPC.ontrack = (e) => {
            const newStream = new MediaStream();
            e.streams[0].getTracks().forEach((track) => {
                newStream.addTrack(track);
            });
            setRemoteStream(newStream);
        };

        const offer = await localPC.createOffer();
        await localPC.setLocalDescription(offer);

        await setDoc(roomRef, { offer, connected: false, name: 'Farmaan' }, { merge: true });

        // Listen for remote answer
        onSnapshot(roomRef, (doc) => {
            if (!doc.exists()) {  // <- Ensure the document still exists
                console.log("Room document deleted. Stopping listener.");
                return;
            }
            const data = doc.data();
            if (!localPC.currentRemoteDescription && data.answer) {
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                localPC.setRemoteDescription(rtcSessionDescription);
            } else {
                setRemoteStream();
            }
        });

        // when answered, add candidate to peer connection
        onSnapshot(calleeCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    let data = change.doc.data();
                    localPC.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });

        setCachedLocalPC(localPC);
    };

    const switchCamera = () => {
        localStream.getVideoTracks().forEach((track) => track._switchCamera());
    };

    const toggleChat = () => {
        setChatVisible(!isChatVisible)
    }

    // Mutes the local's outgoing audio
    const toggleMute = () => {
        if (!remoteStream) {
            return;
        }
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };

    const toggleCamera = () => {
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsOffCam(!isOffCam);
        });
    };
    const startPIP = () => {
        startIOSPIP(view);
    };
    const stopPIP = () => {
        stopIOSPIP(view);
    };
    const stop = () => {
        console.log('stop');
        if (stream) {
            stream.release();
            setStream(null);
        }
    };
    let pipOptions = {
        startAutomatically: true,
        fallbackView: (<View style={{ height: 50, width: 50, backgroundColor: 'red' }} />),
        preferredSize: {
            width: 400,
            height: 800,
        }
    }
    return (
        <View className="flex-1">
            {!newPipMode ? (
                <>
                    {!isChatVisible ?
                        <>
                            {!remoteStream && (
                                <RTCView
                                    className="flex-1"
                                    style={{ height: "100%" }}
                                    streamURL={localStream && localStream.toURL()}
                                    objectFit={"cover"}
                                />
                            )}

                            {remoteStream && (
                                <>
                                    <RTCView
                                        className="flex-1"
                                        style={{ height: "100%" }}
                                        streamURL={remoteStream && remoteStream.toURL()}
                                        objectFit={"cover"}
                                    />
                                    {!isOffCam && (
                                        <RTCView
                                            style={{ width: 100, height: 150, position: 'absolute', top: 8, right: 10 }}
                                            streamURL={localStream && localStream.toURL()}
                                        />
                                    )}
                                </>
                            )}
                            <View style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 3 }}>
                                <CallActionBox
                                    switchCamera={switchCamera}
                                    toggleMute={toggleMute}
                                    toggleCamera={toggleCamera}
                                    endCall={endCall}
                                    toggleChat={toggleChat}
                                />
                            </View>
                        </> : 
                        <KeyboardAvoidingView behavior='padding' style={{ backgroundColor: 'white', flex: 1 }}>
                            <SafeAreaView style={{flex:1}} >

                            <Ionicons color={'grey'} onPress={() => toggleChat()} name='chevron-back-circle' size={30} style={{ width: '10%', alignItems: 'center', justifyContent: 'center', padding: 5, marginTop:8,marginBottom:8 }} />
                            <View style={{ flex: 1, backgroundColor: 'white' }}>
                                <FlatList data={messages} 
                                renderItem={({ item }) => (
                                    <MessageBubble msg={item.text} isSender={item.role == "Host"} name={"Patient"}/>
                                )} style={{ flex: 1 }} contentContainerStyle={{justifyContent: 'center' }} />
                            </View>
                            <CustomTextInput
                                containerStyle={{
                                    borderWidth: StyleSheet.hairlineWidth,
                                    // position: 'absolute',
                                    // bottom: '0',
                                    backgroundColor: 'white'
                                }}
                                style={{
                                    width: '90%',
                                    paddingStart: 10,
                                    // borderWidth: 1 ,
                                    height: '100%'
                                }}
                                icon={true}
                                iconName="send"
                                iconSize={25}
                                onIconClick={() => {
                                    handleSendMessage().then(() => setTextMessage(''))
                                    
                                }}
                                iconColor="tomato"
                                value={textMessage}
                                onChangeText={(value) => { setTextMessage(value) }}
                                placeholder="Type a message.." />
                                </SafeAreaView>
                        </KeyboardAvoidingView>}
                </>
            ) : <View style={{ flex: 1 }}>
                {Platform.OS === 'android' ?
                    <RTCView objectFit='cover' streamURL={remoteStream && remoteStream.toURL()} style={{ flex: 1 }} />
                    : <RTCPIPView ref={view} iosPIP={pipOptions} objectFit='cover' streamURL={remoteStream && remoteStream.toURL()} style={{ flex: 1 }} />}
            </View>
            }
        </View>
    )


}

const styles = StyleSheet.create({
    footer: {
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    }
})