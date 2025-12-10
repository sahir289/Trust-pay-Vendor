/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from "../../store/store";

// Select the entire list of payins
export const getAllPayInData = (state: RootState) => state.payin;

// Select a specific payin by ID
export const getPayInById = (id: string) => (state: RootState) =>
  state.payin.payin.find((p) => p.id === id);

// Select amount for a specific payin
export const selectAmount = (id: string) => (state: RootState) =>
  state.payin.payin.find((p) => p.id === id)?.amount;

// Select status for a specific payin
export const selectStatus = (id: string) => (state: RootState) =>
  state.payin.payin.find((p) => p.id === id)?.status;

// Select is_notified for a specific payin
export const selectIsNotified = (id: string) => (state: RootState) =>
  state.payin.payin.find((p) => p.id === id)?.is_notified;

export const getRefreshPayIn = (state: RootState) => state.payin.refreshPayIn;
export const getIsloadingPayinEntries = (state: RootState) =>
  state.payin.isloadingPayinEntries;
// export const getSumPayIn = (state: RootState) => state.payin.getSumPayin;
