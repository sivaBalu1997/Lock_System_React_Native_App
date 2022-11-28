import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native'
import { BluetoothDevice } from 'react-native-bluetooth-classic';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import BluetoothModule from 'react-native-bluetooth-classic/lib/BluetoothModule';
import { addDeviceId, RemoveDeviceId, selectDeviceId } from '../redux/reducers/AccountReducer';
import { useDispatch, useSelector } from 'react-redux';
import { selectDeviceAddress, addDeviceAddress } from '../redux/reducers/DeviceAddressReducer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { sendEmail } from '../services/mailService';

function ListofDevices({ navigation }) {

    const [isDisabled, setIsDisabled] = useState(false)
    const dispatch = useDispatch()
    const [storage, setStorage] = useState({})
    const isFocused = useIsFocused()
    useEffect(() => {
        if (isFocused) {
            check();
            getStorage();

        }

    }, [isFocused])



    const [devices, setDevices] = useState(null)
    const check = async () => {
        try {
            let available;
            available = await RNBluetoothClassic.getBondedDevices();
            setDevices(available)
        } catch (err) {

        }
    }

    const getStorage = async () => {
        const locstorage = await AsyncStorage.getItem('AccountDetail')
        if (locstorage === null) setStorage(null)
        if (locstorage !== null) {
            const data = JSON.parse(locstorage)
            setStorage(data)
            checkForGuestUser(data);
        }

    }

    const checkForGuestUser = (data) => {
        if (data && data?.guestUser) {
            const currentDateTime = new Date().getTime();
            if (data?.tempPasswordDateTime && currentDateTime - new Date(data?.tempPasswordDateTime)?.getTime() > 600000) {

                AsyncStorage.removeItem('AccountDetail');
            }
        }
    };
    const ConnectToDevice = async (device) => {
        setIsDisabled(true)
        dispatch(addDeviceAddress(device))
        let ispair;
        try {
            ispair = await RNBluetoothClassic.connectToDevice(device)
        }
        catch { }
        var sendConnectionRequest;
        if (ispair?._nativeDevice) {
            try {
                sendConnectionRequest = await RNBluetoothClassic.writeToDevice(device, 'giveid')
            }
            catch { }
            var readid;
            if (sendConnectionRequest) {
                setTimeout(async () => {
                    try {
                        readid = await RNBluetoothClassic.readFromDevice(device)
                        while (readid === null) {
                            readid = await RNBluetoothClassic.readFromDevice(device)
                        }
                        if (readid?.length === 16) {
                            setIsDisabled(false)
                            dispatch(addDeviceId(readid))
                            navigation.navigate("OTP")
                        }
                        else {
                            Alert.alert("Try Again", "Something went wrong", [
                                {
                                    text: 'Ok',
                                    onPress: () => setIsDisabled(false)
                                }
                            ])
                        }
                    }
                    catch {
                    }
                }, 2500)
            }
        }
        else {
            Alert.alert("Try Again", "Make sure device is switched ON", [
                {
                    text: 'Ok',
                    onPress: () => setIsDisabled(false)
                }
            ])
        }

    }

    const handleLogOut = async () => {
        await AsyncStorage.removeItem('AccountDetail')
        getStorage();
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.textBox}>
                <Text style={styles.subHeading}> Select and Connect to device</Text>
                {storage ? <TouchableOpacity onPress={() => { storage?.guestUser === false ? navigation.navigate('createTempPwd') : null }} onLongPress={() => Alert.alert('Log Out', 'Click below to logout', [{
                    text: 'Log Out',
                    onPress: () => handleLogOut()
                },
                {
                    text: 'Cancel',
                }
                ])} style={styles.AvatarContainer}>
                    <Image source={require('../images/avatar.jpg')} style={styles.Avatar} />
                </TouchableOpacity> : null}
            </View>
            <View style={styles.devicelist}>
                {devices?.map((device) => {
                    return (
                        <View key={device._nativeDevice.id} style={styles.devices}>
                            <TouchableOpacity disabled={isDisabled} onPress={() => { ConnectToDevice(device._nativeDevice.address) }}>
                                <Text style={isDisabled ? styles.disableDeviceName : styles.devicename}>{device._nativeDevice.name}</Text>
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </View>

        </ScrollView>
    )
}

export default ListofDevices



const styles = StyleSheet.create({
    container: {
        position: 'relative',
        background: '#FFFFFF',
        borderRadius: 30,
    },
    text: {
        color: 'black'
    },
    textBox: {
        position: 'relative',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    devicelist: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        padding: 20
    },
    devices: {
        textAlign: 'center',
        display: 'flex',
        alignSelf: 'center',
        position: 'relative',
        border: 30,
        margin: 10,
        fontSize: 50,
        fontWeight: 600,
        lineHeight: 20,
        borderWidth: 1,
        borderColor: 'black',
        width: '100%',
        borderRadius: 5
    },
    devicename: {
        fontSize: 20,
        lineHeight: 20,
        fontWeight: '600',
        color: "#0f1333",
        alignSelf: 'center',
        padding: 10
    },
    disableDeviceName: {
        fontSize: 20,
        lineHeight: 20,
        fontWeight: '600',
        color: "grey",
        alignSelf: 'center',
        padding: 10
    },
    subHeading: {
        position: 'relative',
        height: 23,
        marginTop: 14,
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: '500',
        fontSize: 20,
        lineHeight: 23,
        color: '#94989A',
    },
    Avatar: {
        maxHeight: 40,
        maxWidth: 40,
        display: 'flex',
        borderRadius: 50,
    },
    AvatarContainer: {
        maxHeight: 30,
        marginTop: 10,
        display: 'flex',
        right: 10
    }
})
