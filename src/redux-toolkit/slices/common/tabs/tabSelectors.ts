/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from "../../../store/store";

// Select tabs
export const getTabs = (state: RootState) => state.tab.activeTab;
export const getParentTabs = (state: RootState) => state.tab.parentTab;
export const getButtonTab = (state: RootState) => state.tab.activeButton;
export const getParentButton = (state: RootState) => state.tab.parentButton; 
