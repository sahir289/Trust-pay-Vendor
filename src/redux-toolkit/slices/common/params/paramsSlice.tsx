import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaginationState {
  params: {
    page: number;
    limit: number;
  };
}

const initialState: PaginationState = {
  params: {
    page: 1,
    limit: 20,
  },
};

const paramsSlice = createSlice({
  name: 'pagination',
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.params.page = action.payload.page;
      state.params.limit = action.payload.limit;
    },
    resetPagination: (state) => {
      state.params = initialState.params;
    },
  },
});

export const { setPagination, resetPagination } = paramsSlice.actions;
export default paramsSlice.reducer;
