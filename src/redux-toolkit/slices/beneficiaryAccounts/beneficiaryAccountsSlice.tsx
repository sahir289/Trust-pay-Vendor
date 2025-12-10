import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BeneficiaryAccount, Beneficiaries, BeneficiaryAccountsState } from './beneficiaryAccountsTypes';

const initialState: BeneficiaryAccountsState = {
  beneficiaryAccount: [],
  beneficiaries: [],
  loading: false,
  error: null,
  count: 0,
  refreshBankDetails: false,
};

const beneficiaryAccountSlice = createSlice({
  name: 'BeneficiaryAccount',
  initialState,
  reducers: {
    getBeneficiaryAccountSlice: (state, action: PayloadAction<BeneficiaryAccount[]>) => {
      state.beneficiaryAccount = action.payload;
      state.loading = false;
      state.error = null;
    },
    getBeneficiary: (state, action: PayloadAction<Beneficiaries[]>) => {
      state.beneficiaries = action.payload;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    addBeneficiaryAccountSlice: (state, action: PayloadAction<BeneficiaryAccount>) => {
      state.beneficiaryAccount.push(action.payload);
      state.count++;
      state.loading = false;
      state.error = null;
    },
    setRefreshBeneficiaryAccounts: (state, action) => {
      state.refreshBankDetails = action.payload;
    },
    updateBeneficiaryAccountSlice: (state, action: PayloadAction<BeneficiaryAccount>) => {
      const updatedBankDetail = action.payload;
      const index = state.beneficiaryAccount.findIndex(
        (user) => user.id === updatedBankDetail.id,
      );
      if (index !== -1) {
        state.beneficiaryAccount[index] = updatedBankDetail;
      }
      state.loading = false;
      state.error = null;
    },
    deleteBeneficiaryAccountSlice: (state, action: PayloadAction<string>) => {
      state.beneficiaryAccount = state.beneficiaryAccount.filter((user) => user.id !== action.payload);
       state.loading = false;
       state.error = null;
    },
    getBeneficiaryCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

export const {
  getBeneficiaryAccountSlice,
  addBeneficiaryAccountSlice,
  setRefreshBeneficiaryAccounts,
  getBeneficiary,
  updateBeneficiaryAccountSlice,
  deleteBeneficiaryAccountSlice,
  getBeneficiaryCount,
   onload,
} = beneficiaryAccountSlice.actions;
export default beneficiaryAccountSlice.reducer;