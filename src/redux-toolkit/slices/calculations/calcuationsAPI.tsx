/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '@/redux-toolkit/services/api';

export const getAllCalculations = async (queryString: string) => {
  try {
    const response = await api.get(`/calculation?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

export const getAllMerchantsSuccessRate = async (payload: {
  user_ids: string[];
  date: string;
}) => {
  try {
    const response = await api.post('/calculation/success_ratio', payload);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined;
  }
};

export const getClaimCalculations = async (queryString: string) => {
  try {
    const response = await api.get(`/bankResponse/claim?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined;
  }
};

export const updateCalculations = async (data: any) => {
  try {
    const response = await api.put(`/calculation/update-calculations`, data);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined;
  }
};
