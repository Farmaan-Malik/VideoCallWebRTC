import { View, Text, TouchableOpacity, Button, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import CustomTextInput from '@/components/CustomTextInput'
import { globalStyle } from "@/assets/styles/globalStyle"
import { auth } from '@/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isDoctor, setIsDoctor] = useState(false)
    const register = async () => {
        if (!email || !password || !confirmPassword) {
            alert("Please fill all the fields")
            return
        }else if(password !== confirmPassword){
            alert("Password does not match")
            return
        }else{
        try {
            setIsLoading(true)
            const response = await createUserWithEmailAndPassword(auth, email, password)
            console.log('Response: ', response)
            router.navigate('/RoomScreen')
        } catch (e: any) {
            console.log('12')
            const err = e
            console.log(err)
            alert("Registration failed: " + err)
        } finally {
            setIsLoading(prev => !prev)
        }
    }
    }


    return (
        <KeyboardAvoidingView behavior='padding' style={[style.container, {
            backgroundColor: '#D84040'
        }]}>
            {isLoading ? <ActivityIndicator /> :
                <>
                    <Text style={{ fontFamily: "Nunito-ExtraBold", fontSize: 50, marginBottom: 10, color: 'white' }}>Health Bridge</Text>
                    <Text style={style.textStyle}>Register as a {isDoctor ? "Doctor" : "Patient"}</Text>
                    <CustomTextInput containerStyle={style.containerStyle} style={style.input} placeholder='Email' value={email} onChangeText={(value) => { setEmail(prev => value) }} />
                    <CustomTextInput secureTextEntry={!showPassword} style={style.input} iconName={!showPassword ? 'eye-off' : 'eye'} icon={true} onIconClick={() => {
                        setShowPassword(prev => !prev)
                    }} containerStyle={style.containerStyle} placeholder='Password' value={password} onChangeText={(value) => { setPassword(prev => value) }} />
                    <CustomTextInput secureTextEntry={!showConfirmPassword} style={style.input} iconName={!showConfirmPassword ? 'eye-off' : 'eye'} icon={true} onIconClick={() => {
                        setShowConfirmPassword(prev => !prev)
                    }} containerStyle={style.containerStyle} placeholder='Confirm Password' value={confirmPassword} onChangeText={(value) => { setConfirmPassword(prev => value) }} />
                    <TouchableOpacity style={[style.touchable]} onPress={() => {
                        register()
                        // router.navigate('/RoomScreen')
                    }}>
                        <Text style={[style.buttonText]}>
                            Register
                        </Text>
                    </TouchableOpacity>
                    <TouchableWithoutFeedback onPress={() => {
                        setIsDoctor(prev => !prev)
                    }} >
                        <Text style={[style.switch]}>
                            Register as a {!isDoctor ? 'Doctor' : 'Patient'}
                        </Text>
                    </TouchableWithoutFeedback>
                </>
            }
        </KeyboardAvoidingView>

    )
}

export default Register

const style = StyleSheet.create({

    container: {
        flex: 1,
        borderWidth: 1,
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
        fontSize: 25,
        marginBottom: 10,
        fontFamily: 'Nunito-Medium',
        color: 'white'
    },
    buttonText: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Nunito-Bold',
        color: 'white'
    },
    input: {
        flex: 1,
        paddingStart: 20,
        height: '100%',
        borderRadius: 20,
    },
    touchable: {
        backgroundColor: 'black',
        padding: 10,
        width: '40%',
        borderRadius: 20,
        marginTop: 10,
    },
    switch: {
        marginTop: 20,
        fontFamily: 'Nunito-SemiBold',
        textDecorationLine: 'underline',
        color: 'white'
    }
})
