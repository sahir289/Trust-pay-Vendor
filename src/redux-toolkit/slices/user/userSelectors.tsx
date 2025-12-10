import { RootState } from "../../store/store";
import { User, UserState } from "./userTypes";

export const selectAllUsers = (state: RootState): UserState => state.user
export const selectUserById = (state: RootState, userId: string): User | undefined =>
  state.user.users.find((user) => user.id === userId);
export const selectUsersCount = (state: RootState): number => state.user.users.length;
export const getRefreshUser = (state: RootState) => state.user.refreshUser;