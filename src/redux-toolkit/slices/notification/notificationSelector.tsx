import { RootState } from '../../store/store';
import { NotificationState } from './notificationType';

export const selectAllNotifications = (state: RootState): NotificationState =>
  state.notification;

export const selectNotificationsCount = (state: RootState): number =>
  state.notification.count; 

export const selectRefreshNotification = (state: RootState): boolean =>
  state.notification.refreshNotification;

export const selectIsSocketHit = (state: RootState): boolean =>
  state.notification.isSocketHit;
