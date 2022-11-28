/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React, { useEffect, useState } from 'react';
 // import type {Node} from 'react';
 import {
   FlatList,
   SafeAreaView,
   ScrollView,
   StatusBar,
   StyleSheet,
   Text,
   useColorScheme,
   View,
 } from 'react-native';
 
 import {
   Colors,
   DebugInstructions,
   Header,
   LearnMoreLinks,
   ReloadInstructions,
 } from 'react-native/Libraries/NewAppScreen';
 
 import { NavigationContainer } from '@react-navigation/native';
 import { createNativeStackNavigator } from '@react-navigation/native-stack';
 import RNBluetoothClassic from 'react-native-bluetooth-classic';
 import BleEnaReq from './src/screens/BleEnaReq';
 //  import BleEnaReq from './src/screens/BleEnaReq';
 import ListofDevices from './src/screens/ListofDevices';
 //  import ListofDevices from './src/screens/ListofDevices';
 import Loading from './src/screens/Loading';
 import { store } from './src/redux/Store';
 import { Provider, useDispatch, useSelector } from 'react-redux';
 import { addDeviceId, RemoveDeviceId, selectDeviceId } from './src/redux/reducers/AccountReducer';
 import Otp from './src/screens/Otp';
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import Register from './src/screens/Register';
 import Login from './src/screens/Login';
 import { AddAccount, fetchDoorFunc } from './src/services'
 import CreateTempPwd from './src/screens/createTempPwd';
 // import ContactUs from './src/services/mailService';
 
 const Stack = createNativeStackNavigator();
 
 const App = () => {
 
   const [storage, setStorage] = useState(null)
   const getStorage = async () => {
     const stor = await AsyncStorage.getItem('AccountDetail')
     setStorage(stor)
 
   }
   useEffect(() => {
     check();
     getStorage();
   }, [])
 
   const [isBleEna, setIsBleEna] = useState(false)
   const [isloading, setIsLoading] = useState(true)
   const [BleId, setBleId] = useState(null)
   const check = async () => {
     try {
       let available;
       available = await RNBluetoothClassic.isBluetoothEnabled();
       setIsBleEna(available)
       setIsLoading(false)
     }
     catch (err) {
     }
   }
 
   const isDarkMode = useColorScheme() === 'dark';
 
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };
 
   return (
     <Provider store={store}>
       <NavigationContainer>
         <Stack.Navigator >
           {isloading ? <Stack.Screen options={{ headerShown: false }} name='Loading' component={Loading} /> : null}
           {isBleEna === false && isloading === false ? <Stack.Screen options={{ headerShown: false }} name="Warning" component={BleEnaReq} /> : null}
           {isBleEna && isloading === false ? <Stack.Screen name="ListOfDevices" options={{ title: 'List of Devices' }} component={ListofDevices} /> : null}
           <Stack.Screen name="OTP" options={{ title: 'OTP Validation' }} component={Otp} />
           <Stack.Screen name="Register" component={Register} />
           <Stack.Screen name="Login" component={Login} />
           <Stack.Screen name="createTempPwd" options={{ headerShown: false }} component={CreateTempPwd} />
         </Stack.Navigator>
       </NavigationContainer>
     </Provider>
   );
 };
 
 const styles = StyleSheet.create({
   sectionContainer: {
     marginTop: 32,
     paddingHorizontal: 24,
   },
   sectionTitle: {
     fontSize: 24,
     fontWeight: '600',
   },
   sectionDescription: {
     marginTop: 8,
     fontSize: 18,
     fontWeight: '400',
   },
   highlight: {
     fontWeight: '700',
   },
 });
 
 export default App;
 