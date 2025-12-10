/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '@/redux-toolkit/services/api';
import { PayinsSearchResponse,ApiResponse } from './payinTypes';
export const getAllPayIns = async (queryString: string) => {
  try {
    const response = await api.get(`/payIn?${queryString}`);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const getAllPayInsSum = async () => {
  try {
    const response = await api.get(`/payIn/getPayinSummary`);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
  }
};

export const getPayInsSearch = async (
  queryString: string,
): Promise<PayinsSearchResponse> => {
  try {
    const response = await api.get<ApiResponse<PayinsSearchResponse>>(
      `/payIn/search?${queryString}`,
    );
    return response?.data?.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching payin details by search');
  }
};


export const updatePayIns = async (url: string, data: any = {}) => {
  try {
    let response = await api.put(`/payIn/${url}`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const updatePayInsData = async (url: string, data: any = {}) => {
  try {
    let response = await api.put(`/payIn/updatePayin/${url}`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

export const createPayIn = async (queryString: string, api_key?: string) => {
  try {
    const config = api_key
    ? { headers: { 'x-api-key': api_key } }
    : {}; 
    const response = await api.get(`/payIn/generate-payin?${queryString}`,config);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
   }
};

//process/:merchantOrderId for updating image - > utr manually
export const processUtr = async (merchantOrderId: string, data: any) => {
  try {
    const response = await api.post(
      `/payIn/processIMGUTR/${merchantOrderId}`,
      data,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
  }
};
export const checkPendingStatus = async () => {
  try {
    const response = await api.get(`/payIn/checkPendingPayinStatus`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
  }
};

export const generateHashCode = async (queryString: string, api_key?: string) => {
  try {
    const config = api_key
      ? { headers: { 'x-api-key': api_key } }
      : {}; 

    const response = await api.get(`/payIn/generate-hash?${queryString}`, config);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
  }
};
