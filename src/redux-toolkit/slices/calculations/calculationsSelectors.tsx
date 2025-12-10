/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from "../../store/store";

// Select the entire list of payouts
export const getAllCalculationsData = (state: RootState) => state.calculations;

// Select a specific calculations by ID
export const getCalculationById = (id: string) => (state: RootState) =>
  state.calculations.calculations.find((p) => p.id === id);