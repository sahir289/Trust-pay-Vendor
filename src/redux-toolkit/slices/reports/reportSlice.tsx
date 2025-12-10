// reportSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PayinReports, Reports, ReportState, VendorReports } from "./reportTypes";

// Initial State
const initialState: ReportState = {
  token: null,
  isAuthenticated: false,
  reports: [],
  payinReport: [],
  vendorReports: [],
  loading: false,
  error: null,
  refreshReports: false,
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    getMerchantReports: (state, action: PayloadAction<Reports[]>) => {
      state.reports = action.payload.map((merchantReport) => ({
        ...merchantReport,
        total_reverse_payout_count: 0,
        total_reverse_payout_amount: 0,
        total_reverse_payout_commission: 0,
      }));
      state.loading = false;
      state.error = null;
    },
    onloadMerchant: (state) => {
      state.loading = true;
    },
    setMerchantError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    getSelectedMerchantReports: (state, action: PayloadAction<Reports[]>) => {
      state.reports = action.payload.map((merchantReport) => ({
        ...merchantReport,
        total_reverse_payout_count: 0,
        total_reverse_payout_amount: 0,
        total_reverse_payout_commission: 0,
      }));
      state.loading = false;
      state.error = null;
    },
    getVendorReportsSlice: (state, action: PayloadAction<VendorReports[]>) => {
      state.reports = action.payload.map((report) => ({
        ...report,
        total_reverse_payout_count: report.total_payout_count || 0,
        total_reverse_payout_amount: report.total_payout_amount || 0,
        total_reverse_payout_commission: report.total_payout_commission || 0,
      }));
      state.loading = false;
      state.error = null;
    },
    onloadVendorReport: (state) => {
      state.loading = true;
    },
    setVendorReportError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    getSelectedVendorReportsSlice: (state, action: PayloadAction<VendorReports[]>) => {
      state.vendorReports = action.payload.map((vendorReport) => ({
        ...vendorReport,
        total_reverse_payout_count: 0,
        total_reverse_payout_amount: 0,
        total_reverse_payout_commission: 0,
      }));
      state.loading = false;
      state.error = null;
    },
    getPayInReportSlice: (state, action: PayloadAction<PayinReports[]>) => {
      state.payinReport = action.payload;
      state.loading = false;
      state.error = null;
    },
    //refresh for reports
    setRefreshReports: (state, action) => {
      state.refreshReports = action.payload;
    },
    getPayOutReportSlice: (state, action: PayloadAction<PayinReports[]>) => {
      state.payinReport = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  getMerchantReports, 
  onloadMerchant, 
  setRefreshReports,
  setMerchantError, 
  getSelectedMerchantReports,
  getVendorReportsSlice,
  onloadVendorReport,
  setVendorReportError,
  getSelectedVendorReportsSlice,
  getPayInReportSlice,
  getPayOutReportSlice
} = reportSlice.actions;

export default reportSlice.reducer;