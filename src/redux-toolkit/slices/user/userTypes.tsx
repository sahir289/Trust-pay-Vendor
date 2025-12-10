/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  user_name: string;
  data: any;
  config: any;
  error: any;
  id: string;
  sno: number;
  code: string;
  vendor_commission: number;
  created_date: string;
  created_by: string;
  status: string;
  action: string;
  updated_at: string;
  is_enabled: boolean;
  email: string;
  first_name: string;
  last_name: string;
  contact_no: string;
}
export interface UserSearchResponse {
  totalCount: number;
  totalPages: number;
  Users: User[];
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}
export interface UserState {
  token: string | null;
  isAuthenticated: boolean;
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  count: number;
  refreshUser: boolean;
}