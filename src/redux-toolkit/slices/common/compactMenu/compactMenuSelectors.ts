import { RootState } from "../../../store/store";

export const selectCompactMenu = (state: RootState): boolean => {
  if (localStorage.getItem("compactMenu") === null) {
    localStorage.setItem("compactMenu", "true");
  }

  return state.compactMenu.value;
};
