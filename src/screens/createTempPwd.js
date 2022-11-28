import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Text, TextInput, StyleSheet, Alert } from 'react-native'
import { updateDoorAccount } from '../services'
function CreateTempPwd() {

    useEffect(() => {
        getStorage();
    }, [])
    const [storage, setStorage] = useState(null)
    const [password1, setPassword1] = useState(null)
    const [password2, setPassword2] = useState(null)

    const getStorage = async () => {
        const locstorage = await AsyncStorage.getItem('AccountDetail')
        if (locstorage !== null) {
            const data = JSON.parse(locstorage)
            setStorage(data)
        }

    }
    const handleSubmit = async () => {
        const body = {
            'userName': storage?.username,
            'tempPassword': password1,
            'tempPasswordDateTime': new Date()
        }
        if (password1 === password2) {
            if (password1 === storage?.password) {
                Alert.alert('Warning', 'Temporary Password Cannot be same as Password');
            }
            else {
                const sendRequest = await updateDoorAccount(body)
                if (sendRequest != 'Error') {
                    Alert.alert('Temporary Password Created', 'Password valid for next 10 mins');
                }
            }
        }
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Hello {storage?.username}</Text>
            </View>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>Enter Temporary Password:</Text>
                <TextInput value={password1} style={styles.input} placeholder='******' placeholderTextColor={'lightgrey'} secureTextEntry={true} onChangeText={(newText) => setPassword1(newText)} />
            </View>
            <View style={styles.InputBoxes}>
                <Text style={styles.text}>Confirm Temporary Password:</Text>
                <TextInput value={password2} style={styles.input} placeholder='*******' placeholderTextColor={'lightgrey'} secureTextEntry={true} onChangeText={(newText) => setPassword2(newText)} />
            </View>
            <TouchableOpacity style={styles.submit} onPress={() => handleSubmit()}><Text style={styles.buttonText}>CREATE</Text></TouchableOpacity>
        </ScrollView>
    )
}

export default CreateTempPwd


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
    welcomeText: {
        color: 'black',
        fontSize: 23,
        fontWeight: '500'
    },
    welcomeContainer: {
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        alignContent: 'center',
        alignSelf: 'center'
    }
}
)