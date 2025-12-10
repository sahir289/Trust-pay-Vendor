/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React from 'react';
import { Tab } from '@/components/Base/Headless';
import { Role } from '@/constants';
// import { withLazyLoading } from '@/utils/lazyStrategies';
import Lucide from '@/components/Base/Lucide';
import { useState  ,useEffect } from 'react';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { onload } from '@/redux-toolkit/slices/payout/payoutSlice';
import { getVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSlice';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';

// Normal imports instead of lazy loading
import AllPayOut from '@/pages/TransactionList/Payout/allPayout';
import CompletedPayOut from '@/pages/TransactionList/Payout/completedPayout';
import InProgressPayOut from '@/pages/TransactionList/Payout/inProgressPayout';
import RejectedPayOut from '@/pages/TransactionList/Payout/rejectedPayout';

// Commented out lazy loading approach:
// const AllPayOut = withLazyLoading(() => import('@/pages/TransactionList/Payout/allPayout'), { chunkName: 'AllPayOut' });
// const CompletedPayOut = withLazyLoading(() => import('@/pages/TransactionList/Payout/completedPayout'), { chunkName: 'CompletedPayOut' });
// const InProgressPayOut = withLazyLoading(() => import('@/pages/TransactionList/Payout/inProgressPayout'), { chunkName: 'InProgressPayOut' });
// const RejectedPayOut = withLazyLoading(() => import('@/pages/TransactionList/Payout/rejectedPayout'), { chunkName: 'RejectedPayOut' });

const PayOut: React.FC = () => {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const activeTab = useAppSelector(getTabs); // Get active tab from state
  const [merchantCodes, setMerchantCodes] = useState<any[]>([]);
  const [merchantCodesData, setMerchantCodesData] = useState<any[]>([]);
  const [vendorCodes, setVendorCodes] = useState<any[]>([]);
  const [vendorCodesData, setVendorCodesData] = useState<any[]>([]);
  const [callMerchant, setCallMerchant] = useState<boolean>(false);
  const [callVendor, setCallVendor] = useState<boolean>(false);
  const handleTabChange = (index: number) => {
    // Don't do anything if clicking the same tab
    if (index === activeTab) return;

    dispatch(setActiveTab(index)); // Dispatch action to set the active tab
    dispatch(onload());
  };
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
  }

  const handleGetAllMerchantCodes = async () => {
    if (callMerchant && merchantCodes.length == 0) {
      const res = await getAllMerchantCodes();
      setMerchantCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
      setMerchantCodesData(
        res.map((el: any) => ({
          label: el.label,
          value: el.merchant_id,
        })),
      );
   }
  }


  const handleGetAllVendorCodes =async () => {
    if (callVendor && vendorCodes.length == 0) {
      const res = await getAllVendorCodes();
      setVendorCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
      setVendorCodesData(
        res.map((el: any) => ({
          label: el.label,
          value: el.vendor_id,
        })),
      );
      dispatch(getVendorCodes(res));
   }
  }

  useEffect(() => {
    if (role) {
      if (role !== Role.VENDOR) {
        handleGetAllMerchantCodes();
      }
      if (role !== Role.MERCHANT) {
        handleGetAllVendorCodes();
      }
    }
  }, [callMerchant,callVendor]);
  return (
    <div className="flex flex-col p-3 sm:p-5">
      <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
        <Tab.List className="grid grid-cols-2 sm:grid-cols-2 md:flex border-b-0 bg-transparent relative">
          <Tab className="relative flex-1">
            {({ selected }) => (
              <Tab.Button
                className={`w-full py-2 px-2 sm:px-4 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
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
                <Lucide icon="Globe" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                All
              </Tab.Button>
            )}
          </Tab>
          <Tab className="relative flex-1">
            {({ selected }) => (
              <Tab.Button
                className={`w-full py-2 px-2 sm:px-4 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
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
                  icon="BadgeCheck"
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]"
                />
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden">Done</span>
              </Tab.Button>
            )}
          </Tab>
          <Tab className="relative flex-1">
            {({ selected }) => (
              <Tab.Button
                className={`w-full py-2 px-2 sm:px-4 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
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
                <LoadingIcon icon="ball-triangle" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">In Progress</span>
                <span className="sm:hidden">Progress</span>
              </Tab.Button>
            )}
          </Tab>
          <Tab className="relative flex-1">
            {({ selected }) => (
              <Tab.Button
                className={`w-full py-2 px-2 sm:px-4 flex items-center justify-center gap-1 text-[10px] sm:text-xs md:text-sm transition-all duration-200 relative ${
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
                <Lucide icon="BadgeX" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                Rejected
              </Tab.Button>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
          <Tab.Panel className="py-3 sm:py-5 leading-relaxed">
            <AllPayOut
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              vendorCodesData={vendorCodesData}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
            />
          </Tab.Panel>
          <Tab.Panel className="py-3 sm:py-5 leading-relaxed">
            <CompletedPayOut
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
            />
          </Tab.Panel>
          <Tab.Panel className="py-3 sm:py-5 leading-relaxed">
            <InProgressPayOut
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              vendorCodesData={vendorCodesData}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
            />
          </Tab.Panel>
          <Tab.Panel className="py-3 sm:py-5 leading-relaxed">
            <RejectedPayOut
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default PayOut;
