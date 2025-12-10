/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FormCheck, FormInput, FormLabel } from '@/components/Base/Form';
// import Tippy from "@/components/Base/Tippy";
// import users from "@/fakers/users";
import Button from '@/components/Base/Button';
import { getShortBuildInfo } from '@/utils/buildInfo';
import clsx from 'clsx';
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
      <div className="container grid lg:h-screen grid-cols-12 lg:max-w-[1550px] 2xl:max-w-[1750px] py-10 px-5 sm:py-14 sm:px-10 md:px-36 lg:py-0 lg:pl-14 lg:pr-12 xl:px-24">
        <div
          className={clsx([
            'relative z-50 h-full col-span-12 p-7 sm:p-14 bg-white rounded-2xl lg:bg-transparent lg:pr-10 lg:col-span-5 xl:pr-24 2xl:col-span-4 lg:p-0 dark:bg-darkmode-600',
            "before:content-[''] before:absolute before:inset-0 before:-mb-3.5 before:bg-white/40 before:rounded-2xl before:mx-5 dark:before:hidden",
          ])}
        >
          <div className="relative z-10 flex flex-col justify-center w-full h-full py-2 lg:py-32">
            <div className="rounded-[0.8rem] w-[55px] h-[55px] border border-primary/30 flex items-center justify-center">
              <div className="relative flex items-center justify-center w-[50px] rounded-[0.6rem] h-[50px] bg-gradient-to-b from-theme-1/90 to-theme-2/90 bg-white">
                <div className="w-[26px] h-[26px] relative -rotate-45 [&_div]:bg-white">
                  <div className="absolute w-[20%] left-0 inset-y-0 my-auto rounded-full opacity-50 h-[75%]"></div>
                  <div className="absolute w-[20%] inset-0 m-auto h-[120%] rounded-full"></div>
                  <div className="absolute w-[20%] right-0 inset-y-0 my-auto rounded-full opacity-50 h-[75%]"></div>
                </div>
              </div>
            </div>
            <div className="mt-10">
              {showForgotPassword ? (
                <ForgotPassword
                  onBack={() => setShowForgotPassword(false)}
                  onSuccess={() => {
                    setShowForgotPassword(false);
                    // dispatch(
                    //   addAllNotification({
                    //     status: Status.SUCCESS,
                    //     message: 'Password reset successful. Please login with your new password.',
                    //   })
                    // );
                  }}
                />
              ) : (
                <>
                  <div className="text-2xl font-medium">
                    {isLoginFirst ? 'Please change your password' : 'Log In'}
                  </div>
                  <div className="mt-6">
                    <form onSubmit={handleForm} className="mt-6 space-y-4">
                      {!isLoginFirst && (
                        <>
                          <FormLabel>
                            UserName<span className="text-danger">*</span>
                          </FormLabel>
                          <FormInput
                            type="text"
                            className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                            placeholder={'Enter your username'}
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
                          {/* Error message below button */}
                          {userRoleError && (
                            <div className="text-danger text-sm mt-2">
                              {userRoleError}
                            </div>
                          )}
                          <FormLabel className="mt-4">
                            Password<span className="text-danger">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormInput
                              type={showPassword ? 'text' : 'password'}
                              className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
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
                          {/* <div className="flex mt-4 text-xs text-slate-500 sm:text-sm">
                            <div className="flex items-center mr-auto">
                              <FormCheck.Input
                                id="admin-login"
                                type="checkbox"
                                className="mr-2.5 border"
                                checked={loginObj.isAdminLogin}
                                onChange={(e) =>
                                  updateFormValue({
                                    updateType: 'isAdminLogin',
                                    value: e.target.checked,
                                  })
                                }
                              />
                              <label
                                className="cursor-pointer select-none"
                                htmlFor="admin-login"
                              >
                                Admin Login
                              </label>
                            </div>
                          </div> */}
                          {loginObj.isAdminLogin && (
                            <div className="mt-4">
                              <FormLabel>
                                Unique ID<span className="text-danger">*</span>
                              </FormLabel>
                              <FormInput
                                type="text"
                                className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
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
                          <div className="flex mt-4 text-xs text-slate-500 sm:text-sm">
                            {loginObj.isAdminLogin && (
                              <div className="flex items-center mr-auto">
                                <FormCheck.Input
                                  id="remember-me"
                                  type="checkbox"
                                  className="mr-2.5 border"
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
                              className={`text-primary hover:underline ${!loginObj.isAdminLogin ? 'ml-auto' : ''}`}
                            >
                              Forgot Password?
                            </button>
                          </div>
                        </>
                      )}

                      {isLoginFirst && (
                        <>
                          <FormLabel className="mt-4">
                            New Password<span className="text-danger">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormInput
                              type={showPassword ? 'text' : 'password'}
                              className={`block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80 ${
                                passwordError && passwords.newPassword
                                  ? 'border-danger'
                                  : ''
                              }`}
                              placeholder="Enter new password"
                              value={passwords.newPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  'newPassword',
                                  e.target.value,
                                )
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

                          <FormLabel className="mt-4">
                            Confirm New Password
                            <span className="text-danger">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormInput
                              type={showPassword ? 'text' : 'password'}
                              className={`block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80 ${
                                passwordError && passwords.confirmPassword
                                  ? 'border-danger'
                                  : ''
                              }`}
                              placeholder="Confirm new password"
                              value={passwords.confirmPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  'confirmPassword',
                                  e.target.value,
                                )
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
                          {passwordError && (
                            <div className="text-danger text-sm mt-2">
                              {passwordError}
                            </div>
                          )}
                        </>
                      )}

                      <div className="mt-5 text-center xl:mt-8 xl:text-left">
                        <Button
                          variant="primary"
                          rounded
                          disabled={userLogin.loading || isButtonDisabled}
                          className="bg-gradient-to-r from-theme-1/70 to-theme-2/70 w-full py-3.5 xl:mr-3 dark:border-darkmode-400"
                        >
                          {userLogin.loading
                            ? 'Loading...'
                            : isLoginFirst
                            ? 'Update Password'
                            : 'Log In'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed container grid w-screen inset-0 h-screen grid-cols-12 lg:max-w-[1550px] 2xl:max-w-[1750px] pl-14 pr-12 xl:px-24">
        <div
          className={clsx([
            'relative h-screen col-span-12 lg:col-span-5 2xl:col-span-4 z-20',
            "after:bg-white after:hidden after:lg:block after:content-[''] after:absolute after:right-0 after:inset-y-0 after:bg-gradient-to-b after:from-white after:to-slate-100/80 after:w-[800%] after:rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0] dark:after:bg-darkmode-600 dark:after:from-darkmode-600 dark:after:to-darkmode-600",
            "before:content-[''] before:hidden before:lg:block before:absolute before:right-0 before:inset-y-0 before:my-6 before:bg-gradient-to-b before:from-white/10 before:to-slate-50/10 before:bg-white/50 before:w-[800%] before:-mr-4 before:rounded-[0_1.2rem_1.2rem_0/0_1.7rem_1.7rem_0] dark:before:from-darkmode-300 dark:before:to-darkmode-300",
          ])}
        ></div>
        <div
          className={clsx([
            'h-full col-span-7 2xl:col-span-8 lg:relative',
            "before:content-[''] before:absolute before:lg:-ml-10 before:left-0 before:inset-y-0 before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 before:w-screen before:lg:w-[800%]",
            "after:content-[''] after:absolute after:inset-y-0 after:left-0 after:w-screen after:lg:w-[800%] after:bg-texture-white after:bg-fixed after:bg-center after:lg:bg-[25rem_-25rem] after:bg-no-repeat",
          ])}
        >
          <div className="sticky top-0 z-10 flex-col justify-center hidden h-screen ml-16 lg:flex xl:ml-28 2xl:ml-36">
            <div className="leading-[1.4] text-[2.6rem] xl:text-5xl font-medium xl:leading-[1.2] text-white">
              Seamless Payments, <br /> Powered by Simplicity
            </div>
            <div className="mt-5 text-base leading-relaxed xl:text-lg text-white/70">
              Our payment solution streamlines transactions with speed,
              security, and ease. Whether you're a small business or a global
              enterprise, our platform ensures hassle-free payments, supporting
              multiple methods and currencies while keeping your data safe.
              Focus on growth—let us handle the rest.
            </div>
            <div className="flex flex-col gap-3 mt-10 xl:items-center xl:flex-row">
              <div className="text-base xl:ml-2 2xl:ml-3 text-white/70">
                Over 180k+ strong and growing! Your journey begins here.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50 text-sm text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-darkmode-600/80 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
        {getShortBuildInfo()}
      </div>
      <ThemeSwitcher />
      <NotificationManager />
    </>
  );
}

export default Main;
