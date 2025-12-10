import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AllNotification {
  id: string;
  status: string;
  message: string;
}

interface AllNotificationState {
  allNotifications: AllNotification[];
}

const initialState: AllNotificationState = {
  allNotifications: [],
};

const allNotificationSlice = createSlice({
    name: 'allNotification',
    initialState,
    reducers: {
      addAllNotification(state, action: PayloadAction<{ status: string; message: string }>) {
        state.allNotifications.push({
          id: `${Date.now()}-${Math.random()}`,
          status: action.payload.status,
          message: action.payload.message,
        });
        if (state.allNotifications.length > 5) {
          state.allNotifications.shift(); 
        }
      },
      removeAllNotification(state) {
        state.allNotifications = [];
      },
      removeNotificationById(state, action: PayloadAction<string>) {
        state.allNotifications = state.allNotifications.filter(
          (notification) => notification.id !== action.payload
        );
      },
    },
  });

export const { addAllNotification, removeAllNotification, removeNotificationById } =
  allNotificationSlice.actions;
export default allNotificationSlice.reducer;