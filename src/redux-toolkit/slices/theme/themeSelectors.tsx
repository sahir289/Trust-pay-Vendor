import { RootState } from "../../store/store";

export const selectTheme = (state: RootState): "echo" => {
  if (localStorage.getItem("theme") === null) {
    localStorage.setItem("theme", "echo");
  }

  return state.theme.value as "echo";
};
