import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { selectDeviceId } from '../redux/reducers/AccountReducer'
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { selectDeviceAddress } from '../redux/reducers/DeviceAddressReducer'
import { useIsFocused } from '@react-navigation/native'
import { sendEmail } from '../services/mailService'

function Otp({ navigation }) {

    const [storage, setStorage] = useState({})
    const deviceId = useSelector(selectDeviceId)
    const deviceAdd = useSelector(selectDeviceAddress)

    const [isAlertVis, setIsAlertVis] = useState(false)
    const [generatedOTP, setGeneratedOTP] = useState(null)
    const [enteredOTP, setEnteredOTP] = useState(null)
    const [isOtpGenerating, setIsOtpGenerating] = useState(false)
    const [isValidating, setIsValidating] = useState(false)
    const isFocused = useIsFocused()
    useEffect(() => {
        if (isFocused) { getStorage(); }
    }, [isFocused])

    const checkForGuestUser = (data) => {
        if (data && data?.guestUser) {
            const currentDateTime = new Date().getTime();
            if (data?.tempPasswordDateTime && currentDateTime - new Date(data?.tempPasswordDateTime)?.getTime() > 600000) {
                AsyncStorage.removeItem('AccountDetail');
                navigation.navigate('ListOfDevices')
            }
        }
    };

    const generateOTP = async () => {
        setIsOtpGenerating(true)
        var sendReq;
        try {
            sendReq = await RNBluetoothClassic.writeToDevice(deviceAdd, 'generateOtp')
            var readData;
            // setTimeout(async () => {
            try {
                readData = await RNBluetoothClassic.readFromDevice(deviceAdd)
                while (readData === null) {
                    readData = await RNBluetoothClassic.readFromDevice(deviceAdd)
                }
                if (readData?.length === 7) {
                    const mailSend = await sendEmail({ otp: readData, doorId: deviceId });

                    if (mailSend === 'success') {
                        Alert.alert('OTP Generated', 'OTP send to registered Email Address')
                        setGeneratedOTP(readData)
                    }
                    else {
                        setIsOtpGenerating(false)
                    }
                }
            }
            catch {
                Alert.alert('Try Again', 'Something went wrong', [
                    {
                        text: 'Ok',
                        onPress: () => navigation.navigate('ListOfDevices')
                    }
                ])
            }
            // }, 2500)
        }
        catch {
            setIsOtpGenerating(false)
            Alert.alert('Try Again', 'Error in OTP Generating')
        }
    }

    const LockAgain = async () => {
        var sendLockReq;
        try {
            sendLockReq = await RNBluetoothClassic.writeToDevice(deviceAdd, 'lockAgain')
        }
        catch {
            Alert.alert('Something Went Wrong', 'Door will be closed automatically within 10 seconds')
        }

        if (sendLockReq) {
            var readRes;
            // setTimeout(async () => {
            try {
                readRes = await RNBluetoothClassic.readFromDevice(deviceAdd)
                console.log(readRes, 'readres')
                while (readRes === null) {
                    readRes = await RNBluetoothClassic.readFromDevice(deviceAdd)
                }
                console.log(readRes, 'newreadres');
                if (readRes?.length === 13) {
                    Alert.alert('Thank You', 'The Door is locked again', [
                        {
                            text: 'Ok',
                            onPress: () => navigation.navigate('ListOfDevices')
                        }
                    ],
                        {
                            cancelable: true
                        }
                    )
                }

            }
            catch {
                Alert.alert('Error in reading', 'Door must have Closed')
            }
            // }, 2500)
        }
    }
    const verifyOTP = async () => {
        setIsValidating(true)
        if (generatedOTP.substring(0, 6) === enteredOTP) {
            var sendReq;
            try {
                sendReq = await RNBluetoothClassic.writeToDevice(deviceAdd, enteredOTP)
            }
            catch {
                setIsValidating(false)
                Alert.alert('Try Again', 'Press below to send again', [
                    {
                        text: 'Send Again',
                        onPress: () => verifyOTP()
                    }
                ])
            }
            if (sendReq) {
                var readData;
                // setTimeout(async () => {
                try {
                    readData = await RNBluetoothClassic.readFromDevice(deviceAdd)
                    console.log(readData, 'readdata')
                    while (readData === null) {
                        readData = await RNBluetoothClassic.readFromDevice(deviceAdd)
                    }
                    console.log(readData, 'newreaddata');
                    if (readData.substring(0, 8) === "unlocked") {
                        Alert.alert('Welcome, Door unlocked', 'Press below to lock again', [
                            {
                                text: 'Lock Again',
                                onPress: () => LockAgain(),

                            }
                        ],
                            {
                                cancelable: true
                            }
                        )
                    }
                }
                catch {
                    Alert.alert('Welcome, Door unlocked', 'Lock will enable after 10 seconds')
                }
                // }, 2000)
            }

        }
        else {
            Alert.alert('Try Again', 'OTP not matched')
            setIsValidating(false)
        }
    }

    const getStorage = async () => {
        const locstorage = await AsyncStorage.getItem('AccountDetail')
        if (locstorage !== null) {
            const data = JSON.parse(locstorage)
            setStorage(data)
            checkForGuestUser(data);
            if (data.linkedDeviceId !== deviceId) setIsAlertVis(true)
        }
        else {
            navigation.navigate('Register')
        }

    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View >
                {/* <Text style={styles.generateOtpText}>{generatedOTP}</Text> */}
                <TouchableOpacity onPress={() => generateOTP()} disabled={storage?.linkedDeviceId === deviceId && !isOtpGenerating && !generatedOTP ? false : true}><Text style={storage?.linkedDeviceId === deviceId && !isOtpGenerating && !generatedOTP ? styles.generateOtpTouchOpacTextValid : styles.generateOtpTouchOpacTextInvalid}>Generate OTP</Text></TouchableOpacity>
            </View>

            {isAlertVis ? Alert.alert('Unmatched Door', 'This door is not registered with your account', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('ListOfDevices')
                }
            ]) : null}

            {generatedOTP ? <View >
                <TextInput value={enteredOTP} onChangeText={newText => setEnteredOTP(newText)} style={styles.generateOtpText} />
                <TouchableOpacity onPress={() => verifyOTP()} disabled={storage?.linkedDeviceId === deviceId && !isValidating ? false : true}><Text style={storage?.linkedDeviceId === deviceId && !isValidating ? styles.generateOtpTouchOpacTextValid : styles.generateOtpTouchOpacTextInvalid}>Submit OTP</Text></TouchableOpacity>
            </View> : null}
        </ScrollView>
    )
}

export default Otp

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    generateOtpText: {
        color: 'black',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
        minWidth: 120,
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
        letterSpacing: 5,
        fontSize: 20,
        fontWeight: '500',
        marginTop: 100,
        borderRadius: 5
    },
    generateOtpTouchOpacTextValid: {
        color: 'white',
        fontWeight: '600',
        fontSize: 20,
        marginTop: 30,
        padding: 10,
        backgroundColor: '#135cd1',
        borderRadius: 5
    },
    generateOtpTouchOpacTextInvalid: {
        color: 'white',
        fontWeight: '600',
        fontSize: 20,
        marginTop: 30,
        padding: 10,
        backgroundColor: 'grey',
        borderRadius: 5
    }
})
