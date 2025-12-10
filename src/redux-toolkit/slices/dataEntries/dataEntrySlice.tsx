import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BankResponse } from './dataEntryTypes'; // or use the correct name
import { WritableDraft } from 'immer';
import { DataEntryState } from './dataEntryTypes';

const initialState: DataEntryState = {
  bankResponse: [],
  checkUtrHistory: [],
  resetHistory: [],
  totalCount: 0,
  loading: false,
  filter: {},
  error: null,
  refreshDataEntries: false,
  isloadingDataEntries:true,
};

interface FilterState {
  merchant_id?: string[];
  status?: string;
  [key: string]: string | string[] | undefined;
}

const dataEntrySlice = createSlice({
  name: 'dataEntry',
  initialState,
  reducers: {
    getBankResponses: (state, action: PayloadAction<DataEntryState>) => {
      state.bankResponse = action.payload?.bankResponse;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = null;
    },
    getCheckUtrHistories: (state, action: PayloadAction<DataEntryState>) => {
      state.checkUtrHistory = action.payload?.checkUtrHistory;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    setRefreshDataEntries: (state, action) => {
      state.refreshDataEntries = action.payload;
    },
    setIsloadingDataEntries: (state, action) => {
      state.isloadingDataEntries = action.payload;
    },
    getResetHistory: (state, action: PayloadAction<DataEntryState>) => {
      const {
        resetHistory,
        totalCount,
        loading,
        error,
        //  status, confirmed, payin_merchant_commission, payin_vendor_commission, user_submitted_utr, duration
      } = action.payload;
      state.resetHistory = resetHistory;
      state.totalCount = totalCount;
      state.loading = loading;
      state.error = typeof error === 'string' ? error : null; // Ensure it’s either a string or null
    },

    getBankResponsesExportSlice: (
      state,
      action: PayloadAction<BankResponse[]>,
    ) => {
      state.bankResponse = action.payload.map((entry) => ({
        ...entry,
      })) as WritableDraft<BankResponse>[];
      state.loading = false;
      state.error = null;
    },
    setResetHistory: (state, action: PayloadAction<DataEntryState>) => {
      state.resetHistory = action.payload.resetHistory;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = action.payload.error || null;
    },

    setBankResponseFilter: (state, action: PayloadAction<FilterState>) => {
      // Merge new filters with existing ones instead of replacing
      // console.log('Setting filter with payload:', action.payload);
      state.filter = { ...state.filter, ...action.payload };
    },

    clearBankResponseFilters: (state) => {
      state.filter = {};
    },

    updateSingleBankResponseEntry(state, action: PayloadAction<BankResponse>) {
      const updated = action.payload;
      try {
        if (!updated?.id) {
          return state;
        }

        // Create a plain object copy of filters to avoid proxy issues
        const filters = JSON.parse(JSON.stringify(state.filter || {}));
        
        // Check if updated data matches current filters
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) return true;

          // Handle specific filter types
          switch(key) {
            case 'is_used':
              return String(updated.is_used) === value;
            case 'bank_id':
              return updated.bank_id === value;
            case 'status':
              return updated.status === value;
            case 'amount':
              return String(updated.amount) === String(value);
            case 'utr':
              return updated.utr?.toLowerCase().includes(String(value).toLowerCase());
            case 'upi_short_code':
              return updated.upi_short_code?.toLowerCase().includes(String(value).toLowerCase());
            case 'updated_by':
              return updated.updated_by?.toLowerCase().includes(String(value).toLowerCase());
            default:
              return true;
          }
        });

        const index = (state.bankResponse ?? []).findIndex(item => item?.id === updated?.id);
        const updatedData = updated?.data || updated;

        const searchInAddData = window.sessionStorage.getItem('searchInAddData')   

        if (index !== -1) {
          // Update existing entry if it matches filters
          if (matchesFilters) {
            if (!state.bankResponse) {
              state.bankResponse = [];
            }
            state.bankResponse[index] = {
              ...state.bankResponse[index],
              ...updatedData
            };
          }
        } else if (matchesFilters) {
          // Add new entry if it matches filters
          if (!state.bankResponse) {
            state.bankResponse = [];
          }
          if(searchInAddData !== 'true'){        
            state.bankResponse.unshift(updated);
            state.totalCount++;
          }
          if (state.bankResponse.length > 20) {
            state.bankResponse.pop();
            state.totalCount++;
          }
      }

      } catch (error) {
        console.error('Error updating bank response entry:', error);
        return state;
      }
    },
    addBankResponse: (state, action: PayloadAction<BankResponse>) => {
      const updated = action.payload;
      try {
        if (!updated?.id) {
          return state;
        }
        if (!state.bankResponse) {
          state.bankResponse = [];
        }
        state.bankResponse.unshift(updated);
        if (state.bankResponse.length > 0) {
          state.bankResponse.pop();
        }
      } catch (error) {
        console.error('Error updating payin entry:', error);
        return state;
      }
    },  
  },
});


export const {
  getBankResponses,
  getCheckUtrHistories,
  onload,
  getBankResponsesExportSlice,
  setRefreshDataEntries,
  addBankResponse,
  getResetHistory,
  setResetHistory,
  setIsloadingDataEntries,
  updateSingleBankResponseEntry,
  setBankResponseFilter,
  clearBankResponseFilters,  
} = dataEntrySlice.actions;

export default dataEntrySlice.reducer;
