export interface merchants {
  message: merchants | undefined;
  error: merchants | undefined;
  id: string;
  role_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  code: string;
  min_payin: number;
  max_payin: number;
  payin_commission: number;
  min_payout: number;
  max_payout: number;
  payout_commission: number;
  is_test_mode: boolean;
  is_enabled: boolean;
  dispute_enabled: boolean;
  is_demo: boolean;
  balance: number;
  config?: {
    urls?: {
      site?: string;
      return?: string;
      payin_notify?: string;
      payout_notify?: string;
    };
    keys?: {
      private?: string;
      public?: string;
    };
    allow_intent?: boolean;
  };
  created_by: string;
  updated_by: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  designation_id: string;
  full_name: string;
  designation_name: string;
  loading: boolean;
}

export interface merchantsBySearchResponse {
  totalCount: number;
  totalPages: number;
  merchants: merchants[];
}

export interface merchantsByCode {
  public_key: string;
  code: string;
  id: string;
  payin_commission: string;
  payout_commission: string;
  min_payin: number;
  max_payin: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface MerchantCodes {
  value: string;
  label: string;
  merchant_id: string;
  submerchants: [];
}
export interface MerchantState {
  merchants: merchants[];
  merchantCodes: MerchantCodes[];
  loading: boolean;
  error: string | null;
  refreshMerchant: boolean;
  page: number;
  limit: number;
  count: number
}
