/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: any | null;
  }
  