import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { selectDeviceId } from '../redux/reducers/AccountReducer'
import { CheckForLogin } from '../services'

function Login({ navigation }) {

    const deviceId = useSelector(selectDeviceId)
    const [userName, setUserName] = useState(null)
    const [password, setPassword] = useState(null)
    const handleSubmit = async () => {
        const data = {
            'userName': userName,
        }
        const checkForLogin = await CheckForLogin(data)
        if (checkForLogin && checkForLogin.password === password) {
            const receivedData = {
                'username': checkForLogin.userName,
                'password': checkForLogin.password,
                'linkedDeviceId': checkForLogin.doorId,
                'guestUser': false
            }
            const stringfyData = JSON.stringify(receivedData)
            AsyncStorage.setItem('AccountDetail', stringfyData)
            navigation.navigate('OTP')
        }
        else if (checkForLogin && checkForLogin?.tempPassword === password) {
            if (new Date().getTime() - new Date(checkForLogin.tempPasswordDateTime).getTime() <= 600000) {
                const receivedData = {
                    'username': checkForLogin.userName,
                    'password': checkForLogin.password,
                    'linkedDeviceId': checkForLogin.doorId,
                    'tempPassword': checkForLogin.tempPassword,
                    'tempPasswordDateTime': checkForLogin.tempPasswordDateTime,
                    'guestUser': true
                }
                const stringfyData = JSON.stringify(receivedData)
                AsyncStorage.setItem('AccountDetail', stringfyData)
                navigation.navigate('OTP')
            }
            else {
                Alert.alert("Password Expired", "Ask Again to Generate New Password");
            }
        }
        else {
            Alert.alert('Error', 'Invalid Entries or Internet Error')
        }
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>UserName:</Text>
                <TextInput value={userName} style={styles.input} placeholder='username' placeholderTextColor={'lightgrey'} onChangeText={(newText) => setUserName(newText)} />
            </View>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>Password:</Text>
                <TextInput value={password} style={styles.input} placeholder='*******' placeholderTextColor={'lightgrey'} secureTextEntry={true} onChangeText={(newText) => setPassword(newText)} />
            </View>
            <TouchableOpacity style={styles.submit} onPress={() => handleSubmit()}><Text style={styles.buttonText}>SUBMIT</Text></TouchableOpacity>
        </ScrollView>
    )
}

export default Login

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
    }
}
)