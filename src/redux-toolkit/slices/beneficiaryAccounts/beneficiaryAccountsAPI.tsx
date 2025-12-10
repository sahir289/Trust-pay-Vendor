/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../services/api'; // Assuming this is your axios instance
import { ApiResponse, BeneficiaryAccount, BeneficiaryAccountSearchResponse } from './beneficiaryAccountsTypes';

// Fetch all beneficiaryAccounts
export const getAllBeneficiaryApi = async (
  queryString: string,
) => {
  try {
    const response = await api.get<ApiResponse<BeneficiaryAccount[]>>(
      `/beneficiaryAccounts?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching beneficiaryAccounts.');
  }
};

// Fetch all beneficiaryAccounts by Search
export const getAllBeneficiary = async (
  queryString: string,
): Promise<BeneficiaryAccountSearchResponse> => {
  try {
    const response = await api.get<ApiResponse<BeneficiaryAccountSearchResponse>>(
      `/beneficiaryAccounts/get?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching beneficiaryAccounts by search');
  }
};

// Create a new bank detail
export const addBeneficiaryApi = async (bankData: {
    accountName: string;
    bankName: string;
    ifsc: string;
    accountNumber: string;
    upiId: string;
    vendor: any;
    merchant: string;
    createdAt: string;
}): Promise<BeneficiaryAccount> => {
  try {
    const response = await api.post<BeneficiaryAccount>(
      '/beneficiaryAccounts/create-beneficiary',
      bankData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      throw new Error((error as any)?.response.data?.error || 'Failed to add beneficiaryAccounts.');
    }
    throw new Error('An unexpected error occurred while adding beneficiaryAccounts.');
  }
};

// Update an existing bank detail
export const updateBeneficiaryApi = async (
  id: string,
  bankData: Partial<BeneficiaryAccount>,
): Promise<BeneficiaryAccount> => {
  try {
    const response = await api.put<BeneficiaryAccount>(
      `/beneficiaryAccounts/update-beneficiary/${id}`,
      bankData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      throw new Error((error as any)?.response.data?.error || 'Failed to update beneficiaryAccounts.');
    }
    throw new Error('An unexpected error occurred while updating beneficiaryAccounts.');
  }
};

export const getAllBeneficiaryBankNames = async (type: string) => {
  try {
    const response = await api.get(`/beneficiaryAccounts/beneficiarybanknames?type=${type}`);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

// Delete a bank detail (Fixed incorrect API endpoint)
export const deleteBeneficiaryApi = async (id: string,): Promise<void> => {
  try {
    await api.delete(`/beneficiaryAccounts/delete-beneficiary/${id}`); // Corrected DELETE endpoint
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};