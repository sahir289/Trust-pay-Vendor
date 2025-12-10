/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../services/api';
import {
  ApiReportsResponse,
  PayinReports,
  Reports,
  VendorReports,
} from './reportTypes';

//Actions are functions that dispatch payloads to the reducer(userSlice.ts)
//all apis called

export const getMerchantsReports = async (
  queryString?: string,
): Promise<Reports[]> => {
  try {
    const response = await api.get<ApiReportsResponse<Reports[]>>(
      `/reports/get-accounts-reports?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return [];
  }
};

export const getSelectedMerchantsReports = async (
  queryString?: string,
): Promise<Reports[]> => {
  try {
    const response = await api.get<ApiReportsResponse<Reports[]>>(
      `/reports/get-accounts-reports?${queryString}`,
    );
    if (!response) {
      throw new Error('No reports found for the given criteria');
    }
    return response.data.data;
  } catch (error) {
    return []; // Return an empty array on failure
  }
};

export const getSelectedPayinReport = async (
  merchantCode?: string,
  startDate?: string,
  endDate?: string,
  status?:any,
  updatedPayin?: boolean,
): Promise<PayinReports[]> => {
  try {
    const params = new URLSearchParams();

    if (merchantCode) params.append('code', merchantCode);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    if (updatedPayin) params.append('updatedPayin', String(updatedPayin));
    const response = await api.get<ApiReportsResponse<PayinReports[]>>(
      `/reports/get-payins-reports?${params.toString()}`,
    );
    if (!response) {
      throw new Error('No reports found for the given criteria');
    }
    return response.data.data;
  } catch (error) {
    return [];
  }
};

export const getSelectedPayoutReport = async (
  merchantCode?: string,
  startDate?: string,
  endDate?: string,
  status?: any,
): Promise<PayinReports[]> => {
  try {
    const response = await api.get<ApiReportsResponse<PayinReports[]>>(
      `/reports/get-payouts-report?code=${merchantCode}&startDate=${startDate}&endDate=${endDate}&status=${status}`,
    );
    if (!response) {
      throw new Error('No reports found for the given criteria');
    }
    return response.data.data;
  } catch (error) {
    return [];
  }
};

export const getSelectedVendorsReports = async (
  queryString: string,
  vendorCode?: string,
  startDate?: string,
  endDate?: string,
): Promise<VendorReports[]> => {
  let query = '';
  try {
    if (!vendorCode || !startDate || !endDate) {
      query = `/reports/get-vendors-reports?${queryString}`;
    } else {
      query = `/reports/get-vendors-reports?${query}&code=${vendorCode}&startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get<ApiReportsResponse<Reports[]>>(query);
    if (!response) {
      throw new Error('No reports found for the given criteria');
    }
    return response.data.data;
  } catch (error) {
    return []; // Return an empty array on failure
  }
};

export const getVendorReports = async (
  _default?: string,
): Promise<VendorReports[]> => {
  try {
    const response = await api.get<ApiReportsResponse<VendorReports[]>>(
      `/reports/get-vendors-reports`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return []; // Ensure a default return value in case of an unhandled error
  }
};
