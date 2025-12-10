/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Vendor {
  error: any;
  id: string;
  role_id: number;
  user_id: string;
  full_name: number;
  code: string;
  payin_commission: string;
  payout_commission: string;
  balance: string;
  created_by: string;
  updated_by: string;
  config: object;
  created_at: string;
  updated_at: string;
  designation_id: string;
  designation_name: string;
}

export interface VendorsBySearchResponse {
  totalCount: number;
  totalPages: number;
  Vendors: Vendor[];
}
export interface ApiVendorResponse<T> {
  data: T;
  message?: string;
  status?: string;
}
export interface VendorState {
  data: any;
  vendors: Vendor[];
  vendorCodes: VendorCodes[];
  loading: boolean;
  error: string | null;
  refreshVendor: boolean;
  count: number
}

export interface VendorCodes {
  label: string;
  value: string;
  vendor_id: string;
  subVendors: [];
}

export interface vendorsByCode {
  code: string;
  id: string;
  payin_commission: string;
  payout_commission: string;
  min_payin: number;
  max_payin: number;
}
