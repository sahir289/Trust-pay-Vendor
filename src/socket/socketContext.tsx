/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import socket from './socket';
import {
  setRefreshDataEntries,
  setIsloadingDataEntries,
  updateSingleBankResponseEntry,
} from '@/redux-toolkit/slices/dataEntries/dataEntrySlice';
import {
  setRefreshPayOut,
  setIsloadingPayOutEntries,
} from '@/redux-toolkit/slices/payout/payoutSlice';
import { useNavigate } from 'react-router-dom';
import {
  setIsloadingPayinEntries,
  setRefreshPayIn,
  updateSinglePayinEntry,
} from '@/redux-toolkit/slices/payin/payinSlice';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { Role, Status } from '@/constants';
import { logOutUser } from '@/redux-toolkit/slices/auth/authAPI';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { useAuth } from '@/components/context/AuthContext';
import { logout } from '@/redux-toolkit/slices/auth/authSlice';
import { setIsSocketHit } from '@/redux-toolkit/slices/notification/notificationSlice';
import {
  triggerCrossTabLogout,
  initCrossTabAuthSync,
  updateSessionId,
  triggerCrossTabLogin,
  onCrossTabLogin,
  offCrossTabLogin,
  getTabId as getCrossTabId,
  type LoginEventData,
} from '@/utils/crossTabAuthSync';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

// Master-Slave Tab Management Types
interface CrossTabMessage {
  type: string;
  tabId: string;
  timestamp: number;
  data?: any;
}

// Cross-tab communication events
const TAB_EVENTS = {
  MASTER_CLAIM: 'master_claim',
  MASTER_HANDOFF: 'master_handoff',
  MASTER_PING: 'master_ping',
  MASTER_PONG: 'master_pong',
  TAB_FOCUS: 'tab_focus',
  TAB_LOGOUT: 'tab_logout',
  AUTH_UPDATE: 'auth_update',
  SOCKET_EVENT: 'socket_event',
  TAB_CLOSING: 'tab_closing',
} as const;

const SocketContext = createContext<typeof socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  // Safe usage of useAuth with error handling
  let setToken: Function | null = null;
  try {
    const authContext = useAuth();
    setToken = authContext?.setToken || null;
  } catch (error) {
    console.warn('useAuth hook not available in SocketProvider context:', error);
    setToken = null;
  }

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Tab Management State
  const getCurrentTabId = () => getCrossTabId();
  const [isMaster, setIsMaster] = useState(false);
  const masterCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef(Date.now());

  // Add state to track auth changes
  const [authState, setAuthState] = useState({
    accessToken: localStorage.getItem('accessToken'),
    userDataString: localStorage.getItem('userData'),
    userSession: localStorage.getItem('userSession'),
  });

  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('socket_channel') : null;

  const broadcastMessage = useCallback((message: CrossTabMessage) => {
    const payload = {
      ...message,
      tabId: getCurrentTabId(),
      timestamp: Date.now(),
    };
    // console.log('Broadcasting message:', payload); // Debug log
    if (bc) {
      bc.postMessage(payload);
    } else {
      localStorage.setItem('tab_message', JSON.stringify(payload));
      localStorage.removeItem('tab_message'); // Trigger storage event
    }
  }, [bc]);

  const claimMasterRole = useCallback(() => {
    setIsMaster(true);
    localStorage.setItem(
      'socket_master_tab',
      JSON.stringify({
        tabId: getCurrentTabId(),
        timestamp: Date.now(),
        lastActivity: Date.now(),
      }),
    );
    // console.log('Master role claimed by tab:', getCurrentTabId());
    broadcastMessage({
      type: TAB_EVENTS.MASTER_CLAIM,
      tabId: getCurrentTabId(),
      timestamp: Date.now(),
    });
  }, [broadcastMessage]);

  const relinquishMasterRole = useCallback(() => {
    setIsMaster(false);
    if (socket.connected) {
      socket.disconnect();
    }
    // console.log('Master role relinquished by tab:', getCurrentTabId());
  }, []);

  // Check if current tab should be master
  const shouldBeMaster = useCallback(() => {
    const masterInfo = localStorage.getItem('socket_master_tab');
    if (!masterInfo) return true;

    try {
      const master = JSON.parse(masterInfo);
      const now = Date.now();

      // If master is too old (30 seconds), claim it
      if (now - master.timestamp > 30000) {
        return true;
      }

      // If this tab is already master, keep it
      if (master.tabId === getCurrentTabId()) {
        return true;
      }

      return false;
    } catch {
      return true; // Invalid master info, claim it
    }
  }, []);

  const handleSocketEventFromMaster = useCallback(
    (eventData: any) => {
      // console.log('Slave tab received socket event:', eventData); // Debug log
      const { eventType, data } = eventData;

      switch (eventType) {
        case 'bankStatusWarning':
          if (data.notification) {
            dispatch(addAllNotification(data.notification));
          }
          break;

        case 'bankStatusUpdate':
          if (data.notification) {
            dispatch(addAllNotification(data.notification));
          }
          break;

        case 'updatedPayout':
          if (data.notification) {
            dispatch(addAllNotification(data.notification));
          }
          break;

        case 'newTableEntryBankResponse':
          if (data.actions) {
            if (data.actions.setIsloadingDataEntries !== undefined) {
              dispatch(setIsloadingDataEntries(data.actions.setIsloadingDataEntries));
            }
            if (data.actions.setRefreshDataEntries) {
              dispatch(setRefreshDataEntries(data.actions.setRefreshDataEntries));
            }
            if (data.actions.updateSingleBankResponseEntry) {
              dispatch(updateSingleBankResponseEntry(data.actions.updateSingleBankResponseEntry));
            }
          }
          break;
        case 'newTableEntryPayin':
          if (data.actions) {
            if (data.actions.setIsloadingPayinEntries !== undefined) {
              dispatch(setIsloadingPayinEntries(data.actions.setIsloadingPayinEntries));
            }
            if (data.actions.updateSinglePayinEntry) {
              dispatch(updateSinglePayinEntry(data.actions.updateSinglePayinEntry));
            }
            if (data.actions.setRefreshPayIn) {
              dispatch(setRefreshPayIn(data.actions.setRefreshPayIn));
            }
          }
          break;
        case 'newTableEntryPayout':
          if (data.actions) {
            if (data.actions.setIsloadingPayOutEntries !== undefined) {
              dispatch(setIsloadingPayOutEntries(data.actions.setIsloadingPayOutEntries));
            }
            if (data.actions.setRefreshPayOut) {
              dispatch(setRefreshPayOut(data.actions.setRefreshPayOut));
            }
          }
          break;
        case 'newTableEntryNotifications':
          if (data.actions && data.actions.setIsSocketHit) {
            dispatch(setIsSocketHit(data.actions.setIsSocketHit));
          }
          break;
        case 'bankResponseAccessUpdate':
          if (data.data) {
            const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
            const currentUserId = storedUserData.userId || storedUserData.user_id;
            if (data.data.user_id && data.data.user_id === currentUserId) {
              const hasAccess = data.data.bank_response_access === 'true' || data.data.bank_response_access === true;
              if (!hasAccess) {
                // Access denied - show notification with custom message and navigate immediately
                dispatch(
                  addAllNotification({
                    status: Status.ERROR,
                    message: data.data.message || 'Your access to Bank Response Data has been revoked. Redirecting...',
                  }),
                );

                // Navigate immediately
                try {
                  // Check if we can go back in history
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    // Fallback to dashboard if no previous route
                    navigate('/auth/dashboard');
                  }
                } catch {
                  // If navigation fails, force redirect to dashboard
                  navigate('/auth/dashboard');
                }

                // Notification will remain visible for 5 seconds as per user's request
              } else {
                // Access granted - show success notification with custom message
                dispatch(
                  addAllNotification({
                    status: Status.SUCCESS,
                    message: data.data.message || 'Your access to Bank Response Data has been granted.',
                  }),
                );
              }
            }
          }
          break;
      }
    },
    [dispatch, navigate],
  );

  const handleCrossTabLogin = useCallback(
    (loginData: LoginEventData) => {
      setAuthState({
        accessToken: loginData.accessToken,
        userDataString: localStorage.getItem('userData'),
        userSession: loginData.sessionId,
      });
      if (isMaster && !socket.connected) {
        socket.connect();
      }
    },
    [isMaster],
  );

  const handleCrossTabMessage = useCallback(
    (event: StorageEvent | { key: string; newValue: string }) => {
      if (event.key !== 'tab_message' || !event.newValue) return;

      try {
        const message: CrossTabMessage = JSON.parse(event.newValue);
        // console.log('Received cross-tab message:', message); // Debug log
        if (message.tabId === getCurrentTabId()) return;

        switch (message.type) {
          case TAB_EVENTS.MASTER_CLAIM:
            // Another tab claimed master, relinquish if we were master
            if (isMaster && message.tabId !== getCurrentTabId()) {
              relinquishMasterRole();
            }
            break;

          case TAB_EVENTS.TAB_FOCUS:
            // Another tab became focused, they should be master
            if (isMaster && message.tabId !== getCurrentTabId()) {
              relinquishMasterRole();
            }
            break;

          case TAB_EVENTS.MASTER_PING:
            // Another tab is checking if master is alive
            if (isMaster) {
              broadcastMessage({
                type: TAB_EVENTS.MASTER_PONG,
                tabId: getCurrentTabId(),
                timestamp: Date.now(),
              });
            }
            break;

          case TAB_EVENTS.TAB_LOGOUT:
            // Master tab initiated logout, but let crossTabAuthSync handle the actual logout
            // This is just for immediate coordination between our master-slave tabs
            // The actual logout will be handled by crossTabAuthSync storage events
            break;

          case TAB_EVENTS.AUTH_UPDATE:
            // Master tab updated auth state, sync it
            if (!isMaster && message.data) {
              setAuthState(message.data);
            }
            break;

          case TAB_EVENTS.SOCKET_EVENT:
            // Master tab received socket event, propagate to slaves
            if (!isMaster && message.data) {
              handleSocketEventFromMaster(message.data);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing cross-tab message:', error);
      }
    },
    [isMaster, broadcastMessage, relinquishMasterRole, handleSocketEventFromMaster],
  );

  useEffect(() => {
    if (bc) {
      bc.onmessage = (e) => {
        // console.log('BroadcastChannel message received:', e.data); // Debug log
        handleCrossTabMessage({ key: 'tab_message', newValue: JSON.stringify(e.data) } as any);
      };
    }
    window.addEventListener('storage', handleCrossTabMessage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleCrossTabMessage);
    };
  }, [bc, handleCrossTabMessage]);

  useEffect(() => {
    const handleFocus = () => {
      lastActivity.current = Date.now();

      // Claim master role when tab becomes active
      if (!isMaster && shouldBeMaster()) {
        claimMasterRole();
      }

      // Notify other tabs about focus
      broadcastMessage({
        type: TAB_EVENTS.TAB_FOCUS,
        tabId: getCurrentTabId(),
        timestamp: Date.now(),
      });
    };

    const handleBlur = () => {
      // Don't immediately relinquish master role on blur
      // Let other tabs claim it when they focus
    };

    const handleBeforeUnload = () => {
      broadcastMessage({
        type: TAB_EVENTS.TAB_CLOSING,
        tabId: getCurrentTabId(),
        timestamp: Date.now(),
      });

      if (isMaster) {
        localStorage.removeItem('socket_master_tab');
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isMaster, shouldBeMaster, claimMasterRole, broadcastMessage]);

  // Master health check system
  useEffect(() => {
    if (masterCheckInterval.current) {
      clearInterval(masterCheckInterval.current);
    }

    masterCheckInterval.current = setInterval(() => {
      if (!isMaster) {
        // Slave tab: check if master is alive
        broadcastMessage({
          type: TAB_EVENTS.MASTER_PING,
          tabId: getCurrentTabId(),
          timestamp: Date.now(),
        });

        // If no master responds in 3 seconds, claim master role
        setTimeout(() => {
          if (!isMaster && shouldBeMaster()) {
            claimMasterRole();
          }
        }, 3000);
      } else {
        // Master tab: update activity timestamp
        localStorage.setItem(
          'socket_master_tab',
          JSON.stringify({
            tabId: getCurrentTabId(),
            timestamp: Date.now(),
            lastActivity: lastActivity.current,
          }),
        );
      }
    }, 10000); // Check every 10 seconds

    return () => {
      if (masterCheckInterval.current) {
        clearInterval(masterCheckInterval.current);
      }
    };
  }, [isMaster, shouldBeMaster, claimMasterRole, broadcastMessage]);

  // Initial master election and crossTabAuthSync initialization
  useEffect(() => {
    // Initialize cross-tab auth sync
    initCrossTabAuthSync();

    // Set up cross-tab login listener
    onCrossTabLogin(handleCrossTabLogin);

    // Small delay to let other tabs initialize
    setTimeout(() => {
      if (shouldBeMaster()) {
        claimMasterRole();
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      // Remove cross-tab login listener
      offCrossTabLogin(handleCrossTabLogin);
      // Note: We don't destroy crossTabAuthSync here as it's a singleton
      // and might be used by other components
    };
  }, [shouldBeMaster, claimMasterRole, handleCrossTabLogin]);

  // Function to manually trigger auth state update (to be called after login)
  const updateAuthState = useCallback(() => {
    const currentAccessToken = localStorage.getItem('accessToken');
    const currentUserData = localStorage.getItem('userData');
    const currentSession = localStorage.getItem('userSession');

    const newAuthState = {
      accessToken: currentAccessToken,
      userDataString: currentUserData,
      userSession: currentSession,
    };

    setAuthState(newAuthState);

    // If this is master tab, broadcast auth update to slave tabs and trigger cross-tab login
    if (isMaster) {
      broadcastMessage({
        type: TAB_EVENTS.AUTH_UPDATE,
        tabId: getCurrentTabId(),
        timestamp: Date.now(),
        data: newAuthState,
      });

      // Update session ID in crossTabAuthSync if available
      if (newAuthState.userSession) {
        const sessionId = newAuthState.userSession.replace(/"/g, '');
        updateSessionId(sessionId);
      }

      // Trigger cross-tab login coordination if we have valid auth data
      // But only if this is a new login (prevent loops from storage events)
      if (currentAccessToken && currentUserData && currentSession) {
        // Check if this is actually a new login by comparing with previous state
        const prevAuthString = JSON.stringify(authState);
        const newAuthString = JSON.stringify(newAuthState);

        if (prevAuthString !== newAuthString) {
          const parsedUserData = JSON.parse(currentUserData);
          const cleanSessionId = currentSession.replace(/"/g, '');

          // Debounce to prevent rapid successive calls
          setTimeout(() => {
            triggerCrossTabLogin(cleanSessionId, parsedUserData.userId, currentAccessToken);
          }, 100);
        }
      }
    }
  }, [isMaster, broadcastMessage, authState]);

  useEffect(() => {
    (window as any).updateSocketAuth = updateAuthState;

    // Enhanced debug function to check session info
    (window as any).debugSessionInfo = () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const sessionId = localStorage.getItem('userSession')?.replace(/"/g, '');
      const masterInfo = localStorage.getItem('socket_master_tab');
      const masterData = masterInfo ? JSON.parse(masterInfo) : null;

      const info = {
        tabId: getCurrentTabId(),
        isMaster,
        userId: userData.userId,
        sessionId,
        socketId: socket.id,
        connected: socket.connected,
        hostname: window.location.hostname,
        masterTab: masterData?.tabId,
        masterTimestamp: masterData?.timestamp,
      };
      // console.log('Session info:', info);
      if (navigator.userAgent.includes('Mobile')) {
        alert(`SESSION INFO:\n${JSON.stringify(info, null, 2)}`);
      }
      return info;
    };

    // Function to manually claim master role (for testing)
    (window as any).claimMaster = () => {
      claimMasterRole();
    };

    // Function to check master status (for testing)
    (window as any).checkMaster = () => {
      const masterInfo = localStorage.getItem('socket_master_tab');
      return masterInfo ? JSON.parse(masterInfo) : null;
    };

    // Function to manually trigger login coordination (for external use)
    (window as any).triggerLogin = () => {
      updateAuthState();
    };

    // Function to test tab ID consistency (for debugging)
    (window as any).testTabIds = () => {
      const socketTabId = getCurrentTabId();
      const crossTabAuthTabId = getCrossTabId();
      const result = {
        socketTabId,
        crossTabAuthTabId,
        areEqual: socketTabId === crossTabAuthTabId,
        timestamp: Date.now(),
      };
      // eslint-disable-next-line no-console
      // console.log('Tab ID consistency test:', result);
      return result;
    };

    return () => {
      delete (window as any).updateSocketAuth;
      delete (window as any).debugSessionInfo;
      delete (window as any).claimMaster;
      delete (window as any).checkMaster;
      delete (window as any).triggerLogin;
      delete (window as any).testTabIds;
    };
  }, [updateAuthState, claimMasterRole, isMaster]);

  // Listen for localStorage changes - only storage events, no polling
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only master tab should update auth state from storage changes
      if (!isMaster) return;

      // Ignore events that are handled by crossTabAuthSync system
      if (
        event.key === 'trust_pay_login_event' ||
        event.key === 'trust_pay_logout_event' ||
        event.key === 'tab_message'
      ) {
        return;
      }

      // Only react to auth-related storage changes
      if (
        event.key === 'accessToken' ||
        event.key === 'userData' ||
        event.key === 'userSession'
      ) {
        updateAuthState();
      }
    };

    // Only listen for storage events (for cross-tab changes)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMaster, updateAuthState]);

  // MASTER TAB ONLY: Socket connection management
  useEffect(() => {
    // Only master tab manages socket connection
    if (!isMaster) {
      // Slave tab: ensure socket is disconnected
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    const accessToken = authState.accessToken;
    const userData = authState.userDataString ? JSON.parse(authState.userDataString) : {};
    const sessionId = authState.userSession?.replace(/"/g, '');

    // Add safety check - only proceed if we have valid auth data
    if (!accessToken || !userData.userId) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    // Master tab: Establish socket connection and emit user-login
    // First, disconnect any existing connection to ensure clean state
    if (socket.connected) {
      socket.disconnect();
    }

    // Set login time to track recent logins in localStorage
    const currentTime = Date.now();
    localStorage.setItem('lastLoginTime', currentTime.toString());

    const handleConnect = () => {
      try {
        const loginData = {
          userId: userData.userId,
          sessionId,
          loginTime: currentTime,
          socketId: socket.id,
          tabId: getCurrentTabId(),
        };
        // console.log('Socket connected, emitting user-login:', loginData);
        socket.volatile.emit('user-login', loginData);

        // NUCLEAR: Immediate connection verification to prevent phantom sessions
        socket.emit('connectionVerify', {
          userId: userData.userId,
          sessionId,
          timestamp: Date.now(),
          socketId: socket.id,
          tabId: getCurrentTabId(),
        });

        // ULTIMATE NUCLEAR: Instant phantom session detection and termination
        socket.emit('phantomSessionCheck', {
          userId: userData.userId,
          sessionId,
          timestamp: Date.now(),
          immediate: true,
          nuclear: true,
          ultraNuclear: true,
          instant: true,
          tabId: getCurrentTabId(),
        });

        // NUCLEAR: Additional verification after phantom check
        setTimeout(() => {
          socket.emit('connectionVerify', {
            userId: userData.userId,
            sessionId,
            timestamp: Date.now(),
            socketId: socket.id,
            verification: 'secondary',
            tabId: getCurrentTabId(),
          });
        }, 500);
        socket.emit('pingCheck', () => {});
      } catch (error) {
        console.error('Socket connect error:', error);
        setTimeout(() => {
          if (!socket.connected) {
            socket.connect();
          }
        }, 1000);
      }
    };

    // Connect the socket and register connect handler
    socket.connect();

    // Wait a brief moment to ensure we have a clean connection, then emit
    setTimeout(() => {
      if (socket.connected) {
        // Already connected, emit immediately
        handleConnect();
      } else {
        // Wait for connection
        socket.once('connect', handleConnect);
      }
    }, 100);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [isMaster, authState.accessToken, authState.userDataString, authState.userSession]);

  useEffect(() => {
    // Only master tab listens to socket events
    if (!isMaster) {
      return;
    }

    // Parse user data inside the effect to avoid dependency issues
    const userData = localStorage.getItem('userData');
    const parsedUserData = userData ? JSON.parse(userData) : null;

    // Helper function to broadcast socket events to slave tabs
    const broadcastSocketEvent = (eventType: string, data: any) => {
      // Prevent broadcasting if user is logged out
      if (!localStorage.getItem('userData')) return;
      // console.log('Master broadcasting socket event:', { eventType, data }); // Debug log
      broadcastMessage({
        type: TAB_EVENTS.SOCKET_EVENT,
        tabId: getCurrentTabId(),
        timestamp: Date.now(),
        data: { eventType, data },
      });
    };

    // Centralized logout handler to prevent duplicate notifications
    const handleForcedLogout = async (data: any, eventType: string) => {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const currentUserId = storedUserData.userId;

      if (!currentUserId || sessionStorage.getItem('isLoggingOut') === 'true') {
        return;
      }

      if (data.userId && data.userId !== currentUserId) {
        return;
      }

      // For simple userId events (like newLogin/newlogout), check direct match
      if (typeof data === 'string' && data !== currentUserId) {
        return;
      }

      // Check if this might be our own recent login (protect new sessions)
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      if (lastLoginTime && eventType !== 'newlogout') {
        const timeSinceLogin = Date.now() - parseInt(lastLoginTime, 10);
        if (timeSinceLogin < 3000 && !data.ultraNuclear && !data.instant && !data.nuclear) {
          return;
        }
      }

      let notificationMessage = 'You have been logged out due to security reasons';
      if (data.nuclear || data.priority === 'CRITICAL' || data.ultraNuclear || data.reason?.includes('nuclear')) {
        notificationMessage = 'CRITICAL: Session terminated - Login detected from another device';
      } else if (eventType === 'newLogin') {
        notificationMessage = 'New login detected from another device - You have been logged out';
      } else if (data.message) {
        notificationMessage = `Session terminated - ${data.message}`;
      }

      // Show only ONE notification for better readability
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: notificationMessage,
        }),
      );

      // MASTER TAB: Coordinate logout across all tabs using existing crossTabAuthSync
      broadcastMessage({
        type: TAB_EVENTS.TAB_LOGOUT,
        tabId: getCurrentTabId(),
        timestamp: Date.now(),
      });

      triggerCrossTabLogout(`Session terminated - ${data.message || 'Security reasons'}`);

      // Process the logout for this tab
      try {
        await handleLogout();
      } catch {
        // Force logout even if handleLogout fails
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    };

    // Simplified event handlers that use the centralized function
    socket.on('newLogin', async (emittedUserId) => {
      await handleForcedLogout(emittedUserId, 'newLogin');
    });

    socket.on('newlogout', (emittedUserId) => {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const storedUserId = storedUserData.userId;
      if (storedUserId && storedUserId === emittedUserId) {
        // Master tab coordinates silent logout for all tabs using crossTabAuthSync
        triggerCrossTabLogout('Silent logout event received');

        // Silent logout for newlogout events - no notification needed
        localStorage.removeItem('userData');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userSession');
        navigate('/');
      }
    });

    socket.on('forceLogout', async (data) => {
      await handleForcedLogout(data, 'forceLogout');
    });

    socket.on('session-terminated', async (data) => {
      await handleForcedLogout(data, 'session-terminated');
    });

    socket.on('bankStatusWarning', (data) => {
      if (!localStorage.getItem('userData')) return;
      if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS, Role.VENDOR, Role.VENDOR_OPERATIONS].includes(parsedUserData?.role)) {
        const notification = {
          status: Status.WARN,
          message: `Bank Warning: ${data.message}`,
        };
        dispatch(addAllNotification(notification));
        broadcastSocketEvent('bankStatusWarning', { notification, data });
      }
    });

    socket.on('bankStatusUpdate', (data) => {
      // Ignore event if user is logged out
      if (!localStorage.getItem('userData')) return;
      if (
        [Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(parsedUserData?.role) ||
        ([Role.VENDOR_OPERATIONS, Role.VENDOR].includes(parsedUserData?.role) && parsedUserData.userId === data.userId)
      ) {
        const notification = {
          status: Status.SUCCESS,
          message: `Bank Update: ${data.message}`,
        };
        dispatch(addAllNotification(notification));
        broadcastSocketEvent('bankStatusUpdate', { notification, data });
      }
    });

    //update payout socket notification
    socket.on('updatedPayout', (data) => {
      // Ignore event if user is logged out
      if (!localStorage.getItem('userData')) return;
      if (
        [Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS, Role.MERCHANT, Role.VENDOR, Role.MERCHANT_OPERATIONS, Role.VENDOR_OPERATIONS].includes(parsedUserData?.role)
      ) {
        const notification = {
          status: Status.SUCCESS,
          message: `Payout Update: ${data.message}`,
        };
        dispatch(addAllNotification(notification));
        broadcastSocketEvent('updatedPayout', { notification, data });
      }
    });

    ///for add data
    socket.on('newTableEntryBankResponse', (data) => {
      // Ignore event if user is logged out
      if (!localStorage.getItem('userData')) return;
      if ([Role.ADMIN].includes(parsedUserData?.role)) {
        // Check if data.company_id matches current user's company_id
        if (data && data.company_id !== parsedUserData?.companyId) {
          return; // Don't process data for different company
        }
        dispatch(setIsloadingDataEntries(false));
        dispatch(updateSingleBankResponseEntry(data));
        // dispatch(setRefreshDataEntries(true));
        window.dispatchEvent(new CustomEvent("socket:newTableEntryBankResponse", { detail: data }));
        broadcastSocketEvent('newTableEntryBankResponse', {
          data,
          actions: {
            setIsloadingDataEntries: false,
            setRefreshDataEntries: false,
            updateSingleBankResponseEntry: data,
          },
        });
      }
    });

    socket.on('newTableEntryPayin', (data) => {
      if (!localStorage.getItem('userData')) return;
      if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(parsedUserData?.role)) {
        if (data && data.company_id !== parsedUserData?.companyId) {
          return;
        }
        const activeTab = Number(localStorage.getItem('activeTab') || '0');
        const updatedData = { ...data, _activeTab: activeTab };
        // console.log('Received newTableEntryPayin:', updatedData); // Debug log
        dispatch(setIsloadingPayinEntries(false));
        dispatch(updateSinglePayinEntry(updatedData));
        // dispatch(setRefreshPayIn(true));
        window.dispatchEvent(new CustomEvent("socket:newTableEntryPayin", { detail: updatedData }));
        broadcastSocketEvent('newTableEntryPayin', {
          data: updatedData,
          actions: {
            setIsloadingPayinEntries: false,
            updateSinglePayinEntry: updatedData,
            setRefreshPayIn: false,
          },
        });
      }
    });

    ///for payouts
    socket.on('newTableEntryPayout', () => {
      // Ignore event if user is logged out
      if (!localStorage.getItem('userData')) return;
      if (
        [Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS , Role.VENDOR].includes(
          parsedUserData?.role,
        )
      ) {
        dispatch(setIsloadingPayOutEntries(false));
        dispatch(setRefreshPayOut(true));
        broadcastSocketEvent('newTableEntryPayout', {
          actions: {
            setIsloadingPayOutEntries: false,
            setRefreshPayOut: true,
          },
        });
      }
    });

    //for notifications
    socket.on('newTableEntryNotifications', () => {
      // Ignore event if user is logged out
      if (!localStorage.getItem('userData')) return;
      dispatch(setIsSocketHit(true));
      broadcastSocketEvent('newTableEntryNotifications', {
        actions: {
          setIsSocketHit: true,
        },
      });
    });

    // Bank response access update socket event listener
    socket.on('bankResponseAccessUpdate', (data) => {
      // Ignore event if user is logged out
      if (!localStorage.getItem('userData')) return;

      const storedUserData = JSON.parse(
        localStorage.getItem('userData') || '{}',
      );
      const currentUserId = storedUserData.userId || storedUserData.user_id;

      // Check if this update is for the current user using user_id from payload
      if (data && data.user_id && data.user_id === currentUserId) {
        // Broadcast to slave tabs
        broadcastSocketEvent('bankResponseAccessUpdate', { data });

        // Handle navigation based on access status from payload
        const hasAccess =
          data.bank_response_access === 'true' ||
          data.bank_response_access === true;

        if (!hasAccess) {
          // Access denied - show notification with custom message and navigate immediately
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message:
                data.message ||
                'Your access to Bank Response Data has been revoked. Redirecting...',
            }),
          );

          // Navigate immediately
          try {
            // Check if we can go back in history
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              // Fallback to dashboard if no previous route
              navigate('/auth/dashboard');
            }
          } catch {
            // If navigation fails, force redirect to dashboard
            navigate('/auth/dashboard');
          }

          // Notification will remain visible for 5 seconds as per user's request
        } else {
          // Access granted - show success notification with custom message
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: data.message || 'Your access to Bank Response Data has been granted.',
            }),
          );
        }
      }
    });

    return () => {
      socket.off('forceLogout');
      socket.off('session-terminated');
      socket.off('bankStatusWarning');
      socket.off('bankStatusUpdate');
      socket.off('newTableEntryBankResponse');
      socket.off('newTableEntryPayin');
      socket.off('newTableEntryPayout');
      socket.off('newTableEntryNotifications');
      socket.off('bankResponseAccessUpdate');
      socket.off('newLogin');
      socket.off('newlogout');
    };
  }, [isMaster, dispatch, navigate, broadcastMessage]);

  const handleLogout = async (): Promise<void> => {
    try {
      if (sessionStorage.getItem('isLoggingOut') === 'true') {
        return;
      }

      // Set the flag to prevent duplicate logout
      sessionStorage.setItem('isLoggingOut', 'true');

      // First, capture the session ID before we clear local storage
      const session_id = localStorage.getItem('userSession');

      // If this is master tab, coordinate logout using crossTabAuthSync
      if (isMaster) {
        // Use the reliable crossTabAuthSync system for logout coordination
        triggerCrossTabLogout('Manual logout initiated');
      }

      // Disconnect socket first to prevent any reconnection attempts during logout
      if (socket.connected) {
        socket.disconnect();
      }

      // Clear master role if this tab was master
      if (isMaster) {
        localStorage.removeItem('socket_master_tab');
        setIsMaster(false);
      }

      // Dispatch logout actions first (before clearing localStorage)
      dispatch(logout());
      dispatch(setActiveTab(0));
      if (setToken) {
        setToken(null);
      }

      // Clear all local data (crossTabAuthSync will also clear auth data)
      localStorage.removeItem('userData');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('lastLoginTime');

      // API call to logout (fire and forget)
      if (session_id) {
        logOutUser({ session_id }).catch(() => {
          // API call failed, but continue with logout
        });
      }

      // Clear the logout flag immediately
      sessionStorage.removeItem('isLoggingOut');

      // Force immediate navigation
      window.location.href = '/';
    } catch {
      // Even if something fails, still logout locally
      localStorage.clear(); // Clear everything
      sessionStorage.clear(); // Clear everything

      dispatch(logout());
      dispatch(setActiveTab(0));
      if (setToken) {
        setToken(null);
      }

      if (socket.connected) {
        socket.disconnect();
      }

      // Clear master role
      setIsMaster(false);

      // Force navigation even on error
      window.location.href = '/';
    }
  };

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): typeof socket => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Helper function to trigger login coordination across tabs
export const triggerSocketLogin = (): void => {
  if (typeof window !== 'undefined' && (window as any).triggerLogin) {
    (window as any).triggerLogin();
  }
};
