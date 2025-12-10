interface MerchantDetails {
  merchant_code: string;
  return_url: string | null;
  notify_url: string | null;
}

export interface PayOut {
  id: string | null;
  sno: number | null;
  user: string | null;
  amount: number | null;
  status: string;
  merchant_order_id: string | null;
  payout_merchant_commission: number | null;
  payout_vendor_commission: number | null;
  approved_at: string | null;
  rejected_at?: string | null;
  failed_reason?: string | null;
  rejected_reason?: string | null;
  acc_no: string | null;
  acc_holder_name: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  upi_id: string | null;
  utr_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  vendor_code: string | null; // Added
  nick_name: string | null; // Added
  merchant_details: MerchantDetails;
}

export interface PayOutState {
  payout: PayOut[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refreshPayOut: boolean;
  isloadingPayOutEntries: boolean;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: string;
}
  
export interface PayOutsSearchResponse {
  totalCount: number;
  totalPages: number;
  payout: PayOut[];
  loading: boolean;
  error: string | null;
  refreshPayOut: boolean;
  isloadingPayOutEntries: boolean;
}