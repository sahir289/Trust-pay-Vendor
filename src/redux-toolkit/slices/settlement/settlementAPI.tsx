/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '@/redux-toolkit/services/api';
import { Settlement,SettlementsSearchResponse,ApiResponse } from './settlementTypes';

export const getAllSettlements = async (queryString: string) => {
  try {
    const response = await api.get(`/settlement?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    }
    return undefined; // Ensure all code paths return a value
  }

export const getAllSettlementsBySearchApi = async (
  queryString: string,
): Promise<SettlementsSearchResponse> => {
  try {
    const response = await api.get<ApiResponse<SettlementsSearchResponse>>(
      `/settlement/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching bank details by search');
  }
};


export const getAllSettlementsExport = async(queryString: string)=>{
  try {
    const response = await api.get(`/settlement/settlementReports?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    }
    return undefined; // Ensure all code paths return a value
}

  export const createSettlement = async (data: any) => {
    try {
      const response = await api.post("/settlement/create-settlement", data);
      return response.data; // Ensure this is returning the correct data
    } catch  {
      return undefined; // Return undefined if there's an error
    }
  };
export const updateSettlement = async (
  id: string, 
  settlementData: {
    user_id: string;
    amount: number;
    method: string;
    updated_by: string;
    status: string;
    config: {
      reference_id?: string;
      rejected_reason?: string;
    };
  }
): Promise<Settlement | undefined> => {
  try {
    const response = await api.put<Settlement>(
      `/settlement/update-settlement/${id}`, 
      settlementData
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};

export const deleteSettlement = async(id:string):  Promise<Settlement | undefined>=>{
  try {
    const response = await api.delete<Settlement>(`/settlement/delete-settlement/${id}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
}
