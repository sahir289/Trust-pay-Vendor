import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PayOut, PayOutState } from "./payoutTypes";

const initialState: PayOutState = {
  payout: [],
  totalCount: 0,
  loading: false,
  error: null,
  refreshPayOut: false,
  isloadingPayOutEntries:true,
};

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    getPayOuts: (state, action: PayloadAction<PayOutState>) => {
      state.payout = action.payload.payout;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    addPayOut: (state, action: PayloadAction<PayOut>) => {
      state.payout.push(action.payload);
    },
    updateAmount: (
      state,
      action: PayloadAction<{ id: string; amount: number }>,
    ) => {
      const payout = state.payout.find((p) => p.id === action.payload.id);
      if (payout) {
        payout.amount = action.payload.amount;
      }
    },
    getTotalCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
    updateStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>,
    ) => {
      const payout = state.payout.find((p) => p.id === action.payload.id);
      if (payout) {
        payout.status = action.payload.status;
      }
    },
    setRefreshPayOut: (state, action) => {
      state.refreshPayOut = action.payload;
    },
    setIsloadingPayOutEntries: (state, action) => {
      state.isloadingPayOutEntries = action.payload;
    },
  },
});

export const {
  getPayOuts,
  getTotalCount,
  onload,
  addPayOut,
  updateAmount,
  updateStatus,
  setRefreshPayOut,
  setIsloadingPayOutEntries,
} = payoutSlice.actions;
export default payoutSlice.reducer;
