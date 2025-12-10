import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserState } from "./userTypes";

const initialState: UserState = {
  token: null,
  isAuthenticated: false,
  users: [],
  loading: false,
  error: null,
  page: 0,
  limit: 10,
  count: 0,
  refreshUser: false, 
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    getUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    onload: (state) => {
      state.loading = true;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      state.loading = false;
      state.error = null;

    },
    setRefreshUser: (state, action) => {
      state.refreshUser = action.payload;
    },
    getUserCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const updatedUser = action.payload;
      const index = state.users.findIndex((user) => user.id === updatedUser.id);
      if (index !== -1) {
        state.users[index] = updatedUser;
      }
      state.loading = false;
      state.error = null;
    },
  },
});

export const { getUsers, addUser, updateUser,setRefreshUser, onload, getUserCount} = userSlice.actions;
export default userSlice.reducer;
