/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import { Tab } from '@/components/Base/Headless';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import CheckUtrHistory from './CheckUtrHistory';
import ResetHistory from './ResetHistory';
import AddDataHistory from './AddDataHistory';
import { Role } from '@/constants';
interface dataEntries {
  tabState: number;
}

function DataEntries({ tabState }: dataEntries) {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const activeTab = useAppSelector(getTabs);
  const [title, setTitle] = useState('Add Bank Response');

  useEffect(() => {
    switch (activeTab) {
      case 0:
        setTitle('Add Bank Response');
        break;
      case 1:
        setTitle('Check Utr');
        break;
      case 2:
        setTitle('Reset Entry');
        break;
      default:
        setTitle('Add Bank Response');
    }
  }, [activeTab]);

  const handleTabChange = (index: number) => {
    dispatch(setActiveTab(index));
  };
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
  }

  return (
    <div className="mt-8 sm:mt-12">
      <div className="grid grid-cols-12 gap-y-6 sm:gap-y-10 gap-x-4 sm:gap-x-6">
        <div className="col-span-12">
          <div className="flex items-center h-auto sm:h-10 justify-between mb-3 mx-1">
            <div className="p-2 sm:p-3 text-lg sm:text-xl md:text-2xl font-bold">{title}</div>
          </div>
          <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-4 sm:gap-y-7">
            <div className="flex flex-col p-2 sm:p-3 box box--stacked">
              <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
                <Tab.List className="grid grid-cols-2 sm:grid-cols-3 md:flex border-b-0 bg-transparent relative">
                  <Tab className="relative flex-1">
                    {({ selected }) => (
                      <Tab.Button
                        className={`w-full py-2 sm:py-3 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
                          selected
                            ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                            : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                        }`}
                        as="button"
                        style={selected ? {
                          position: 'relative',
                          zIndex: 10
                        } : {}}
                      >
                        <Lucide icon="FileCheck" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                        <span className="hidden sm:inline">Add Data</span>
                        <span className="sm:hidden">Add</span>
                      </Tab.Button>
                    )}
                  </Tab>
                  {(role && ![Role.VENDOR, Role.VENDOR_OPERATIONS].includes(role)) && (
                    <>
                      <Tab className="relative flex-1">
                        {({ selected }) => (
                          <Tab.Button
                            className={`w-full py-2 sm:py-3 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
                              selected
                                ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                                : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                            }`}
                            as="button"
                            style={selected ? {
                              position: 'relative',
                              zIndex: 10
                            } : {}}
                          >
                            <Lucide
                              icon="CheckCircle"
                              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]"
                            />
                            <span className="hidden sm:inline">Check UTR</span>
                            <span className="sm:hidden">Check</span>
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
                            style={selected ? {
                              position: 'relative',
                              zIndex: 10
                            } : {}}
                          >
                            <Lucide
                              icon="History"
                              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]"
                            />
                            <span className="hidden sm:inline">Reset Entry</span>
                            <span className="sm:hidden">Reset</span>
                          </Tab.Button>
                        )}
                      </Tab>
                    </>
                  )}
                </Tab.List>
                <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
                  <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
                    <AddDataHistory
                      selectedIndex={activeTab}
                      tabState={tabState}
                    />
                  </Tab.Panel>
                  <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
                    <CheckUtrHistory
                      selectedIndex={activeTab}
                      tabState={tabState}
                    />
                  </Tab.Panel>
                  <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
                    <ResetHistory
                      selectedIndex={activeTab}
                      tabState={tabState}
                    />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEntries;
