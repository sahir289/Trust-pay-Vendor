import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationState } from './notificationType';

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  refreshNotification: false,
  isSocketHit: false,
  count: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{
        notifications: Notification[];
        loading: boolean;
        refreshNotification: boolean;
      }>,
    ) => {
      state.notifications = action.payload.notifications;
      state.loading = action.payload.loading;
      state.refreshNotification = action.payload.refreshNotification;
    },
    onload: (state) => {
      state.loading = true;
    },
    setRefreshNotification: (state, action: PayloadAction<boolean>) => {
      state.refreshNotification = action.payload;
    },
    setIsSocketHit: (state, action: PayloadAction<boolean>) => {
      state.isSocketHit = action.payload;
    },
    setNotificationsCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

export const {
  setNotifications,
  onload,
  setRefreshNotification,
  setIsSocketHit,
  setNotificationsCount,
} = notificationSlice.actions;
export default notificationSlice.reducer;
