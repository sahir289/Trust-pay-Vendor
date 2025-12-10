/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '@/redux-toolkit/services/api';
import { ApiResponse,PayOutsSearchResponse } from './payoutTypes';
export const getAllPayOuts = async (queryString: string) => {
  try {
    const response = await api.get(`/payOut?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const getPayOutsReports = async (
  queryString: string,
) => {
  try {
    const response = await api.get<ApiResponse<PayOutsSearchResponse>>(
      `/payOut/reports?${queryString}`,
    );
    return response?.data?.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching payin details by search');
  }
};

export const createPayOut = async (data: any = {}, api_key: string) => {
  try {
    const response = await api.post(`/payOut/generate-payout`, data, {
      headers: {
        'x-api-key': api_key,
      },
    });
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const updatePayOuts = async (id: string | undefined, data: any = {}) => {
  try {
    const response = await api.put(`/payOut/update-payout/${id}`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const assigenedPayOuts = async (id: string | undefined, data: any = {}) => {
  try {
    const response = await api.put(`/payOut/assign-vendor-payout/${id}`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
  }
};

export const getWalletBalance = async () => {
  try {
    const response = await api.get(`/payOut/payassist/wallets-balance`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const getTataPayBalance = async () => {
  try {
    const response = await api.get(`/payOut/tatapay/tatapay-balance`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const getClickrrWalletBalance = async () => {
  try {
    const response = await api.get(`/payOut/clickrr/wallet-balance`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const tataPayBulkPayout = async (data: any = {}) => {
  try {
    const response = await api.post(`/payOut/tatapay/bulk-payout`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};
