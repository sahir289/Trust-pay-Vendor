/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BankResponse {
  data: any;
  id: string | null;
  sno: number | null; // Updated from string to number
  upi_short_code: string | null;
  amount: number | null;
  status: string;
  bank_id: string | null;
  nick_name : string | null;
  utr: string | null;
  is_used: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PayInDetails {
  merchant_order_id: string | null;
  status: string;
}

export interface CheckUtrHistory {
  id: string | null;
  sno: number | null;
  payin_details: PayInDetails;
  utr: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DataEntryState {
  bankResponse?: BankResponse[];
  checkUtrHistory?: CheckUtrHistory[];
  resetHistory?: ResetHistory[];
  totalCount: number;
  loading: boolean;
  filter?: any;
  error: string | null;
  refreshDataEntries?: boolean;
  isloadingDataEntries?: boolean;
}

export interface ResetHistory {
  id: string | null;
  sno: number | null; // Updated from string to number
  upi_short_code: string | null;
  amount: number | null;
  confirmed: string;
  duration: string | null;
  utr: string | null;
  merchant_order_id: string |null;
  user_submitted_utr: string | null;
  is_used: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ResetHistoryState {
  resetHistory: ResetHistory[];
  totalCount: number;
}


export interface AddDataSearch{
 totalCount: number,
  totalPages: number,
  resetHistory?: ResetHistory[]
  bankResponses?: BankResponse[]
  checkUtr?:CheckUtrHistory[]
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}