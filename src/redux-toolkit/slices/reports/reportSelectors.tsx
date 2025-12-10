import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { PayinReports, Reports } from './reportTypes';
import { VendorReports } from './reportTypes';

//Selectors help fetch specific data from the store.

export const selectReports = (state: RootState): Reports[] =>
  state.report.reports;
export const selectVendorReports = (state: RootState): VendorReports[] =>
  state.report.reports;

export const selectPayinReports = createSelector(
  [(state: RootState): Reports[] => state.report.reports],
  (reports): PayinReports[] =>
    reports.map((report) => ({
      ...report,
      upi_short_code: (report as unknown as PayinReports).upi_short_code || '',
      amount: (report as unknown as PayinReports).amount || 0,
      status: (report as unknown as PayinReports).status || 'pending',
      user_submitted_utr:
        (report as unknown as PayinReports).user_submitted_utr || '',
      merchant_order_id:
        (report as unknown as PayinReports).merchant_order_id || '',
      bank_acc_id: (report as unknown as PayinReports).bank_acc_id || '',
      merchant_id: (report as unknown as PayinReports).merchant_id || '',
    })) as unknown as PayinReports[]
);

export const selectPayoutReports = createSelector(
  [(state: RootState): Reports[] => state.report.reports],
  (reports): PayinReports[] =>
    reports.map((report) => ({
      ...report,
      merchant_order_id:
        (report as unknown as PayinReports).merchant_order_id || '',
      upi_short_code: (report as unknown as PayinReports).upi_short_code || '',
      payin_merchant_commission:
        (report as unknown as PayinReports).payin_merchant_commission || 0,
      amount: (report as unknown as PayinReports).amount || 0,
      status: (report as unknown as PayinReports).status || 'pending',
      user_submitted_utr:
        (report as unknown as PayinReports).user_submitted_utr || '',
      bank_acc_id: (report as unknown as PayinReports).bank_acc_id || '',
      merchant_id: (report as unknown as PayinReports).merchant_id || '',
    })) as unknown as PayinReports[]
);
//refresh for accounts
export const getRefreshReports = (state: RootState): Reports[] => state.report.reports;

