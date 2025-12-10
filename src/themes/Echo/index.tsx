/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import '@/assets/css/vendors/simplebar.css';
import '@/assets/css/themes/echo.css';
import { Transition } from 'react-transition-group';
import Breadcrumb from '@/components/Base/Breadcrumb';
import { useState, useEffect, createRef, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { setActiveMenuWithReset } from '@/redux-toolkit/slices/common/sideMenu/sideMenuSlice';
import { selectSideMenu } from '@/redux-toolkit/slices/common/sideMenu/sideMenuSelectors';
import { setCompactMenu as setCompactMenuStore } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSlice';
import { selectCompactMenu } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSelectors';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { FormattedMenu, linkTo, nestedMenu, enter, leave } from './side-menu';
import Lucide from '@/components/Base/Lucide';
import users from '@/assets/images/users/users.svg';
import clsx from 'clsx';
import SimpleBar from 'simplebar';
import Tippy from '@/components/Base/Tippy';
import { getBuildInfo } from '@/utils/buildInfo';
import SwitchAccount from '@/components/SwitchAccount';
import NotificationsPanel from '@/components/NotificationsPanel';
import ActivitiesPanel from '@/components/ActivitiesPanel';
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
import { getAllMerchants } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { triggerCrossTabLogout } from '@/utils/crossTabAuthSync';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
// import { setIsSocketHit } from '@/redux-toolkit/slices/notification/notificationSlice';
// import { getNotificationsCount } from '@/redux-toolkit/slices/notification/notificationAPI';
// import {
//   // selectNotificationsCount,
//   // selectIsSocketHit,
// } from '@/redux-toolkit/slices/notification/notificationSelector';
import { getUsersById } from '@/redux-toolkit/slices/user/userAPI';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utility to build breadcrumb path from active menu
const buildBreadcrumbPath = (menuItems: Array<FormattedMenu | string>) => {
  const path: { title: string; to: string; active: boolean }[] = [];

  // Always start with Dashboard as the root
  path.push({ title: 'Home', to: '/auth/dashboard', active: false });

  const findActiveMenu = (
    items: Array<FormattedMenu | string>,
    currentPath: string[] = [],
  ) => {
    for (const item of items) {
      if (typeof item === 'string') continue;

      if (item.active) {
        path.push({
          title: item.title,
          to: item.pathname || currentPath.join('/'),
          active: true,
        });
        return true;
      }

      if (item.subMenu && item.activeDropdown) {
        const found = findActiveMenu(item.subMenu, [
          ...currentPath,
          item.pathname || '',
        ]);
        if (found) {
          if (!path.some((p) => p.title === item.title)) {
            path.splice(path.length - 1, 0, {
              title: item.title,
              to: item.pathname || currentPath.join('/'),
              active: false,
            });
          }
          return true;
        }
      }
    }
    return false;
  };

  findActiveMenu(menuItems);
  return path.length > 1
    ? path
    : [{ title: 'Dashboard', to: '/auth/dashboard', active: true }];
};

function Main() {
  const dispatch = useAppDispatch();
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
  const [switchAccount, setSwitchAccount] = useState(false);
  const [notificationsPanel, setNotificationsPanel] = useState(false);
  const [activitiesPanel, setActivitiesPanel] = useState(false);
  const [compactMenuOnHover, setCompactMenuOnHover] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(false);
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
  const [apiKey, setApiKey] = useState('your-api-key');
  const [isBlurred, setIsBlurred] = useState(true);
  const pagination = useAppSelector(getPaginationData);
  const [verification, setVerification] = useState(false);
  const [, setVerified] = useState(false);
  const [showPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData] = useState<FormData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const verificationModalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [uniqueId, setUniqueId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleBlur = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isBlurred) {
      if (userData?.designation === Role.ADMIN) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData?.designation === Role.ADMIN) {
          const userInfo = await getUsersById(userData?.userId);
          if (userInfo[0]) {
            setUniqueId(userInfo?.[0]?.config?.unique_admin_id || '');
          }
        }
      }
      if (userData?.designation === Role.MERCHANT) {
        const queryString = new URLSearchParams({
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 10).toString(),
        }).toString();
        const response = await getAllMerchants(queryString);
        setApiKey(response?.merchants[0].config?.keys?.private || '');
      }
    } else {
      setApiKey('your-api-key');
    }
    setIsBlurred(!isBlurred);
  };

  // const displayNotificationCount = useCallback(
  //   debounce(async () => {
  //     try {
  //       const count = await getNotificationsCount();
  //       dispatch(setNotificationsCount(count));
  //       dispatch(setIsSocketHit(false));
  //     } catch (error) {
  //       console.error('Failed to fetch notifications count', error);
  //     }
  //   }, 500),
  //   [dispatch],
  // );
  // useEffect(() => {
  // displayNotificationCount();
  //   if (isRefreshCount) {
  //     dispatch(setIsSocketHit(false));
  //   }
  // }, [isRefreshCount, dispatch]);

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

  //background click
  const handleBackgroundClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (activeMobileMenu) {
      setActiveMobileMenu(false);
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

  useEffect(() => {
    const storedCompanyName = localStorage.getItem('companyName');
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }
  }, []);

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
                setCompanyName(companyDetails.data[0].full_name);
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

  //useEffect to change inbuilt height of simplebar by removing simplerbar-placeholder
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

  // Determine if sidebar is expanded
  const isSidebarExpanded =
    isSidebarFixed || !compactMenu || (compactMenu && compactMenuOnHover);

  // Build dynamic breadcrumb path
  const breadcrumbPath = buildBreadcrumbPath(formattedMenu);

  const handleVerificationClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setVerification(true);
  };

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
          'echo group bg-stone-50 background relative min-h-screen dark:bg-darkmode-900',
          "before:content-[''] before:h-[200px] before:w-screen before:bg-gradient-to-b before:from-slate-900/[0.01] before:to-transparent [&.background--hidden]:before:opacity-0 before:transition-all before:ease-in-out before:duration-300 before:top-0 before:fixed before:pointer-events-none",
          "after:content-[''] after:h-[200px] after:w-screen [&.background--hidden]:after:opacity-0 after:transition-all after:ease-in-out after:duration-300 after:top-0 after:fixed after:bg-texture-white after:bg-contain after:bg-fixed after:bg-[center_-13rem] after:bg-no-repeat after:pointer-events-none",
          topBarActive && 'background--hidden',
        ])}
      >
        <div
          className={clsx([
            'xl:ml-0 shadow-xl transition-[margin,padding] duration-300 xl:shadow-none fixed top-0 left-0 z-50 side-menu group inset-y-0 xl:py-3.5 xl:pl-3.5',
            "after:content-[''] after:fixed after:inset-0 after:bg-black/80 after:xl:hidden",
            { 'side-menu--collapsed': compactMenu && !isSidebarFixed },
            { 'side-menu--on-hover': compactMenuOnHover && !isSidebarFixed },
            { 'ml-0 after:block': activeMobileMenu },
            { '-ml-[275px] after:hidden': !activeMobileMenu },
          ])}
          onClick={(event) => {
            if ((event.target as HTMLElement).classList.contains('side-menu')) {
              handleBackgroundClick(event);
            }
          }}
        >
          <div
            className={clsx([
              'h-full box bg-white/[0.95] rounded-none xl:rounded-xl z-20 relative w-[275px] duration-300 transition-[width]',
              !isSidebarFixed &&
                'group-[.side-menu--collapsed]:xl:w-[91px] group-[.side-menu--collapsed.side-menu--on-hover]:xl:w-[275px]',
              'flex flex-col',
            ])}
            onMouseOver={(event) => {
              if (!isSidebarFixed) {
                event.preventDefault();
                setCompactMenuOnHover(true);
              }
            }}
            onMouseLeave={(event) => {
              if (!isSidebarFixed) {
                event.preventDefault();
                setCompactMenuOnHover(false);
              }
            }}
          >
            <div
              className={clsx([
                'flex-none hidden xl:flex items-center z-10 px-5 h-[65px] w-[275px] relative duration-300',
                !isSidebarFixed &&
                  'group-[.side-menu--collapsed]:xl:w-[91px] group-[.side-menu--collapsed.side-menu--on-hover]:xl:w-[275px]',
              ])}
            >
              <Tippy content={getBuildInfo()}>
                <a
                  href="/auth/dashboard"
                  className="flex items-center transition-[margin] duration-300 group-[.side-menu--collapsed]:xl:ml-2 group-[.side-menu--collapsed.side-menu--on-hover]:xl:ml-0"
                >
                  <div className="flex items-center justify-center w-[46px] h-[34px] rounded-lg bg-gradient-to-b from-theme-1 to-theme-2/80 transition-transform ease-in-out group-[.side-menu--collapsed.side-menu--on-hover]:xl:-rotate-180 group-[.side-menu--collapsed.side-menu--on-hover]:xl:scale-x-[0.8]">
                    <div className="w-[16px] h-[16px] relative -rotate-45">
                      <div className="absolute w-[3.36px] h-[12px] left-0 top-[2px] bg-white rounded-full opacity-50"></div>
                      <div className="absolute w-[3.36px] h-[19.2px] left-[6.32px] top-[-1.6px] bg-white rounded-full"></div>
                      <div className="absolute w-[3.36px] h-[12px] right-0 top-[2px] bg-white rounded-full opacity-50"></div>
                    </div>
                  </div>
                  <div
                    className={clsx([
                      'ml-3.5 font-medium',
                      !isSidebarFixed &&
                        'group-[.side-menu--collapsed]:xl:opacity-0 group-[.side-menu--collapsed.side-menu--on-hover]:xl:opacity-100 transition-opacity duration-300',
                    ])}
                  >
                    {companyName || 'Payment gateway'}
                  </div>
                </a>
              </Tippy>
              <a
                href=""
                onClick={toggleSidebarMode}
                className={clsx(
                  [
                    'flex items-center justify-center w-[20px] h-[20px] border rounded-full border-slate-600/40 hover:bg-slate-600/5 dark:border-darkmode-100',
                    !isSidebarFixed &&
                      'group-[.side-menu--collapsed]:xl:ml-0 group-[.side-menu--collapsed.side-menu--on-hover]:xl:ml-auto',
                    isSidebarFixed
                      ? 'ml-auto rotate-0'
                      : 'group-[.side-menu--collapsed]:xl:rotate-180 rotate-on-hover',
                    'transition-transform duration-300',
                  ],
                  { hidden: !compactMenuOnHover },
                )}
                title={
                  isSidebarFixed
                    ? 'Switch to collapsible sidebar'
                    : 'Fix sidebar'
                }
                role="button"
                aria-label={
                  isSidebarFixed
                    ? 'Switch to collapsible sidebar'
                    : 'Fix sidebar'
                }
              >
                <Lucide
                  icon={compactMenu ? 'ArrowLeft' : 'ArrowRight'}
                  className="w-3.5 h-3.5 stroke-[1.3]"
                />
              </a>
            </div>
            <div
              ref={scrollableRef}
              className={clsx([
                'w-full h-full z-20 px-5 overflow-y-auto overflow-x-hidden pb-3',
                '[&_.simplebar-content]:p-0 [&_.simplebar-track.simplebar-vertical]:w-[10px] [&_.simplebar-track.simplebar-vertical]:mr-0.5 [&_.simplebar-track.simplebar-vertical_.simplebar-scrollbar]:before:bg-slate-400/30',
              ])}
            >
              <ul className="scrollable">
                {formattedMenu.length > 0 ? (
                  formattedMenu.map((menu, menuKey) =>
                    typeof menu === 'string' ? (
                      <li className="side-menu__divider" key={menuKey}>
                        {menu}
                      </li>
                    ) : (
                      <li key={menuKey}>
                        <a
                          href=""
                          className={clsx([
                            'side-menu__link flex items-center py-2 px-3 rounded-md',
                            {
                              'side-menu__link--active bg-gray-100':
                                menu.active,
                            },
                            {
                              'side-menu__link--active-dropdown':
                                menu.activeDropdown,
                            },
                          ])}
                          onClick={(event: React.MouseEvent) => {
                            event.preventDefault();
                            if (menu.pathname && !menu.subMenu) {
                              dispatch(setActiveMenuWithReset(menu.pathname)); // On change event: reset tabs and set active menu
                            }
                            linkTo(menu, navigate);
                            setFormattedMenu([...formattedMenu]);
                            setActiveMobileMenu(false);
                          }}
                        >
                          <Lucide
                            icon={menu.icon || 'Circle'}
                            className="side-menu__link__icon w-5 h-5 mr-2"
                          />
                          <div
                            className={clsx([
                              'side-menu__link__title truncate',
                              !isSidebarFixed &&
                                'group-[.side-menu--collapsed]:xl:hidden group-[.side-menu--collapsed.side-menu--on-hover]:xl:block',
                            ])}
                          >
                            {menu.title}
                          </div>
                          {menu.badge && (
                            <div className="side-menu__link__badge ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {menu.badge}
                            </div>
                          )}
                          {menu.subMenu && (
                            <Lucide
                              icon="ChevronDown"
                              className="side-menu__link__chevron w-4 h-4 ml-auto transition-transform duration-200"
                            />
                          )}
                        </a>
                        {menu.subMenu && (
                          <Transition
                            in={menu.activeDropdown}
                            onEnter={enter}
                            onExit={leave}
                            timeout={300}
                          >
                            <ul
                              className={clsx([
                                'pl-8',
                                { block: menu.activeDropdown },
                                { hidden: !menu.activeDropdown },
                              ])}
                            >
                              {menu.subMenu.map((subMenu, subMenuKey) => (
                                <li key={subMenuKey}>
                                  <a
                                    href=""
                                    className={clsx([
                                      'side-menu__link flex items-center py-1.5 px-2 rounded-md',
                                      {
                                        'side-menu__link--active bg-gray-100':
                                          subMenu.active,
                                      },
                                      {
                                        'side-menu__link--active-dropdown':
                                          subMenu.activeDropdown,
                                      },
                                    ])}
                                    onClick={(event: React.MouseEvent) => {
                                      event.preventDefault();
                                      if (
                                        subMenu.pathname &&
                                        !subMenu.subMenu
                                      ) {
                                        dispatch(
                                          setActiveMenuWithReset(
                                            subMenu.pathname,
                                          ),
                                        ); // On change event: reset tabs and set active menu
                                      }
                                      linkTo(subMenu, navigate);
                                      setFormattedMenu([...formattedMenu]);
                                    }}
                                  >
                                    <Lucide
                                      icon={subMenu.icon || 'Circle'}
                                      className="side-menu__link__icon w-4 h-4 mr-2"
                                    />
                                    <div
                                      className={clsx([
                                        'side-menu__link__title truncate',
                                        !isSidebarFixed &&
                                          'group-[.side-menu--collapsed]:xl:hidden group-[.side-menu--collapsed.side-menu--on-hover]:xl:block',
                                      ])}
                                    >
                                      {subMenu.title}
                                    </div>
                                    {subMenu.badge && (
                                      <div className="side-menu__link__badge ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {subMenu.badge}
                                      </div>
                                    )}
                                    {subMenu.subMenu && (
                                      <Lucide
                                        icon="ChevronDown"
                                        className="side-menu__link__chevron w-4 h-4 ml-auto transition-transform duration-200"
                                      />
                                    )}
                                  </a>
                                  {subMenu.subMenu && (
                                    <Transition
                                      in={subMenu.activeDropdown}
                                      onEnter={enter}
                                      onExit={leave}
                                      timeout={300}
                                    >
                                      <ul
                                        className={clsx([
                                          'pl-8',
                                          { block: subMenu.activeDropdown },
                                          { hidden: !subMenu.activeDropdown },
                                        ])}
                                      >
                                        {subMenu.subMenu.map(
                                          (lastSubMenu, lastSubMenuKey) => (
                                            <li key={lastSubMenuKey}>
                                              <a
                                                href=""
                                                className={clsx([
                                                  'side-menu__link flex items-center py-1.5 px-2 rounded-md',
                                                  {
                                                    'side-menu__link--active bg-gray-100':
                                                      lastSubMenu.active,
                                                  },
                                                  {
                                                    'side-menu__link--active-dropdown':
                                                      lastSubMenu.activeDropdown,
                                                  },
                                                ])}
                                                onClick={(
                                                  event: React.MouseEvent,
                                                ) => {
                                                  event.preventDefault();
                                                  if (
                                                    lastSubMenu.pathname &&
                                                    !lastSubMenu.subMenu
                                                  ) {
                                                    dispatch(
                                                      setActiveMenuWithReset(
                                                        lastSubMenu.pathname,
                                                      ),
                                                    ); // On change event: reset tabs and set active menu
                                                  }
                                                  linkTo(lastSubMenu, navigate);
                                                  setFormattedMenu([
                                                    ...formattedMenu,
                                                  ]);
                                                }}
                                              >
                                                <Lucide
                                                  icon={
                                                    lastSubMenu.icon || 'Circle'
                                                  }
                                                  className="side-menu__link__icon w-4 h-4 mr-2"
                                                />
                                                <div
                                                  className={clsx([
                                                    'side-menu__link__title truncate',
                                                    !isSidebarFixed &&
                                                      'group-[.side-menu--collapsed]:xl:hidden group-[.side-menu--collapsed.side-menu--on-hover]:xl:block',
                                                  ])}
                                                >
                                                  {lastSubMenu.title}
                                                </div>
                                                {lastSubMenu.badge && (
                                                  <div className="side-menu__link__badge ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                    {lastSubMenu.badge}
                                                  </div>
                                                )}
                                              </a>
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </Transition>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </Transition>
                        )}
                      </li>
                    ),
                  )
                ) : (
                  <li className="py-2 text-gray-500">
                    No menu items available
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div
          className={clsx([
            'absolute h-[65px] transition-[margin] duration-300 mt-3.5 inset-x-0 top-0 z-[60]',
            isSidebarFixed && 'xl:ml-[275px]',
            !isSidebarFixed && !compactMenu && 'xl:ml-[275px]',
            !isSidebarFixed &&
              compactMenu &&
              !compactMenuOnHover &&
              'xl:ml-[91px]',
            !isSidebarFixed &&
              compactMenu &&
              compactMenuOnHover &&
              'xl:ml-[275px]',
          ])}
        >
          {/* icon overlapping on sidebar fixed */}
          {!activeMobileMenu && (
            <div className="flex absolute px-5 pt-5 items-center gap-1 xl:hidden">
              <a
                href=""
                onClick={(event) => {
                  event.preventDefault();
                  setActiveMobileMenu(true);
                }}
                className="p-2 text-white rounded-full hover:bg-white/5"
              >
                <Lucide icon="AlignJustify" className="w-[18px] h-[18px]" />
              </a>
            </div>
          )}
          <div
            className={clsx([
              'top-bar absolute xl:left-3.5 right-0 h-full mx-5',
              "before:content-[''] before:absolute before:top-0 before:inset-x-0 before:-mt-[15px] before:h-[20px] before:backdrop-blur",
              topBarActive && 'top-bar--active',
            ])}
          >
            <div
              className={clsx([
                'container flex items-center w-full h-full transition-all ease-in-out duration-200 bg-transparent shadow-none',
                'group-[.top-bar--active]:rounded-none group-[.top-bar--active]:px-5',
                'group-[.top-bar--active]:bg-white',
                'group-[.top-bar--active]:border-b-4 group-[.top-bar--active]:border-emerald-500',
                'group-[.top-bar--active]:shadow-sm',
                'dark:group-[.top-bar--active]:bg-darkmode-800',
                'dark:group-[.top-bar--active]:border-emerald-400',
                !isSidebarExpanded && 'pl-2',
              ])}
            >
              <div className="flex-1 hidden xl:block pr-10">
                <Breadcrumb light className="truncate">
                  {breadcrumbPath.map((item, index) => (
                    <Breadcrumb.Link
                      key={index}
                      className={clsx(['dark:before:bg-chevron-white'])}
                      to={item.to}
                      active={item.active}
                    >
                      {item.title}
                    </Breadcrumb.Link>
                  ))}
                </Breadcrumb>
              </div>
              <div className="flex items-center">
                <div className="flex items-center gap-1 ml-auto">
                  <a
                    href=""
                    className="p-2 text-white rounded-full hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFullscreen();
                    }}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    <Lucide 
                      icon={isFullscreen ? "Minimize" : "Maximize"} 
                      className="w-[18px] h-[18px]" 
                    />
                  </a>
                  {/* <a
                    href=""
                    className="p-2 text-white rounded-full hover:bg-white/5 relative"
                    onClick={(e) => {
                      e.preventDefault();
                      setNotificationsPanel(true);
                    }}
                  > */}
                  {/* Notification Count Badge */}
                  {/* {notificationsCount > 0 && (
                      <span
                        id="notification-badge"
                        className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white"
                      >
                        {notificationsCount}
                      </span>
                    )} */}

                  {/* Bell Icon */}
                  {/* <Lucide icon="Bell" className="w-[18px] h-[18px]" />
                  </a> */}
                </div>
                {/* Replaced Menu to avoid headlessUI internal flow */}
                <div
                  className="ml-5 relative"
                  style={{ zIndex: 100 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="profile-button right-0 rounded-full w-[36px] h-[36px] border-[3px] border-white/[0.15] focus:outline-none"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleDropdown();
                    }}
                  >
                    <img
                      alt="Profile"
                      src={users || 'https://via.placeholder.com/36'}
                      className="object-cover w-full h-full"
                      style={{ pointerEvents: 'none' }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      // color in dark mode
                      className={`dark:bg-[rgb(var(--color-darkmode-500))] dropdown mt-1 bg-white shadow-lg rounded-md absolute z-[100] right-0 max-h-[80vh] overflow-y-auto ${
                        [
                          Role.MERCHANT,
                          Role.SUB_MERCHANT,
                          Role.MERCHANT_OPERATIONS,
                          Role.VENDOR_OPERATIONS,
                        ].includes(userData.designation || '')
                          ? 'w-[14rem]'
                          : 'w-56'
                      }`}
                    >
                      <div
                        className={`${
                          [
                            Role.MERCHANT,
                            Role.SUB_MERCHANT,
                            Role.MERCHANT_OPERATIONS,
                            Role.VENDOR_OPERATIONS,
                          ].includes(userData.designation || '')
                            ? 'pr-8 pl-4 py-3'
                            : 'px-4 py-3'
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-3 ${
                            [Role.MERCHANT, Role.SUB_MERCHANT].includes(
                              userData.role,
                            )
                              ? 'mb-2'
                              : ''
                          }`}
                        >
                          <img
                            alt="Profile"
                            src={users || 'https://via.placeholder.com/36'}
                            className="object-cover w-8 h-8 rounded-full"
                          />
                          <div className="flex flex-col">
                            <span className="block font-medium text-gray-900 dark:text-gray-100">
                              {userData.name}
                            </span>
                            <span className="block text-sm text-gray-500 dark:text-gray-400">
                              {userData.designation}
                            </span>
                          </div>
                        </div>
                        {userData.designation === Role.ADMIN && (
                          <div className="flex items-center space-x-3">
                            <span>Unique ID:</span>
                            <span
                              className={`block text-xs text-gray-500 dark:text-gray-400 ${
                                isBlurred ? 'blur-sm' : ''
                              } transition-all duration-300`}
                            >
                              {uniqueId || 'N/A'}
                            </span>
                            <button className="focus:outline-none">
                              {isBlurred ? (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="Eye"
                                  onClick={handleVerificationClick}
                                />
                              ) : (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="EyeOff"
                                  onClick={toggleBlur}
                                />
                              )}
                            </button>
                          </div>
                        )}
                        {[Role.MERCHANT, Role.SUB_MERCHANT].includes(
                          userData.designation || '',
                        ) && (
                          <div className="flex items-center space-x-3 mt-2">
                            <span>API Key:</span>
                            <span
                              className={`block text-xs text-gray-500 dark:text-gray-400 ${
                                isBlurred ? 'blur-sm' : ''
                              } transition-all duration-300`}
                            >
                              {apiKey}
                            </span>
                            <button className="focus:outline-none">
                              {isBlurred ? (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="Eye"
                                  onClick={handleVerificationClick}
                                />
                              ) : (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="EyeOff"
                                  onClick={toggleBlur}
                                />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <hr />
                      {/* stop click impact when opening dropdown */}
                      <button
                        // color changed darkmode
                        className="flex items-center w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-[rgb(var(--color-darkmode-400))]"
                        onClick={() => {
                          setShowChangePasswordModal(true);
                          setIsOpen(false);
                        }}
                      >
                        <Lucide icon="Lock" className="w-4 h-4 mr-2" />
                        Change Password
                      </button>
                      <hr />
                      <button
                        // color changed darkmode
                        className="flex items-center w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-[rgb(var(--color-darkmode-400))]"
                        onClick={() => {
                          HandleLogOut();
                          setIsOpen(false);
                        }}
                      >
                        <Lucide icon="Power" className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                <ActivitiesPanel
                  activitiesPanel={activitiesPanel}
                  setActivitiesPanel={setActivitiesPanel}
                />
                <NotificationsPanel
                  notificationsPanel={notificationsPanel}
                  setNotificationsPanel={setNotificationsPanel}
                />
                <SwitchAccount
                  switchAccount={switchAccount}
                  setSwitchAccount={setSwitchAccount}
                />
              </div>
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
        <div
          className={clsx([
            'transition-[margin,width] duration-100 xl:pl-3.5 pt-[54px] pb-16 relative z-10 group mode',
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
      </div>
    </>
  );
}

export default Main;
