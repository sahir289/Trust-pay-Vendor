/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import '@/assets/css/vendors/simplebar.css';
import '@/assets/css/themes/echo.css';
// import Breadcrumb from '@/components/Base/Breadcrumb';
import { useState, useEffect, createRef, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { selectSideMenu } from '@/redux-toolkit/slices/common/sideMenu/sideMenuSelectors';
import { setCompactMenu as setCompactMenuStore } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSlice';
import { selectCompactMenu } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSelectors';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { FormattedMenu, linkTo, nestedMenu } from './side-menu';
import Lucide from '@/components/Base/Lucide';
import users from '@/assets/images/users/user-244.png';
import clsx from 'clsx';
import SimpleBar from 'simplebar';
import { useAuth } from '@/components/context/AuthContext';
import {
  logout,
  onload,
  loginFailure,
  clearError,
} from '@/redux-toolkit/slices/auth/authSlice';
import {
  changePassword,
  logOutUser,
  verifyPassword,
  getCompanyDetails,
} from '@/redux-toolkit/slices/auth/authAPI';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import {
  ChangePasswordFormFields,
  Role,
  Status,
  VerificationformFields,
} from '@/constants';
import Modal from '../../components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
import { triggerCrossTabLogout } from '@/utils/crossTabAuthSync';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};


function Main() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector(selectDarkMode);
  // const isRefreshCount = useAppSelector(selectIsSocketHit);
  // const notificationsCount = useAppSelector(selectNotificationsCount);
  const { setToken } = useAuth();
  const compactMenu = useAppSelector(selectCompactMenu);
  const setCompactMenu = (val: boolean) => {
    localStorage.setItem('compactMenu', val.toString());
    dispatch(setCompactMenuStore(val));
  };
  const [isSidebarFixed, setIsSidebarFixed] = useState(
    localStorage.getItem('isSidebarFixed') === 'true',
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [formattedMenu, setFormattedMenu] = useState<
    Array<FormattedMenu | string>
  >([]);
  const sideMenuStore = useAppSelector(selectSideMenu);
  const sideMenu = () => nestedMenu(sideMenuStore || [], location);
  const scrollableRef = createRef<HTMLDivElement>();
  const [topBarActive, setTopBarActive] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}') || {
    name: 'Guest',
    designation: 'N/A',
  };
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isBlurred, setIsBlurred] = useState(true);
  const [verification, setVerification] = useState(false);
  const [, setVerified] = useState(false);
  const [showPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData] = useState<FormData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const verificationModalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleBlur = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsBlurred(!isBlurred);
  };


  const handleChangePassword = async (data: {
    password: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    let payload = {
      oldPassword: data.password,
      password: data.newPassword,
    };
    try {
      const response = await changePassword(payload);
      if (response?.meta?.message) {
        setShowChangePasswordModal(false);
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: response?.meta?.message,
          }),
        );
      } else {
        setPasswordError('Failed to change password');
      }
      if (response?.error?.message) {
        setPasswordError('Failed to change password');
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: response?.error?.message,
          }),
        );
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'An error occurred while changing password',
        }),
      );
      setPasswordError('An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize states from localStorage
  useEffect(() => {
    const storedCompactMenu = localStorage.getItem('compactMenu');
    if (storedCompactMenu !== null && !isSidebarFixed) {
      setCompactMenu(storedCompactMenu === 'true');
    }
  }, [isSidebarFixed]);

  // Persist isSidebarFixed to localStorage
  useEffect(() => {
    localStorage.setItem('isSidebarFixed', isSidebarFixed.toString());
  }, [isSidebarFixed]);

  // Modified useEffect to fetch company details
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      const currentDesignation = parsedUserData.designation;
      const currentRole = parsedUserData.role;

      if (parsedUserData?.companyId) {
        const fetchCompanyDetails = async () => {
          try {
            const companyDetails = await getCompanyDetails(
              parsedUserData.companyId,
            );
            if (companyDetails?.data) {
              if (currentDesignation === Role.ADMIN) {
                localStorage.setItem(
                  'companyName',
                  companyDetails.data[0].full_name,
                );
              }
              if (companyDetails.data[0]?.allowpayassist) {
                localStorage.setItem(
                  'allowPayAssist',
                  companyDetails.data[0].allowpayassist.toString(),
                );
              }
              if (companyDetails.data[0]?.allowtatapay) {
                localStorage.setItem(
                  'allowTataPay',
                  companyDetails.data[0].allowtatapay.toString(),
                );
              }
              if (companyDetails.data[0]?.allow_clickrr) {
                localStorage.setItem(
                  'allowClickrr',
                  companyDetails.data[0].allow_clickrr.toString(),
                );
              } 
            } 
          } catch {
            // Handle error silently
          }
        };
        if ([Role.ADMIN, Role.VENDOR, Role.SUB_VENDOR ,Role.VENDOR_ADMIN].includes(currentRole || '')) {
          fetchCompanyDetails();
        }
      }
    }
  }, []);

  const toggleSidebarMode = (event: React.MouseEvent) => {
    event.preventDefault();
    const newFixedState = !isSidebarFixed;
    setIsSidebarFixed(newFixedState);
    if (!newFixedState) {
      const storedCompactMenu = localStorage.getItem('compactMenu');
      setCompactMenu(storedCompactMenu === 'true' || window.innerWidth <= 1600);
    }
  };

  const compactLayout = () => {
    if (!isSidebarFixed) {
      if (window.innerWidth <= 1600) {
        setCompactMenu(true);
      } else {
        const storedCompactMenu = localStorage.getItem('compactMenu');
        setCompactMenu(storedCompactMenu === 'true');
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Determine if sidebar is expanded (hover only works when NOT fixed)
  const isSidebarExpanded =
    isSidebarFixed ||
    (!compactMenu && !isSidebarFixed) ||
    (isSidebarHovered && !isSidebarFixed && compactMenu);

  //sidebar scrollable due to increased height which isoccuring due to  in-build placeholder component in simplebar imported from simplebar
  useEffect(() => {
    const observer = new MutationObserver(() => {
      //MutationObserver is a built-in JavaScript API that lets you watch for changes in the DOM
      const placeholder = document.querySelector('.simplebar-placeholder');
      //It’s useful when DOM elements are inserted dynamically after page load, like in your case with .simplebar-placeholder
      if (placeholder) {
        placeholder.remove();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      //Watch the entire DOM tree, and if any elements are added or removed anywhere inside, call the mutation callback
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let simpleBarInstance: SimpleBar | null = null;
    if (scrollableRef.current) {
      simpleBarInstance = new SimpleBar(scrollableRef.current);
    }

    setFormattedMenu(sideMenu());
    compactLayout();

    const debouncedCompactLayout = debounce(compactLayout, 100);
    window.addEventListener('resize', debouncedCompactLayout);

    return () => {
      window.removeEventListener('resize', debouncedCompactLayout);
      if (simpleBarInstance) {
        simpleBarInstance.unMount();
      }
    };
  }, [sideMenuStore, location, isSidebarFixed]);

  const HandleLogOut = useCallback(async () => {
    dispatch(onload({ load: true }));
    dispatch(clearError());
    const session_id = localStorage.getItem('userSession');
    if (!session_id) {
      dispatch(
        loginFailure({
          error: {
            message: 'Session ID is missing',
            name: 'Error',
            statusCode: 400,
          },
        }),
      );
      return;
    }
    const logOutUserInfo = await logOutUser({ session_id });
    if (logOutUserInfo) {
      // Trigger cross-tab logout before local logout
      triggerCrossTabLogout('User initiated logout');

      dispatch(logout());
      dispatch(setActiveTab(0));
      setToken(null);
      navigate('/');
    } else {
      dispatch(
        loginFailure({
          error: {
            message: 'An error occurred',
            name: 'Error',
            statusCode: 500,
          },
        }),
      );
    }
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        document.body.scrollTop > 0 ||
        document.documentElement.scrollTop > 0
      ) {
        setTopBarActive(true);
      } else {
        setTopBarActive(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  // background click functionality
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const dropdown = document.querySelector('.dropdown');
      const button = document.querySelector('.profile-button');
      const modalContent = document.querySelector(
        '.verification-modal-content',
      );
      if (
        isOpen &&
        dropdown &&
        button &&
        !dropdown.contains(event.target as Node) &&
        !button.contains(event.target as Node) &&
        !(
          verification &&
          modalContent &&
          modalContent.contains(event.target as Node)
        )
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, verification]);

  const handleVerification = async (passwordData: { password: string }) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      const response = await verifyPassword(passwordData.password);
      setVerified(response);
      toggleBlur(event as unknown as React.MouseEvent);
      setVerification(false);
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={clsx([
          'echo group relative min-h-screen',
          // Dynamic background based on dark mode
          darkMode 
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
            : 'bg-gradient-to-br from-slate-100 via-white to-slate-200',
          darkMode 
            ? "before:content-[''] before:h-[420px] before:w-screen before:bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.28),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.22),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.18),transparent_24%)] before:top-0 before:fixed before:left-0 before:right-0 before:pointer-events-none"
            : "before:content-[''] before:h-[420px] before:w-screen before:bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.08),transparent_24%)] before:top-0 before:fixed before:left-0 before:right-0 before:pointer-events-none",
          topBarActive && 'background--hidden',
        ])}
      >
        {/* Enhanced Navbar */}
        <div
          className={clsx([
            'navbar fixed top-0 left-0 right-0 z-40 h-16',
            darkMode 
              ? 'bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-slate-900/80'
              : 'bg-gradient-to-r from-white/90 via-slate-50/80 to-white/90',
            darkMode ? 'border-b border-white/10' : 'border-b border-slate-200/60',
            darkMode 
              ? 'shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
              : 'shadow-[0_4px_30px_rgba(0,0,0,0.08)]',
            'backdrop-blur-xl',
            'flex items-center justify-between px-4 sm:px-6',
            'transition-all duration-300',
            topBarActive && darkMode && 'shadow-[0_4px_40px_rgba(79,70,229,0.15)]',
            topBarActive && !darkMode && 'shadow-[0_4px_40px_rgba(79,70,229,0.08)]',
          ])}
        >
          {/* Decorative gradient line at top */}
          <div className={clsx([
            'absolute top-0 left-0 right-0 h-[2px]',
            darkMode 
              ? 'bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent'
              : 'bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent',
          ])} />
          
          {/* Subtle animated glow */}
          <div className={clsx([
            'absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none',
            darkMode 
              ? 'bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-emerald-500/5'
              : 'bg-gradient-to-r from-indigo-500/3 via-cyan-500/3 to-emerald-500/3',
          ])} />

          <div className="navbar-left flex items-center space-x-4 relative z-10">
            {/* Enhanced Logo */}
            <div className="logo-container group/logo relative">
              <div className={clsx([
                'logo w-11 h-11 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500',
                'shadow-lg shadow-indigo-500/40',
                'transition-all duration-300',
                'group-hover/logo:shadow-xl group-hover/logo:shadow-indigo-500/50',
                'group-hover/logo:scale-105',
                'relative overflow-hidden',
              ])}>
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-700" />
                <span className="text-white font-bold text-lg relative z-10">TP</span>
              </div>
              {/* Glow ring on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover/logo:opacity-30 blur-md transition-opacity duration-300" />
            </div>
            
            {/* Brand name with gradient */}
            <div className="brand-name hidden sm:block">
              <span className={clsx([
                'text-xl font-bold',
                darkMode 
                  ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-slate-800 via-indigo-600 to-cyan-600 bg-clip-text text-transparent',
                'drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]',
              ])}>
                TrustPay
              </span>
              <span className={clsx([
                'block text-[10px] font-medium tracking-widest uppercase -mt-1',
                darkMode ? 'text-white/40' : 'text-slate-500',
              ])}>
                Vendor Portal
              </span>
            </div>

            {/* Divider */}
            <div className={clsx([
              'hidden md:block w-px h-8 mx-2',
              darkMode 
                ? 'bg-gradient-to-b from-transparent via-white/20 to-transparent'
                : 'bg-gradient-to-b from-transparent via-slate-300 to-transparent',
            ])} />

            {/* Enhanced Toggle Button - Now acts as Pin/Unpin */}
            <button
              className={clsx([
                'toggle-sidebar-btn p-2.5 rounded-xl',
                darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
                darkMode ? 'border border-white/10 hover:border-white/20' : 'border border-slate-200 hover:border-slate-300',
                darkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-800',
                'transition-all duration-200',
                darkMode ? 'hover:shadow-lg hover:shadow-indigo-500/10' : 'hover:shadow-lg hover:shadow-slate-300/50',
                'group/toggle',
                // Highlight when pinned
                isSidebarFixed && darkMode && 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300',
                isSidebarFixed && !darkMode && 'bg-indigo-100 border-indigo-300 text-indigo-600',
              ])}
              onClick={(event) => {
                event.preventDefault();
                toggleSidebarMode(event);
              }}
              title={
                isSidebarFixed
                  ? 'Unpin sidebar (enable hover)'
                  : 'Pin sidebar (disable hover)'
              }
            >
              <Lucide
                icon={isSidebarFixed ? 'Pin' : 'PinOff'}
                className={clsx([
                  'w-5 h-5 transition-transform duration-200 group-hover/toggle:scale-110',
                  isSidebarFixed && darkMode && 'text-indigo-300',
                  isSidebarFixed && !darkMode && 'text-indigo-600',
                ])}
              />
            </button>
          </div>

          {/* ...existing navbar center section (commented)... */}

          <div className="navbar-right flex items-center space-x-2 sm:space-x-3 relative z-10">
            {/* Fullscreen Button */}
            <button
              className={clsx([
                'fullscreen-btn p-2.5 rounded-xl',
                darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
                darkMode ? 'border border-white/10 hover:border-white/20' : 'border border-slate-200 hover:border-slate-300',
                darkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-800',
                'transition-all duration-200',
                darkMode ? 'hover:shadow-lg hover:shadow-indigo-500/10' : 'hover:shadow-lg hover:shadow-slate-300/50',
                'group/fs',
              ])}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Lucide
                icon={isFullscreen ? 'Minimize' : 'Maximize'}
                className="w-5 h-5 transition-transform duration-200 group-hover/fs:scale-110"
              />
            </button>

            {/* Divider */}
            <div className={clsx([
              'hidden sm:block w-px h-8 mx-1',
              darkMode 
                ? 'bg-gradient-to-b from-transparent via-white/20 to-transparent'
                : 'bg-gradient-to-b from-transparent via-slate-300 to-transparent',
            ])} />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className={clsx([
                  'profile-btn flex items-center gap-3 p-1.5 pr-3 rounded-xl',
                  darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
                  darkMode ? 'border border-white/10 hover:border-white/20' : 'border border-slate-200 hover:border-slate-300',
                  'transition-all duration-200',
                  darkMode ? 'hover:shadow-lg hover:shadow-indigo-500/10' : 'hover:shadow-lg hover:shadow-slate-300/50',
                  'group/profile',
                  isOpen && darkMode && 'bg-white/10 border-white/20',
                  isOpen && !darkMode && 'bg-slate-200 border-slate-300',
                ])}
                onClick={toggleDropdown}
              >
                {/* Avatar with status */}
                <div className="relative">
                  <div className={clsx([
                    'w-9 h-9 rounded-lg overflow-hidden',
                    darkMode 
                      ? 'ring-2 ring-white/20 group-hover/profile:ring-indigo-400/50'
                      : 'ring-2 ring-slate-200 group-hover/profile:ring-indigo-400/50',
                    'transition-all duration-200',
                  ])}>
                    <img
                      src={users || 'https://via.placeholder.com/40'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online status */}
                  <span className={clsx([
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3',
                    'bg-emerald-500 rounded-full',
                    darkMode ? 'border-2 border-slate-900' : 'border-2 border-white',
                    'shadow-lg shadow-emerald-500/50',
                  ])} />
                </div>
                
                {/* User info - hidden on small screens */}
                <div className="hidden sm:block text-left">
                  <p className={clsx([
                    'text-sm font-medium transition-colors',
                    darkMode 
                      ? 'text-white/90 group-hover/profile:text-white'
                      : 'text-slate-700 group-hover/profile:text-slate-900',
                  ])}>
                    {userData.name?.split(' ')[0] || 'User'}
                  </p>
                  <p className={clsx([
                    'text-[10px] transition-colors',
                    darkMode 
                      ? 'text-white/50 group-hover/profile:text-white/60'
                      : 'text-slate-500 group-hover/profile:text-slate-600',
                  ])}>
                    {userData.designation || 'N/A'}
                  </p>
                </div>
                
                <Lucide
                  icon="ChevronDown"
                  className={clsx([
                    'w-4 h-4 transition-transform duration-200',
                    'hidden sm:block',
                    darkMode ? 'text-white/50' : 'text-slate-400',
                    isOpen && 'rotate-180',
                  ])}
                />
              </button>

              {/* Enhanced Dropdown Menu */}
              {isOpen && (
                <div className={clsx([
                  'dropdown-menu absolute right-0 mt-2 w-64',
                  darkMode 
                    ? 'bg-gradient-to-b from-slate-800/95 to-slate-900/95'
                    : 'bg-gradient-to-b from-white to-slate-50',
                  darkMode ? 'text-white' : 'text-slate-800',
                  'rounded-2xl',
                  darkMode ? 'shadow-2xl shadow-black/50' : 'shadow-2xl shadow-slate-300/50',
                  darkMode ? 'border border-white/10' : 'border border-slate-200',
                  'backdrop-blur-xl',
                  'overflow-hidden',
                  'animate-in fade-in slide-in-from-top-2 duration-200',
                ])}>
                  {/* User header */}
                  <div className={clsx([
                    'px-4 py-4',
                    darkMode 
                      ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10'
                      : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-cyan-50',
                  ])}>
                    <div className="flex items-center gap-3">
                      <div className={clsx([
                        'w-12 h-12 rounded-xl overflow-hidden',
                        darkMode ? 'ring-2 ring-white/20' : 'ring-2 ring-slate-200',
                      ])}>
                        <img
                          src={users || 'https://via.placeholder.com/48'}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className={clsx([
                          'text-sm font-semibold',
                          darkMode ? 'text-white' : 'text-slate-800',
                        ])}>{userData.name}</p>
                        <p className={clsx([
                          'text-xs',
                          darkMode ? 'text-white/60' : 'text-slate-500',
                        ])}>{userData.designation}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-500/20 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                          <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {/* Change Password */}
                    <button
                      className={clsx([
                        'dropdown-item flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl',
                        darkMode 
                          ? 'text-white/70 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100',
                        'transition-all duration-200',
                        'group/item',
                      ])}
                      onClick={() => {
                        setShowChangePasswordModal(true);
                        setIsOpen(false);
                      }}
                    >
                      <div className={clsx([
                        'p-2 rounded-lg transition-colors',
                        darkMode 
                          ? 'bg-white/5 group-hover/item:bg-amber-500/20'
                          : 'bg-slate-100 group-hover/item:bg-amber-100',
                      ])}>
                        <Lucide icon="Lock" className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Change Password</span>
                        <span className={clsx([
                          'block text-[10px]',
                          darkMode ? 'text-white/40' : 'text-slate-400',
                        ])}>Update your password</span>
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className={clsx([
                    'mx-3 h-px',
                    darkMode 
                      ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent',
                  ])} />

                  {/* Logout */}
                  <div className="p-2">
                    <button
                      className={clsx([
                        'dropdown-item flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl',
                        'text-rose-400 hover:text-rose-300',
                        darkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50',
                        'transition-all duration-200',
                        'group/item',
                      ])}
                      onClick={() => {
                        HandleLogOut();
                        setIsOpen(false);
                      }}
                    >
                      <div className={clsx([
                        'p-2 rounded-lg transition-colors',
                        darkMode 
                          ? 'bg-rose-500/10 group-hover/item:bg-rose-500/20'
                          : 'bg-rose-50 group-hover/item:bg-rose-100',
                      ])}>
                        <Lucide icon="LogOut" className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Logout</span>
                        <span className="block text-[10px] text-rose-400/60">Sign out of your account</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={clsx([
            'sidebar-container fixed top-16 left-0 z-30 h-[calc(100%-4rem)]',
            darkMode 
              ? 'bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95'
              : 'bg-gradient-to-b from-white/95 via-slate-50/90 to-white/95',
            darkMode ? 'text-white' : 'text-slate-800',
            'shadow-2xl backdrop-blur-xl',
            darkMode ? 'border-r border-white/10' : 'border-r border-slate-200/60',
            isSidebarExpanded ? 'w-72' : 'w-20',
            'transition-all duration-300 ease-in-out overflow-hidden',
            darkMode 
              ? 'hover:shadow-[0_0_40px_rgba(79,70,229,0.15)]'
              : 'hover:shadow-[0_0_40px_rgba(79,70,229,0.08)]',
            // Show pin indicator when fixed
            isSidebarFixed && darkMode && 'border-r-indigo-500/30',
            isSidebarFixed && !darkMode && 'border-r-indigo-300/50',
          ])}
          onMouseEnter={() => {
            if (!isSidebarFixed && compactMenu) {
              setIsSidebarHovered(true);
            }
          }}
          onMouseLeave={() => {
            if (!isSidebarFixed) {
              setIsSidebarHovered(false);
            }
          }}
        >
          {/* Decorative gradient overlay */}
          <div className={clsx([
            'absolute inset-0 pointer-events-none',
            darkMode 
              ? 'bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5'
              : 'bg-gradient-to-br from-indigo-500/3 via-transparent to-cyan-500/3',
          ])} />

          {/* Animated border glow on hover */}
          <div
            className={clsx([
              'absolute top-0 right-0 w-[2px] h-full',
              'bg-gradient-to-b from-indigo-500/50 via-cyan-500/50 to-emerald-500/50',
              'opacity-0 transition-opacity duration-300',
              isSidebarHovered && !isSidebarFixed && 'opacity-100',
            ])}
          />

          <div className="sidebar-menu mt-4 h-full relative z-10">
            <ul className="menu-list space-y-1 px-3">
              {formattedMenu.map((menu, index) =>
                typeof menu === 'string' ? (
                  <li
                    key={index}
                    className={clsx([
                      'menu-divider text-[10px] font-semibold px-3 py-2 uppercase tracking-widest',
                      darkMode ? 'text-white/40' : 'text-slate-400',
                      'transition-all duration-300',
                      !isSidebarExpanded && 'opacity-0 h-0 py-0 overflow-hidden',
                    ])}
                  >
                    {menu}
                  </li>
                ) : (
                  <li key={index} className="group/item relative">
                    <a
                      href=""
                      className={clsx([
                        'menu-item flex items-center px-3 py-3 rounded-xl transition-all duration-200',
                        darkMode 
                          ? 'hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5'
                          : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50',
                        darkMode 
                          ? 'hover:shadow-lg hover:shadow-indigo-500/10'
                          : 'hover:shadow-lg hover:shadow-slate-300/30',
                        'hover:translate-x-1',
                        darkMode 
                          ? 'border border-transparent hover:border-white/10'
                          : 'border border-transparent hover:border-slate-200',
                        menu.active && darkMode && [
                          'bg-gradient-to-r from-indigo-500/20 via-cyan-500/15 to-emerald-500/10',
                          'shadow-lg shadow-indigo-500/20',
                          'border-l-2 border-l-indigo-400',
                        ],
                        menu.active && !darkMode && [
                          'bg-gradient-to-r from-indigo-100 via-cyan-50 to-emerald-50',
                          'shadow-lg shadow-indigo-200/50',
                          'border-l-2 border-l-indigo-500',
                        ],
                      ])}
                      onClick={(event) => {
                        event.preventDefault();
                        linkTo(menu, navigate);
                      }}
                    >
                      <div className={clsx([
                        'menu-icon-wrapper flex items-center justify-center w-10 h-10 rounded-lg',
                        'transition-all duration-200',
                        darkMode 
                          ? 'bg-gradient-to-br from-white/5 to-transparent'
                          : 'bg-gradient-to-br from-slate-100 to-transparent',
                        menu.active && darkMode && 'from-indigo-500/30 to-cyan-500/20 shadow-lg shadow-indigo-500/20',
                        menu.active && !darkMode && 'from-indigo-200 to-cyan-100 shadow-lg shadow-indigo-200/50',
                        darkMode 
                          ? 'group-hover/item:from-white/10 group-hover/item:to-white/5'
                          : 'group-hover/item:from-slate-200 group-hover/item:to-slate-100',
                        'group-hover/item:shadow-md',
                      ])}>
                        <Lucide
                          icon={menu.icon || 'Circle'}
                          className={clsx([
                            'w-5 h-5 transition-all duration-200',
                            menu.active && darkMode && 'text-indigo-300',
                            menu.active && !darkMode && 'text-indigo-600',
                            !menu.active && darkMode && 'text-white/70',
                            !menu.active && !darkMode && 'text-slate-500',
                            darkMode 
                              ? 'group-hover/item:text-white group-hover/item:scale-110'
                              : 'group-hover/item:text-slate-800 group-hover/item:scale-110',
                          ])}
                        />
                      </div>
                      
                      {/* Menu title with animation */}
                      <div className={clsx([
                        'flex-1 ml-3 overflow-hidden transition-all duration-300',
                        isSidebarExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0',
                      ])}>
                        <span className={clsx([
                          'menu-title text-sm font-medium whitespace-nowrap',
                          menu.active && darkMode && 'text-white',
                          menu.active && !darkMode && 'text-slate-800',
                          !menu.active && darkMode && 'text-white/80',
                          !menu.active && !darkMode && 'text-slate-600',
                          darkMode ? 'group-hover/item:text-white' : 'group-hover/item:text-slate-800',
                        ])}>
                          {menu.title}
                        </span>
                      </div>

                      {/* Arrow for submenu */}
                      {menu.subMenu && isSidebarExpanded && (
                        <Lucide
                          icon={menu.activeDropdown ? 'ChevronDown' : 'ChevronRight'}
                          className={clsx([
                            'w-4 h-4 transition-transform duration-200',
                            darkMode ? 'text-white/50' : 'text-slate-400',
                            menu.activeDropdown && 'rotate-0',
                          ])}
                        />
                      )}
                    </a>

                    {/* Tooltip for collapsed state */}
                    {!isSidebarExpanded && (
                      <div className={clsx([
                        'absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2',
                        darkMode 
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-800',
                        'text-sm rounded-lg shadow-xl',
                        'opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible',
                        'transition-all duration-200 whitespace-nowrap z-50',
                        darkMode ? 'border border-white/10' : 'border border-slate-200',
                      ])}>
                        {menu.title}
                        {/* Tooltip arrow */}
                        <div className={clsx([
                          'absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45',
                          darkMode 
                            ? 'bg-slate-800 border-l border-b border-white/10'
                            : 'bg-white border-l border-b border-slate-200',
                        ])} />
                      </div>
                    )}

                    {/* Submenu */}
                    {menu.subMenu && menu.activeDropdown && isSidebarExpanded && (
                      <ul className={clsx([
                        'submenu-list ml-4 mt-1 space-y-1 pl-4',
                        darkMode ? 'border-l border-white/10' : 'border-l border-slate-200',
                        'animate-in slide-in-from-top-2 duration-200',
                      ])}>
                        {menu.subMenu.map((subMenu, subIndex) => (
                          <li key={subIndex} className="group/subitem">
                            <a
                              href=""
                              className={clsx([
                                'submenu-item flex items-center px-3 py-2 rounded-lg transition-all duration-200',
                                darkMode 
                                  ? 'hover:bg-white/5 hover:translate-x-1'
                                  : 'hover:bg-slate-100 hover:translate-x-1',
                                subMenu.active && darkMode && 'bg-white/10 text-white',
                                subMenu.active && !darkMode && 'bg-slate-100 text-slate-800',
                                !subMenu.active && darkMode && 'text-white/60',
                                !subMenu.active && !darkMode && 'text-slate-500',
                              ])}
                              onClick={(event) => {
                                event.preventDefault();
                                linkTo(subMenu, navigate);
                              }}
                            >
                              <div className={clsx([
                                'w-1.5 h-1.5 rounded-full mr-3 transition-all duration-200',
                                subMenu.active 
                                  ? 'bg-indigo-400 shadow-lg shadow-indigo-400/50'
                                  : darkMode ? 'bg-white/30' : 'bg-slate-300',
                                'group-hover/subitem:bg-indigo-400',
                              ])} />
                              <span className={clsx([
                                'submenu-title text-sm transition-colors duration-200',
                                darkMode 
                                  ? 'group-hover/subitem:text-white'
                                  : 'group-hover/subitem:text-slate-800',
                              ])}>
                                {subMenu.title}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Sidebar footer decoration */}
          <div className={clsx([
            'absolute bottom-0 left-0 right-0 h-20 pointer-events-none',
            darkMode 
              ? 'bg-gradient-to-t from-slate-900/80 to-transparent'
              : 'bg-gradient-to-t from-white/80 to-transparent',
          ])} />
        </div>
        <div
          className={clsx([
            'transition-[margin,width] duration-300 xl:pl-3.5 pt-[54px] pb-16 relative z-10 group mode',
            { 'xl:ml-[275px]': !compactMenu || isSidebarFixed },
            { 'xl:ml-[91px]': compactMenu && !isSidebarFixed },
            { 'mode--light': !topBarActive },
          ])}
        >
          <div className="px-2 mt-16 w-full">
            <div className="max-w-full 2xl:max-w-[1920px] mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
        <Modal
          handleModal={() => setShowChangePasswordModal(false)}
          forOpen={showChangePasswordModal}
          title=""
        >
          <DynamicForm
            sections={ChangePasswordFormFields}
            onSubmit={handleChangePassword}
            defaultValues={{
              password: '',
              newPassword: '',
              confirmPassword: '',
            }}
            isEditMode={false}
            handleCancel={() => setShowChangePasswordModal(false)}
            isLoading={isLoading}
          />
          {passwordError && (
            <div className="text-danger text-sm mt-2">{passwordError}</div>
          )}
        </Modal>
        {/* added ref for backgroundclick handling in evrification modal */}
        <div
          className="verification-modal"
          ref={verificationModalRef}
          style={{ zIndex: 200 }}
        >
          <Modal
            handleModal={() => setVerification(false)}
            forOpen={verification}
          >
            <div
              className="verification-modal-content"
              onClick={(event) => event.stopPropagation()}
            >
              <DynamicForm
                sections={VerificationformFields(showPassword)}
                onSubmit={handleVerification}
                defaultValues={formData || {}}
                isEditMode={formData ? true : false}
                handleCancel={() => setVerification(false)}
                isLoading={isLoading}
              />
              {errorMessage && (
                <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
}

export default Main;
