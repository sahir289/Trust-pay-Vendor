/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vendor, VendorCodes, VendorState } from './vendorTypes';

// Reducer
const initialState: VendorState = {
  data:[],
  vendors: [],
  vendorCodes: [],
  loading: false,
  error: null,
  refreshVendor: false,
  count: 0
};

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    getVendorsSlice: (state, action: PayloadAction<Vendor[]>) => {
      state.vendors = action.payload;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addVendor: (state, action: PayloadAction<Vendor>) => {
      state.vendors.push(action.payload);
    },
    setRefreshvendor: (state, action) => {
      state.refreshVendor = action.payload;
    },
    updateVendorSlice: (state, action: PayloadAction<Vendor>) => {
      const updatedVendor = action.payload;
      const index = state.vendors.findIndex(
        (vendor) => vendor.id === updatedVendor.id,
      );
      if (index !== -1) {
        state.vendors[index] = updatedVendor;
      }
    },
    deleteVendorSlice: (state, action: PayloadAction<string>) => {
      const vendorId = action.payload;
      state.vendors = state.vendors.filter((vendor) => vendor.id !== vendorId);
    },
    getVendorCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    getVendorCodes: (state, action: PayloadAction<VendorCodes[]>) => {
      state.vendorCodes = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  getVendorsSlice,
  addVendor,
  getVendorCodes,
  updateVendorSlice,
  deleteVendorSlice,setRefreshvendor,onload, setError, getVendorCount
} = vendorSlice.actions;
export default vendorSlice.reducer;
