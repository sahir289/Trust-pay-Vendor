/* eslint-disable @typescript-eslint/no-explicit-any */
export interface bankDetails {
  error: any;
  id: string;
  accountName: string;
  bankDetails: string;
  accountNumber: string;
  upiId: string;
  limits: string;
  balance: number;
  bank_used_for: string;
  bankUsedFor: string;
  vendors: string;
  createdAt: string;
  lastScheduledAt: string;
  allowIntent: boolean;
  allowQR: boolean;
  allowPhonePay: boolean;
  showBank: boolean;
  status: string;
}

export interface BankDetailsSearchResponse {
  totalCount: number;
  totalPages: number;
  bankAccounts: bankDetails[];
}

export interface BankNames {
  value: string;
  label: string;
  bank_id: string;
}

export interface bankDetailsState {
  bankdetails: bankDetails[];
  bankNames: BankNames[];
  loading: boolean;
  error: string | null;
  count: number;
  refreshBankDetails: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
