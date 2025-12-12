import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PayIn, PayInState } from "./payinTypes";
import { Status } from "@/constants";

const initialState: PayInState = {
  payin: [],
  totalCount: 0,
  loading: false,
  filter: {},
  error: null,
  refreshPayIn: false,
  isloadingPayinEntries: true,
  // getSumPayin : false,
};

interface FilterState {
  merchant_id?: string[];
  status?: string;
  [key: string]: string | string[] | undefined;
}

// Define interface for PayIn with active tab
interface PayInWithTab extends PayIn {
  _activeTab?: number;
  
}

const payinSlice = createSlice({
  name: 'payin',
  initialState,
  reducers: {
    getPayIns: (state, action: PayloadAction<PayInState>) => {
      state.payin = action.payload.payin;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    addPayIn: (state, action: PayloadAction<PayIn>) => {
      state.payin.push(action.payload);
      state.totalCount++;
    },
    setPayInFilter: (state, action: PayloadAction<FilterState>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearPayInFilter: (state) => {
      state.filter = {};
    },
    updateAmount: (
      state,
      action: PayloadAction<{ id: string; amount: number }>,
    ) => {
      const payin = state.payin.find((p) => p.id === action.payload.id);
      if (payin) {
        payin.amount = action.payload.amount;
      }
    },
    updateStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>,
    ) => {
      const payin = state.payin.find((p) => p.id === action.payload.id);
      if (payin) {
        payin.status = action.payload.status;
      }
    },
    updateIsNotified: (
      state,
      action: PayloadAction<{ id: string; is_notified: boolean }>,
    ) => {
      const payin = state.payin.find((p) => p.id === action.payload.id);
      if (payin) {
        payin.is_notified = action.payload.is_notified;
      }
    },
    setRefreshPayIn: (state, action) => {
      state.refreshPayIn = action.payload;
    },
    // setSumPayIn: (state, action) => {
    //   state.getSumPayin = action.payload;
    // },
    setIsloadingPayinEntries: (state, action) => {
      state.isloadingPayinEntries = action.payload;
    },
    updateSinglePayinEntry(state, action: PayloadAction<PayInWithTab>) {
      const { _activeTab, ...updated } = action.payload;
      try {
        if (!updated?.id) {
          return state;
        }

        // Create a clean copy of filters
        const filters = JSON.parse(JSON.stringify(state.filter || {}));

        const searchInAddData = window.sessionStorage.getItem('searchInAddData')        
        // If no filters are set, proceed with normal update
        const hasNoFilters = !Object.keys(filters).length;
        const hasFiltersAndSearch = Object.keys(filters).length > 0 && searchInAddData === 'true';

        if (hasFiltersAndSearch) {
          console.warn('Cannot add entry when both search and filters are active.');
          return state;
        }
        if (hasNoFilters) {
          // Define logic for handling tab-based updates
          if (!state.loading  && searchInAddData !== 'true') {
            const index = state.payin.findIndex(item => item.id === updated.id);

            const shouldAdd = 
            (_activeTab === 0) ||
            (_activeTab === 1 && updated.status === Status.SUCCESS) ||
            (_activeTab === 2 && [Status.INITIATED, Status.ASSIGNED].includes(updated.status)) ||
            (_activeTab === 3 && [Status.DROPPED, Status.FAILED].includes(updated.status)) ||
            (_activeTab === 4 && [Status.PENDING, Status.IMAGE_PENDING, Status.DISPUTE, Status.BANK_MISMATCH, Status.DUPLICATE].includes(updated.status));
            if (index !== -1 && shouldAdd) {
              // Update existing entry
              state.payin[index] = {
                ...state.payin[index],
                ...updated
              };
            } else {
              // Add new entry if it matches tab conditions
              const shouldAdd = 
                (_activeTab === 0) ||
                (_activeTab === 1 && updated.status === Status.SUCCESS) ||
                (_activeTab === 2 && [Status.INITIATED, Status.ASSIGNED].includes(updated.status)) ||
                (_activeTab === 3 && [Status.DROPPED, Status.FAILED].includes(updated.status)) ||
                (_activeTab === 4 && [Status.PENDING, Status.IMAGE_PENDING, Status.DISPUTE, Status.BANK_MISMATCH, Status.DUPLICATE].includes(updated.status));

              if (shouldAdd) {
                state.payin.unshift(updated);
                if (state.payin.length > 20) {
                  state.payin.pop();
                  state.totalCount++;
                } else {
                  state.totalCount++;
                }
              }
            }
          }
          return state;
        }

        // Check if updated data matches current filters
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) return true;

          switch(key) {
            case 'merchant_id':
              if (Array.isArray(value)) {
                return value.includes(updated.merchant_id);
              }
              return updated.merchant_id === value;
              
            case 'user_ids':
              if (Array.isArray(value)) {
                return value.includes(updated.vendor_user_id);
              }
              return updated.vendor_code === value;

            case 'status':
              return updated.status === value;

            case 'updated_at':
              return updated.updated_at?.includes(value.toString());

            case 'user_submitted_utr':
              return updated.user_submitted_utr?.toLowerCase()
                .includes(value.toString().toLowerCase());

            case 'merchant_order_id':
              return updated.merchant_order_id?.toLowerCase()
                .includes(value.toString().toLowerCase());

            case 'utr':
              return updated.user_submitted_utr?.toLowerCase()
                .includes(value.toString().toLowerCase());

            case 'nick_name':
              return updated.nick_name?.toLowerCase()
                .includes(value.toString().toLowerCase());

            case 'bank_acc_id':
              return updated.bank_acc_id === value;

            case 'amount':
              return Number(updated.amount) === Number(value);

            case 'user':
              return updated.user?.toLowerCase()
                .includes(value.toString().toLowerCase());

            default:
              return true;
          }
        });

        // Only proceed if filters match
        if (!matchesFilters) {
          // If entry exists but no longer matches filters, remove it
          const index = state.payin.findIndex(item => item.id === updated.id);
          if (index !== -1) {
            state.payin.splice(index, 1);
            if (state.totalCount > 0) state.totalCount--;
          }
          return state;
        }

        // Handle tab-based updates
        if (!state.loading) {
          const index = state.payin.findIndex(item => item.id === updated.id);

          if (index !== -1) {
            // Update existing entry
            state.payin[index] = {
              ...state.payin[index],
              ...updated
            };
          } else {
            // Add new entry if it matches tab conditions
            const shouldAdd = 
              (_activeTab === 0) ||
              (_activeTab === 1 && updated.status === 'SUCCESS') ||
              (_activeTab === 2 && ['INITIATED', 'ASSIGNED'].includes(updated.status)) ||
              (_activeTab === 3 && ['DROPPED', 'FAILED'].includes(updated.status)) ||
              (_activeTab === 4 && ['PENDING', 'IMAGE_PENDING', 'DISPUTE', 'BANK_MISMATCH', 'DUPLICATE'].includes(updated.status));

            if (shouldAdd) {
              state.payin.unshift(updated);
              if (state.payin.length > 20) {
                state.payin.pop();
              } else {
                state.totalCount++;
              }
            }
          }
        }

      } catch (error) {
        console.error('Error updating payin entry:', error);
        return state;
      }
    }
  },
});

export const {
  getPayIns,
  setIsloadingPayinEntries,
  updateSinglePayinEntry,
  onload,
  addPayIn,
  setPayInFilter,
  clearPayInFilter,
  updateAmount,
  updateStatus,
  updateIsNotified,
  setRefreshPayIn,
} = payinSlice.actions;
export default payinSlice.reducer;
