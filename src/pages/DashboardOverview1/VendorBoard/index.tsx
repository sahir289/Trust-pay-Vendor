/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
// import { Menu } from "@/components/Base/Headless";
import BarChart from '@/components/VerticalBarChart';
import { useEffect, useState } from 'react';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import Litepicker from '@/components/Base/Litepicker';
import { Role } from '@/constants';
// import CustomTooltip from "@/pages/Tooltip/tooltip";
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
  // const vendorCurrentDateCalculation = calculationData?.vendor[0] || {};
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
  // const userDesignation = parsedData?.designation;
  // const currentUserId = parsedData?.user_id || parsedData?.userId;

  // Check if current vendor has sub-vendors by looking in vendorCodes
  // const currentVendorHasSubVendors =
  //   userRole === Role.VENDOR && vendorCodes
  //     ? vendorCodes.some(
  //         (vendor: any) =>
  //           vendor.value === currentUserId &&
  //           (vendor.subvendors?.length > 0 || vendor.subVendors?.length > 0),
  //       )
  //     : false;

  // Chart datasets configuration
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_24%)]"></div>
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
                  className="absolute text-white/60 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
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
                  className="w-full pl-10 rounded-xl bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-theme-1/60 focus:ring-2 focus:ring-theme-1/30 dark:!box"
                />
              </div>
              <button
                onClick={handleFilterData}
                disabled={isLoading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-theme-1 via-theme-2 to-emerald-500 text-white font-semibold shadow-lg shadow-theme-2/30 hover:shadow-theme-2/50 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
            <div className="flex flex-col col-span-12 p-4 sm:p-6 md:col-span-6 rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 border rounded-full border-primary/10 bg-primary/10">
              <Lucide
              icon="Calculator"
              className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary/10"
              />
              </div>
              <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold">
              Calculations
              </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
              {/* Deposits */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/20 p-3 sm:p-4 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
              <Lucide icon="BadgeIndianRupee" className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm text-blue-300/80 font-medium">Deposits</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ₹{totalCalculations?.total_payin_amount || 0}
              </div>
              </div>

              {/* Withdrawals */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-400/20 p-3 sm:p-4 hover:border-orange-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/10 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20">
              <Lucide icon="ArrowRightCircle" className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs sm:text-sm text-orange-300/80 font-medium">Withdrawals</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ₹{totalCalculations?.total_payout_amount || 0}
              </div>
              </div>

              {/* Reverse Withdrawals */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-400/20 p-3 sm:p-4 hover:border-yellow-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/10 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/20">
              <Lucide icon="ArrowRightCircle" className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-xs sm:text-sm text-yellow-300/80 font-medium">Reverse Withdrawals</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ₹{totalCalculations?.total_reverse_payout_amount || 0}
              </div>
              </div>

              {/* Commission */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-400/20 p-3 sm:p-4 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/10 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20">
              <Lucide icon="BadgePercent" className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs sm:text-sm text-purple-300/80 font-medium">Commission</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ₹{totalCommission || 0}
              </div>
              </div>

              {/* Settlements */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-400/20 p-3 sm:p-4 hover:border-indigo-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-400/10 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20">
              <Lucide icon="NotebookText" className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-xs sm:text-sm text-indigo-300/80 font-medium">Settlements</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ₹{totalCalculations?.total_settlement_amount || 0}
              </div>
              </div>

              {/* Chargebacks */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-400/20 p-3 sm:p-4 hover:border-red-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-400/10 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20">
              <Lucide icon="ArrowLeftCircle" className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-xs sm:text-sm text-red-300/80 font-medium">Chargebacks</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ₹{totalCalculations?.total_chargeback_amount || 0}
              </div>
              </div>

              {/* Adjustments */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-400/20 p-3 sm:p-4 hover:border-pink-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-pink-400/10 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/20">
              <Lucide icon="ArrowLeftCircle" className="w-4 h-4 text-pink-400" />
              </div>
              <span className="text-xs sm:text-sm text-pink-300/80 font-medium">Adjustments</span>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ₹{totalCalculations?.total_adjustment_amount || 0}
              </div>
              </div>
            </div>

            {/* Balance Cards - Full Width Single Row Each */}
            <div className="flex flex-col gap-3 sm:gap-4 mt-2">
              {/* Current Balance */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 p-4 sm:p-5">
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-400/10 rounded-full"></div>
              <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/30">
                <Lucide icon="Globe" className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm sm:text-base text-emerald-300 font-semibold">Current Balance</span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400">
              ₹{-1 * (totalCalculations?.current_balance || 0)}
              </div>
              </div>
              </div>

              {/* Net Balance */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border border-cyan-400/30 p-4 sm:p-5">
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-400/10 rounded-full"></div>
              <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/30 border border-cyan-400/30">
                <Lucide icon="Globe" className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm sm:text-base text-cyan-300 font-semibold">Net Balance</span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400">
              ₹{-1 * (calculationData?.netBalance?.vendor || 0).toFixed(2)}
              </div>
              </div>
              </div>
            </div>
            </div>

                    {/* Calculation Chart */}
                    <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl">
            {/* <Menu className="absolute top-0 right-0 mt-5 mr-5">
              <Menu.Button className="w-5 h-5 text-slate-500">
                <Lucide
                  icon="MoreVertical"
                  className="w-6 h-6 stroke-slate-400/70 fill-slate-400/70"
                />
              </Menu.Button>
              <Menu.Items className="w-40">
                <Menu.Item>
                  <Lucide icon="Copy" className="w-4 h-4 mr-2" /> Copy Link
                </Menu.Item>
                <Menu.Item>
                  <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                  Delete
                </Menu.Item>
              </Menu.Items>
            </Menu> */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                <Lucide
                  icon="Calculator"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary/10"
                />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-semibold">
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
            <div className="flex flex-col col-span-12 rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 border rounded-2xl border-white/20 bg-white/10 shrink-0">
                    <Lucide
                      icon="NotebookText"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                      Settlements & Commissions
                    </div>
                    <p className="text-white/60 text-sm">Quick financial snapshot</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mt-6">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4 shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base sm:text-lg font-semibold text-white">
                      Settlements
                    </span>
                  </div>
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full table-auto text-[10px] sm:text-xs md:text-sm text-left text-white/90">
                      <thead className="bg-white/5 text-white">
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
                            className={`${
                              index % 2 === 0
                                ? 'bg-white/5'
                                : 'bg-transparent'
                            } hover:bg-white/10 transition`}
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

                <div className="rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4 shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base sm:text-lg font-semibold text-white">
                      Commissions
                    </span>
                    <span className="text-xs text-white/60">All values in ₹</span>
                  </div>
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full table-auto text-[10px] sm:text-xs md:text-sm text-left text-white/90">
                      <thead className="bg-white/5 text-white">
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
                        <tr className="bg-white/5 hover:bg-white/10">
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
          <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-full border-primary/10 bg-primary/10 shrink-0">
                <Lucide
                  icon="BadgeIndianRupee"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-semibold">
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
          <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-full border-primary/10 bg-primary/10 shrink-0">
                <Lucide
                  icon="ArrowRightCircle"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-semibold">
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
          <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-full border-primary/10 bg-primary/10 shrink-0">
                <Lucide
                  icon="NotebookText"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-semibold">
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
