// @ts-nocheck

import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Button, View, FlatList } from "react-native";
import "../global.css";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
} from "react-native-webrtc";
import {
    addDoc,
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    deleteField,
    query,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import {db} from "@/firebase";
import CallActionBox from "./CallActionBox";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import CustomTextInput from "@/components/CustomTextInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import MessageBubble from "@/components/MessageBubble";
import { SafeAreaView } from "react-native-safe-area-context";

const configuration = {
    iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
    ],
    iceCandidatePoolSize: 10,
};

export default function JoinScreen() {
    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [cachedLocalPC, setCachedLocalPC] = useState();
    const {roomId} = useLocalSearchParams()
    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);
    const [messages,setMessages] = useState([])
    const [textMessage,setTextMessage] = useState('')
    const [isChatVisible,setChatVisible] = useState(false)
     const handleSendMessage = async () => {
            if (!textMessage) {
                return
            }
            try {
                console.log(roomId)
                const docRef = doc(db, "room", roomId);
                const messagesRef = collection(docRef, 'messages')
                const newDoc = await addDoc(messagesRef, {
                    role: 'Patient',
                    text: textMessage,
                    createdAt: Timestamp.fromDate(new Date()) 
                })
                console.log("Message: ", textMessage)
    
            } catch (err) {
                Alert.alert("Message:", err)
            }
        }
    
    //Automatically start stream
    useEffect(() => {
        startLocalStream();
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
    useEffect(() => {
        if (localStream) {
            joinCall(roomId);
        }
    }, [localStream]);

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
        await updateDoc(roomRef, { answer: deleteField(), connected: false });

        if (localStream) {
            localStream.getTracks().forEach((track) => {
                track.stop(); // This stops the track (audio or video)
            });
        }
        
        setLocalStream();
        setRemoteStream(); // set remoteStream to null or empty when callee leaves the call
        setCachedLocalPC();
        // cleanup
router.back
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

    //join call function
    const joinCall = async (id) => {
        const roomRef = doc(db, "room", id);
        const roomSnapshot = await getDoc(roomRef);

        if (!roomSnapshot.exists) return;
        const localPC = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach((track) => {
            localPC.addTrack(track, localStream);
        });

        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

        localPC.addEventListener("icecandidate", (e) => {
            if (!e.candidate) {
                console.log("Got final candidate!");
                return;
            }
            addDoc(calleeCandidatesCollection, e.candidate.toJSON());
        });

        localPC.ontrack = (e) => {
            const newStream = new MediaStream();
            e.streams[0].getTracks().forEach((track) => {
                newStream.addTrack(track);
            });
            setRemoteStream(newStream);
        };

        const offer = roomSnapshot.data().offer;
        await localPC.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await localPC.createAnswer();
        await localPC.setLocalDescription(answer);

        await updateDoc(roomRef, { answer, connected: true }, { merge: true });

        const unsub = onSnapshot(callerCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    let data = change.doc.data();
                    localPC.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });

        const unsub2 = onSnapshot(roomRef, (doc) => {
            const data = doc.data();
            if (!data) {
                unsub
                unsub2
                router.navigate('/RoomScreen')
                // setScreen(screens.ROOM);
            }
        });

        setCachedLocalPC(localPC);
    };

    const switchCamera = () => {
        localStream.getVideoTracks().forEach((track) => track._switchCamera());
    };

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
    const toggleChat = () => {
        setChatVisible((prev)=>!prev)
    }


    const toggleCamera = () => {
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsOffCam(!isOffCam);
        });
    };

    // @ts-ignore
    return (

        
        <View className="flex-1">
            {isChatVisible ? (
               <KeyboardAvoidingView behavior='padding' style={{ backgroundColor: 'white', flex: 1 }}>
                <SafeAreaView edges={['top']} style={{flex:1,backgroundColor:'red'}}>
               <Ionicons color={'grey'} onPress={() => toggleChat()} name='chevron-back-circle' size={30} style={{ width: '10%', alignItems: 'center', justifyContent: 'center', padding: 5,marginTop:8,marginBottom:8 }} />
               <View style={{ flex: 1, backgroundColor: 'white' }}>
                   <FlatList data={messages} 
                   renderItem={({ item }) => (
                       <MessageBubble msg={item.text} isSender={item.role != "Host"} name={"Doctor"}/>
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
           </KeyboardAvoidingView>
            ) : (
                <>
            <RTCView
            style={{height:'100%'}}
            className="flex-1"
            streamURL={remoteStream && remoteStream.toURL()}
            objectFit={"cover"}
            />
            
            {remoteStream && !isOffCam && (
                <RTCView
                style={{width:100,height:150,position:'absolute',top:8,right:10}}
                className="w-32 h-48 absolute right-6 top-8"
                streamURL={localStream && localStream.toURL()}
                objectFit={"cover"}
                />
            )}
            <View style={{position:'absolute', bottom:0, width:'100%',zIndex:3}}>
            <CallActionBox
            switchCamera={switchCamera}
            toggleMute={toggleMute}
            toggleCamera={toggleCamera}
            endCall={endCall}
            toggleChat={toggleChat}
            />
            </View>
            </>
        )}
            </View>
        );
    }