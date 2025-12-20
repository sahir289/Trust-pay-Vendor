/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import BarChart from '@/components/VerticalBarChart';
import { useEffect, useState } from 'react';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import Litepicker from '@/components/Base/Litepicker';
import { Role } from '@/constants';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import clsx from 'clsx';

function VendorBoard({
  calculationData,
  vendorPayinChartData,
  vendorPayoutChartData,
  ChargebackChartData,
  ReverseChartData,
  payInCommissionData,
  payoutCommissionData,
  totalVendorCommissionData,
  vendorSettlementChartData,
  settlementCommissionData,
  vendorSelectedFilterDates,
  setVendorSelectedFilterDates,
  vendorSelectedFilter,
  setVendorSelectedFilter,
  vendorCodes,
  handleFilterData,
  startDate,
  endDate,
  isLoading,
}: any) {
  const darkMode = useAppSelector(selectDarkMode);
  const [totalCalculations, setTotalCalculations] = useState(
    calculationData?.vendorTotalCalculations || {},
  );
  useEffect(() => {
    if (calculationData?.merchantTotalCalculations) {
      setTotalCalculations(calculationData.vendorTotalCalculations);
    }
  }, [calculationData]);

  const totalCommission = Number(
    (
      (totalCalculations?.total_payin_commission || 0) +
      (totalCalculations?.total_payout_commission || 0) +
      (totalCalculations?.total_reverse_payout_commission || 0) -
      (totalCalculations?.total_settlement_commission || 0)
    ).toFixed(2),
  );

  const userData = localStorage.getItem('userData');
  const parsedData = userData ? JSON.parse(userData) : null;
  const userRole = parsedData?.role;

  const calculationChartDatasets = [
    {
      data: vendorPayinChartData || [],
      label: 'Deposits Amount',
      color: '0, 0, 255', // blue
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 1,
    },
    {
      data: vendorPayoutChartData || [],
      label: 'Withdrawals Amount',
      color: '255, 165, 0', // orange
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 2,
    },
    {
      data: totalVendorCommissionData || [],
      label: 'Commissions Amount',
      color: '128, 0, 128', // purple
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 4,
    },
    {
      data: ChargebackChartData || [],
      label: 'Chargebacks Amount',
      color: '255, 99, 132', // red
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 5,
    },
    {
      data: ReverseChartData || [],
      label: 'Reverse Withdrawals Amount',
      color: '255, 206, 86', // yellow
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 6,
    },
    {
      data: vendorSettlementChartData || [],
      label: 'Settlements Amount',
      color: '153, 102, 255', // purple
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 1,
    },
  ];

  const withdrawalsDatasets = [
    {
      data: vendorPayoutChartData || [],
      label: 'Withdrawals Amount',
      color: '75, 192, 192', // teal
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 1,
    },
    {
      data: payoutCommissionData || [],
      label: 'Withdrawals Commission',
      color: '153, 102, 255', // purple
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 2,
    },
  ];

  const settlementsDatasets = [
    {
      data: vendorSettlementChartData || [],
      label: 'Settlements Amount',
      color: '153, 102, 255', // purple
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 1,
    },
    {
      data: settlementCommissionData || [],
      label: 'Settlements Commission',
      color: '75, 192, 192', // teal
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 2,
    },
  ];

  const depositsDatasets = [
    {
      data: vendorPayinChartData || [],
      label: 'Deposits',
      color: '0, 0, 255', // blue
    },
    {
      data: payInCommissionData || [],
      label: 'Commission',
      color: '153, 102, 255', // purple
    },
  ];

  return (
    <div className={clsx([
      'relative overflow-hidden rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl',
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10'
        : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200',
    ])}>
      <div className={clsx([
        'pointer-events-none absolute inset-0',
        darkMode 
          ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_24%)]'
          : 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.06),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.06),transparent_24%)]',
      ])}></div>
      <div className="relative z-10 grid grid-cols-12 gap-y-6 gap-x-4 lg:gap-y-10 lg:gap-x-6">
        <div className="col-span-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex-1">
              <MultiSelect
                codes={vendorCodes}
                selectedFilter={vendorSelectedFilter}
                setSelectedFilter={setVendorSelectedFilter}
                placeholder="Select Vendor"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Lucide
                  icon="Calendar"
                  className={clsx([
                    'absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]',
                    darkMode ? 'text-white/60' : 'text-slate-400',
                  ])}
                />
                <Litepicker
                  value={vendorSelectedFilterDates}
                  onChange={(e) => setVendorSelectedFilterDates(e.target.value)}
                  enforceRange={false}
                  options={{
                    autoApply: true,
                    singleMode: false,
                    numberOfColumns: 2,
                    numberOfMonths: 2,
                    showWeekNumbers: true,
                    dropdowns: {
                      minYear: 1990,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                    startDate: startDate,
                    endDate: endDate,
                  }}
                  placeholder="Select a date range"
                  className={clsx([
                    'w-full pl-10 rounded-xl border focus:ring-2 focus:ring-theme-1/30',
                    darkMode 
                      ? 'bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-theme-1/60'
                      : 'bg-white text-slate-800 placeholder:text-slate-400 border-slate-200 focus:border-theme-1/60',
                  ])}
                />
              </div>
              <button
                onClick={handleFilterData}
                disabled={isLoading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 col-span-12 gap-4 lg:gap-5 mt-3.5">

          {/* Calculations Box */}
          <div className={clsx([
            'flex flex-col col-span-12 p-4 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-xl',
            darkMode 
              ? 'bg-white/10 border border-white/15'
              : 'bg-white border border-slate-200',
          ])}>
            <div className="flex items-center gap-3 mb-6">
              <div className={clsx([
                'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 border rounded-full',
                darkMode ? 'border-primary/10 bg-primary/10' : 'border-primary/20 bg-primary/10',
              ])}>
                <Lucide
                  icon="Calculator"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary/10"
                />
              </div>
              <div>
                <div className={clsx([
                  'text-xl sm:text-2xl lg:text-3xl font-semibold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  Calculations
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-4">
              {/* Deposits */}
              <div className={clsx([
                'group relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300',
                darkMode 
                  ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/20 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-200/50',
              ])}>
                <div className={clsx([
                  'absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8',
                  darkMode ? 'bg-blue-400/10' : 'bg-blue-200/30',
                ])}></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx([
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    darkMode ? 'bg-blue-500/20' : 'bg-blue-200',
                  ])}>
                    <Lucide icon="BadgeIndianRupee" className={clsx([
                      'w-4 h-4',
                      darkMode ? 'text-blue-400' : 'text-blue-600',
                    ])} />
                  </div>
                  <span className={clsx([
                    'text-xs sm:text-sm font-medium',
                    darkMode ? 'text-blue-300/80' : 'text-blue-700',
                  ])}>Deposits</span>
                </div>
                <div className={clsx([
                  'text-lg sm:text-xl lg:text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  ₹{totalCalculations?.total_payin_amount || 0}
                </div>
              </div>

              {/* Withdrawals */}
              <div className={clsx([
                'group relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300',
                darkMode 
                  ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-400/20 hover:border-orange-400/40 hover:shadow-lg hover:shadow-orange-500/10'
                  : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-200/50',
              ])}>
                <div className={clsx([
                  'absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8',
                  darkMode ? 'bg-orange-400/10' : 'bg-orange-200/30',
                ])}></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx([
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    darkMode ? 'bg-orange-500/20' : 'bg-orange-200',
                  ])}>
                    <Lucide icon="ArrowRightCircle" className={clsx([
                      'w-4 h-4',
                      darkMode ? 'text-orange-400' : 'text-orange-600',
                    ])} />
                  </div>
                  <span className={clsx([
                    'text-xs sm:text-sm font-medium',
                    darkMode ? 'text-orange-300/80' : 'text-orange-700',
                  ])}>Withdrawals</span>
                </div>
                <div className={clsx([
                  'text-lg sm:text-xl lg:text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  ₹{totalCalculations?.total_payout_amount || 0}
                </div>
              </div>

              {/* Reverse Withdrawals */}
              <div className={clsx([
                'group relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300',
                darkMode 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-500/10'
                  : 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-200/50',
              ])}>
                <div className={clsx([
                  'absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8',
                  darkMode ? 'bg-yellow-400/10' : 'bg-yellow-200/30',
                ])}></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx([
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    darkMode ? 'bg-yellow-500/20' : 'bg-yellow-200',
                  ])}>
                    <Lucide icon="ArrowRightCircle" className={clsx([
                      'w-4 h-4',
                      darkMode ? 'text-yellow-400' : 'text-yellow-600',
                    ])} />
                  </div>
                  <span className={clsx([
                    'text-xs sm:text-sm font-medium',
                    darkMode ? 'text-yellow-300/80' : 'text-yellow-700',
                  ])}>Reverse Withdrawals</span>
                </div>
                <div className={clsx([
                  'text-lg sm:text-xl lg:text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  ₹{totalCalculations?.total_reverse_payout_amount || 0}
                </div>
              </div>

              {/* Commission */}
              <div className={clsx([
                'group relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300',
                darkMode 
                  ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-400/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-200/50',
              ])}>
                <div className={clsx([
                  'absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8',
                  darkMode ? 'bg-purple-400/10' : 'bg-purple-200/30',
                ])}></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx([
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    darkMode ? 'bg-purple-500/20' : 'bg-purple-200',
                  ])}>
                    <Lucide icon="BadgePercent" className={clsx([
                      'w-4 h-4',
                      darkMode ? 'text-purple-400' : 'text-purple-600',
                    ])} />
                  </div>
                  <span className={clsx([
                    'text-xs sm:text-sm font-medium',
                    darkMode ? 'text-purple-300/80' : 'text-purple-700',
                  ])}>Commission</span>
                </div>
                <div className={clsx([
                  'text-lg sm:text-xl lg:text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  ₹{totalCommission || 0}
                </div>
              </div>

              {/* Settlements */}
              <div className={clsx([
                'group relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300',
                darkMode 
                  ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-400/20 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10'
                  : 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-200/50',
              ])}>
                <div className={clsx([
                  'absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8',
                  darkMode ? 'bg-indigo-400/10' : 'bg-indigo-200/30',
                ])}></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx([
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    darkMode ? 'bg-indigo-500/20' : 'bg-indigo-200',
                  ])}>
                    <Lucide icon="NotebookText" className={clsx([
                      'w-4 h-4',
                      darkMode ? 'text-indigo-400' : 'text-indigo-600',
                    ])} />
                  </div>
                  <span className={clsx([
                    'text-xs sm:text-sm font-medium',
                    darkMode ? 'text-indigo-300/80' : 'text-indigo-700',
                  ])}>Settlements</span>
                </div>
                <div className={clsx([
                  'text-lg sm:text-xl lg:text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  ₹{totalCalculations?.total_settlement_amount || 0}
                </div>
              </div>

              {/* Chargebacks */}
              <div className={clsx([
                'group relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300',
                darkMode 
                  ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-400/20 hover:border-red-400/40 hover:shadow-lg hover:shadow-red-500/10'
                  : 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-200/50',
              ])}>
                <div className={clsx([
                  'absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8',
                  darkMode ? 'bg-red-400/10' : 'bg-red-200/30',
                ])}></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx([
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    darkMode ? 'bg-red-500/20' : 'bg-red-200',
                  ])}>
                    <Lucide icon="ArrowLeftCircle" className={clsx([
                      'w-4 h-4',
                      darkMode ? 'text-red-400' : 'text-red-600',
                    ])} />
                  </div>
                  <span className={clsx([
                    'text-xs sm:text-sm font-medium',
                    darkMode ? 'text-red-300/80' : 'text-red-700',
                  ])}>Chargebacks</span>
                </div>
                <div className={clsx([
                  'text-lg sm:text-xl lg:text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  ₹{totalCalculations?.total_chargeback_amount || 0}
                </div>
              </div>

              {/* Adjustments */}
              <div className={clsx([
                'group relative overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300 col-span-2 lg:col-span-1',
                darkMode 
                  ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-400/20 hover:border-pink-400/40 hover:shadow-lg hover:shadow-pink-500/10'
                  : 'bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-200/50',
              ])}>
                <div className={clsx([
                  'absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8',
                  darkMode ? 'bg-pink-400/10' : 'bg-pink-200/30',
                ])}></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx([
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    darkMode ? 'bg-pink-500/20' : 'bg-pink-200',
                  ])}>
                    <Lucide icon="ArrowLeftCircle" className={clsx([
                      'w-4 h-4',
                      darkMode ? 'text-pink-400' : 'text-pink-600',
                    ])} />
                  </div>
                  <span className={clsx([
                    'text-xs sm:text-sm font-medium',
                    darkMode ? 'text-pink-300/80' : 'text-pink-700',
                  ])}>Adjustments</span>
                </div>
                <div className={clsx([
                  'text-lg sm:text-xl lg:text-2xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  ₹{totalCalculations?.total_adjustment_amount || 0}
                </div>
              </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2">
              {/* Current Balance */}
              <div className={clsx([
                'relative overflow-hidden rounded-xl p-4 sm:p-5',
                darkMode 
                  ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200',
              ])}>
                <div className={clsx([
                  'absolute -bottom-4 -right-4 w-24 h-24 rounded-full',
                  darkMode ? 'bg-emerald-400/10' : 'bg-emerald-200/50',
                ])}></div>
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx([
                      'flex items-center justify-center w-10 h-10 rounded-xl',
                      darkMode 
                        ? 'bg-emerald-500/30 border border-emerald-400/30'
                        : 'bg-emerald-200 border border-emerald-300',
                    ])}>
                      <Lucide icon="Globe" className={clsx([
                        'w-5 h-5',
                        darkMode ? 'text-emerald-400' : 'text-emerald-600',
                      ])} />
                    </div>
                    <span className={clsx([
                      'text-sm sm:text-base font-semibold',
                      darkMode ? 'text-emerald-300' : 'text-emerald-700',
                    ])}>Current Balance</span>
                  </div>
                  <div className={clsx([
                    'text-2xl sm:text-3xl lg:text-4xl font-bold',
                    darkMode ? 'text-emerald-400' : 'text-emerald-600',
                  ])}>
                    ₹{-1 * (totalCalculations?.current_balance || 0)}
                  </div>
                </div>
              </div>

              {/* Net Balance */}
              <div className={clsx([
                'relative overflow-hidden rounded-xl p-4 sm:p-5',
                darkMode 
                  ? 'bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border border-cyan-400/30'
                  : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200',
              ])}>
                <div className={clsx([
                  'absolute -bottom-4 -right-4 w-24 h-24 rounded-full',
                  darkMode ? 'bg-cyan-400/10' : 'bg-cyan-200/50',
                ])}></div>
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx([
                      'flex items-center justify-center w-10 h-10 rounded-xl',
                      darkMode 
                        ? 'bg-cyan-500/30 border border-cyan-400/30'
                        : 'bg-cyan-200 border border-cyan-300',
                    ])}>
                      <Lucide icon="Globe" className={clsx([
                        'w-5 h-5',
                        darkMode ? 'text-cyan-400' : 'text-cyan-600',
                      ])} />
                    </div>
                    <span className={clsx([
                      'text-sm sm:text-base font-semibold',
                      darkMode ? 'text-cyan-300' : 'text-cyan-700',
                    ])}>Net Balance</span>
                  </div>
                  <div className={clsx([
                    'text-2xl sm:text-3xl lg:text-4xl font-bold',
                    darkMode ? 'text-cyan-400' : 'text-cyan-600',
                  ])}>
                    ₹{-1 * (calculationData?.netBalance?.vendor || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Chart */}
          <div className={clsx([
            'flex flex-col col-span-12 p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-xl',
            darkMode 
              ? 'bg-white/10 border border-white/15'
              : 'bg-white border border-slate-200',
          ])}>
            <div className="flex items-center gap-3">
              <div className={clsx([
                'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 border rounded-full',
                darkMode ? 'border-primary/10 bg-primary/10' : 'border-primary/20 bg-primary/10',
              ])}>
                <Lucide
                  icon="Calculator"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary/10"
                />
              </div>
              <div>
                <div className={clsx([
                  'text-xl sm:text-2xl lg:text-3xl font-semibold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  Calculations
                </div>
              </div>
            </div>
            <div className="relative mt-5 mb-2">
              <BarChart
                height={400}
                className="relative z-10"
                datasets={calculationChartDatasets}
              />
            </div>
          </div>

          {(userRole === Role.ADMIN || userRole === Role.VENDOR) && (
            <div className={clsx([
              'flex flex-col col-span-12 rounded-2xl shadow-2xl backdrop-blur-xl p-4 sm:p-6',
              darkMode 
                ? 'bg-white/10 border border-white/15'
                : 'bg-white border border-slate-200',
            ])}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={clsx([
                    'flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 border rounded-2xl shrink-0',
                    darkMode ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-slate-100',
                  ])}>
                    <Lucide
                      icon="NotebookText"
                      className={clsx([
                        'w-5 h-5 sm:w-6 sm:h-6',
                        darkMode ? 'text-white' : 'text-slate-800',
                      ])}
                    />
                  </div>
                  <div>
                    <div className={clsx([
                      'text-lg sm:text-xl lg:text-2xl font-semibold',
                      darkMode ? 'text-white' : 'text-slate-800',
                    ])}>
                      Settlements & Commissions
                    </div>
                    <p className={clsx([
                      'text-sm',
                      darkMode ? 'text-white/60' : 'text-slate-600',
                    ])}>Quick financial snapshot</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mt-6">
                <div className={clsx([
                  'rounded-2xl p-3 sm:p-4 shadow-inner',
                  darkMode 
                    ? 'border border-white/15 bg-white/5'
                    : 'border border-slate-200 bg-slate-50',
                ])}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={clsx([
                      'text-base sm:text-lg font-semibold',
                      darkMode ? 'text-white' : 'text-slate-800',
                    ])}>
                      Settlements
                    </span>
                  </div>
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className={clsx([
                      'w-full table-auto text-left',
                      darkMode ? 'text-white/90' : 'text-slate-800',
                    ])}>
                      <thead className={clsx([
                        darkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800',
                      ])}>
                        <tr>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold">
                            Type
                          </th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold text-center">
                            Sent
                          </th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold text-center">
                            Received
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            type: 'BANK',
                            sent:
                              totalCalculations?.total_banksentsettlement_amount ||
                              0,
                            received:
                              totalCalculations?.total_bankreceivedsettlement_amount ||
                              0,
                          },
                          {
                            type: 'CASH',
                            sent:
                              totalCalculations?.total_cashsentsettlement_amount ||
                              0,
                            received:
                              totalCalculations?.total_cashreceivedsettlement_amount ||
                              0,
                          },
                          {
                            type: 'AED',
                            sent:
                              totalCalculations?.total_aedsentsettlement_amount ||
                              0,
                            received:
                              totalCalculations?.total_aedreceivedsettlement_amount ||
                              0,
                          },
                          {
                            type: 'CRYPTO',
                            sent:
                              totalCalculations?.total_cryptosentsettlement_amount ||
                              0,
                            received:
                              totalCalculations?.total_cryptoreceivedsettlement_amount ||
                              0,
                          },
                          {
                            type: 'INTERNAL BANK',
                            sent: '0',
                            received:
                              totalCalculations?.total_internalbanksettlement_amount ||
                              0,
                          },
                          {
                            type: 'INTERNAL QR',
                            sent: '0',
                            received:
                              totalCalculations?.total_internalsettlement_amount ||
                              0,
                          },
                        ].map((row, index) => (
                          <tr
                            key={row.type}
                            className={clsx([
                              index % 2 === 0
                                ? darkMode ? 'bg-white/5' : 'bg-slate-100'
                                : 'bg-transparent',
                              'hover:bg-white/10 transition',
                            ])}
                          >
                            <td className="px-1 sm:px-2 md:px-3 py-2 font-medium">
                              {row.type}
                            </td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">
                              ₹ {row.sent}
                            </td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">
                              ₹ {row.received}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={clsx([
                  'rounded-2xl p-3 sm:p-4 shadow-inner',
                  darkMode 
                    ? 'border border-white/15 bg-white/5'
                    : 'border border-slate-200 bg-slate-50',
                ])}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={clsx([
                      'text-base sm:text-lg font-semibold',
                      darkMode ? 'text-white' : 'text-slate-800',
                    ])}>
                      Commissions
                    </span>
                    <span className={clsx([
                      'text-xs',
                      darkMode ? 'text-white/60' : 'text-slate-600',
                    ])}>All values in ₹</span>
                  </div>
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className={clsx([
                      'w-full table-auto text-left',
                      darkMode ? 'text-white/90' : 'text-slate-800',
                    ])}>
                      <thead className={clsx([
                        darkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800',
                      ])}>
                        <tr>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold text-center whitespace-nowrap">
                            Payin
                          </th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold text-center whitespace-nowrap">
                            Payout
                          </th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold text-center whitespace-nowrap">
                            Reversed
                          </th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold text-center whitespace-nowrap">
                            Settlements
                          </th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 font-semibold text-center whitespace-nowrap">
                            Adjustments
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={clsx([
                          darkMode ? 'bg-white/5' : 'bg-slate-100',
                          'hover:bg-white/10',
                        ])}>
                          <td className="px-1 sm:px-2 md:px-3 py-2 text-center font-semibold whitespace-nowrap">
                            ₹ {totalCalculations?.total_payin_commission || 0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-3 py-2 text-center font-semibold whitespace-nowrap">
                            ₹ {totalCalculations?.total_payout_commission || 0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-3 py-2 text-center font-semibold whitespace-nowrap">
                            ₹{' '}
                            {totalCalculations?.total_reverse_payout_commission ||
                              0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-3 py-2 text-center font-semibold whitespace-nowrap">
                            ₹{' '}
                            {totalCalculations?.total_settlement_commission ||
                              0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-3 py-2 text-center font-semibold whitespace-nowrap">
                            ₹{' '}
                            {totalCalculations?.total_adjustment_commission ||
                              0}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deposits Chart */}
          <div className={clsx([
            'flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 rounded-2xl shadow-2xl backdrop-blur-xl',
            darkMode 
              ? 'bg-white/10 border border-white/15'
              : 'bg-white border border-slate-200',
          ])}>
            <div className="flex items-center gap-3">
              <div className={clsx([
                'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 border rounded-full',
                darkMode ? 'border-primary/10 bg-primary/10' : 'border-primary/20 bg-primary/10',
              ])}>
                <Lucide
                  icon="BadgeIndianRupee"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                />
              </div>
              <div>
                <div className={clsx([
                  'text-xl sm:text-2xl lg:text-3xl font-semibold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  Deposits
                </div>
              </div>
            </div>
            <div className="relative mt-5 mb-2">
              <BarChart
                height={350}
                className="relative z-10 chart-container"
                datasets={depositsDatasets}
              />
            </div>
          </div>

          {/* Withdrawals Chart */}
          <div className={clsx([
            'flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 rounded-2xl shadow-2xl backdrop-blur-xl',
            darkMode 
              ? 'bg-white/10 border border-white/15'
              : 'bg-white border border-slate-200',
          ])}>
            <div className="flex items-center gap-3">
              <div className={clsx([
                'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 border rounded-full',
                darkMode ? 'border-primary/10 bg-primary/10' : 'border-primary/20 bg-primary/10',
              ])}>
                <Lucide
                  icon="ArrowRightCircle"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                />
              </div>
              <div>
                <div className={clsx([
                  'text-xl sm:text-2xl lg:text-3xl font-semibold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  Withdrawals
                </div>
              </div>
            </div>
            <div className="relative mt-5 mb-2">
              <BarChart
                height={350}
                className="relative z-10 chart-container"
                datasets={withdrawalsDatasets}
              />
            </div>
          </div>

          {/* Settlements Chart */}
          <div className={clsx([
            'flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 rounded-2xl shadow-2xl backdrop-blur-xl',
            darkMode 
              ? 'bg-white/10 border border-white/15'
              : 'bg-white border border-slate-200',
          ])}>
            <div className="flex items-center gap-3">
              <div className={clsx([
                'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 border rounded-full',
                darkMode ? 'border-primary/10 bg-primary/10' : 'border-primary/20 bg-primary/10',
              ])}>
                <Lucide
                  icon="NotebookText"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                />
              </div>
              <div>
                <div className={clsx([
                  'text-xl sm:text-2xl lg:text-3xl font-semibold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  Settlements
                </div>
              </div>
            </div>
            <div className="relative mt-5 mb-2">
              <BarChart
                height={350}
                className="relative z-10 chart-container"
                datasets={settlementsDatasets}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorBoard;
