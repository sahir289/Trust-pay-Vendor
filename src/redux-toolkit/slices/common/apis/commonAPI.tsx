/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../../services/api';
import { ApiResponse, Count } from './commonTypes';
import { Role } from '@/constants';

export const getCount = async (
  queryString: string,
  p0?: any,
  filters?: any,
): Promise<Count> => {
  const validRoles = Object.values(Role);
  if (filters && p0) {
    const filterString = encodeURIComponent(JSON.stringify(filters));
    const response = await api.get<ApiResponse<Count>>(
      `/common/count/${queryString}?role=${p0}&filters=${filterString}`,
    );
    return response.data.data;
  } else if (filters) {
    // Convert filters object to a JSON string and encode it
    const filterString = encodeURIComponent(JSON.stringify(filters));
    const response = await api.get<ApiResponse<Count>>(
      `/common/count/${queryString}?filters=${filterString}`,
    );
    return response.data.data;
  } else if (validRoles.includes(p0)) {
    const response = await api.get<ApiResponse<Count>>(
      `/common/count/${queryString}?role=${p0}`,
    );
    return response.data.data;
  }
  const response = await api.get<ApiResponse<Count>>(
    `/common/count/${queryString}`,
  );
  return response.data.data;
};
