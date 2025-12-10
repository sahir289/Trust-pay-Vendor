import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RoleState } from './roleTypes';

const initialState: RoleState = {
  role: [],
  totalCount: 0,
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    getRoles: (state, action: PayloadAction<RoleState>) => {
      state.role = action.payload.role;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
  },
});

export const { getRoles, onload } = roleSlice.actions;
export default roleSlice.reducer;
