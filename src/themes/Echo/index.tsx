/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import '@/assets/css/vendors/simplebar.css';
import '@/assets/css/themes/echo.css';
import Breadcrumb from '@/components/Base/Breadcrumb';
import { useState, useEffect, createRef, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { selectSideMenu } from '@/redux-toolkit/slices/common/sideMenu/sideMenuSelectors';
import { setCompactMenu as setCompactMenuStore } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSlice';
import { selectCompactMenu } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSelectors';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { FormattedMenu, linkTo, nestedMenu } from './side-menu';
import Lucide from '@/components/Base/Lucide';
import users from '@/assets/images/users/users.svg';
import clsx from 'clsx';
import SimpleBar from 'simplebar';
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
          'echo group bg-gradient-to-b from-slate-200/70 to-slate-50 background relative min-h-screen dark:from-darkmode-800/[.95] dark:to-darkmode-900/[.95]',
          "before:content-[''] before:h-[370px] before:w-screen before:bg-gradient-to-t before:from-theme-1/80 before:to-theme-2 [&.background--hidden]:before:opacity-0 before:transition-[opacity,height] before:ease-in-out before:duration-300 before:top-0 before:fixed",
          "after:content-[''] after:h-[370px] after:w-screen [&.background--hidden]:after:opacity-0 after:transition-[opacity,height] after:ease-in-out after:duration-300 after:top-0 after:fixed after:bg-texture-white after:bg-contain after:bg-fixed after:bg-[center_-13rem] after:bg-no-repeat",
          topBarActive && 'background--hidden',
        ])}
      >
        <div
          className={clsx([
            'navbar fixed top-0 left-0 right-0 z-40 h-16 bg-white shadow-md border-b border-gray-200',
            'flex items-center justify-between px-6',
          ])}
        >
          <div className="navbar-left flex items-center space-x-4">
            <div className="logo bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">TP</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">TrustPay</span>
            <button
              className="toggle-sidebar-btn p-2 rounded-full hover:bg-gray-200"
              onClick={(event) => {
                event.preventDefault();
                toggleSidebarMode(event);
              }}
            >
              <Lucide
                icon={isSidebarExpanded ? 'ChevronLeft' : 'ChevronRight'}
                className="w-5 h-5 text-gray-800"
              />
            </button>
          </div>
          <div className="navbar-right flex items-center space-x-4">
            <button
              className="fullscreen-btn p-2 rounded-md hover:bg-gray-100"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Lucide
                icon={isFullscreen ? 'Minimize' : 'Maximize'}
                className="w-6 h-6 text-gray-700"
              />
            </button>
            <div className="relative">
              <button
                className="profile-btn w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 focus:outline-none"
                onClick={toggleDropdown}
              >
                <img
                  src={users || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
              {isOpen && (
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium">{userData.name}</p>
                    <p className="text-xs text-gray-500">{userData.designation}</p>
                  </div>
                  <hr />
                  <button
                    className="dropdown-item flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      setShowChangePasswordModal(true);
                      setIsOpen(false);
                    }}
                  >
                    <Lucide icon="Lock" className="w-4 h-4 mr-2" />
                    Change Password
                  </button>
                  <button
                    className="dropdown-item flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left"
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
          </div>
        </div>
        <div
          className={clsx([
            'sidebar-container fixed top-16 left-0 z-30 h-[calc(100%-4rem)] bg-white text-gray-800 shadow-lg',
            isSidebarExpanded ? 'w-64' : 'w-24',
            'transition-all duration-300',
          ])}
        >
          {/* <div className="sidebar-header flex items-center justify-between px-4 py-3 border-b border-gray-300">
          </div> */}
          <div className="sidebar-menu mt-4">
            <ul className="menu-list space-y-2">
              {formattedMenu.map((menu, index) =>
                typeof menu === 'string' ? (
                  <li
                    key={index}
                    className="menu-divider text-gray-500 text-sm px-4"
                  >
                    {/* {menu} */}
                  </li>
                ) : (
                  <li key={index}>
                    <a
                      href=""
                      className={clsx([
                        'menu-item flex items-center px-4 py-2 rounded-md hover:bg-gray-200',
                        menu.active && 'bg-gray-200',
                      ])}
                      onClick={(event) => {
                        event.preventDefault();
                        linkTo(menu, navigate);
                      }}
                    >
                      <Lucide
                        icon={menu.icon || 'Circle'}
                        className="menu-icon w-5 h-5 text-gray-800"
                      />
                      {isSidebarExpanded && (
                        <span className="menu-title ml-3">{menu.title}</span>
                      )}
                    </a>
                    {menu.subMenu && menu.activeDropdown && (
                      <ul className="submenu-list pl-6 mt-2 space-y-1">
                        {menu.subMenu.map((subMenu, subIndex) => (
                          <li key={subIndex}>
                            <a
                              href=""
                              className={clsx([
                                'submenu-item flex items-center px-4 py-2 rounded-md hover:bg-gray-200',
                                subMenu.active && 'bg-gray-200',
                              ])}
                              onClick={(event) => {
                                event.preventDefault();
                                linkTo(subMenu, navigate);
                              }}
                            >
                              <Lucide
                                icon={subMenu.icon || 'Circle'}
                                className="submenu-icon w-4 h-4 text-gray-800"
                              />
                              {isSidebarExpanded && (
                                <span className="submenu-title ml-3">
                                  {subMenu.title}
                                </span>
                              )}
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
