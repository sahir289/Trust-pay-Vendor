/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from '../../store/store';
import { bankDetails,bankDetailsState,BankNames } from './bankDetailsTypes';

// Select all bank details from the store
export const selectAllBankDetails = (state: RootState): bankDetailsState =>
  state.bankDetails;
export const selectAllBankNames = (state: RootState): BankNames[] =>
  state.bankDetails.bankNames;
// Select a single bank detail by ID
export const selectBankDetailsById = (
  state: RootState,
  bankId: string,
): bankDetails | undefined =>
state.bankDetails.bankdetails.find((user) => user.id === bankId);

export const getRefreshBakDetails = (state: RootState) => state.bankDetails.refreshBankDetails;
