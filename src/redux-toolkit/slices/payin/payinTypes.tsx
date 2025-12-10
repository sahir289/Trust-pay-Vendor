/* eslint-disable @typescript-eslint/no-explicit-any */

interface BankResponse {
  amount: number | null;
  utr: string | null;
}

interface UserLocation {
  user_ip: string;
  continent: string;
  continent_code: string;
  country: string;
  region: string;
  timezone: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

interface PayInDetails {
  hi: string;
  user: UserLocation;
}

interface MerchantDetails {
  merchant_code: string;
  return_url: string | null;
  notify_url: string | null;
  dispute: boolean;
}

export interface PayIn {
  id: string | null;
  sno: number | null; // Updated from string to number
  upi_short_code: string | null;
  amount: number | null;
  status: string;
  is_notified: boolean;
  merchant_id: string | null;
  vendor_user_id: string | null
  user_submitted_utr: string | null;
  merchant_order_id: string | null;
  user: string | null;
  payin_merchant_commission: number | null;
  payin_vendor_commission: number | null;
  user_submitted_image: string | null;
  duration: number | null;
  bank_acc_id: string | null;
  approved_at: string | null;
  failed_at?: string | null; // Optional if not always present
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  payin_details: PayInDetails; // Added from JSON structure
  vendor_code: string | null; // Added
  nick_name: string | null; // Added
  merchant_details: MerchantDetails; // More specific
  bank_res_details: BankResponse;
}


export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: string;
}
  
export interface PayinsSearchResponse{
  totalCount: number;
  totalPages: number;
  payins: PayIn[];
}

export interface PayInState {
  payin: PayIn[];
  totalCount: any;
  loading: boolean;
  filter?: any;
  error: string | null;
  refreshPayIn: boolean;
  isloadingPayinEntries: boolean;
}
