import React from 'react';
import "../global.css";
import { View, Text, StyleSheet } from 'react-native';
import {Stack} from "expo-router";

const _layout = () => {
    return (
       <Stack screenOptions={{headerShown: false}}/>
    );
};

export default _layout;

