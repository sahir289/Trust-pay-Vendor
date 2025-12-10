/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../services/api';
import { ApiResponse,Notification } from './notificationType';

// notificationAPI.ts
export const getAllNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<ApiResponse<Notification[]>>('/notifications');
  return response.data.data;
};
export const getNotificationsCount = async (): Promise<number> => {
  const response = await api.get<ApiResponse<number>>(
    '/notifications/get-count',
  );
  return response.data.data; // Adjusted to return a number
};

export const updateNotifications = async (id: any): Promise<Notification[]> => {
  const response = await api.put<ApiResponse<Notification[]>>(
    '/notifications/update-notification',
    id,
  );
  return response.data.data;
};