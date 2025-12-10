/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chargeback, ChargebackState } from "./chargebackType";

const initialState: ChargebackState = {
  chargeback: [],
  loading: false,
  error: null,
  refreshChargeBacks:false,
  page: 0,
  limit: 10,
  count: 0
};

const userSlice = createSlice({
  name: "chargeback",
  initialState,
  reducers: {
    getChargebacks: (state, action: PayloadAction<Chargeback[]>) => {
      state.chargeback = action.payload;
       state.loading = false;
       state.error = null;
    },
     onload: (state) => {
      state.loading = true;
    },
    addChargebacks: (state, action: PayloadAction<Chargeback>) => {
      state.chargeback.push(action.payload);
       state.loading = false;
       state.error = null;
    },
    setRefreshChargeBacks: (state, action) => {
      state.refreshChargeBacks = action.payload;
    },
    updateChargebacks: (state, action: PayloadAction<Chargeback>) => {
      const updatedChargeback = action.payload;
      const index = state.chargeback.findIndex((chargeback) => chargeback.id === updatedChargeback.id);
      if (index !== -1) {
        state.chargeback[index] = updatedChargeback;
      }
    },
    getChargeBackCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

export const { getChargebacks, addChargebacks,setRefreshChargeBacks, updateChargebacks,onload, getChargeBackCount } = userSlice.actions;
export default userSlice.reducer;
