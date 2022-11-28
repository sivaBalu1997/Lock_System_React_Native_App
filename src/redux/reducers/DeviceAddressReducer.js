import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  deviceAddress: null
}

export const DeviceAddressReducer = createSlice({
  name: 'deviceAdd',
  initialState,
  reducers: {
    addDeviceAddress: (state, action) => {
      state.deviceAddress = action.payload
    },
  },
})

export const { addDeviceAddress } = DeviceAddressReducer.actions
export const selectDeviceAddress = (state) => state.deviceAdd.deviceAddress;
export default DeviceAddressReducer.reducer