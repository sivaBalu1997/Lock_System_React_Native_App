
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { selectDeviceId } from '../redux/reducers/AccountReducer'
import { AddDoorAccount, fetchDoorFunc } from '../services'

function Register({ navigation }) {
    const dispatch = useDispatch()
    const deviceId = useSelector(selectDeviceId)
    const [userName, setUserName] = useState(null)
    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState(null)
    var allDoors;
    const [isDoorRegistered, setIsDoorRegistered] = useState(false)
    const isFocused = useIsFocused()
    useEffect(() => {
        if (isFocused) {
            checkIfDoorRegistered()
        }
    }, [isFocused])

    const checkIfDoorRegistered = async () => {
        const getLocalData = await AsyncStorage.getItem('AccountDetail')
        if (getLocalData) navigation.navigate('OTP')
        const doors = await fetchDoorFunc()
        allDoors = doors
        if (allDoors === 'Error') {
            Alert.alert('Try Again', 'Something went wrong', [{
                text: 'Ok',
                onPress: () => checkIfDoorRegistered()
            }],
                {
                    cancelable: true
                })
        }
        else {
            allDoors?.map((door) => {
                if (door?.doorId === deviceId) {
                    setIsDoorRegistered(true)
                    Alert.alert('Warning', 'This door is registered with an account', [{
                        text: 'Login now',
                        onPress: () => navigation.navigate('Login')
                    }],
                        cancelable = false)
                }
            })
        }

    }
    const handleSubmit = async () => {
        const data = {
            'username': userName,
            'password': password,
            'linkedDeviceId': deviceId,
            'guestUser': false
        }
        if (userName === null || password === null || confirmPassword === null) Alert.alert('Error', 'Enter all details')
        else if (userName === '' || password === '' || confirmPassword === '') Alert.alert('Error', 'Enter all details')
        else if (password.length < 6) Alert.alert('Password length is small', 'Password length should be at least 6')
        else if (password !== confirmPassword) Alert.alert(`password not Match`, 'Recheck Password')
        else {
            const body = {
                'userName': userName,
                'password': password,
                'doorId': deviceId,
                'email': email
            }
            const resp = await AddDoorAccount(body)
            if (resp === 'Error') {
                Alert.alert('Try Again', 'Username taken or Internet Error')
            }
            else if (resp) {
                const stringfyData = JSON.stringify(data)
                AsyncStorage.setItem('AccountDetail', stringfyData)
                navigation.navigate('OTP')
            }
            else {
                Alert.alert('Try Again', 'Some error occured')
            }
        }
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>UserName:</Text>
                <TextInput value={userName} style={styles.input} placeholder='username' placeholderTextColor={'lightgrey'} onChangeText={(newText) => setUserName(newText)} />
            </View>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>Email:</Text>
                <TextInput value={email} style={styles.input} placeholder='email@gmail.com' placeholderTextColor={'lightgrey'} onChangeText={(newText) => setEmail(newText)} />
                <Text style={styles.text}>Enter Correct Email as otp for door unlock will send on email</Text>
            </View>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>Password:</Text>
                <TextInput value={password} style={styles.input} placeholder='*******' placeholderTextColor={'lightgrey'} secureTextEntry={true} onChangeText={(newText) => setPassword(newText)} />
            </View>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>Confirm Password:</Text>
                <TextInput value={confirmPassword} style={styles.input} placeholder='******' secureTextEntry={true} placeholderTextColor={'lightgrey'} keyboardType='visible-password' onChangeText={(newText) => setConfirmPassword(newText)} />
            </View>
            <View style={styles.InputBoxes}>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}><Text style={styles.loginRedirect}>Login Here</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submit} onPress={() => handleSubmit()}><Text style={styles.buttonText}>SUBMIT</Text></TouchableOpacity>
        </ScrollView>
    )
}

export default Register

const styles = StyleSheet.create({
    container: {
        height: '100%',
        marginTop: 20
    },
    InputBoxes: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignContent: 'center',
        margin: 15,
    },
    input: {
        height: 40,
        minWidth: '40%',
        // width:'80%',
        marginTop: 5,
        borderWidth: 1,
        padding: 10,
        color: 'black',
    },
    text: {
        color: 'grey'
    },
    submit: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        marginTop: 5,
        height: 45,
        backgroundColor: '#135cd1',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 20,
        color: 'white'
    },
    loginRedirect: {
        color: '#0c254d',
        marginTop: 10,
        fontSize: 15,
        textDecorationLine: 'underline',
        fontWeight: 'bold'
    }
}
)