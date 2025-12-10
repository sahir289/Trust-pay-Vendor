import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {  MerchantCodes, MerchantState ,merchants} from "./merchantTypes";

const initialState: MerchantState = {
  merchants: [],
  merchantCodes: [],
  loading: false,
  error: null,
  refreshMerchant: false,
  page: 0,
  limit: 10,
  count: 0
};

const merchantSlice = createSlice({
  name: "merchants",
  initialState,
  reducers: {
    getMerchants: (state, action: PayloadAction<merchants[]>) => {
      state.merchants = action.payload;
      state.loading = false;
      state.error = null;
    },
    getMerchantCodes: (state, action: PayloadAction<MerchantCodes[]>) => {
      state.merchantCodes = action.payload;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    setRefreshmerchant: (state, action) => {
      state.refreshMerchant = action.payload;
    },
    getMerchantCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    addMerchant: (state, action: PayloadAction<merchants>) => {
      state.merchants.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateMerchant: (state, action: PayloadAction<merchants>) => {
      const updatedMerchant = action.payload;
      const index = state.merchants.findIndex((merchant) => merchant.id === updatedMerchant.id);
      if (index !== -1) {
        state.merchants[index] = updatedMerchant;
      }
      state.loading = false;
      state.error = null;
    },
    deleteMercHantData: (state, action: PayloadAction<string>) => {
      const merchantId = action.payload;
      state.merchants = state.merchants.filter((merchant) => merchant.id !== merchantId);
      state.loading = false;
      state.error = null;
    },
  },
});

export const { getMerchants, getMerchantCodes, addMerchant, updateMerchant, deleteMercHantData, onload, setRefreshmerchant, getMerchantCount } = merchantSlice.actions;
export default merchantSlice.reducer;
