import { View, Text, TouchableOpacity, Button, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import CustomTextInput from '@/components/CustomTextInput'
import { globalStyle } from "@/assets/styles/globalStyle"
import { auth } from '@/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const index = () => {
    const [email, setEmail] = useState('1@gmail.com')
    const [password, setPassword] = useState('123456')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isDoctor, setIsDoctor] = useState(false)
    const [role,setRole] = useState('Patient')
    const doctorpng = require('@/assets/images/doctor01.png')
    const patientpng = require('@/assets/images/patient01.png')
    const signIn = async () => {
        try {
            setIsLoading(true)
            // const response = await signInWithEmailAndPassword(auth, email, password)
            // console.log('Response: ', response)
            router.navigate({pathname:'/RoomScreen',params:{Role:role}})

        } catch (e: any) {
            console.log('12')
            const err = e
            console.log(err)
            alert("Registration failed: " + err)
        } finally {
            setIsLoading(prev => !prev)
        }
    }


    return (
        <KeyboardAvoidingView behavior='padding' style={[style.container,{backgroundColor:'#D84040'
        }]}>
            {isLoading ? <ActivityIndicator /> :
                <>
                <Text style={{ fontWeight:'bold',fontSize:30,marginBottom:20,color:'white'}}>Health Bridge</Text>
                    <View style={{ height: 200, width: 200, justifyContent: 'center', alignItems: 'center', borderRadius: '50%', backgroundColor: 'white', marginBottom: 20, shadowColor: 'grey', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 20 }}>
                        <Image source={isDoctor ? doctorpng : patientpng} style={{ width: 200, height: 200}} />
                    </View>
                    <Text style={style.textStyle}>Login to your Account</Text>
                    <CustomTextInput containerStyle={style.containerStyle} style={style.input} placeholder='Email' value={email} onChangeText={(value) => { setEmail(prev => value) }} />
                    <CustomTextInput secureTextEntry={!showPassword} style={style.input} iconName={!showPassword ? 'eye-off' : 'eye'} icon={true} onIconClick={() => {
                        setShowPassword(prev => !prev)
                    }} containerStyle={style.containerStyle} placeholder='Password' value={password} onChangeText={(value) => { setPassword(prev => value) }} />
                    <TouchableOpacity style={[style.touchable]} onPress={() => {
                        signIn()
                    }}>
                        <Text style={[style.buttonText]}>
                        Login
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[style.touchable]} onPress={() => {
                        router.navigate('/Register')
                    }}>
                        <Text style={[style.buttonText]}>
                            Register
                        </Text>
                    </TouchableOpacity>
                    <TouchableWithoutFeedback onPress={() => {
                        setIsDoctor(prev => !prev)
                        setRole(!isDoctor ? "Doctor" : "Patient")
                    }} >
                        <Text style={[style.switch]}>
                            Sign in as a {!isDoctor ? 'Doctor' : 'Patient'}
                        </Text>
                    </TouchableWithoutFeedback>
                </>
            }
        </KeyboardAvoidingView>

    )
}

export default index
const style = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    containerStyle: {
        marginVertical: 10,
        // borderWidth:StyleSheet.hairlineWidth,
        backgroundColor: 'white'
    },
    textStyle: {
        fontSize: 18,
        marginBottom: 10,
        fontFamily:'Nunito-Medium',
        color:'white'
    },
    buttonText: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily:'Nunito-Bold',
        color:'white'
    },
    input: {
        flex: 1,
        paddingStart: 20,
        height: '100%',
        borderRadius: 20,
    },
    touchable:{
        backgroundColor:'black',
        padding:10,
        width:'40%',
        borderRadius:20,
        marginTop:10,
    },
    switch:{
        marginTop:20,
        fontFamily:'Nunito-SemiBold',
        textDecorationLine:'underline',
        color:'white'
    }
})