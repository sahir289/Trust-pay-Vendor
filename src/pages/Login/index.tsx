/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FormCheck, FormInput, FormLabel } from "@/components/Base/Form"
import Button from "@/components/Base/Button"
import { getShortBuildInfo } from "@/utils/buildInfo"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import { getUserRoleDetails, loginUser } from "@/redux-toolkit/slices/auth/authAPI"
import { selectAuth } from "@/redux-toolkit/slices/auth/authSelectors"
import { useAppDispatch } from "@/redux-toolkit/hooks/useAppDispatch"
import { useAppSelector } from "@/redux-toolkit/hooks/useAppSelector"
import { loginSuccess, onload, loginFailure, clearError } from "@/redux-toolkit/slices/auth/authSlice"
import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import Lucide from "@/components/Base/Lucide"
import type { NotificationElement } from "@/components/Base/Notification"
import { useAuth } from "@/components/context/AuthContext"
import { updateMenu, initializeMenu } from "@/redux-toolkit/slices/common/sideMenu/sideMenuSlice"
import ForgotPassword from "@/components/ForgotPassword"
import { updateSessionId } from "@/utils/crossTabAuthSync"
import { Status } from "@/constants"
import { addAllNotification, removeNotificationById } from "@/redux-toolkit/slices/AllNoti/allNotifications"
import NotificationManager from "@/components/Base/Notification/NotificationManager"

interface CustomJwtPayload {
  company_id: any
  user_id: string
  user_name: string
  designation: string
  role: string
  code: string[]
  id: string
  session_id: string
}

function Main() {
  const { setToken } = useAuth()

  const dispatch = useAppDispatch()
  const userLogin = useAppSelector(selectAuth)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const INITIAL_LOGIN_OBJ = {
    username: "",
    password: "",
    rememberMe: false,
    isAdminLogin: false,
    uniqueId: "",
  }
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginFirst, setIsLoginFirst] = useState(false)
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [userRoleError, setUserRoleError] = useState("")
  const notifications = useAppSelector((state) => state.allNotification.allNotifications)
  const notificationRefs = useRef<Map<string, NotificationElement>>(new Map())
  interface LoginUserInfo {
    data?: {
      accessToken: string
      user?: {
        [key: string]: unknown
      }
      sessionId?: string
      isLoginFirst?: boolean
    }
  }

  useEffect(() => {
    if (loginObj.username && loginObj.isAdminLogin) {
      const rememberedAdmins = localStorage.getItem("rememberedAdmins")
      if (rememberedAdmins) {
        try {
          const adminsMap = JSON.parse(rememberedAdmins)
          const rememberedUniqueId = adminsMap[loginObj.username]
          if (rememberedUniqueId) {
            setLoginObj((prev) => ({
              ...prev,
              uniqueId: rememberedUniqueId,
              rememberMe: true,
            }))
          }
        } catch {
          // console.error('Error parsing remembered admins:', error);
        }
      }
    }
  }, [loginObj.username, loginObj.isAdminLogin])

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1]
      if (latestNotification) {
        const ref = notificationRefs.current.get(latestNotification.id)
        if (ref && latestNotification.id) {
          notificationRefs.current.forEach((_, id) => {
            if (id !== latestNotification.id) {
              dispatch(removeNotificationById(id))
              notificationRefs.current.delete(id)
            }
          })
          ref.showToast()
          setTimeout(() => {
            dispatch(removeNotificationById(latestNotification.id))
            notificationRefs.current.delete(latestNotification.id)
          }, 3000)
        }
      }
    }
  }, [notifications, dispatch])

  const handleLoginSuccess = useCallback(
    (loginUserInfo: LoginUserInfo) => {
      if (loginUserInfo?.data?.accessToken) {
        const userData = jwtDecode<CustomJwtPayload>(loginUserInfo?.data?.accessToken)

        if (userData?.designation === "ADMIN") {
          const rememberedAdmins = localStorage.getItem("rememberedAdmins")
          let adminsMap: Record<string, string> = {}

          if (rememberedAdmins) {
            try {
              adminsMap = JSON.parse(rememberedAdmins)
            } catch {
              // console.error('Error parsing remembered admins:', error);
            }
          }

          if (loginObj.rememberMe && loginObj.uniqueId && loginObj.username) {
            adminsMap[loginObj.username] = loginObj.uniqueId
            localStorage.setItem("rememberedAdmins", JSON.stringify(adminsMap))
          } else if (loginObj.username && adminsMap[loginObj.username]) {
            delete adminsMap[loginObj.username]
            if (Object.keys(adminsMap).length > 0) {
              localStorage.setItem("rememberedAdmins", JSON.stringify(adminsMap))
            } else {
              localStorage.removeItem("rememberedAdmins")
            }
          }
        }

        localStorage.setItem("accessToken", loginUserInfo?.data?.accessToken)
        setToken(loginUserInfo?.data?.accessToken)

        const userDataDecoded = jwtDecode<CustomJwtPayload>(loginUserInfo?.data?.accessToken)
        localStorage.setItem(
          "userData",
          JSON.stringify({
            name: userDataDecoded?.user_name,
            designation: userDataDecoded?.designation,
            role: userDataDecoded?.role,
            userId: userDataDecoded?.user_id,
            companyId: userDataDecoded?.company_id,
          }),
        )

        if (
          [
            "ADMIN",
            "TRANSACTIONS",
            "OPERATIONS",
            "MERCHANT",
            "SUB_MERCHANT",
            "MERCHANT_OPERATIONS",
            "VENDOR",
            "VENDOR_OPERATIONS",
            "VENDOR_ADMIN",
          ].includes(userDataDecoded?.designation)
        ) {
          dispatch(
            updateMenu(
              userDataDecoded?.designation as
                | "ADMIN"
                | "TRANSACTIONS"
                | "OPERATIONS"
                | "MERCHANT"
                | "SUB_MERCHANT"
                | "MERCHANT_OPERATIONS"
                | "VENDOR"
                | "VENDOR_OPERATIONS"
                | "VENDOR_ADMIN",
            ),
          )
        } else {
          dispatch(initializeMenu())
        }

        const sessionId = loginUserInfo?.data?.sessionId
        localStorage.setItem("userSession", JSON.stringify(sessionId))

        if (sessionId) {
          updateSessionId(sessionId)
        }

        if (loginUserInfo.data) {
          dispatch(
            loginSuccess({
              accessToken: loginUserInfo.data.accessToken,
              user: loginUserInfo.data.user || {},
            }),
          )
        }

        if (sessionId && userDataDecoded?.user_id && loginUserInfo?.data?.accessToken) {
          import("@/utils/crossTabAuthSync").then(({ triggerCrossTabLogin }) => {
            if (loginUserInfo.data) {
              triggerCrossTabLogin(sessionId, userDataDecoded.user_id, loginUserInfo.data.accessToken)
            }
          })
        }
      }
    },
    [dispatch, setToken, loginObj.rememberMe, loginObj.uniqueId, loginObj.username],
  )

  useEffect(() => {
    let removeListener: (() => void) | undefined
    import("@/utils/crossTabAuthSync").then(({ onCrossTabLogin, offCrossTabLogin }) => {
      const reloadOnLogin = () => {
        window.location.reload()
      }
      onCrossTabLogin(reloadOnLogin)
      removeListener = () => offCrossTabLogin(reloadOnLogin)
    })
    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  const fetchLoginDetails = useCallback(
    async (userlogin: {
      username: string
      password: string
      newPassword?: string
      uniqueId?: string
    }) => {
      dispatch(onload({ load: true }))
      dispatch(clearError())
      try {
        const loginUserInfo = await loginUser(userlogin)
        if (!loginUserInfo || !loginUserInfo?.data) {
          dispatch(
            loginFailure({
              error: new Error("No response or invalid response from server"),
            }),
          )
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: loginUserInfo?.error?.message || "Failed to login",
            }),
          )
          dispatch(onload({ load: false }))
          return
        }
        if (loginUserInfo?.data?.isLoginFirst) {
          dispatch(onload({ load: false }))
          setIsLoginFirst(true)
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: "Please change your password",
            }),
          )
          return
        }

        if (loginUserInfo?.data?.accessToken) {
          handleLoginSuccess(loginUserInfo)
          setTimeout(() => {
            if ((window as any).updateSocketAuth) {
              ;(window as any).updateSocketAuth()
            }
          }, 100)
        } else {
          dispatch(loginFailure({ error: loginUserInfo?.error }))
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: loginUserInfo?.error?.message || "An unknown error occurred",
            }),
          )
        }
      } catch (error: any) {
        dispatch(loginFailure({ error }))
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: error?.message || "Failed to login",
          }),
        )
      }
    },
    [dispatch, handleLoginSuccess],
  )

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const updateFormValue = ({
    updateType,
    value,
  }: {
    updateType: string
    value: string | boolean
  }) => {
    setLoginObj({ ...loginObj, [updateType]: value })
  }

  const handlePasswordChange = (field: string, value: string) => {
    const newPasswords = {
      ...passwords,
      [field]: value,
    }
    setPasswords(newPasswords)

    setPasswordError("")

    if (field === "newPassword") {
      if (value === loginObj.password) {
        setPasswordError("New password cannot be same as current password")
        return
      }
      if (value.length > 0 && value.length < 8) {
        setPasswordError("Password must be at least 8 characters long")
        return
      }
      if (passwords.confirmPassword && value !== passwords.confirmPassword) {
        setPasswordError("Passwords do not match")
      }
    }

    if (field === "confirmPassword" && newPasswords.newPassword) {
      if (value !== newPasswords.newPassword) {
        setPasswordError("Passwords do not match")
      }
    }
  }

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isLoginFirst) {
      if (!passwords.newPassword || !passwords.confirmPassword) {
        setPasswordError("Both password fields are required")
        return
      }

      if (passwords.newPassword === loginObj.password) {
        setPasswordError("New password cannot be same as current password")
        return
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }

      if (passwords.newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters long")
        return
      }

      fetchLoginDetails({
        username: loginObj.username,
        password: loginObj.password,
        newPassword: passwords.newPassword,
      })
    } else {
      if (loginObj.username.trim() === "") {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: "UserName is required!",
          }),
        )
      } else if (loginObj.password.trim() === "") {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: "Password is required!",
          }),
        )
      } else if (loginObj.isAdminLogin && !loginObj.uniqueId) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: "Unique ID is required for admin login!",
          }),
        )
      } else {
        const loginData = {
          username: loginObj.username,
          password: loginObj.password,
          ...(loginObj.isAdminLogin && {
            unique_admin_id: loginObj.uniqueId,
          }),
        }
        fetchLoginDetails(loginData)
      }
    }
  }

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const getUserRole = (username: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (username) {
      debounceRef.current = setTimeout(async () => {
        const res = await getUserRoleDetails(username)
        if (res?.data) {
          if (res?.data?.isAdmin) {
            setLoginObj((prev) => ({
              ...prev,
              isAdminLogin: true,
            }))
          } else {
            setLoginObj((prev) => ({
              ...prev,
              isAdminLogin: false,
            }))
          }
          setIsButtonDisabled(false)
          setUserRoleError("")
        } else if (res?.error) {
          setLoginObj((prev) => ({
            ...prev,
            isAdminLogin: false,
          }))
          const errorMsg = res.error.message || "Failed to fetch user role"
          setUserRoleError(errorMsg)
          setIsButtonDisabled(true)
        }
      }, 1000)
    }
  }

  return (
    <>
      {/* Main Container with Animated Background */}
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-darkmode-800 dark:via-darkmode-900 dark:to-darkmode-800">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Login Card Container */}
        <div className="relative z-10 w-full max-w-md px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 dark:bg-darkmode-600/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/30 border border-white/20 dark:border-slate-700/50 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:shadow-slate-900/20">
            {/* Card Header with Logo */}
            <div className="px-8 pt-10 pb-6 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative rounded-2xl w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-9 h-9 relative -rotate-45 [&_div]:bg-white">
                      <div className="absolute w-[20%] left-0 inset-y-0 my-auto rounded-full opacity-50 h-[75%]"></div>
                      <div className="absolute w-[20%] inset-0 m-auto h-[120%] rounded-full"></div>
                      <div className="absolute w-[20%] right-0 inset-y-0 my-auto rounded-full opacity-50 h-[75%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                  {isLoginFirst ? "Change Password" : "Welcome Back"}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isLoginFirst
                    ? "Please update your password to continue"
                    : "Sign in to access your account"}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-8 py-8">
              {showForgotPassword ? (
                <ForgotPassword
                  onBack={() => setShowForgotPassword(false)}
                  onSuccess={() => {
                    setShowForgotPassword(false)
                  }}
                />
              ) : (
                <form onSubmit={handleForm} className="space-y-5">
                  {!isLoginFirst && (
                    <>
                      {/* Username Field */}
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Username<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                          <FormInput
                            type="text"
                            className="relative block w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-darkmode-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="Enter your username"
                            value={loginObj.username}
                            onChange={(e) => {
                              getUserRole(e.target.value)
                              updateFormValue({
                                updateType: "username",
                                value: e.target.value,
                              })
                            }}
                            required
                          />
                        </div>
                        {userRoleError && (
                          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-1.5 animate-in slide-in-from-top-1 duration-200">
                            <Lucide icon="AlertCircle" className="w-3.5 h-3.5" />
                            <span>{userRoleError}</span>
                          </div>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Password<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                          <FormInput
                            type={showPassword ? "text" : "password"}
                            className="relative block w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-darkmode-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="Enter your password"
                            value={loginObj.password}
                            onChange={(e) =>
                              updateFormValue({
                                updateType: "password",
                                value: e.target.value,
                              })
                            }
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <Lucide className="w-5 h-5" icon="Eye" />
                            ) : (
                              <Lucide className="w-5 h-5" icon="EyeOff" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Admin Unique ID Field */}
                      {loginObj.isAdminLogin && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Unique ID<span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                            <FormInput
                              type="text"
                              className="relative block w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-darkmode-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              placeholder="Enter admin unique ID"
                              value={loginObj.uniqueId}
                              onChange={(e) =>
                                updateFormValue({
                                  updateType: "uniqueId",
                                  value: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between pt-1">
                        {loginObj.isAdminLogin && (
                          <label className="flex items-center gap-2 cursor-pointer group" htmlFor="remember-me">
                            <FormCheck.Input
                              id="remember-me"
                              type="checkbox"
                              className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                              checked={loginObj.rememberMe}
                              onChange={(e) =>
                                updateFormValue({
                                  updateType: "rememberMe",
                                  value: e.target.checked,
                                })
                              }
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-200">
                              Remember me
                            </span>
                          </label>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className={`text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 hover:underline ${
                            !loginObj.isAdminLogin ? "ml-auto" : ""
                          }`}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </>
                  )}

                  {/* Change Password Fields */}
                  {isLoginFirst && (
                    <>
                      {/* New Password */}
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          New Password<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                          <FormInput
                            type={showPassword ? "text" : "password"}
                            className={`relative block w-full px-4 py-3.5 pr-12 rounded-xl border-2 ${
                              passwordError && passwords.newPassword
                                ? "border-red-500 dark:border-red-400 focus:ring-red-500/10"
                                : "border-slate-200 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/10"
                            } bg-white dark:bg-darkmode-700 focus:ring-4 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                            placeholder="Enter new password"
                            value={passwords.newPassword}
                            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <Lucide className="w-5 h-5" icon="Eye" />
                            ) : (
                              <Lucide className="w-5 h-5" icon="EyeOff" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Confirm New Password<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                          <FormInput
                            type={showPassword ? "text" : "password"}
                            className={`relative block w-full px-4 py-3.5 pr-12 rounded-xl border-2 ${
                              passwordError && passwords.confirmPassword
                                ? "border-red-500 dark:border-red-400 focus:ring-red-500/10"
                                : "border-slate-200 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/10"
                            } bg-white dark:bg-darkmode-700 focus:ring-4 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                            placeholder="Confirm your new password"
                            value={passwords.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <Lucide className="w-5 h-5" icon="Eye" />
                            ) : (
                              <Lucide className="w-5 h-5" icon="EyeOff" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password Error Message */}
                      {passwordError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg animate-in slide-in-from-top-1 duration-200">
                          <Lucide icon="AlertCircle" className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <span className="text-sm text-red-600 dark:text-red-400">{passwordError}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      rounded
                      disabled={userLogin.loading || isButtonDisabled}
                      className="relative w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {userLogin.loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
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
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>{isLoginFirst ? "Update Password" : "Sign In"}</span>
                            <Lucide
                              icon="ArrowRight"
                              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                            />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Secure login powered by{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">TrustPay</span>
            </p>
          </div>
        </div>
      </div>

      {/* Build Info Badge */}
      <div className="fixed bottom-5 right-5 z-50 text-xs text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-darkmode-700/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl transition-all duration-300">
        {getShortBuildInfo()}
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher />

      {/* Notification Manager */}
      <NotificationManager />
    </>
  )
}

export default Main
