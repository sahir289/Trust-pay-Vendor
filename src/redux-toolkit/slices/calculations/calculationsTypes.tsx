export interface calculations {
  id: string | null;
  user: number | null;
  total_payin_count: number | null;
  total_payin_amount: number | null;
  total_payin_commission: number | null;
  total_payout_count: number | null;
  total_payout_amount: number | null;
  total_payout_commission: number | null;
  total_reverse_payout_count: number | null;
  total_reverse_payout_amount: number | null;
  total_reverse_payout_commission: number | null;
  total_settlement_count: number | null;
  total_settlement_amount: number | null;
  total_chargeback_count: number | null;
  total_chargeback_amount: number | null;
  current_balance: number | null;
  net_balance: number | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CalculationsState {
  calculations: calculations[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  merchantSuccessRate: any[];
  merchantSuccessRateLoading: boolean;
  merchantSuccessRateError: string | null;
}
