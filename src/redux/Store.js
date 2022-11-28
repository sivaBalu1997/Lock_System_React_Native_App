import { configureStore } from '@reduxjs/toolkit'
import AccountReducer from './reducers/AccountReducer'
import DeviceAddressReducer from './reducers/DeviceAddressReducer'

export const store = configureStore({
  reducer: {
    deviceid: AccountReducer,
    deviceAdd: DeviceAddressReducer
  },
})