/* eslint-disable no-unused-vars */
import { useEffect, useCallback, useState } from 'react';
import { Slideover } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import LoadingIcon from '@/components/Base/LoadingIcon';
import {
  getAllNotifications,
  updateNotifications,
} from '@/redux-toolkit/slices/notification/notificationAPI';
import {
  selectAllNotifications,
  selectRefreshNotification,
} from '@/redux-toolkit/slices/notification/notificationSelector';
import {
  setNotifications,
  onload,
  setRefreshNotification,
} from '@/redux-toolkit/slices/notification/notificationSlice';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
interface MainProps {
  notificationsPanel: boolean;
  setNotificationsPanel: (val: boolean) => void;
}

function Main({ notificationsPanel, setNotificationsPanel }: MainProps) {
  const [isLoading, setIsloading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectAllNotifications);
  const refreshNotification = useAppSelector(selectRefreshNotification);
  const fetchNotifications = useCallback(async () => {
    try {
      dispatch(onload());
      const data = await getAllNotifications();
      dispatch(
        setNotifications({
          notifications: data,
          loading: false,
          refreshNotification: false,
        }),
      );
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [dispatch]);

  const markNotificationsAsRead = useCallback(
    async (id?: string) => {
      if (!id) {
        // "Mark all as read" case
        setIsloading(true);
        const idArray = notifications.notifications.map((n) => n.id);
        try {
          await updateNotifications({ id: idArray });
          dispatch(setRefreshNotification(true));
        } catch (error) {
          console.error('Failed to update notifications:', error);
        } finally {
          setIsloading(false);
        }
      } else {
        // Single notification case
        setLoadingIds((prev) => [...prev, id]);
        try {
          await updateNotifications({ id: [id] });
          dispatch(setRefreshNotification(true));
        } catch (error) {
          console.error('Failed to update notification:', error);
        } finally {
          setLoadingIds((prev) => prev.filter((item) => item !== id));
        }
      }
    },
    [dispatch, notifications],
  );

  // Existing useEffect for notificationsPanel
  useEffect(() => {
    if (notificationsPanel) {
      fetchNotifications();
    }
  }, [notificationsPanel, fetchNotifications]);

  // New useEffect for refreshNotification
  useEffect(() => {
    if (refreshNotification && notificationsPanel) {
      fetchNotifications();
    }
  }, [refreshNotification, fetchNotifications, notificationsPanel]);

  const notificationList = notifications.notifications;

  return (
    <Slideover
      open={notificationsPanel}
      onClose={() => setNotificationsPanel(false)}
    >
      <Slideover.Panel className="w-72 rounded-[0.75rem_0_0_0.75rem/1.1rem_0_0_1.1rem]">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setNotificationsPanel(false);
          }}
          className="absolute top-1/2 left-0 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-white/90 border border-white/90 rounded-full hover:rotate-180 hover:scale-105 -ml-[60px] sm:-ml-[105px] dark:bg-darkmode-800/40 dark:border-darkmode-800/20"
        >
          <Lucide icon="X" className="w-8 h-8 stroke-[1]" />
        </a>
        <Slideover.Title className="px-6 py-5">
          <h2 className="mr-auto text-base font-medium">Notifications</h2>
          {notificationList.length > 0 &&
            notificationList.some(
              (notification) => notification.is_read === 'false',
            ) && (
              <Button
                variant="outline-secondary"
                className="hidden sm:flex items-center"
                disabled={isLoading}
                onClick={() => markNotificationsAsRead()}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                    <span>Marking...</span>
                  </>
                ) : (
                  <>
                    <Lucide icon="ShieldCheck" className="w-4 h-4 mr-2" />
                    <span>Mark all as read</span>
                  </>
                )}
              </Button>
            )}
        </Slideover.Title>
        <Slideover.Description className="p-0">
          {notifications.loading ? (
            <div className="flex justify-center items-center w-full h-64">
              <LoadingIcon icon="ball-triangle" className="w-8 h-8" />
            </div>
          ) : notificationList.length === 0 ? (
            <div className="flex justify-center items-center w-full h-64">
              <div className="text-slate-500 text-sm">
                No notifications available
              </div>
            </div>
          ) : (
            <div className="flex flex-col p-3 gap-0.5">
              {notificationList.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start px-3 py-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-darkmode-400"
                >
                  {/* Image container with fixed width */}
                  <div className="flex-shrink-0 w-11 h-11">
                    <div className="overflow-hidden border-2 rounded-full w-full h-full image-fit border-slate-200/70">
                      <img
                        alt="Notification"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          notification.user,
                        )}&background=random`}
                      />
                    </div>
                  </div>
                  {/* Text portion takes remaining space */}
                  <div className="flex-grow sm:ml-5 text-sm min-w-0">
                    <div
                      className={`font-medium break-words ${
                        notification.is_read === 'true'
                          ? 'text-slate-500'
                          : 'text-white-500 font-semibold'
                      }`}
                    >
                      {notification.message}
                    </div>
                    <div className="text-slate-500 mt-0.5 text-xs truncate">
                      from {notification.user} at{' '}
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                  {/* Lucide icon with fixed width */}
                  {notification.is_read === 'false' && (
                    <div className="flex-shrink-0 w-6 h-6 ml-auto mt-2">
                      <div className="flex-shrink-0 w-6 h-6 ml-auto mt-2">
                        {loadingIds.includes(notification.id) ? (
                          <svg
                            className="animate-spin w-5 h-5 text-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                            />
                          </svg>
                        ) : (
                          <Lucide
                            icon="Circle"
                            className="w-full h-full text-primary fill-primary animate-pulse cursor-pointer"
                            onClick={() =>
                              markNotificationsAsRead(notification.id)
                            }
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Slideover.Description>
      </Slideover.Panel>
    </Slideover>
  );
}

export default Main;
