// @ts-nocheck

import React, { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Button, Alert, FlatList, ActivityIndicator } from "react-native";

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
    getDocs,
} from "firebase/firestore";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native";
import MeetingCard from "@/components/MeetingCard";
import { globalStyle } from "@/assets/styles/globalStyle";
import { LinearGradient } from "expo-linear-gradient";

export default function RoomScreen({
}) {
    const navigation = useNavigation()
    const [roomId, setRoomId] = useState("");
    const [roomList, setRoomList] = useState([{ "hostName": "Farmaan", "roomId": "lkiwssu2212" }])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isDoctor, setIsDoctor] = useState(true)

    const fetchAllData = async () => {
        try {
            setIsRefreshing(true);
            const roomRef = collection(db, "room");
            const snapshot = await getDocs(roomRef);
            const arr = [];

            snapshot.forEach((doc) => {
                arr.push({ roomId: doc.id, hostName: doc.data().name || "Unknown" });
            });
            setRoomList((prev) => [...prev, ...arr]);
            console.log(arr)
            console.log("Length:", roomList.length)
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setIsRefreshing(false);
        }
    };
    useEffect(() => {
        if (!isDoctor) {
            fetchAllData();
        }
    }, []); // ✅ Runs only once when the component mounts


    //generate random room id
    useEffect(() => {
        if (isDoctor) {
            const generateRandomId = () => {
                const characters = "abcdefghijklmnopqrstuvwxyz";
                let result = "";
                for (let i = 0; i < 7; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    result += characters.charAt(randomIndex);
                }
                return setRoomId(result);
            };
            generateRandomId();
        }
    }, []);

    //checks if room is existing
    const checkMeeting = async (id) => {
        console.log("Clicked", id)
        const roomRef = doc(db, "room", id);
        console.log("Clicked2", roomRef)
        const roomSnapshot = await getDoc(roomRef);
        console.log("Clicked3")

        console.log(roomSnapshot.data());

        if (!roomSnapshot.exists() || id === "") {
            // console.log(`Room ${roomId} does not exist.`);
            Alert.alert("Wait for your instructor to start the meeting.");
            return;
        } else {
            router.navigate({ pathname: '/JoinScreen', params: { roomId: id } });
            // onCallOrJoin(screens.JOIN);
        }

    };

    return (
        <SafeAreaView style={{ height: '100%' }}>
            <LinearGradient style={[globalStyle.container, { flex: 1 }]} colors={['white', 'tomato']}>
                {!isDoctor ? <>
                    {roomList.length > 0 ?
                        (<FlatList numColumns={2} data={roomList} style={{ width: '100%' }} contentContainerStyle={{}} renderItem={({ item }) => <MeetingCard name={item.hostName} id={item.roomId} onClick={() => checkMeeting(item.roomId)} />} />)
                        : (<View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text>No rooms currently active</Text>
                        </View>)}
                </>
                    // </View>
                    : <View style={{ flex: 1,width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        {/* <Text style={{fontSize:20,fontWeight:'bold'}}>Create Room</Text> */}
                        <TouchableOpacity style={{ backgroundColor: 'tomato', borderRadius: 10 }} onPress={() => {
                        router.navigate({pathname:`/CallScreen`, params: {roomId:roomId}});

                        }}>
                            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 20, padding: 10, color: 'white' }}>Start Meeting</Text>
                        </TouchableOpacity>

                        {/* <Text className="text-2xl font-bold text-center">Enter Room ID:</Text>
            <TextInput
            className="bg-white border-sky-600 border-2 mx-5 my-3 p-2 rounded-md"
            value={roomId}
            onChangeText={setRoomId}
            />
            <View className="gap-y-3 mx-5 mt-2">
                <TouchableOpacity
                    className="bg-sky-300 p-2  rounded-md"
                    onPress={() => {
                        
                        router.navigate({pathname:`/CallScreen`, params: {roomId:roomId}});
                    }}
                    >
                    <Text className="color-black text-center text-xl font-bold ">
                        Start meeting
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-sky-300 p-2 rounded-md"
                    onPress={() => checkMeeting(roomId)}
                    >
                    <Text className="color-black text-center text-xl font-bold ">
                        Join meeting
                    </Text>
                </TouchableOpacity>
                </View> */}
                    </View>
                }
            </LinearGradient>
        </SafeAreaView>
    );
}