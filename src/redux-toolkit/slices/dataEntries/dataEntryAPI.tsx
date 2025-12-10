/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '@/redux-toolkit/services/api';

import { AddDataSearch, ApiResponse } from './dataEntryTypes';
export const getAllBankResponses = async (queryString: string) => {
  try {
    const response = await api.get(`/bankResponse?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};


export const getBankResponsesReports = async (queryString: string) => {
  try {
    const response = await api.get(
      `/bankResponse/BankResponseReports?${queryString}`,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

export const getAllCheckUtrHistories = async (queryString: string) => {
  try {
    const response = await api.get(`/checkUtr?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};
export const getAllCheckUtrHistoriesBySearchApi = async (
  queryString: string,
): Promise<AddDataSearch> => {
  try {
    const response = await api.get<ApiResponse<AddDataSearch>>(
      `/checkUtr/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while fetching data by search',
    );
  }
};

export const createBankResponses = async (data: any) => {
  try {
    const response = await api.post(`/bankResponse/create-message`, {
      body: data,
    });
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

export const payinCheckUTR = async (data: any = {}) => {
  try {
    const response = await api.post(`/payIn/telegram-check-utr`, data);
    return response;
  } catch (error: any) {
    if (error?.isAxiosError && error?.response) {
      throw error.response.data; // Throw the entire error response
    }
    throw new Error('An unexpected error occurred');
  }
};

// export const createCheckUTR = async (data: any = {}) => {
//   try {
//     const response = await api.post(`/checkUtr/create`, data);
//     return response.data;
//   } catch (error) {
//     if ((error as any)?.isAxiosError && (error as any)?.response) {
//       return (error as any)?.response.data?.error;
//     }
//     return undefined; // Ensure all code paths return a value
//   }
// };

export const resetBankResponse = async (id: string, data: any = {}) => {
  try {
    const response = await api.put(`/bankResponse/reset-message/${id}`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

export const updateBankResponse = async (id: string, data: any) => {
  try {
    const response = await api.put(`/bankResponse/update-message/${id}`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};
export const getResetHistoryBySearchApi = async (
  queryString: string,
): Promise<AddDataSearch> => {
  try {
    const response = await api.get<ApiResponse<AddDataSearch>>(
      `/resetHistory/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while fetching data by search',
    );
  }
};

export const getBankResponseBySearchApi = async (
  queryString: string,
): Promise<AddDataSearch> => {
  try {
    const response = await api.get<ApiResponse<AddDataSearch>>(
      `/bankResponse/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while fetching data by search',
    );
  }
};

export const updateBankResponseUTR = async (id: string, data: any) => {
  try {
    const response = await api.put(
      `/bankResponse/update-message-utr/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

export const resetDataHistory = async (payload: { merchant_order_id: any }) => {
  try {
    const response = await api.post(`/payIn/reset-payment`, payload);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

export const getAllResetHistory = async (queryString: string = '') => {
  try {
    const response = await api.get(`/resetHistory?${queryString}`);
    return {
      bankResponse: [],
      checkUtrHistory: [],
      resetHistory: response.data.data.resetHistory,
      totalCount: response.data.data.totalCount,
      loading: false,
      error: null,
      refreshDataEntries: false,
    };
  } catch {
    return {
      bankResponse: [],
      checkUtrHistory: [],
      resetHistory: [],
      totalCount: 0,
      loading: false,
      error: 'Failed to fetch reset history',
      refreshDataEntries: false,
    };
  }
};

// Import bank response data
export const importBankResponse = async (formData: any) => {
  try {
    const response = await api.post(`/bankResponse/import-bank-response`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};