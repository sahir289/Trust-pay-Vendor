/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface Count {
  [x: string]: any;
  count: number
}

export interface CountState {
  count: number;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}