/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../services/api"; 
import { ApiResponse, User,UserSearchResponse } from "./userTypes";

export const getAllUsers = async (
  queryString: string,
): Promise<UserSearchResponse> => {
  try {
    const response = await api.get<ApiResponse<UserSearchResponse>>(
      `/users?${queryString}`,
    );
    return response.data.data; // Return UserSearchResponse
  } catch (error) {
    throw error;
  }
};

export const getUsersById = async (id: string,): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>> (`/users/${id}`);
    return response.data.data;
};
// export const checkUserFirstLogin = async (payload:any): Promise<User[]> => {
//   try {
//     const response = await api.get<ApiResponse<User[]>> (`/users/isFirstLogin`,payload);
//     return response.data.data;
//   } catch (error) {
//     console.error("Failed to fetch users:", error);
//     throw error;
//   }
// };
// Fetch all bank details by Search
export const getAllUsersBySearchApi = async (
  queryString: string,
): Promise<UserSearchResponse> => {
  try {
    const response = await api.get<ApiResponse<UserSearchResponse>>(
      `/users/search?${queryString}`,
    );
    return response.data.data;
  } catch (error) {
    if ((error as any)?.isAxiosError && (error as any)?.response) {
      return (error as any)?.response.data?.error;
    }
    throw new Error('An unexpected error occurred while fetching bank details by search');
  }
};
export const createUser = async (userData: {
  email: string;
  first_name?: string;
  last_name?: string;
  contact_no?: string;
  is_enabled?: boolean;
  role_id?: string;
  designation_id?: string;
  user_name?: string;
  code?: string;
}): Promise<User> => {
  try {
    const response = await api.post<User>("/users/create-user", userData);
    return response.data;
  } catch (error) {
    throw error; 
  }
};

export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    const response = await api.put<User>(`/users/update-user/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};