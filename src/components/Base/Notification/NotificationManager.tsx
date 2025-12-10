import React, { useEffect, useRef } from 'react';
import Notification, { NotificationElement } from '@/components/Base/Notification';
import { removeNotificationById } from '@/redux-toolkit/slices/AllNoti/allNotifications';
import { Status } from '@/constants';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import clsx from 'clsx';

const NotificationManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.allNotification.allNotifications);
  const notificationRefs = useRef<Map<string, NotificationElement>>(new Map());
  const shownNotifications = useRef<Set<string>>(new Set());

  useEffect(() => {
    notifications.forEach((notification) => {
      if (!shownNotifications.current.has(notification.id)) {
        const ref = notificationRefs.current.get(notification.id);
        if (ref) {
          shownNotifications.current.add(notification.id);
          ref.showToast();
          
          setTimeout(() => {
            dispatch(removeNotificationById(notification.id));
            shownNotifications.current.delete(notification.id);
            notificationRefs.current.delete(notification.id);
          }, 3000);
        }
      }
    });
  }, [notifications, dispatch]);

  useEffect(() => {
    return () => {
      notificationRefs.current.clear();
      shownNotifications.current.clear();
    };
  }, []);
  return (
    <>
      {notifications.map((notification) => (
        <div key={notification.id} className="text-center hidden">
          
          <Notification
            getRef={(el) => {
              if (el) {
                notificationRefs.current.set(notification.id, el);
              }
            }}
            options={{ duration: 3000 }}
            className={clsx({
              'bg-red-100': notification.status === Status.ERROR,
              'bg-green-100': notification.status === Status.SUCCESS,
              'bg-yellow-100': notification.status === Status.WARN,
            })}
          >
            <div className='flex flex-row'>
              <div className="ml-2 mr-1 font-medium">{notification.status === Status.SUCCESS
        ? '✅'
        : notification.status === Status.WARN
        ? '⚠️'
        : '❌'} {notification.message}</div>
            </div>
          </Notification>
        </div>
      ))}
    </>
  );
};

export default NotificationManager;