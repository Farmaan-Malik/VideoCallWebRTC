
import React, { useState } from "react";
import { Text, SafeAreaView } from "react-native";
import JoinScreen from "@/app/JoinScreen";
import RoomScreen from "@/app/RoomScreen";
import CallScreen from "@/app/CallScreen";

// Just to handle navigation
export default function index() {
    const screens = {
        ROOM: "JOIN_ROOM",
        CALL: "CALL",
        JOIN: "JOIN",
    };

    const [screen, setScreen] = useState(screens.ROOM);
    const [roomId, setRoomId] = useState("");

    let content;

    switch (screen) {
        case screens.ROOM:
            content = (
                <RoomScreen
                    roomId={roomId}
                    setRoomId={setRoomId}
                    screens={screens}
                    setScreen={setScreen}
                />
            );
            break;

        case screens.CALL:
            content = (
                <CallScreen roomId={roomId} screens={screens} setScreen={setScreen} />
            );
            break;

        case screens.JOIN:
            content = (
                <JoinScreen roomId={roomId} screens={screens} setScreen={setScreen} />
            );
            break;

        default:
            content = <Text>Wrong Screen</Text>;
    }

    return (
        <SafeAreaView className="flex-1 justify-center ">{content}</SafeAreaView>
    );
}