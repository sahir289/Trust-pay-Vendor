/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../services/api';
import { ApiChargebackResponse, Chargeback,ChargeBacksSearchResponse } from './chargebackType';

export const getChargeBacksApi = async (
  queryString: string,
) => {
  try {
    const response = await api.get<ApiChargebackResponse<Chargeback[]>>(
      `/chargeBacks?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching chargebacks.');
  }
};
;
export const getChargeBacksReportsApi = async (
  queryString: string,
): Promise<Chargeback[]> => {
  try {
    const response = await api.get<ApiChargebackResponse<Chargeback[]>>(
      `/chargeBacks/reports?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching chargebacks.');
  }
};
export const getChargeBacksBySearchApi = async (
  queryString: string,
): Promise<ChargeBacksSearchResponse> => {
  try {
    const response = await api.get<ApiChargebackResponse<ChargeBacksSearchResponse>>(
      `/chargeBacks/search?${queryString}`,
    );
    return response?.data?.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching chargebacks by search');
  }
};

export const getChargeBackByIdApi = async (
  id: string,
): Promise<Chargeback[]> => {
  try {
    const response = await api.get<ApiChargebackResponse<Chargeback[]>>(
      `/chargeBacks/${id}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while fetching the chargeback by ID.',
    );
  }
};

export const createChargeBackApi = async (chargebackData: {
  merchant_order_id?: string;
  amount?: string;
  when?: string;
}): Promise<Chargeback> => {
  try {
    const response = await api.post<Chargeback>(
      `/chargeBacks/create-chargeback`,
      chargebackData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
  }
  throw new Error(
    'An unexpected error occurred while creating the chargeback.',
  );
};

export const updateChargeBackApi = async (
  id: string,
  chargebackData: {
    amount?: string;
  },
): Promise<Chargeback> => {
  try {
    const response = await api.put<Chargeback>(
      `/chargeBacks/update-chargeback/${id}`,
      chargebackData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while updating the chargeback.',
    );
  }
};

export const deleteChargeBackApi = async (id: {
  id?: string;
}): Promise<Chargeback> => {
  try {
    const response = await api.delete<Chargeback>(
      `/chargeBacks/update-chargeback/${id}`,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while updating the chargeback.',
    );
  }
};


export const blockUserChargeback = async (
  { id }: { id?: string },
  config: { config: { userId: any; user_ip: any; merchant_user_id : any } },
): Promise<Chargeback> => {
  try {
    const response = await api.put<Chargeback>(
      `/chargeBacks/blockuser-chargeback/${id}`,
      config,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while updating the chargeback.',
    );
  }
};
