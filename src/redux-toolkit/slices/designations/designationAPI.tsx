/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '@/redux-toolkit/services/api';

export const getAllDesignations = async (queryString: string) => {
  try {
    const response = await api.get(`/designation?${queryString}`);
    return response.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    return undefined; // Ensure all code paths return a value
  }
};