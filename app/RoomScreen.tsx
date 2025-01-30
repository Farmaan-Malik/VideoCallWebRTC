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
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RoomScreen({
}) {
    const navigation = useNavigation()
    const [roomId, setRoomId] = useState("");
    const [roomList, setRoomList] = useState([{ "hostName": "Farmaan", "roomId": "lkiwssu2212" }])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const {Role} = useLocalSearchParams()
    const isDoctor = Role == "Doctor"

    const fetchAllData = async () => {
        try {
            setIsRefreshing(true);
            const roomRef = collection(db, "room");
            const snapshot = await getDocs(roomRef);
            const arr = [];

            snapshot.forEach((doc) => {
                console
                arr.push({ roomId: doc.id, hostName: doc.data().name || "Dr. Joe" });
            });
            setRoomList((prev) => [...arr]);
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
    const generateRandomId = () => {
        const characters = "abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < 7; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    };

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
                        (<>
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',paddingHorizontal:10}}>
                        <Text style={{fontSize:20,fontFamily:'Nunito-Bold',paddingVertical:10}}>Available Doctors</Text>
                        <Ionicons onPress={()=>fetchAllData()} color={'#D84040'} name='refresh-circle' size={25} style={{alignSelf:'flex-end',padding:10}}/>
                        </View>
                        <FlatList numColumns={2} data={roomList} style={{ width: '100%' }} contentContainerStyle={{}} renderItem={({ item }) => <MeetingCard name={item.hostName} id={item.roomId} onClick={() => checkMeeting(item.roomId)} />} />
                        </>)
                        : (<View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text>No rooms currently active</Text>
                        </View>)}
                </>
                    // </View>
                    : <View style={{ flex: 1,width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        {/* <Text style={{fontSize:20,fontWeight:'bold'}}>Create Room</Text> */}
                        <TouchableOpacity style={{ backgroundColor: 'tomato', borderRadius: 10 }} onPress={() => {
                        const result = generateRandomId()
                        router.navigate({pathname:`/CallScreen`, params: {roomId:result}});

                        }}>
                            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 20, padding: 10, color: 'white' }}>Start Meeting</Text>
                        </TouchableOpacity>
                    </View>
                }
            </LinearGradient>
        </SafeAreaView>
    );
}