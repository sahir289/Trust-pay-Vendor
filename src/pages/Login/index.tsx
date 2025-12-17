/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FormCheck, FormInput, FormLabel } from '@/components/Base/Form';
// import Tippy from "@/components/Base/Tippy";
// import users from "@/fakers/users";
import Button from '@/components/Base/Button';
import { getShortBuildInfo } from '@/utils/buildInfo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import {
  getUserRoleDetails,
  loginUser,
} from '@/redux-toolkit/slices/auth/authAPI';
import { selectAuth } from '@/redux-toolkit/slices/auth/authSelectors';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import {
  loginSuccess,
  onload,
  loginFailure,
  clearError,
} from '@/redux-toolkit/slices/auth/authSlice';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Lucide from '@/components/Base/Lucide';
import { NotificationElement } from '@/components/Base/Notification';
import { useAuth } from '@/components/context/AuthContext';
// import socket from "@/socket/socket";
import {
  updateMenu,
  initializeMenu,
} from '@/redux-toolkit/slices/common/sideMenu/sideMenuSlice';
// import { checkUserFirstLogin } from '@/redux-toolkit/slices/user/userAPI';
import ForgotPassword from '@/components/ForgotPassword';
import { updateSessionId } from '@/utils/crossTabAuthSync';
import { Status } from '@/constants';
import {
  addAllNotification,
  removeNotificationById,
} from '@/redux-toolkit/slices/AllNoti/allNotifications';
import NotificationManager from '@/components/Base/Notification/NotificationManager';
interface CustomJwtPayload {
  company_id: any;
  user_id: string;
  user_name: string;
  designation: string;
  role: string;
  code: string[];
  id: string;
  session_id: string;
}

function Main() {
  const { setToken } = useAuth();

  const dispatch = useAppDispatch();
  const userLogin = useAppSelector(selectAuth);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const INITIAL_LOGIN_OBJ = {
    username: '',
    password: '',
    rememberMe: false,
    isAdminLogin: false, // Add this
    uniqueId: '', // Add this
  };
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginFirst, setIsLoginFirst] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userRoleError, setUserRoleError] = useState('');
  const notifications = useAppSelector(
    (state) => state.allNotification.allNotifications,
  );
  const notificationRefs = useRef<Map<string, NotificationElement>>(new Map());
  interface LoginUserInfo {
    data?: {
      accessToken: string;
      user?: {
        [key: string]: unknown;
      };
      sessionId?: string;
      isLoginFirst?: boolean;
    };
  }

  // Load remembered unique ID based on username
  useEffect(() => {
    if (loginObj.username && loginObj.isAdminLogin) {
      const rememberedAdmins = localStorage.getItem('rememberedAdmins');
      if (rememberedAdmins) {
        try {
          const adminsMap = JSON.parse(rememberedAdmins);
          const rememberedUniqueId = adminsMap[loginObj.username];
          if (rememberedUniqueId) {
            setLoginObj((prev) => ({
              ...prev,
              uniqueId: rememberedUniqueId,
              rememberMe: true,
            }));
          }
        } catch {
          // console.error('Error parsing remembered admins:', error);
        }
      }
    }
  }, [loginObj.username, loginObj.isAdminLogin]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      if (latestNotification) {
        const ref = notificationRefs.current.get(latestNotification.id);
        if (ref && latestNotification.id) {
          notificationRefs.current.forEach((_, id) => {
            if (id !== latestNotification.id) {
              dispatch(removeNotificationById(id));
              notificationRefs.current.delete(id);
            }
          });
          ref.showToast();
          setTimeout(() => {
            dispatch(removeNotificationById(latestNotification.id));
            notificationRefs.current.delete(latestNotification.id);
          }, 3000);
        }
      }
    }
  }, [notifications.length, dispatch]);

  const handleLoginSuccess = useCallback(
    (loginUserInfo: LoginUserInfo) => {
      if (loginUserInfo?.data?.accessToken) {
        // Handle Remember Me for admin users
        const userData = jwtDecode<CustomJwtPayload>(
          loginUserInfo?.data?.accessToken,
        );
        
        if (userData?.designation === 'ADMIN') {
          const rememberedAdmins = localStorage.getItem('rememberedAdmins');
          let adminsMap: Record<string, string> = {};
          
          if (rememberedAdmins) {
            try {
              adminsMap = JSON.parse(rememberedAdmins);
            } catch {
              // console.error('Error parsing remembered admins:', error);
            }
          }
          
          if (loginObj.rememberMe && loginObj.uniqueId && loginObj.username) {
            // Add or update the unique ID for this admin username
            adminsMap[loginObj.username] = loginObj.uniqueId;
            localStorage.setItem('rememberedAdmins', JSON.stringify(adminsMap));
          } else if (loginObj.username && adminsMap[loginObj.username]) {
            // Remove this admin's unique ID if remember me is unchecked
            delete adminsMap[loginObj.username];
            if (Object.keys(adminsMap).length > 0) {
              localStorage.setItem('rememberedAdmins', JSON.stringify(adminsMap));
            } else {
              localStorage.removeItem('rememberedAdmins');
            }
          }
        }

        // Save token and user data to localStorage
        localStorage.setItem('accessToken', loginUserInfo?.data?.accessToken);
        setToken(loginUserInfo?.data?.accessToken);

        const userDataDecoded = jwtDecode<CustomJwtPayload>(
          loginUserInfo?.data?.accessToken,
        );
        localStorage.setItem(
          'userData',
          JSON.stringify({
            name: userDataDecoded?.user_name,
            designation: userDataDecoded?.designation,
            role: userDataDecoded?.role,
            userId: userDataDecoded?.user_id,
            companyId: userDataDecoded?.company_id,
          }),
        );

        // Update menu immediately after setting user data
        if (
          [
            'ADMIN',
            'TRANSACTIONS',
            'OPERATIONS',
            'MERCHANT',
            'SUB_MERCHANT',
            'MERCHANT_OPERATIONS',
            'VENDOR',
            'VENDOR_OPERATIONS',
            'VENDOR_ADMIN'
          ].includes(userDataDecoded?.designation)
        ) {
          dispatch(
            updateMenu(
              userDataDecoded?.designation as
                | 'ADMIN'
                | 'TRANSACTIONS'
                | 'OPERATIONS'
                | 'MERCHANT'
                | 'SUB_MERCHANT'
                | 'MERCHANT_OPERATIONS'
                | 'VENDOR'
                | 'VENDOR_OPERATIONS'
                | 'VENDOR_ADMIN',
            ),
          );
        } else {
          // Invalid role - initialize menu from localStorage as fallback
          dispatch(initializeMenu());
        }

        // Socket connection is now handled automatically by the SocketContext
        // when accessToken and userData are available in localStorage

        const sessionId = loginUserInfo?.data?.sessionId;
        localStorage.setItem('userSession', JSON.stringify(sessionId));

        // Update cross-tab auth sync with new session ID
        if (sessionId) {
          updateSessionId(sessionId);
        }

        // Dispatch the login success action
        if (loginUserInfo.data) {
          dispatch(
            loginSuccess({
              accessToken: loginUserInfo.data.accessToken,
              user: loginUserInfo.data.user || {},
            }),
          );
        }

        // Trigger cross-tab login event to refresh other tabs
        if (
          sessionId &&
          userDataDecoded?.user_id &&
          loginUserInfo?.data?.accessToken
        ) {
          // Import here to avoid circular dependency
          import('@/utils/crossTabAuthSync').then(
            ({ triggerCrossTabLogin }) => {
              if (loginUserInfo.data) {
                triggerCrossTabLogin(
                  sessionId,
                  userDataDecoded.user_id,
                  loginUserInfo.data.accessToken,
                );
              }
            },
          );
        }
      }
    },
    [dispatch, setToken, loginObj.rememberMe, loginObj.uniqueId, loginObj.username],
  );
  // Listen for cross-tab login event and reload tab if detected
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    import('@/utils/crossTabAuthSync').then(
      ({ onCrossTabLogin, offCrossTabLogin }) => {
        const reloadOnLogin = () => {
          window.location.reload();
        };
        onCrossTabLogin(reloadOnLogin);
        removeListener = () => offCrossTabLogin(reloadOnLogin);
      },
    );
    return () => {
      if (removeListener) removeListener();
    };
  }, []);
  const fetchLoginDetails = useCallback(
    async (userlogin: {
      username: string;
      password: string;
      newPassword?: string;
      uniqueId?: string;
    }) => {
      dispatch(onload({ load: true }));
      dispatch(clearError());
      try {
        const loginUserInfo = await loginUser(userlogin);
        //when server fails response changed from undefined
        if (!loginUserInfo || !loginUserInfo?.data) {
          dispatch(
            loginFailure({
              error: new Error('No response or invalid response from server'),
            }),
          );
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: loginUserInfo?.error?.message || 'Failed to login',
            }),
          );
          dispatch(onload({ load: false }));
          return;
        }
        if (loginUserInfo?.data?.isLoginFirst) {
          dispatch(onload({ load: false }));
          setIsLoginFirst(true);
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'Please change your password',
            }),
          );
          return;
        }

        if (loginUserInfo?.data?.accessToken) {
          handleLoginSuccess(loginUserInfo);
          // Manually trigger socket connection after login
          setTimeout(() => {
            if ((window as any).updateSocketAuth) {
              (window as any).updateSocketAuth();
            }
          }, 100);
          // No need for window.location.reload() - let React Router handle navigation
          // The socket will connect automatically after localStorage is updated
        } else {
          dispatch(loginFailure({ error: loginUserInfo?.error }));
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message:
                loginUserInfo?.error?.message || 'An unknown error occurred',
            }),
          );
        }
      } catch (error: any) {
        dispatch(loginFailure({ error }));
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: error?.message || 'Failed to login',
          }),
        );
      }
    },
    [dispatch, handleLoginSuccess],
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const updateFormValue = ({
    updateType,
    value,
  }: {
    updateType: string;
    value: string | boolean;
  }) => {
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  const handlePasswordChange = (field: string, value: string) => {
    const newPasswords = {
      ...passwords,
      [field]: value,
    };
    setPasswords(newPasswords);

    // Clear previous errors
    setPasswordError('');

    // Validate as user types
    if (field === 'newPassword') {
      if (value === loginObj.password) {
        setPasswordError('New password cannot be same as current password');
        return;
      }
      if (value.length > 0 && value.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }
      // If confirm password is already entered, check match
      if (passwords.confirmPassword && value !== passwords.confirmPassword) {
        setPasswordError('Passwords do not match');
      }
    }

    if (field === 'confirmPassword' && newPasswords.newPassword) {
      if (value !== newPasswords.newPassword) {
        setPasswordError('Passwords do not match');
      }
    }
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoginFirst) {
      // Validate passwords
      if (!passwords.newPassword || !passwords.confirmPassword) {
        setPasswordError('Both password fields are required');
        return;
      }

      if (passwords.newPassword === loginObj.password) {
        setPasswordError('New password cannot be same as current password');
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      if (passwords.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }

      // Send both current password and new password
      fetchLoginDetails({
        username: loginObj.username,
        password: loginObj.password,
        newPassword: passwords.newPassword,
      });
    } else {
      // Normal login flow
      if (loginObj.username.trim() === '') {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'UserName is required!',
          }),
        );
      } else if (loginObj.password.trim() === '') {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Password is required!',
          }),
        );
      } else if (loginObj.isAdminLogin && !loginObj.uniqueId) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Unique ID is required for admin login!',
          }),
        );
      } else {
        // Include both uniqueId and isAdminLogin in payload when admin login is checked
        const loginData = {
          username: loginObj.username,
          password: loginObj.password,
          ...(loginObj.isAdminLogin && {
            unique_admin_id: loginObj.uniqueId,
          }),
        };
        fetchLoginDetails(loginData);
      }
    }
  };

  // Debounce getUserRole API call by 3 seconds
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const getUserRole = (username: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (username) {
      debounceRef.current = setTimeout(async () => {
        const res = await getUserRoleDetails(username);
        if (res?.data) {
          if (res?.data?.isAdmin) {
            setLoginObj((prev) => ({
              ...prev,
              isAdminLogin: true,
            }));
          } else {
            setLoginObj((prev) => ({
              ...prev,
              isAdminLogin: false,
            }));
          }
          setIsButtonDisabled(false);
          setUserRoleError('');
        } else if (res?.error) {
          setLoginObj((prev) => ({
            ...prev,
            isAdminLogin: false,
          }));
          const errorMsg = res.error.message || 'Failed to fetch user role';
          setUserRoleError(errorMsg);
          setIsButtonDisabled(true);
        }
      }, 1000);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden  flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.2),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.16),transparent_20%)]"></div>
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 flex flex-col gap-6 text-white">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-theme-1 to-theme-2 flex items-center justify-center text-xs font-semibold text-white">
                  TP
                </div>
                <span className="text-sm tracking-wide">Trusted. Fast. Secure.</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-semibold leading-tight drop-shadow">
                  Elevate your payments with a fresh, modern workspace.
                </h1>
                <p className="text-lg text-white/70 max-w-xl leading-relaxed">
                  A clean, distraction-free login crafted for busy operators and admins. Stay focused on approvals, settlements, and vendor flows without losing speed.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                  <div className="text-xl font-semibold">99.99%</div>
                  <div className="text-sm text-white/70">Platform uptime</div>
                </div>
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                  <div className="text-xl font-semibold">180k+</div>
                  <div className="text-sm text-white/70">Active users</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-theme-1/70 via-theme-2/60 to-emerald-400/50 rounded-[1.5rem] blur-2xl opacity-70 animate-pulse"></div>
                <div className="relative bg-white/90 dark:bg-darkmode-700/90 backdrop-blur-xl border border-white/30 dark:border-darkmode-400/50 shadow-2xl rounded-[1.4rem] p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-theme-1 to-theme-2 flex items-center justify-center text-white font-semibold">
                      TP
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        Trust Pay Vendor
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-300">
                        Secure Sign In
                      </div>
                    </div>
                    <div className="ml-auto">
                      <ThemeSwitcher />
                    </div>
                  </div>

                  <div className="mt-8">
                    {showForgotPassword ? (
                      <ForgotPassword
                        onBack={() => setShowForgotPassword(false)}
                        onSuccess={() => {
                          setShowForgotPassword(false);
                        }}
                      />
                    ) : (
                      <>
                        <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                          {isLoginFirst ? 'Update your password' : 'Welcome back'}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                          {isLoginFirst
                            ? 'Create a strong password to continue.'
                            : 'Access your dashboard to manage payouts and vendors.'}
                        </div>

                        <form onSubmit={handleForm} className="mt-6 space-y-4">
                          {!isLoginFirst && (
                            <>
                              <div className="space-y-2">
                                <FormLabel className="text-sm text-slate-600 dark:text-slate-200">
                                  UserName<span className="text-danger">*</span>
                                </FormLabel>
                                <FormInput
                                  type="text"
                                  className="block w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-darkmode-400 focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/30 transition"
                                  placeholder="Enter your username"
                                  value={loginObj.username}
                                  onChange={(e) => {
                                    getUserRole(e.target.value);
                                    updateFormValue({
                                      updateType: 'username',
                                      value: e.target.value,
                                    });
                                  }}
                                  required
                                />
                                {userRoleError && (
                                  <div className="text-danger text-sm">{userRoleError}</div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <FormLabel className="text-sm text-slate-600 dark:text-slate-200">
                                  Password<span className="text-danger">*</span>
                                </FormLabel>
                                <div className="relative">
                                  <FormInput
                                    type={showPassword ? 'text' : 'password'}
                                    className="block w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-darkmode-400 focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/30 transition pr-12"
                                    placeholder="************"
                                    value={loginObj.password}
                                    onChange={(e) =>
                                      updateFormValue({
                                        updateType: 'password',
                                        value: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                  <div
                                    className="absolute right-4 top-4 cursor-pointer text-slate-600"
                                    onClick={togglePasswordVisibility}
                                  >
                                    {showPassword ? (
                                      <Lucide className="stroke-[1]" icon="Eye" />
                                    ) : (
                                      <Lucide className="stroke-[1]" icon="EyeOff" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {loginObj.isAdminLogin && (
                                <div className="space-y-2">
                                  <FormLabel className="text-sm text-slate-600 dark:text-slate-200">
                                    Unique ID<span className="text-danger">*</span>
                                  </FormLabel>
                                  <FormInput
                                    type="text"
                                    className="block w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-darkmode-400 focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/30 transition"
                                    placeholder="Enter unique ID"
                                    value={loginObj.uniqueId}
                                    onChange={(e) =>
                                      updateFormValue({
                                        updateType: 'uniqueId',
                                        value: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                              )}

                              <div className="flex items-center text-xs text-slate-500 sm:text-sm gap-3">
                                {loginObj.isAdminLogin && (
                                  <div className="flex items-center gap-2">
                                    <FormCheck.Input
                                      id="remember-me"
                                      type="checkbox"
                                      className="border"
                                      checked={loginObj.rememberMe}
                                      onChange={(e) =>
                                        updateFormValue({
                                          updateType: 'rememberMe',
                                          value: e.target.checked,
                                        })
                                      }
                                    />
                                    <label
                                      className="cursor-pointer select-none"
                                      htmlFor="remember-me"
                                    >
                                      Remember me
                                    </label>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowForgotPassword(true)}
                                  className="text-primary hover:underline ml-auto"
                                >
                                  Forgot Password?
                                </button>
                              </div>
                            </>
                          )}

                          {isLoginFirst && (
                            <>
                              <div className="space-y-2">
                                <FormLabel className="text-sm text-slate-600 dark:text-slate-200">
                                  New Password<span className="text-danger">*</span>
                                </FormLabel>
                                <div className="relative">
                                  <FormInput
                                    type={showPassword ? 'text' : 'password'}
                                    className={`block w-full px-4 py-3.5 rounded-xl border ${
                                      passwordError && passwords.newPassword
                                        ? 'border-danger'
                                        : 'border-slate-200 dark:border-darkmode-400'
                                    } focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/30 transition pr-12`}
                                    placeholder="Enter new password"
                                    value={passwords.newPassword}
                                    onChange={(e) =>
                                      handlePasswordChange('newPassword', e.target.value)
                                    }
                                    required
                                  />
                                  <div
                                    className="absolute right-4 top-4 cursor-pointer text-slate-600"
                                    onClick={togglePasswordVisibility}
                                  >
                                    {showPassword ? (
                                      <Lucide className="stroke-[1]" icon="Eye" />
                                    ) : (
                                      <Lucide className="stroke-[1]" icon="EyeOff" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <FormLabel className="text-sm text-slate-600 dark:text-slate-200">
                                  Confirm New Password<span className="text-danger">*</span>
                                </FormLabel>
                                <div className="relative">
                                  <FormInput
                                    type={showPassword ? 'text' : 'password'}
                                    className={`block w-full px-4 py-3.5 rounded-xl border ${
                                      passwordError && passwords.confirmPassword
                                        ? 'border-danger'
                                        : 'border-slate-200 dark:border-darkmode-400'
                                    } focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/30 transition pr-12`}
                                    placeholder="Confirm new password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) =>
                                      handlePasswordChange('confirmPassword', e.target.value)
                                    }
                                    required
                                  />
                                  <div
                                    className="absolute right-4 top-4 cursor-pointer text-slate-600"
                                    onClick={togglePasswordVisibility}
                                  >
                                    {showPassword ? (
                                      <Lucide className="stroke-[1]" icon="Eye" />
                                    ) : (
                                      <Lucide className="stroke-[1]" icon="EyeOff" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              {passwordError && (
                                <div className="text-danger text-sm">{passwordError}</div>
                              )}
                            </>
                          )}

                          <div className="pt-2">
                            <Button
                              variant="primary"
                              rounded
                              disabled={userLogin.loading || isButtonDisabled}
                              className="w-full py-3.5 font-semibold bg-gradient-to-r from-theme-1 via-theme-2 to-emerald-500 text-white shadow-lg shadow-theme-2/30 hover:shadow-theme-2/50 transition"
                            >
                              {userLogin.loading
                                ? 'Loading...'
                                : isLoginFirst
                                ? 'Update Password'
                                : 'Log In'}
                            </Button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-4 right-4 z-50 text-sm text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
          {getShortBuildInfo()}
        </div>
      </div>
      <NotificationManager />
    </>
  );
}

export default Main;