import { RootState } from "../../../store/store";
import { Menu } from "./sideMenuSlice";

export const selectSideMenu = (state: RootState): Array<Menu | string> => state.sideMenu.menu;
export const selectActiveMenu = (state: RootState): string | null => state.sideMenu.activeMenu;
