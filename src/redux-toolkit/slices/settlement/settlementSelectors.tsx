/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from "../../store/store";

// Select the entire list of payouts
export const getAllSettlementData = (state: RootState) => state.settlement;

// Select a specific settlement by ID
export const getSettlementById = (id: string) => (state: RootState) =>
  state.settlement.settlement.find((p) => p.id === id);

// Select amount for a specific settlement
export const selectAmount = (id: string) => (state: RootState) =>
  state.settlement.settlement.find((p) => p.id === id)?.amount;

// Select status for a specific settlement
export const selectStatus = (id: string) => (state: RootState) =>
  state.settlement.settlement.find((p) => p.id === id)?.status;

export const getRefreshSettlement = (state: RootState) => state.settlement.refreshSettlement;

