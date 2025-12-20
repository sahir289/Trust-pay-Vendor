/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useCallback, useEffect, useState } from 'react';
import { Role } from '@/constants';
import Lucide from '@/components/Base/Lucide';
import LoadingIcon from '@/components/Base/LoadingIcon';
import CustomTooltip from '@/pages/Tooltip/tooltip';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { onload } from '@/redux-toolkit/slices/payin/payinSlice';
import { getAllPayInsSum } from '@/redux-toolkit/slices/payin/payinAPI';
import { Status } from '@/constants';
import AllPayIn from '@/pages/TransactionList/Payin/allPayin';
import CompletedPayIn from '@/pages/TransactionList/Payin/completedPayin';
import InProgressPayIn from '@/pages/TransactionList/Payin/inProgressPayin';
import DroppedPayIn from '@/pages/TransactionList/Payin/droppedPayin';
import ReviewPayIn from '@/pages/TransactionList/Payin/review';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { getBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
import { selectAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSelectors';
import clsx from 'clsx';

interface PayInSummary {
  status: string;
  totalAmount: number;
  totalCount: number;
}

interface ConsolidatedStatus {
  name: string;
  totalAmount: number;
  totalCount: number;
  statuses: PayInSummary[];
}



const PayInComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector(selectDarkMode);
  const activeTab = useAppSelector(getTabs);
  // const getSumPayin = useAppSelector(getSumPayIn);
  
  const [data, setData] = useState<PayInSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSum, setIsLoadingSum] = useState(false);
  const [vendorCodes, setVendorCodes] = useState<any[]>([]);
  const [merchantCodes, setMerchantCodes] = useState<any[]>([]);
  const [merchantCodesData, setMerchantCodesData] = useState<any[]>([]);

  const [callMerchant, setCallMerchant] = useState<boolean>(false);
  const [callVendor, setCallVendor] = useState<boolean>(false);
  const [callBank, setCallBank] = useState<boolean>(false);

  const handleTabChange = (index: number) => {
    // Don't do anything if clicking the same tab
    if (index === activeTab) return;
    
    dispatch(setActiveTab(index));
    dispatch(onload());
  };
  const Data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;

  if (Data !== null) {
    const parsedData = JSON.parse(Data) as { role: RoleType };
    role = parsedData.role;
  }
  const getSum = useCallback(async () => {
    try {
      setIsLoadingSum(true); // Set loading true before API call
      const response = await getAllPayInsSum();
      setData(response.results);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to fetch pay-in data');
    } finally {
      setIsLoadingSum(false); // Set loading false after API call completes
    }
  }, [dispatch]);

  useEffect(() => {
    if (role == Role.ADMIN) {
      getSum();
    }
  }, [getSum, dispatch]);

  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const bankNames = useAppSelector(selectAllBankNames);
  const fetchBankNames = async () => {
    let bankNamesList;
    if (bankNames.length == 0) {
       bankNamesList = await getAllBankNames('PayIn');
    }
    if (bankNamesList) {
      dispatch(getBankNames(bankNamesList.bankNames));
    }
  };

  const handleGetAllVendorCodes = async () => {
    if (role !== Role.MERCHANT && vendorCodes.length == 0) {
      const res = await getAllVendorCodes();
      setVendorCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
    }
  };

  useEffect(() => {
    if (role !== Role.MERCHANT && callVendor) {
      handleGetAllVendorCodes();
      setCallVendor(false);
    }
  }, [callVendor]);

  useEffect(() => {
    if (role !== Role.MERCHANT && callBank) {
      fetchBankNames();
      setCallBank(false);
    }
  }, [callBank]);

  const handleGetAllMerchantCodes = async () => {
    if (role !== Role.VENDOR && merchantCodes.length == 0) {
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

  useEffect(() => {
    if (role !== Role.VENDOR && callMerchant) {
      handleGetAllMerchantCodes();
      setCallMerchant(false);
    }
  }, [callMerchant]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return darkMode ? 'text-emerald-400' : 'text-emerald-600';
      case 'Dropped':
        return darkMode ? 'text-rose-400' : 'text-rose-600';
      case 'Pending':
        return darkMode ? 'text-amber-400' : 'text-amber-600';
      case 'InProcess':
        return darkMode ? 'text-blue-400' : 'text-blue-600';
      default:
        return darkMode ? 'text-slate-400' : 'text-slate-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Success':
        return darkMode ? 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30' : 'from-emerald-50 to-emerald-100/50 border-emerald-200';
      case 'Dropped':
        return darkMode ? 'from-rose-500/20 to-rose-600/10 border-rose-400/30' : 'from-rose-50 to-rose-100/50 border-rose-200';
      case 'Pending':
        return darkMode ? 'from-amber-500/20 to-amber-600/10 border-amber-400/30' : 'from-amber-50 to-amber-100/50 border-amber-200';
      case 'InProcess':
        return darkMode ? 'from-blue-500/20 to-blue-600/10 border-blue-400/30' : 'from-blue-50 to-blue-100/50 border-blue-200';
      default:
        return darkMode ? 'from-slate-500/20 to-slate-600/10 border-slate-400/30' : 'from-slate-50 to-slate-100/50 border-slate-200';
    }
  };

  const statusMapping: { [key: string]: string } = {
    [Status.PENDING]: 'Pending',
    [Status.IMAGE_PENDING]: 'Pending',
    [Status.DISPUTE]: 'Pending',
    [Status.BANK_MISMATCH]: 'Pending',
    [Status.DUPLICATE]: 'Pending',
    [Status.INITIATED]: 'InProcess',
    [Status.ASSIGNED]: 'InProcess',
    [Status.SUCCESS]: 'Success',
    [Status.FAILED]: 'Dropped',
    [Status.DROPPED]: 'Dropped',
  };

  const consolidatedData: ConsolidatedStatus[] = [
    { name: 'InProcess', totalAmount: 0, totalCount: 0, statuses: [] },
    { name: 'Pending', totalAmount: 0, totalCount: 0, statuses: [] },
    { name: 'Success', totalAmount: 0, totalCount: 0, statuses: [] },
    { name: 'Dropped', totalAmount: 0, totalCount: 0, statuses: [] },
  ];

  data.forEach((item) => {
    const consolidatedName = statusMapping[item.status] || 'Pending';
    const consolidated = consolidatedData.find(
      (c) => c.name === consolidatedName,
    );
    if (consolidated) {
      consolidated.totalAmount += item.totalAmount;
      consolidated.totalCount += item.totalCount;
      consolidated.statuses.push(item);
    }
  });

  // Tab configuration
  const tabs = [
    { id: 0, label: 'All', icon: 'Globe', shortLabel: 'All' },
    { id: 1, label: 'Completed', icon: 'BadgeCheck', shortLabel: 'Done' },
    { id: 2, label: 'In Progress', icon: 'loader', shortLabel: 'Progress' },
    { id: 3, label: 'Dropped', icon: 'Trash2', shortLabel: 'Dropped' },
    { id: 4, label: 'Review', icon: 'AlertTriangle', shortLabel: 'Review' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      {error ? (
        <div className={clsx([
          'text-xs sm:text-sm p-3 rounded-lg',
          darkMode ? 'text-rose-400 bg-rose-500/10' : 'text-rose-600 bg-rose-50',
        ])}>
          Error loading data
        </div>
      ) : data.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {consolidatedData.map((item, index) => (
              <div
                key={index}
                className={clsx([
                  'relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300',
                  'bg-gradient-to-br border',
                  getStatusBgColor(item.name),
                  darkMode ? 'hover:shadow-lg' : 'hover:shadow-md',
                ])}
              >
                <div className={clsx([
                  'absolute top-0 right-0 w-12 h-12 rounded-full -mr-6 -mt-6',
                  darkMode ? 'bg-white/5' : 'bg-black/5',
                ])}></div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={clsx([
                      'text-[10px] sm:text-xs font-semibold uppercase tracking-wide',
                      getStatusColor(item.name),
                    ])}>
                      {item.name}
                    </span>
                    <span className={clsx([
                      'text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full',
                      darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-slate-700',
                    ])}>
                      {item.totalCount}
                    </span>
                  </div>
                  
                  <CustomTooltip
                    content={
                      <div className={clsx([
                        'text-xs min-w-[180px] max-w-[280px]',
                        darkMode ? 'text-slate-300' : 'text-slate-600',
                      ])}>
                        {item.statuses.length > 0 ? (
                          item.statuses.map((status) => (
                            <div key={status.status} className="py-1 flex justify-between">
                              <span>{status.status}:</span>
                              <span className="font-medium">
                                ₹{formatNumber(status.totalAmount)} ({status.totalCount})
                              </span>
                            </div>
                          ))
                        ) : (
                          <div>No data available</div>
                        )}
                      </div>
                    }
                  >
                    <div className={clsx([
                      'text-sm sm:text-lg font-bold cursor-pointer',
                      darkMode ? 'text-white' : 'text-slate-800',
                    ])}>
                      ₹{formatNumber(item.totalAmount)}
                    </div>
                  </CustomTooltip>
                </div>
              </div>
            ))}
          </div>
          
          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              className={clsx([
                'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                darkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
              ])}
              onClick={getSum}
              disabled={isLoadingSum}
              type="button"
            >
              {isLoadingSum ? (
                <LoadingIcon icon="tail-spin" className="w-4 h-4" />
              ) : (
                <Lucide icon="RefreshCw" className="w-4 h-4" />
              )}
              <span className="text-xs sm:text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      )}

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
          <AllPayIn
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            bankNames={bankNames}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
            setCallBank={setCallBank}
          />
        )}
        {activeTab === 1 && (
          <CompletedPayIn
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            bankNames={bankNames}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
            setCallBank={setCallBank}
          />
        )}
        {activeTab === 2 && (
          <InProgressPayIn
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            bankNames={bankNames}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
            setCallBank={setCallBank}
          />
        )}
        {activeTab === 3 && (
          <DroppedPayIn
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            bankNames={bankNames}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
            setCallBank={setCallBank}
          />
        )}
        {activeTab === 4 && (
          <ReviewPayIn
            vendorCodes={vendorCodes}
            merchantCodes={merchantCodes}
            merchantCodesData={merchantCodesData}
            bankNames={bankNames}
            setCallMerchant={setCallMerchant}
            setCallVendor={setCallVendor}
            setCallBank={setCallBank}
          />
        )}
      </div>
    </div>
  );
};

export default PayInComponent;
