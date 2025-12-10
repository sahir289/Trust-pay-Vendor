import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Settlement, SettlementState } from "./settlementTypes";

const initialState: SettlementState = {
  settlement: [],
  totalCount: 0,
  loading: false,
  error: null,
  refreshSettlement: false,
};

const settlementSlice = createSlice({
  name: "settlement",
  initialState,
  reducers: {
    getSettlements: (state, action: PayloadAction<Settlement[]>) => {
      state.settlement = action.payload;
      state.loading = false;
      state.error = null;
    },
    getSettlementsExportSlice: (state, action: PayloadAction<Settlement[]>) => {
      state.settlement = action.payload;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    addSettlement: (state, action: PayloadAction<Settlement>) => {
      state.settlement.push(action.payload);
      state.totalCount++;
    },
    updateReset: (state, action: PayloadAction<{ id: string; status: string, rejected_reason: string }>) => {
      const settlement = state.settlement.find((p) => p.id === action.payload.id);
      if (settlement) {
        settlement.status = action.payload.status;
        settlement.rejected_reason = action?.payload?.rejected_reason; }
    },
    setRefreshSettlement: (state, action) => {
      state.refreshSettlement = action.payload;
    },
    updateStatus: (state, action: PayloadAction<{ id: string; status: string, reference_id:string, rejected_reason: string }>) => {
      const settlement = state.settlement.find((p) => p.id === action.payload.id);
      if (settlement) {
        settlement.status = action.payload.status;
        settlement.reference_id = action?.payload?.reference_id; // Ensure correct property naming
        settlement.rejected_reason = action?.payload?.rejected_reason; // Ensure correct property naming
      }
    },
    updateUTR : (state, action: PayloadAction<{ id: string; reference_id: string }>) => {
      const settlement = state.settlement.find((p) => p.id === action.payload.id);
      if (settlement) {
        settlement.reference_id = action?.payload?.reference_id; // Ensure correct property naming
      }
    },    
    deleteSettlementSlice: (state, action: PayloadAction<string>) => {
      const settlementId = action.payload;
      state.settlement = state.settlement.filter((settlement) => settlement.id !== settlementId);
    },

    getMerchantSettlementCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
  },
});

export const { getSettlements,getSettlementsExportSlice,setRefreshSettlement, onload, addSettlement, updateStatus, deleteSettlementSlice, updateUTR, updateReset, getMerchantSettlementCount } = settlementSlice.actions;
export default settlementSlice.reducer;