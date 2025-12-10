/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '../../services/api'; // Assuming this is your axios instance
import {
  ApiResponse,
  merchants,
  merchantsByCode,
  merchantsBySearchResponse,
} from './merchantTypes';

export const getAllMerchants = async (queryString: string) => {
  try {
    const response = await api.get<ApiResponse<merchants[]>>(
      `/merchants?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return []; // Return an empty array as a fallback
  }
};

export const getAllMerchantByCode = async (
  queryString: string,
): Promise<merchantsByCode> => {
  try {
    const response = await api.get<ApiResponse<merchantsByCode>>(
      `/merchants/get-merchant-by-code?${queryString}`,
    );
    return response.data.data;
  } catch {
    throw new Error('Failed to fetch merchants by code');
  }
};

export const getAllMerchantsBySearch = async (
  queryString: string,
): Promise<merchantsBySearchResponse> => {
  try {
    const response = await api.get<ApiResponse<merchantsBySearchResponse>>(
      `/merchants/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while fetching bank details by search',
    );
  }
};

export const getAllMerchantCodes = async (
  includeSubMerchants?: boolean,
  includeOnlyMerchants?: boolean,
  excludeDisabledMerchant?: boolean,
) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (includeOnlyMerchants) {
      queryParams.append('includeOnlyMerchants', 'true');
    }
    if (excludeDisabledMerchant) {
      queryParams.append('excludeDisabledMerchant', 'true');
    }
    if (includeSubMerchants) {
      queryParams.append('includeSubMerchants', 'true');
    }
    
    const route = `/merchants/codes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await api.get(route);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
  }
};

export const createMerchant = async (userData: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  contact_no?: string;
  is_enabled?: boolean;
}): Promise<merchants | undefined> => {
  try {
    const response = await api.post<merchants>(
      '/merchants/create-merchant',
      userData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Explicitly return undefined as a fallback
  }
};

export const updateMerchantData = async (
  id: string,
  userData: Partial<merchants>,
): Promise<merchants | undefined> => {
  try {
    const response = await api.put<merchants>(
      `/merchants/update-merchant/${id}`,
      userData,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Explicitly return undefined as a fallback
  }
};

export const deleteMerchant = async (
  id: string,
): Promise<merchants | undefined> => {
  try {
    const response = await api.delete<merchants>(
      `/merchants/delete-merchant/${id}`,
    );
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Explicitly return undefined as a fallback
  }
};
