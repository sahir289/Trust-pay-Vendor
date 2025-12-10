/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Notification {
  id: string;
  message: string;
  user: string;
  created_at: string;
  config: any;
  is_read: string;
  loading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  refreshNotification: boolean;
  isSocketHit: boolean;
  count: any; 
}
