import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { bankDetails, BankNames, bankDetailsState } from './bankDetailsTypes';

const initialState: bankDetailsState = {
  bankdetails: [],
  bankNames: [],
  loading: false,
  error: null,
  count: 0,
  refreshBankDetails: false,
};

const bankDetailSlice = createSlice({
  name: 'bankDetails',
  initialState,
  reducers: {
    getBankDetailsSlice: (state, action: PayloadAction<bankDetails[]>) => {
      state.bankdetails = action.payload;
      state.loading = false;
      state.error = null;
    },
    getBankNames: (state, action: PayloadAction<BankNames[]>) => {
      state.bankNames = action.payload;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    addBankDetailSlice: (state, action: PayloadAction<bankDetails>) => {
      state.bankdetails.push(action.payload);
      state.count++;
      state.loading = false;
      state.error = null;
    },
    setRefreshBankDetails: (state, action) => {
      state.refreshBankDetails = action.payload;
    },
    updateBankDetailSlice: (state, action: PayloadAction<bankDetails>) => {
      const updatedBankDetail = action.payload;
      const index = state.bankdetails.findIndex(
        (user) => user.id === updatedBankDetail.id,
      );
      if (index !== -1) {
        state.bankdetails[index] = updatedBankDetail;
      }
      state.loading = false;
      state.error = null;
    },
    deleteBankDetailSlice: (state, action: PayloadAction<string>) => {
      state.bankdetails = state.bankdetails.filter((user) => user.id !== action.payload);
       state.loading = false;
       state.error = null;
    },
    getBankCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

export const {
  getBankDetailsSlice,
  addBankDetailSlice,
  setRefreshBankDetails,
  getBankNames,
  updateBankDetailSlice,
  deleteBankDetailSlice,
  getBankCount,
   onload,
} = bankDetailSlice.actions;
export default bankDetailSlice.reducer;