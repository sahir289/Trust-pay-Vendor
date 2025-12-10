import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DesignationState } from './designationTypes';

const initialState: DesignationState = {
  designation: [],
  totalCount: 0,
  loading: false,
  error: null,
};

const designationSlice = createSlice({
  name: 'designation',
  initialState,
  reducers: {
    getDesignations: (state, action: PayloadAction<DesignationState>) => {
      state.designation = action.payload.designation;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
  },
});

export const { getDesignations, onload } = designationSlice.actions;
export default designationSlice.reducer;
