export interface Chargeback {
    id: string;
    code: string;
    sno: number;
    merchant_user_id: string;
    vendor_user_id: string;
    payin_id: string;
    bank_acc_id: string;
    amount: number;
    when: string;
    created_by: string;
    updated_by : string;
    config: object;
    created_at: string;
    updated_at : string;
    designation_id : string;
  designation_name: string;
  statusCode: number;
  message: string;
  }
  
  export interface ApiChargebackResponse<T> {
    data: T;
    message?: string;
    status?: string;
  }
export interface ChargeBacksSearchResponse{
  totalCount: number;
  totalPages: number;
  chargeBacks: Chargeback[];
}
  export interface ChargebackState {
    chargeback: Chargeback[];
     loading: boolean;
    error: string | null;
    refreshChargeBacks: boolean;
     page: number
     limit: number
     count: number
  }