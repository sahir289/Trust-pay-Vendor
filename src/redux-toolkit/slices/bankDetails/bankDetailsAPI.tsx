/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../services/api'; // Assuming this is your axios instance
import { ApiResponse, bankDetails, BankDetailsSearchResponse } from './bankDetailsTypes';

// Fetch all bank details
export const getAllBankDetailsApi = async (
  queryString: string,
) => {
  try {
    const response = await api.get<ApiResponse<bankDetails[]>>(
      `/bankDetails?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching bank details.');
  }
};

// Fetch all bank details by Search
export const getAllBankDetailsBySearchApi = async (
  queryString: string,
): Promise<BankDetailsSearchResponse> => {
  try {
    const response = await api.get<ApiResponse<BankDetailsSearchResponse>>(
      `/bankDetails/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching bank details by search');
  }
};

// Create a new bank detail
export const addBankDetailsApi = async (bankData: {
  accountName: string;
  bankDetails: string;
  accountNumber: string;
  upiId: string;
  limits: string;
  balance: number;
  bankUsedFor: string;
  vendors: string;
  createdAt: string;
  lastScheduledAt: string;
  allowIntent: boolean;
  allowQR: boolean;
  allowPhonePay: boolean;
  showBank: boolean;
  status: string;
}): Promise<bankDetails> => {
  try {
    const response = await api.post<bankDetails>(
      '/bankDetails/create-bank',
      bankData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      throw new Error((error as any)?.response.data?.error || 'Failed to add bank details.');
    }
    throw new Error('An unexpected error occurred while adding bank details.');
  }
};

// Update an existing bank detail
export const updateBankDetailsApi = async (
  id: string,
  bankData: Partial<bankDetails>,
): Promise<bankDetails> => {
  try {
    const response = await api.put<bankDetails>(
      `/bankDetails/update-bank/${id}`,
      bankData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      throw new Error((error as any)?.response.data?.error || 'Failed to update bank details.');
    }
    throw new Error('An unexpected error occurred while updating bank details.');
  }
};

export const getAllBankNames = async (type: string, user?: string, check_enabled?: boolean) => {
  try {
    let url: string = `/bankDetails/banknames?type=${type}`;
    if (user) {
      url += `&user=${user}`;
    }
    if (check_enabled) {
      url += `&check_enabled=true`;
    }
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

// Delete a bank detail (Fixed incorrect API endpoint)
export const deleteBankDetailsApi = async (id: string): Promise<void> => {
  try {
    await api.delete(`/bankDetails/delete-bank/${id}`); // Corrected DELETE endpoint
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};