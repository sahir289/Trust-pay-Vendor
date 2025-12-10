/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useCallback, useEffect, useState } from 'react';
import { Tab } from '@/components/Base/Headless';
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
// import { getSumPayIn } from '@/redux-toolkit/slices/payin/payinSelectors';
// import { setSumPayIn } from '@/redux-toolkit/slices/payin/payinSlice';
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
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
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
      if (
        role !== Role.MERCHANT && vendorCodes.length == 0
      ) {
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
      if (role !== Role.MERCHANT && callVendor)  {
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
      if (
        role !== Role.VENDOR && merchantCodes.length == 0
      ) {
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
        return 'text-green-600';
      case 'Dropped':
        return 'text-red-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'InProcess':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
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

  return (
    <div className="flex flex-col">
      <div className="flex flex-col p-1 sm:p-2">
        <div className="flex flex-col p-1 sm:p-2">
          {/* Add Refresh button for getSum */}
          {error ? (
            <div className="text-red-600 text-xs sm:text-sm">Error loading data</div>
          ) : data.length === 0 ? (
            <div></div>
          ) : (
            <div className="flex flex-row flex-wrap sm:flex-nowrap gap-1 sm:gap-2">
              {consolidatedData.map((item, index) => (
                <div
                  key={index}
                  className="w-[calc(50%-0.25rem)] sm:w-1/4 p-1.5 sm:p-2 border border-dashed rounded-md border-slate-300/80 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-around">
                    <div className="text-[10px] sm:text-xs font-medium">{item.totalCount}</div>
                    <div
                      className={`text-[10px] sm:text-xs font-medium truncate ${getStatusColor(
                        item.name,
                      )}`}
                    >
                      {item.name}
                    </div>
                    <CustomTooltip
                      content={
                        <div className="mt-1 text-xs sm:text-sm text-slate-300 min-w-[200px] max-w-[300px]">
                          {item.statuses.length > 0 ? (
                            item.statuses.map((status) => (
                              <div key={status.status} className="py-1">
                                {status.status}: ₹
                                {formatNumber(status.totalAmount)} (
                                {status.totalCount})
                              </div>
                            ))
                          ) : (
                            <div>No data available</div>
                          )}
                        </div>
                      }
                    >
                      <div className="text-[10px] sm:text-xs font-medium cursor-pointer truncate max-w-full">
                        ₹{formatNumber(item.totalAmount)}
                      </div>
                    </CustomTooltip>
                  </div>
                </div>
              ))}
              <div className="flex justify-end w-full sm:w-auto mt-1 sm:mt-0 sm:mb-2">
                <button
                  className="px-2 sm:px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={getSum}
                  disabled={isLoadingSum}
                  type="button"
                >
                  {isLoadingSum ? (
                    <LoadingIcon icon="tail-spin" className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Lucide icon="RefreshCw" className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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
                <Lucide icon="Globe" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                All
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
                <LoadingIcon icon="ball-triangle" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">InProgress</span>
                <span className="sm:hidden">Progress</span>
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
                <Lucide icon="Trash2" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                Dropped
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
                  icon="AlertTriangle"
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]"
                />
                Review
              </Tab.Button>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
          <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
            <AllPayIn
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              bankNames={bankNames}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
              setCallBank={setCallBank}
            />
          </Tab.Panel>
          <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
            <CompletedPayIn
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              bankNames={bankNames}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
              setCallBank={setCallBank}
            />
          </Tab.Panel>
          <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
            <InProgressPayIn
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              bankNames={bankNames}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
              setCallBank={setCallBank}
            />
          </Tab.Panel>
          <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
            <DroppedPayIn
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              bankNames={bankNames}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
              setCallBank={setCallBank}
            />
          </Tab.Panel>
          <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
            <ReviewPayIn
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              bankNames={bankNames}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
              setCallBank={setCallBank}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default PayInComponent;
