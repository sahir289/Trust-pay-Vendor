/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Tab } from '@/components/Base/Headless';
import { useState } from 'react';
import Lucide from '@/components/Base/Lucide';
import { Role } from '@/constants';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { getParentTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { setParentTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
// import { withLazyLoading } from '@/utils/lazyStrategies';

// Normal imports instead of lazy loading
import AccountReports from '@/pages/Reports/AccountReports/index';
import VendorAccountReports from '@/pages/Reports/VendorAccountReports/index';

// Commented out lazy loading approach:
// const AccountReports = withLazyLoading(
//   () => import('@/pages/Reports/AccountReports/index'),
//   { chunkName: 'account-reports', retries: 3 }
// );
// const VendorAccountReports = withLazyLoading(
//   () => import('@/pages/Reports/VendorAccountReports/index'),
//   { chunkName: 'vendor-account-reports', retries: 3 }
// );

function Main() {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const parentTab = useAppSelector(getParentTabs); // Get parent tab from Redux
  const [title, setTitle] = useState(
    parentTab === 0 ? 'Merchant Account Reports' : 'Vendor Account Reports',
  );

  const data = localStorage.getItem('userData');
  let role;
  let name;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
    name = parsedData.name;
  }
  const handleParentTabChange = (index: number) => {
    dispatch(setParentTab(index));
    setTitle(
      index === 0 ? 'Merchant Account Reports' : 'Vendor Account Reports',
    );
  };
  return (
    <>
      <div className="flex flex-col min-h-10 w-full px-2 sm:px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="text-lg sm:text-xl md:text-2xl font-medium group-[.mode--light]:text-white">
            Reports
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-y-4 sm:gap-y-6 md:gap-y-10 gap-x-3 sm:gap-x-6 mt-2">
        <div className="col-span-12">
          {role === Role.ADMIN && (
            <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
              <div className="flex flex-col p-3 sm:p-4 md:p-5 box box--stacked">
                <Tab.Group
                  selectedIndex={parentTab}
                  onChange={handleParentTabChange}
                >
                  <Tab.List className="grid grid-cols-2 md:flex border-b-0 bg-transparent relative">
                    <Tab className="relative flex-1">
                      {({ selected }) => (
                        <Tab.Button
                          className={`w-full py-2 sm:py-3 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
                            selected
                              ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                              : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                          }`}
                          as="button"
                          onClick={() => setTitle('Merchant Account Reports')}
                          title={title}
                          style={selected ? {
                            position: 'relative',
                            zIndex: 10
                          } : {}}
                        >
                          <Lucide
                            icon="BadgeIndianRupee"
                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]"
                          />
                          <span className="hidden sm:inline">Merchant Reports</span>
                          <span className="sm:hidden">Merchant</span>
                        </Tab.Button>
                      )}
                    </Tab>
                    <Tab className="relative flex-1">
                      {({ selected }) => (
                        <Tab.Button
                          className={`w-full py-2 sm:py-3 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
                            selected
                              ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                              : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                          }`}
                          as="button"
                          onClick={() => setTitle('Vendor Account Reports')}
                          title={title}
                          style={selected ? {
                            position: 'relative',
                            zIndex: 10
                          } : {}}
                        >
                          <Lucide
                            icon="ArrowRightCircle"
                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]"
                          />
                          <span className="hidden sm:inline">Vendor Reports</span>
                          <span className="sm:hidden">Vendor</span>
                        </Tab.Button>
                      )}
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
                    <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
                      <AccountReports role={role} name={name} />
                    </Tab.Panel>
                    <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
                      <VendorAccountReports role={role} name={name} />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          )}
          {role === Role.MERCHANT && (
            <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-4 sm:gap-y-7">
              <div className="flex flex-col p-3 sm:p-4 md:p-5 box box--stacked">
                <AccountReports role={role} name={name} />
              </div>
            </div>
          )}
          {role === Role.VENDOR && (
            <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-4 sm:gap-y-7">
              <div className="flex flex-col p-3 sm:p-4 md:p-5 box box--stacked">
                <VendorAccountReports role={role} name={name} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Main;
