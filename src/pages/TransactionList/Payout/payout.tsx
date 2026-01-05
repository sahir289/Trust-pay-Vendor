/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React from 'react';
import { Role } from '@/constants';
import Lucide from '@/components/Base/Lucide';
import { useState, useEffect } from 'react';
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
import clsx from 'clsx';

import AllPayOut from '@/pages/TransactionList/Payout/allPayout';
import CompletedPayOut from '@/pages/TransactionList/Payout/completedPayout';
import InProgressPayOut from '@/pages/TransactionList/Payout/inProgressPayout';
import RejectedPayOut from '@/pages/TransactionList/Payout/rejectedPayout';

const PayOut: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector(selectDarkMode);
  const activeTab = useAppSelector(getTabs);
  const [merchantCodes, setMerchantCodes] = useState<any[]>([]);
  const [merchantCodesData, setMerchantCodesData] = useState<any[]>([]);
  const [vendorCodes, setVendorCodes] = useState<any[]>([]);
  const [vendorCodesData, setVendorCodesData] = useState<any[]>([]);
  const [callMerchant, setCallMerchant] = useState<boolean>(false);
  const [callVendor, setCallVendor] = useState<boolean>(false);

  const handleTabChange = (index: number) => {
    if (index === activeTab) return;
    dispatch(setActiveTab(index));
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
  };

  const handleGetAllVendorCodes = async () => {
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
  };

  useEffect(() => {
    if (role) {
      if (role !== Role.VENDOR) {
        handleGetAllMerchantCodes();
      }
      if (role !== Role.MERCHANT) {
        handleGetAllVendorCodes();
      }
    }
  }, [callMerchant, callVendor]);

  // Tab configuration
  const tabs = [
    { id: 0, label: 'All', icon: 'Globe', shortLabel: 'All' },
    { id: 1, label: 'Completed', icon: 'BadgeCheck', shortLabel: 'Done' },
    { id: 2, label: 'In Progress', icon: 'loader', shortLabel: 'Progress' },
    { id: 3, label: 'Rejected', icon: 'BadgeX', shortLabel: 'Rejected' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Modern Pill Tabs */}
      <div className={clsx([
        'flex flex-wrap gap-2 p-2 rounded-xl',
        darkMode 
          ? 'bg-slate-800/50 border border-white/10'
          : 'bg-slate-100 border border-slate-200',
      ])}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={clsx([
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                : darkMode
                  ? 'text-white/60 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white',
            ])}
          >
            {tab.icon === 'loader' ? (
              <LoadingIcon icon="ball-triangle" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Lucide icon={tab.icon as any} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={clsx([
        'rounded-xl p-4',
        darkMode 
          ? 'bg-white/5 border border-white/10'
          : 'bg-white border border-slate-200',
      ])}>
        {activeTab === 0 && (
          <AllPayOut
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            vendorCodesData={vendorCodesData}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
          />
        )}
        {activeTab === 1 && (
          <CompletedPayOut
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
          />
        )}
        {activeTab === 2 && (
          <InProgressPayOut
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            vendorCodesData={vendorCodesData}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
          />
        )}
        {activeTab === 3 && (
          <RejectedPayOut
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
          />
        )}
      </div>
    </div>
  );
};

export default PayOut;
