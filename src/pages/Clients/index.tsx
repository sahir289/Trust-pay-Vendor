import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { getParentTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { setParentTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { Tab } from '@/components/Base/Headless';
import Lucide from '@/components/Base/Lucide';
import { Role } from '@/constants';
// import { withLazyLoading } from '@/utils/lazyStrategies';

// Normal imports instead of lazy loading
import Vendor from '@/pages/Clients/Vendors/index';
import Merchant from '@/pages/Clients/Merchant/index';

// Commented out lazy loading approach:
// const Vendor = withLazyLoading(() => import('@/pages/Clients/Vendors/index'), { chunkName: 'Vendor' });
// const Merchant = withLazyLoading(() => import('@/pages/Clients/Merchant/index'), { chunkName: 'Merchant' });

const Clients: React.FC = () => {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const parentTab = useAppSelector(getParentTabs);
  const data = localStorage.getItem('userData');
  const parsedData = data ? JSON.parse(data) : null;
  const userRole = parsedData?.designation;

  // Initialize title based on user role
  const [title, setTitle] = useState(() => {
    if (!userRole) return 'Merchant';

    if (
      [
        Role.MERCHANT,
        Role.MERCHANT_ADMIN,
        Role.SUB_MERCHANT,
        Role.MERCHANT_OPERATIONS,
      ].includes(userRole)
    ) {
      return 'Merchant';
    }

    if (
      [
        Role.VENDOR,
        Role.SUB_VENDOR,
        Role.VENDOR_OPERATIONS,
        Role.VENDOR_ADMIN,
      ].includes(userRole)
    ) {
      return 'Vendor';
    }

    if ([Role.ADMIN, Role.TRANSACTIONS].includes(userRole)) {
      return parentTab === 0 ? 'Merchant' : 'Vendor';
    }
    return 'Merchant';
  });
  useEffect(() => {
    if ([Role.ADMIN, Role.TRANSACTIONS].includes(userRole)) {
      setTitle(parentTab === 0 ? 'Merchant' : 'Vendor');
    }
  }, [parentTab, userRole]);

  // Update title only for admin users when tab changes
  const handleParentTabChange = (index: number): void => {
    dispatch(setParentTab(index));
    if ([Role.ADMIN, Role.TRANSACTIONS].includes(userRole)) {
      setTitle(index === 0 ? 'Merchant' : 'Vendor');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex items-center h-10 mx-3 my-2 justify-between">
          <div className="text-lg font-medium group-[.mode--light]:text-white">
            {title}
          </div>
        </div>
        {(userRole === Role.ADMIN ||
          userRole === Role.TRANSACTIONS ||
          userRole === Role.OPERATIONS) && (
          <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
            <div className="flex flex-col p-5 box box--stacked">
              <Tab.Group
                selectedIndex={parentTab}
                onChange={handleParentTabChange}
              >
                <Tab.List className="flex border-b-0 bg-transparent relative">
                  <Tab className="relative flex-1">
                    {({ selected }) => (
                      <Tab.Button
                        className={`w-full py-2 flex items-center justify-center transition-all duration-200 relative ${
                          selected
                            ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                            : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                        }`}
                        as="button"
                        style={
                          selected
                            ? {
                                position: 'relative',
                                zIndex: 10,
                              }
                            : {}
                        }
                      >
                        <Lucide
                          icon="CreditCard"
                          className="w-5 h-5 ml-px stroke-[2.5]"
                        />
                        &nbsp; Merchant
                      </Tab.Button>
                    )}
                  </Tab>
                  <Tab className="relative flex-1">
                    {({ selected }) => (
                      <Tab.Button
                        className={`w-full py-2 flex items-center justify-center transition-all duration-200 relative ${
                          selected
                            ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                            : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                        }`}
                        as="button"
                        style={
                          selected
                            ? {
                                position: 'relative',
                                zIndex: 10,
                              }
                            : {}
                        }
                      >
                        <Lucide
                          icon="Store"
                          className="w-5 h-5 ml-px stroke-[2.5]"
                        />
                        &nbsp; Vendor
                      </Tab.Button>
                    )}
                  </Tab>
                </Tab.List>
                <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
                  <Tab.Panel className="py-5 leading-relaxed">
                    <Merchant />
                  </Tab.Panel>
                  <Tab.Panel className="py-5 leading-relaxed">
                    <Vendor />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        )}
        {(userRole === Role.MERCHANT ||
          userRole === Role.MERCHANT_ADMIN ||
          userRole === Role.SUB_MERCHANT ||
          userRole === Role.MERCHANT_OPERATIONS) && (
          <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
            <div className="flex flex-col p-5 box ">
              {' '}
              <Merchant />
            </div>
          </div>
        )}
        {(userRole === Role.VENDOR ||
          userRole === Role.SUB_VENDOR ||
          userRole === Role.VENDOR_OPERATIONS ||
          userRole === Role.VENDOR_ADMIN) && (
          <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
            <div className="flex flex-col p-5 box ">
              {' '}
              <Vendor />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
