import { RootState } from '../../store/store';
import { Vendor, VendorCodes, VendorState } from './vendorTypes';

//Selectors help fetch specific data from the store.

export const selectVendors = (state: RootState): VendorState =>
  state.vendors;
// export const selectUserById = (state: RootState, vendorId: string): Vendor | undefined =>
//   state.vendors.vendors.find((vendors) => vendors.id === vendorId);
// export const selectUserById = (state: RootState, vendorId: string): Vendor | undefined =>
//   state.vendors.vendors.find((vendors) => vendors.id === vendorId);
export const selectUserById = (
  state: RootState,
  vendorId: string,
): Vendor | undefined =>
  state.vendors.vendors.find((vendor) => vendor.id === vendorId);


export const selectAllVendorCodes = (state: RootState): VendorCodes[] =>
  state.vendors.vendorCodes;

export const getRefreshVendor = (state: RootState) => state.vendors.refreshVendor;
