import { createSlice, PayloadAction } from "@reduxjs/toolkit";
 import { Count, CountState } from "./commonTypes";
 
 const initialState: CountState = {
   token: null,
   isAuthenticated: false,
   count: 0,
   loading: false,
   error: null,
 };
 
 const userSlice = createSlice({
   name: "users",
   initialState,
   reducers: {
     getCountData: (state, action: PayloadAction<Count>) => {
       state.count = action.payload.count;
       state.loading = false;
       state.error = null;
     },
     onload: (state) => {
       state.loading = true;
     },
   },
 });
 
 export const { getCountData, onload} = userSlice.actions;
 export default userSlice.reducer;