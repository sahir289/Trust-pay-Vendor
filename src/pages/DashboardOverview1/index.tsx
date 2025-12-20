/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useCallback, useEffect, useState } from 'react';
import { Role } from '@/constants';
import { getAllCalculations } from '@/redux-toolkit/slices/calculations/calcuationsAPI';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { extractChartData, getFormattedCurrentDate } from '@/utils/helper';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import clsx from 'clsx';

dayjs.extend(utc);
dayjs.extend(timezone);

// Normal imports instead of lazy loading
import VendorBoard from '@/pages/DashboardOverview1/VendorBoard/index';
import { getVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSlice';

type DataEntry = {
  date: string;
  amount: number;
  count: number;
};
type NetBalance = {
  merchant?: number;
  vendor?: number;
};
type CalculationData = {
  vendor: any[];
  merchant: any[];
  merchantTotalCalculations: any;
  vendorTotalCalculations: any;
  netBalance: NetBalance;
};

type FilterOption = {
  label: string;
  value: string;
};
type Filter = {
  label: string;
  value: string;
};

type ChartDataState = {
  payinData: DataEntry[];
  payoutData: DataEntry[];
  settlementData: DataEntry[];
  chargebackData: DataEntry[];
  reverseData: DataEntry[];
  payinCommissionData: DataEntry[];
  payoutCommissionData: DataEntry[];
  settlementCommissionData: DataEntry[];
  totalMerchantCommissionData: DataEntry[];
  totalVendorCommissionData: DataEntry[];
  vendorPayinData: DataEntry[];
  vendorPayoutData: DataEntry[];
  vendorSettlementData: DataEntry[];
  vendorSettlementCommissionData: DataEntry[];
  vendorPayinCommissionData: DataEntry[];
  vendorPayoutCommissionData: DataEntry[];
  vendorChargebackData: DataEntry[];
  vendorReverseData: DataEntry[];
};

function Main() {
  const [newTransactionModal, setNewTransactionModal] = useState(false);
  const userData = localStorage.getItem('userData');
  const parsedData = userData ? JSON.parse(userData) : null;
  const userRole = parsedData?.designation;
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

    return 'Merchant'; // Default for ADMIN and others
  });

  const [calculationData, setCalculationData] = useState<CalculationData>({
    vendor: [],
    merchant: [],
    merchantTotalCalculations: {},
    vendorTotalCalculations: {},
    netBalance: {
      merchant: 0,
      vendor: 0,
    },
  });
  const [merchantCodes, setMerchantCodes] = useState<FilterOption[]>([]);
  const [vendorCodes, setVendorCodes] = useState<FilterOption[]>([]);
  const [chartData, setChartData] = useState<ChartDataState>({
    payinData: [],
    payoutData: [],
    settlementData: [],
    chargebackData: [],
    reverseData: [],
    payinCommissionData: [],
    payoutCommissionData: [],
    settlementCommissionData: [], // Add this line
    vendorPayinData: [],
    vendorPayoutData: [],
    vendorSettlementData: [],
    vendorPayoutCommissionData: [],
    totalMerchantCommissionData: [],
    totalVendorCommissionData: [],
    vendorPayinCommissionData: [],
    vendorChargebackData: [],
    vendorReverseData: [],
    vendorSettlementCommissionData: [], // Add this
  });
  const [merchantSelectedFilter, setMerchantSelectedFilter] = useState<
    FilterOption[]
  >([]);
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const [merchantSelectedFilterDates, setMerchantSelectedFilterDates] =
    useState<string>(`${date} - ${date}`);
  const [vendorSelectedFilter, setVendorSelectedFilter] = useState<
    FilterOption[]
  >([]);
  const [vendorSelectedFilterDates, setVendorSelectedFilterDates] =
    useState<string>(`${date} - ${date}`);
  const [isLoading, setIsloading] = useState(false);
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(getTabs);
  const darkMode = useAppSelector(selectDarkMode);
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render

  useEffect(() => {
    if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(userRole)) {
      setTitle(activeTab === 0 ? 'Merchant' : 'Vendor');
    }
  }, [activeTab, userRole]);

  const transactionModal = () => {
    setMerchantSelectedFilter(merchantCodes);
    setVendorSelectedFilter(vendorCodes);
    setVendorSelectedFilterDates(`${date} - ${date}`);
    setMerchantSelectedFilterDates(`${date} - ${date}`);
  };
  useEffect(() => {
    transactionModal();
  }, [merchantCodes, vendorCodes]);

  const handleGetAllCalculations = useCallback(async (params = '') => {
    try {
      const res = await getAllCalculations(params);
      if (!res?.data) {
        throw new Error('No data received');
      }

      setCalculationData({
        vendor: res?.data?.vendor || [],
        merchant: res?.data?.merchant || [],
        merchantTotalCalculations: res?.data?.merchantTotalCalculations || {},
        vendorTotalCalculations: res?.data?.vendorTotalCalculations || {}, // Add this line
        netBalance: res?.data.netBalance || { merchant: 0, vendor: 0 },
      });
      setIsloading(false);

      // Extract merchant data
      const merchantData = res.data?.merchant || [];
      const merchantChartData = extractChartData(merchantData);

      // Extract vendor data
      const vendorData = res.data?.vendor || [];
      const vendorChartData = extractChartData(vendorData);

      // Update chart data state
      setChartData({
        payinData: merchantChartData.payinData,
        payoutData: merchantChartData.payoutData,
        settlementData: merchantChartData.settlementData,
        chargebackData: merchantChartData.chargeBackData || [],
        reverseData: merchantChartData.reversePayoutData || [],
        payinCommissionData: merchantChartData.payinCommissionData || [],
        payoutCommissionData: merchantChartData.payoutCommissionData || [],
        settlementCommissionData:
          merchantChartData.settlementCommissionData || [],
        totalMerchantCommissionData:
          merchantChartData.totalCommissionData || [],
        vendorPayinData: vendorChartData.payinData,
        vendorPayoutData: vendorChartData.payoutData,
        vendorSettlementData: vendorChartData.settlementData,
        vendorPayinCommissionData: vendorChartData.payinCommissionData || [],
        vendorPayoutCommissionData: vendorChartData.payoutCommissionData || [],
        vendorSettlementCommissionData:
          vendorChartData.settlementCommissionData || [],
        totalVendorCommissionData: vendorChartData.totalCommissionData || [],
        vendorChargebackData: vendorChartData.chargeBackData || [],
        vendorReverseData: vendorChartData.reversePayoutData || [],
      });
    } catch {
      // Set empty data on error
      setCalculationData({
        vendor: [],
        merchant: [],
        merchantTotalCalculations: {},
        vendorTotalCalculations: {},
        netBalance: { merchant: 0, vendor: 0 },
      });
      setChartData({
        payinData: [],
        payoutData: [],
        settlementData: [],
        chargebackData: [],
        reverseData: [],
        payinCommissionData: [],
        payoutCommissionData: [],
        settlementCommissionData: [],
        vendorPayinData: [],
        vendorPayoutData: [],
        vendorSettlementData: [],
        totalMerchantCommissionData: [],
        totalVendorCommissionData: [],
        vendorPayinCommissionData: [],
        vendorPayoutCommissionData: [],
        vendorChargebackData: [],
        vendorReverseData: [],
        vendorSettlementCommissionData: [],
      });
    }
  }, []);

  useEffect(() => {
    handleGetAllCalculations();
  }, [handleGetAllCalculations]);

  const handleGetAllMerchantCodes = useCallback(async () => {
    if (
      userRole !== Role.MERCHANT &&
      userRole !== Role.ADMIN &&
      userRole !== Role.MERCHANT_OPERATIONS &&
      userRole !== Role.TRANSACTIONS &&
      userRole !== Role.OPERATIONS &&
      userRole !== Role.SUB_MERCHANT
    ) {
      return;
    }
    let res;
    if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(userRole)) {
      res = await getAllMerchantCodes(false, true);
    } else {
      res = await getAllMerchantCodes();
    }
    setMerchantCodes(
      res.map((el: any) => ({
        label: el.label,
        value: el.value,
      })),
    );
  }, []);

  useEffect(() => {
    handleGetAllMerchantCodes();
  }, [handleGetAllMerchantCodes]);

  const handleGetAllVendorCodes = useCallback(async () => {
    if (
      userRole !== Role.VENDOR &&
      userRole !== Role.ADMIN &&
      userRole !== Role.VENDOR_OPERATIONS &&
      userRole !== Role.TRANSACTIONS &&
      userRole !== Role.OPERATIONS &&
      userRole !== Role.SUB_VENDOR &&
      userRole !== Role.VENDOR_ADMIN
    ) {
      return;
    }
    let res;
    if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(userRole)) {
      res = await getAllVendorCodes(true, true, false, false, true, true);
    } else {
      res = await getAllVendorCodes(true,true,false,false,true);
    }
    const vendorCodesList = res.map((el: any) => ({
      label: el.label,
      value: el.value,
    }));
    setVendorCodes(vendorCodesList);
    dispatch(getVendorCodes(vendorCodesList));
  }, []);

  useEffect(() => {
    handleGetAllVendorCodes();
  }, [handleGetAllVendorCodes]);

  // Reset dates to current date when modal opens
  useEffect(() => {
    if (newTransactionModal) {
      const formattedDate = getFormattedCurrentDate();
      if (title === 'Merchant') {
        setMerchantSelectedFilterDates(formattedDate);
      } else {
        setVendorSelectedFilterDates(formattedDate);
      }
    }
  }, [newTransactionModal, title]);

  //filter data for both vendor and merchant
  const handleFilterData = async () => {
    setIsloading(true);
    const queryParams = new URLSearchParams();
    const filterValues = [
      Role.ADMIN,
      Role.TRANSACTIONS,
      Role.OPERATIONS,
    ].includes(userRole)
      ? activeTab === 0
        ? merchantSelectedFilter.map((filter: Filter) => filter.value).join(',')
        : vendorSelectedFilter.map((filter: Filter) => filter.value).join(',')
      : [
          Role.MERCHANT,
          Role.MERCHANT_ADMIN,
          Role.SUB_MERCHANT,
          Role.MERCHANT_OPERATIONS,
        ].includes(userRole)
      ? merchantSelectedFilter.map((filter: Filter) => filter.value).join(',')
      : vendorSelectedFilter.map((filter: Filter) => filter.value).join(',');

    const selectedFilterDates = [
      Role.ADMIN,
      Role.TRANSACTIONS,
      Role.OPERATIONS,
    ].includes(userRole)
      ? activeTab === 0
        ? merchantSelectedFilterDates
        : vendorSelectedFilterDates
      : [
          Role.MERCHANT,
          Role.MERCHANT_ADMIN,
          Role.SUB_MERCHANT,
          Role.MERCHANT_OPERATIONS,
        ].includes(userRole)
      ? merchantSelectedFilterDates
      : vendorSelectedFilterDates;
    // Fix date parsing
    if (selectedFilterDates) {
      // Split by the whole " - " string (note the spaces)
      const [startStr, endStr] = selectedFilterDates.split(' - ');
      // Parse using the correct format and convert to desired format
      const startDate = dayjs(startStr).format('YYYY-MM-DD');
      const endDate = dayjs(endStr).format('YYYY-MM-DD');
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
    }
    if (filterValues) {
      queryParams.append('users', filterValues);
    }
    handleGetAllCalculations(queryParams.toString());
    setNewTransactionModal(false);
  };

  // Debounced effect for filter changes
  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      if (activeTab !== 2) {
        handleFilterData();
      }
      setIsloading(false);
    }, 1000);

    return () => window.clearTimeout(debounceTimer);
  }, [merchantSelectedFilter, vendorSelectedFilter, activeTab]);

  const getFilterDateRange = (dateRangeStr: string) => {
    const [startDate, endDate] = dateRangeStr.split(' - ');
    return { startDate, endDate };
  };
  const { startDate: vendorStartDate, endDate: vendorEndDate } =
    getFilterDateRange(vendorSelectedFilterDates);
  return (
    <>
      <div className={clsx([
        'relative min-h-screen px-3 sm:px-6 lg:px-10 py-6',
        darkMode 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-slate-100 via-white to-slate-200',
      ])}>
        <div className={clsx([
          'pointer-events-none absolute inset-0',
          darkMode 
            ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.14),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_22%)]'
            : 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.06),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.06),transparent_22%)]',
        ])}></div>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div>
              <div className={clsx([
                'text-xl sm:text-2xl font-semibold drop-shadow',
                darkMode ? 'text-white' : 'text-slate-800',
              ])}>
                Dashboard
              </div>
              <div className={clsx([
                'text-sm',
                darkMode ? 'text-white/60' : 'text-slate-500',
              ])}>
                Vendor overview & stats
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-y-6 gap-x-4 lg:gap-y-10 lg:gap-x-6">
            <div className="col-span-12">
              <div className={clsx([
                'relative rounded-3xl shadow-2xl p-3 sm:p-5',
                darkMode 
                  ? 'bg-white/5 border border-white/10'
                  : 'bg-white/80 border border-slate-200/60',
              ])}>
                <VendorBoard
                  calculationData={calculationData}
                  vendorPayinChartData={chartData.vendorPayinData}
                  ChargebackChartData={chartData.vendorChargebackData}
                  ReverseChartData={chartData.vendorReverseData}
                  vendorPayoutChartData={chartData.vendorPayoutData}
                  payInCommissionData={chartData.vendorPayinCommissionData}
                  payoutCommissionData={chartData.vendorPayoutCommissionData}
                  vendorSettlementChartData={chartData.vendorSettlementData}
                  settlementCommissionData={
                    chartData.vendorSettlementCommissionData
                  }
                  totalVendorCommissionData={chartData.totalVendorCommissionData}
                  vendorSelectedFilterDates={vendorSelectedFilterDates}
                  setVendorSelectedFilterDates={setVendorSelectedFilterDates}
                  vendorSelectedFilter={vendorSelectedFilter}
                  setVendorSelectedFilter={setVendorSelectedFilter}
                  vendorCodes={vendorCodes}
                  handleFilterData={handleFilterData}
                  startDate={vendorStartDate}
                  endDate={vendorEndDate}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
