/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TabState } from './tabTypes';

const getActiveTabFromLocalStorage = (key: string, defaultValue: number) => {
  const savedTab = localStorage.getItem(key);
  return savedTab ? parseInt(savedTab, 10) : defaultValue;
};

const initialState: TabState = {
  parentTab: getActiveTabFromLocalStorage('parentTab', 0),
  activeTab: getActiveTabFromLocalStorage('activeTab', 0),
  activeButton: getActiveTabFromLocalStorage('activeTab', 0),
  parentButton: getActiveTabFromLocalStorage('parentTab', 0),
};

const tabSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<number>) {
      state.activeTab = action.payload;
      localStorage.setItem('activeTab', action.payload.toString());
    },
    setParentTab(state, action: PayloadAction<number>) {
      state.parentTab = action.payload;
      localStorage.setItem('parentTab', action.payload.toString());
    },
    setActiveButton(state, action: PayloadAction<number>) {
      state.activeButton = action.payload;
      localStorage.setItem('activeButton', action.payload.toString());
    },
    setParentButton(state, action: PayloadAction<number>) {
      state.parentButton = action.payload;
      localStorage.setItem('parentButton', action.payload.toString());
    },
    resetTabs(state) {
      state.parentTab = 0;
      state.activeTab = 0;
      state.activeButton = 0;
      state.parentButton = 0;
      localStorage.setItem('parentTab', '0');
      localStorage.setItem('activeTab', '0');
      localStorage.setItem('activeButton', '0');
      localStorage.setItem('parentButton', '0');
    },
  },
});

export const { setActiveTab, setParentTab, setActiveButton, setParentButton, resetTabs } = tabSlice.actions;
export default tabSlice.reducer;