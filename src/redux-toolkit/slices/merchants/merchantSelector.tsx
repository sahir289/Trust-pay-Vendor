/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from "../../store/store";
import { merchants,MerchantCodes,MerchantState  } from './merchantTypes';

export const selectAllMerchants = (state: RootState): MerchantState=> state.merchants
export const selectAllMerchantCodes = (state: RootState): MerchantCodes[] =>
  state.merchants.merchantCodes;
export const selectMerchantById = (state: RootState, merchantId: string): merchants | undefined =>state.merchants.merchants.find((merchant) => merchant.id === merchantId);
// export const selectMerchantsCount = (state: RootState): number => state.merchant.length;

export const getRefreshMerchant = (state: RootState) => state.merchants.refreshMerchant;
