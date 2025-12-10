import { RootState } from "../../../store/store";

export const selectPageLoader = (state: RootState): boolean => {
  return state.pageLoader.value;
};
