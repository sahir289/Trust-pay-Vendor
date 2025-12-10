/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from "../../store/store";

// Select the entire list of payouts
export const getAllPayOutData = (state: RootState) => state.payout;

// Select a specific payout by ID
export const getPayOutById = (id: string) => (state: RootState) =>
  state.payout.payout.find((p) => p.id === id);

// Select amount for a specific payout
export const selectAmount = (id: string) => (state: RootState) =>
  state.payout.payout.find((p) => p.id === id)?.amount;

// Select status for a specific payout
export const selectStatus = (id: string) => (state: RootState) =>
  state.payout.payout.find((p) => p.id === id)?.status;

export const getRefreshPayOut = (state: RootState) => state.payout.refreshPayOut;
export const getIsLoadPayOut = (state: RootState) =>
  state.payout.isloadingPayOutEntries;
