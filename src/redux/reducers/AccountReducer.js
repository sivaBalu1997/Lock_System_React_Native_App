import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  deviceId: null
}

export const AccountReducer = createSlice({
  name: 'deviceid',
  initialState,
  reducers: {
    addDeviceId: (state, action) => {
      state.deviceId = action.payload
    },
    RemoveDeviceId: (state) => {
      state.deviceId = null
    }
  },
})

export const { addDeviceId, RemoveDeviceId } = AccountReducer.actions
export const selectDeviceId = (state) => state.deviceid.deviceId;
export default AccountReducer.reducer