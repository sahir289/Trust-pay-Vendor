export interface MerchantData {
  total_payin_count: string;
  total_payin_amount: number;
  total_payin_commission: number;
  total_payout_count: string;
  total_payout_amount: number;
  total_payout_commission: number;
  total_reverse_payout_amount: number;
  total_settlement_amount: number;
  total_chargeback_amount: number;
  current_balance: number;
}

export interface VendorData {
  total_payin_count: string;
  total_payin_amount: number;
  total_payin_commission: number;
  total_payout_count: string;
  total_payout_amount: number;
  total_payout_commission: number;
  total_reverse_payout_amount: number;
  total_settlement_amount: number;
  total_chargeback_amount: number;
  current_balance: number;
}
export interface CalculationData {
  merchant: MerchantData;
  vendor: VendorData;
  netBalance: any;
}

export interface MerchantCodes {
  label: string;
  value: string;
}
