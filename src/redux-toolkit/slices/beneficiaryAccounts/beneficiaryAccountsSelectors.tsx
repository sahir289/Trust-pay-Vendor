/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from '../../store/store';
import { BeneficiaryAccount,BeneficiaryAccountsState,Beneficiaries } from './beneficiaryAccountsTypes';

// Select all bank details from the store
export const selectAllBeneficiaryAccounts = (state: RootState): BeneficiaryAccountsState =>
  state.beneficiaryAccount;
export const selectAllBankNames = (state: RootState): Beneficiaries[] =>
  state.beneficiaryAccount.beneficiaries;
// Select a single bank detail by ID
export const selectBeneficiaryAccountsById = (
  state: RootState,
  bankId: string,
): BeneficiaryAccount | undefined =>
state.beneficiaryAccount.beneficiaryAccount.find((user) => user.id === bankId);

export const getRefreshBeneficiaryAccounts = (state: RootState) => state.beneficiaryAccount.refreshBankDetails;
