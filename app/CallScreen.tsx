// @ts-nocheck
import "../global.css";

import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Button, AppState, Platform } from "react-native";
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
import {db} from "@/firebase";
import {
    addDoc,
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    deleteField,
} from "firebase/firestore";
import CallActionBox from "@/app/CallActionBox";


const configuration = {
    iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
    ],
    iceCandidatePoolSize: 10,
};

const ExpoPip = Platform.OS === 'android' ? require('expo-pip') : null;
export default function CallScreen({ roomId, screens, setScreen }) {
    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [cachedLocalPC, setCachedLocalPC] = useState();

    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);
    const [newPipMode, setNewPipMode] = useState(false);
    const [automaticEnterEnabled, setAutomaticEnterEnabled] = useState(false);
    const view = useRef()
    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
      const subscription = AppState.addEventListener('change', handleAppStateChange);
  
      return () => {
        subscription.remove();
      };
    }, []);
  
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
                 height:4,
                 autoEnterEnabled: true,
             })
         }else{
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
    }, [localStream, roomId]);

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
        await updateDoc(roomRef, { answer: deleteField() });
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                track.stop(); // This stops the track (audio or video)
            });
        }
        setLocalStream();
        setRemoteStream(); // set remoteStream to null or empty when callee leaves the call
        setCachedLocalPC();
        // cleanup
        setScreen(screens.ROOM); //go back to room screen
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

        await setDoc(roomRef, { offer, connected: false }, { merge: true });

        // Listen for remote answer
        onSnapshot(roomRef, (doc) => {
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
                    style={{width:100,height:150,position:'absolute',top:8,right:10}}
                    streamURL={localStream && localStream.toURL()}
                    />
                )}
                </>
            )}
            <View style={{position:'absolute', bottom:0, width:'100%',zIndex:3}}>
            <CallActionBox
            switchCamera={switchCamera}
            toggleMute={toggleMute}
            toggleCamera={toggleCamera}
            endCall={endCall}
            />
            </View>
            </>
        ) : <View style={{flex:1}}>
            {Platform.OS === 'android' ? 
                <RTCView objectFit='cover' streamURL={localStream && localStream.toURL()} style={{flex:1}} />
             : <RTCPIPView ref={view} iosPIP={pipOptions} objectFit='cover' streamURL={localStream && localStream.toURL()} style={{flex:1}}/> }
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