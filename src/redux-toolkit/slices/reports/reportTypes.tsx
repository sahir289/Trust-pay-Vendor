// reportTypes.ts
export interface Reports {
  id: string;
  user_id: string;
  total_payin_count: number;
  total_payin_amount: number;
  total_payin_commission: number;
  total_payout_count: number;
  total_payout_amount: number;
  total_payout_commission: number;
  total_settlement_count: number;
  total_settlement_amount: number;
  total_chargeback_count: number;
  total_chargeback_amount: number;
  total_reverse_payout_count: number;
  total_reverse_payout_amount: number;
  total_reverse_payout_commission: number;
  current_balance: number;
  net_balance: number;
  created_at: number;
  updated_at: number;
  code: string;
  calculation_user_id: string;
}

export interface PayinReports {
  merchant_order_id: string; upi_short_code: string;
  payin_merchant_commission: string; amount: string; user_submitted_utr: string;
  status: string; bank_acc_id: string; merchant_id: string
}

export interface PayoutReports {
  merchant_order_id: string; ifsc_code: string;
  payin_merchant_commission: string; amount: string; utr_id: string;
  status: string; bank_acc_id: string; merchant_id: string
}

export interface VendorReports {
  id: string;
  user_id: string;
  total_payin_count: number;
  total_payin_amount: number;
  total_payin_commission: number;
  total_payout_count: number;
  total_payout_amount: number;
  total_payout_commission: number;
  total_settlement_count: number;
  total_settlement_amount: number;
  total_chargeback_count: number;
  total_chargeback_amount: number;
  current_balance: number;
  net_balance: number;
  created_at: number;
  updated_at: number;
  code: string;
  calculation_user_id: string;
}

export interface ReportState {
  token: string | null;
  isAuthenticated: boolean;
  reports: Reports[];
  vendorReports: VendorReports[];
  payinReport: PayinReports[];
  loading: boolean;
  error: string | null;
  refreshReports: boolean;
}

export interface ApiReportsResponse<T> {
  data: T;
  message?: string;
  status?: string;
}