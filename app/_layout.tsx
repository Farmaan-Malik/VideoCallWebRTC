import React from 'react';
import "../global.css";
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {router, Stack} from "expo-router";
import {useFonts} from "expo-font";
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth } from '@/firebase';

const _layout = () => {
    const [fonts] = useFonts({
        "NovaOval": require("@/assets/fonts/NovaOval-Regular.ttf"),
        "Nunito": require("@/assets/fonts/Nunito.ttf"),
        "Nunito-Italic": require("@/assets/fonts/Nunito-Italic.ttf"),
        "Nunito-SemiBold": require("@/assets/fonts/Nunito-SemiBold.ttf"),
        "Nunito-Regular": require("@/assets/fonts/Nunito-Regular.ttf"),
        "Nunito-Bold": require("@/assets/fonts/Nunito-Bold.ttf"),
        "Nunito-Medium": require("@/assets/fonts/Nunito-Medium.ttf"),
        "Nunito-ExtraBold": require("@/assets/fonts/Nunito-ExtraBold.ttf"),
        "Nunito-ExtraLight": require("@/assets/fonts/Nunito-ExtraLight.ttf"),
        "Nunito-BoldItalic": require("@/assets/fonts/Nunito-BoldItalic.ttf"),
      });
      if(!fonts){
        return(
        <View style={{backgroundColor:'white',flex:1,justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator size={90}/>
        </View>)
      }else {
        return (
    
       <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name='RoomScreen' options={{headerShown:true,title:"Home",headerLeft:()=><></>,headerRight:()=><Ionicons color={'#D84040'} size={30} name='log-out' onPress={()=>{
            auth.signOut().then(()=>router.replace('/'))
            }} />}} />
        <Stack.Screen name='index' options={{title:'Login'}} />
        <Stack.Screen name='CallScreen' />
        <Stack.Screen name='JoinScreen'/>
        <Stack.Screen name='Register' options={{headerShown:true,headerTransparent:true }}/>
       </Stack>
    );
}
};

export default _layout;

