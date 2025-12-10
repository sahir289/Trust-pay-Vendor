/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "./authTypes";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: {
    message: "",
    name: "",
    statusCode: 0,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: any; accessToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = { message: "", name: "", statusCode: 0 };
    },
    loginFailure: (state, action: PayloadAction<{ error: any }>) => {
      state.error = action.payload.error;
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    onload: (state, action: PayloadAction<{ load: boolean }>) => {
      state.loading = action.payload.load;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = { message: "", name: "", statusCode: 0 };
    },
    clearError: (state) => {
      state.error = { message: "", name: "", statusCode: 0 };
    },
    isVerified : (state) =>{
      state.isAuthenticated = true;
    }
  },
});

export const { loginSuccess, logout, onload, loginFailure, clearError , isVerified} = authSlice.actions;
export default authSlice.reducer;
