export interface Settlement {
  success: any;
  reference_id: string;
  id: string | null;
  sno: number | null;
  user_id: string | null;
  method : string | null;
  amount: number | null;
  status?: string;
  config?: {
    reference_id: string;
    rejected_reason?: string;
    bank_deatils? : {
      ifsc : string, acc_no : number, acc_holder_name: string , bank_name : string
    }
    [key: string]: any; 
  } | null; 
  approved_at: string | null;
  rejected_at?: string | null;
  rejected_reason?: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SettlementsSearchResponse {
   totalCount: number;
    totalPages: number;
    settlements: Settlement[];
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}
export interface SettlementState {
  settlement: Settlement[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refreshSettlement: boolean;
}

