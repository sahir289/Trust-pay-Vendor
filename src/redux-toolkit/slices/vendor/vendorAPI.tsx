/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import api from '../../services/api';
import { ApiResponse } from '../user/userTypes';
import {
  ApiVendorResponse,
  VendorsBySearchResponse,
  Vendor,
  vendorsByCode,
} from './vendorTypes';

export const getAllVendor = async (queryString: string) => {
  const response = await api.get(`/vendors?${queryString}`);
  return {
    data: response.data.data || [],
  };
};

export const getAllVendorsBySearch = async (
  queryString: string,
): Promise<VendorsBySearchResponse> => {
  try {
    const response = await api.get<ApiVendorResponse<VendorsBySearchResponse>>(
      `/vendors/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error(
      'An unexpected error occurred while fetching vendor details by search',
    );
  }
};

export const getVendorCode = async (
  includeSubVendors?: boolean,
  includeOnlyVendors?: boolean,
  excludeDisabledVendor?: boolean,
): Promise<Vendor[]> => {
  try {
    const queryParams = new URLSearchParams();

    if (includeOnlyVendors) {
      queryParams.append('includeOnlyVendors', 'true');
    }
    if (excludeDisabledVendor) {
      queryParams.append('excludeDisabledVendor', 'true');
    }
    if (includeSubVendors) {
      queryParams.append('includeSubVendors', 'true');
    }

    const route = `/vendors/codes${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await api.get<ApiVendorResponse<Vendor[]>>(route);
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('Failed to fetch vendor codes');
  }
};

export const createVendor = async (vendorData: {
  code?: string;
  full_name?: string;
  balance?: number;
  payin_commission?: string;
  payout_commission?: string;
}): Promise<Vendor> => {
  const response = await api.post<Vendor>(`/vendors/create-vendor`, vendorData);
  return response.data;
};

export const updateVendor = async (
  id: { id?: string },
  vendorData: {
    first_name?: string;
    last_name?: string;
    balance?: number;
    payin_commission?: string;
    payout_commission?: string;
    config?: object;
  },
): Promise<Vendor> => {
  const response = await api.put<Vendor>(
    `/vendors/update-vendor/${id}`,
    vendorData,
  );
  return response.data;
};

export const deleteVendor = async (user_id: string): Promise<Vendor> => {
  const response = await api.delete<Vendor>(
    `/vendors/delete-vendor/${user_id}`,
  );
  return response.data;
};

export const getAllVendorCodes = async (
  includeSubVendors?: boolean,
  includeOnlyVendors?: boolean,
  excludeDisabledVendor?: boolean,
  includeSeperateSubVendors?: boolean,
  includeVendorAdmin?: boolean,
  isEnabled?:boolean,
) => {
  try {
    const queryParams = new URLSearchParams();

    if (includeOnlyVendors) {
      queryParams.append('includeOnlyVendors', 'true');
    }
    if (excludeDisabledVendor) {
      queryParams.append('excludeDisabledVendor', 'true');
    }
    if (includeSubVendors) {
      queryParams.append('includeSubVendors', 'true');
    }
    if (includeSeperateSubVendors) {
      queryParams.append('includeSeperateSubVendors', 'true');
    }
    if (includeVendorAdmin) {
      queryParams.append('includeVendorAdmin', 'true');
    }
    if (isEnabled) {
      queryParams.append('isEnabled', 'true');
    }
    const route = `/vendors/codes${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await api.get(route);
    return response.data.data;
  } catch {
    return [];
  }
};

export const getVendorBankResponseAccess = async (id: string): Promise<any> => {
  const response = await api.get(`/vendors/get-bankresponse-access/${id}`);
  return response.data.data;
};

export const getAllVendorByCode = async (
  queryString: string,
): Promise<vendorsByCode> => {
  try {
    const response = await api.get<ApiResponse<vendorsByCode>>(
      `/vendors/get-vendor-by-code?${queryString}`,
    );
    return response.data.data;
  } catch {
    throw new Error('Failed to fetch vendors by code');
  }
};

export const linkVendor = async (data: object) => {
  const response = await api.post(`/vendors/link-vendor`, data);
  return response.data;
};

export const unLinkVendor = async (data: object) => {
  const response = await api.post(`/vendors/unlink-vendor`, data);
  return response.data;
};

export const transferVendor = async (data: object) => {
  const response = await api.post(`/vendors/transfer-vendor`, data);
  return response.data;
};
