/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BeneficiaryAccount {
    meta: any;
    error: any;
    id: string;
    acc_holder_name: string;
    bank_name: string;
    ifsc: string;
    acc_no: string;
    upiId: string;
    vendor: any;
    merchant: string;
    createdAt: string;
    user_id: string;
  }
  
  export interface BeneficiaryAccountSearchResponse {
    totalCount: number;
    totalPages: number;
    bankAccounts: BeneficiaryAccount[];
  }
  
  export interface Beneficiaries {
    value: string;
    label: string;
    bank_id: string;
  }
  
  export interface BeneficiaryAccountsState {
    beneficiaryAccount: BeneficiaryAccount[];
    beneficiaries: Beneficiaries[];
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
  