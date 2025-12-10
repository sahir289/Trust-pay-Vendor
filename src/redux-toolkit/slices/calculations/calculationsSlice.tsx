import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalculationsState } from "./calculationsTypes";

const initialState: CalculationsState = {
  calculations: [],
  merchantSuccessRate: [],
  merchantSuccessRateLoading: false,
  merchantSuccessRateError: null,
  totalCount: 0,
  loading: false,
  error: null,
};

const calculationsSlice = createSlice({
  name: "calculations",
  initialState,
  reducers: {
    getCalculations: (state, action: PayloadAction<CalculationsState>) => {
      state.calculations = action.payload.calculations;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    getMerchantSuccessRate: (state, action: PayloadAction<CalculationsState>) => {
      state.merchantSuccessRate = action.payload.merchantSuccessRate;
      state.merchantSuccessRateLoading = false;
      state.merchantSuccessRateError = null;
    },
    getMerchantSuccessRateLoading: (state, action: PayloadAction<boolean>) => {
      state.merchantSuccessRateLoading = action.payload;
    },
    getMerchantSuccessRateError: (state, action: PayloadAction<string | null>) => {
      state.merchantSuccessRateError = action.payload;
      state.merchantSuccessRateLoading = false;
    },
    clearMerchantSuccessRate: (state) => {
      state.merchantSuccessRate = [];
      state.merchantSuccessRateLoading = false;
      state.merchantSuccessRateError = null;
    }
  },
});

export const { getCalculations, onload } = calculationsSlice.actions;
export default calculationsSlice.reducer;
