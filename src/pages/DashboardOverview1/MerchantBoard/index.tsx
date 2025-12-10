/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Lucide from '@/components/Base/Lucide';
// import { Menu } from '@/components/Base/Headless';
import BarChart from '@/components/VerticalBarChart';
import { useEffect, useState } from 'react';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import Litepicker from '@/components/Base/Litepicker';
import { Role } from '@/constants';
function MerchantBoard({
  calculationData,
  payinChartData,
  ChargebackChartData,
  ReverseChartData,
  payoutChartData,
  payInCommissionData,
  payoutCommissionData,
  totalMerchantCommissionData,
  settlementChartData,
  settlementCommissionData,
  merchantSelectedFilterDates,
  setMerchantSelectedFilterDates,
  merchantSelectedFilter,
  setMerchantSelectedFilter,
  merchantCodes,
  handleFilterData,
  startDate,
  endDate,
  isLoading,
}: any) {
  const [totalCalculations, setTotalCalculations] = useState(
    calculationData?.merchantTotalCalculations || {},
  );
  useEffect(() => {
    if (calculationData?.merchantTotalCalculations) {
      setTotalCalculations(calculationData.merchantTotalCalculations);
    }
  }, [calculationData]);
  const totalCommission = Number(
    (
      (totalCalculations?.total_payin_commission || 0) +
      (totalCalculations?.total_payout_commission || 0) +
      (totalCalculations?.total_reverse_payout_commission || 0)
    ).toFixed(2),
  );

  const userData = localStorage.getItem('userData');
  const parsedData = userData ? JSON.parse(userData) : null;
  const userRole = parsedData?.role;
  const calculationChartDatasets = [
    {
      data: payinChartData || [],
      label: 'Deposits Amount',
      color: '0, 0, 255', // blue
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 1,
    },
    {
      data: payoutChartData || [],
      label: 'Withdrawals Amount',
      color: '255, 165, 0', // orange
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 2,
    },
    {
      data: totalMerchantCommissionData || [],
      label: 'Commissions Amount',
      color: '128, 0, 128', // purple
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 4,
    },
    {
      data: ReverseChartData || [],
      label: 'Reverse Amount',
      color: '255, 99, 772', // red
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 5,
    },
    {
      data: settlementChartData || [],
      label: 'Settlements Amount',
      color: '255, 99, 132', // red
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 5,
    },
    {
      data: ChargebackChartData || [],
      label: 'Chargebacks Amount',
      color: '153, 102, 255', // yellow
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 7,
    },
  ];

  const withdrawalsDatasets = [
    {
      data: payoutChartData || [],
      label: 'Withdrawals',
      color: '75, 192, 192', // teal
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 1,
    },
    {
      data: payoutCommissionData || [],
      label: 'Commission',
      color: '153, 102, 255', // purple
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      order: 2,
    },
  ];

  const settlementsDatasets = [
    {
      data: settlementChartData || [],
      label: 'Settlements',
      color: '153, 102, 255', // purple
    },
    {
      data: settlementCommissionData || [],
      label: 'Commission',
      color: '75, 192, 192', // teal
    },
  ];

  const depositsDatasets = [
    {
      data: payinChartData || [],
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
    <div className="grid grid-cols-12 gap-y-6 gap-x-4 lg:gap-y-10 lg:gap-x-6">
      <div className="col-span-12">
        {/* Date Picker + Apply Button in one row */}

        {/* MultiSelect in separate row */}
        <div className="my-2 py-2 flex flex-col justify-center">
          <div className="col-span-12 sm:col-span-6 mx-0 sm:mx-2 mt-2">
            <MultiSelect
              codes={merchantCodes}
              selectedFilter={merchantSelectedFilter}
              setSelectedFilter={setMerchantSelectedFilter}
              placeholder="Select Merchant"
            />
          </div>
        </div>
        <div className="flex justify-between items-end gap-2 sm:gap-3 flex-wrap sm:flex-nowrap mb-4">
          {/* Date Picker */}
          <div className="relative w-full sm:w-1/2">
            <Lucide
              icon="Calendar"
              className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
            />
            <Litepicker
              value={merchantSelectedFilterDates}
              onChange={(e) => setMerchantSelectedFilterDates(e.target.value)}
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
              className="w-full pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-500 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
            />
          </div>

          {/* Apply Button right next to Date Picker */}
          <button
            onClick={handleFilterData}
            disabled={isLoading}
            className="px-4 m-2 bg-primary text-white h-8 rounded-lg w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
        <div className="grid grid-cols-12 gap-4 lg:gap-5 mt-3.5">
          {/* Calculation Chart */}
          {userRole === Role.ADMIN && (
            <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 box box--stacked">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-full border-primary/10 bg-primary/10 shrink-0">
                  <Lucide
                    icon="NotebookText"
                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                  />
                </div>
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-semibold">
                    Settlements & Commissions
                  </div>
                </div>
              </div>
              <div className="relative mt-4 sm:mt-6 mb-6">
                {/* Settlements Table */}
                <fieldset className="border border-primary/10 rounded-lg p-3 sm:p-4 bg-primary/5">
                  <legend className="px-2 sm:px-3 py-1 text-base sm:text-lg lg:text-xl font-semibold text-primary">
                    Settlements
                  </legend>
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full table-auto text-[10px] sm:text-xs md:text-sm text-left text-slate-700 dark:text-slate-300">
                      <thead className="bg-primary/10">
                        <tr>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm">
                            Type
                          </th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm text-center">
                            Sent
                          </th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm text-center">
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
                        ].map((row, index) => (
                          <tr
                            key={row.type}
                            className={`${
                              index % 2 === 0
                                ? 'bg-primary/5'
                                : 'bg-transparent'
                            } hover:bg-primary/10`}
                          >
                            <td className="px-1 sm:px-2 md:px-4 py-2 font-medium">
                              {row.type}
                            </td>
                            <td className="px-1 sm:px-2 md:px-4 py-2 text-center">
                              ₹ {row.sent}
                            </td>
                            <td className="px-1 sm:px-2 md:px-4 py-2 text-center">
                              ₹ {row.received}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </fieldset>
                {/* Commissions Table */}
                <fieldset className="border border-primary/10 rounded-lg p-3 sm:p-4 mt-4 bg-primary/5">
                  <legend className="px-2 sm:px-3 py-1 text-base sm:text-lg lg:text-xl font-semibold text-primary">
                    Commissions
                  </legend>
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full table-auto text-[10px] sm:text-xs md:text-sm text-left text-slate-700 dark:text-slate-300">
                      <thead className="bg-primary/10">
                        <tr>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                            Payin
                          </th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                            Payout
                          </th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                            Reversed
                          </th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                            Settlements
                          </th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 font-semibold text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap">
                            Adjustments
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-primary/5 hover:bg-primary/10">
                          <td className="px-1 sm:px-2 md:px-4 py-2 text-center font-normal whitespace-nowrap">
                            ₹ {totalCalculations?.total_payin_commission || 0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 text-center font-normal whitespace-nowrap">
                            ₹ {totalCalculations?.total_payout_commission || 0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 text-center font-normal whitespace-nowrap">
                            ₹{' '}
                            {totalCalculations?.total_reverse_payout_commission ||
                              0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 text-center font-normal whitespace-nowrap">
                            ₹{' '}
                            {totalCalculations?.total_settlement_commission ||
                              0}
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 text-center font-normal whitespace-nowrap">
                            ₹{' '}
                            {totalCalculations?.total_adjustment_commission ||
                              0}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </fieldset>
              </div>
            </div>
          )}
          {/* Calculations Box */}
          <div className="flex flex-col col-span-12 p-3 sm:p-4 md:p-5 md:col-span-6 box box--stacked">
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
            <div className="justify-center gap-y-3 gap-x-5 mt-4">
              <fieldset className="border-2 rounded-lg border-gray-200 my-2">
                <legend className="ml-3 sm:ml-4 pt-1 px-2 text-sm sm:text-base">
                  Entries
                </legend>
                <div className="flex items-center justify-between mx-2 mb-2 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                      <Lucide
                        icon="BadgeIndianRupee"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary/10"
                      />
                    </div>
                    <div className="ml-2 sm:ml-2.5 text-sm sm:text-base truncate">
                      Deposits
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-medium whitespace-nowrap">
                    ₹{totalCalculations?.total_payin_amount || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between mx-2 mt-2 mb-2 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                      <Lucide
                        icon="ArrowRightCircle"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary/10"
                      />
                    </div>
                    <div className="ml-2 sm:ml-2.5 text-sm sm:text-base truncate">
                      Withdrawals
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-medium whitespace-nowrap">
                    ₹{totalCalculations?.total_payout_amount || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between mx-2 mt-2 mb-2 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                      <Lucide
                        icon="ArrowRightCircle"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary/10"
                      />
                    </div>
                    <div className="ml-2 sm:ml-2.5 text-sm sm:text-base truncate">
                      Reverse Withdrawals
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-medium whitespace-nowrap">
                    ₹{totalCalculations?.total_reverse_payout_amount || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between mx-2 mt-2 mb-2 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                      <Lucide
                        icon="BadgePercent"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary/10"
                      />
                    </div>
                    <div className="ml-2 sm:ml-2.5 text-sm sm:text-base truncate">
                      Commission
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-medium whitespace-nowrap">
                    ₹{totalCommission}
                  </div>
                </div>
                <div className="flex items-center justify-between mx-2 mt-2 mb-2 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                      <Lucide
                        icon="NotebookText"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary/10"
                      />
                    </div>
                    <div className="ml-2 sm:ml-2.5 text-sm sm:text-base truncate">
                      Settlements
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-medium whitespace-nowrap">
                    ₹{totalCalculations?.total_settlement_amount || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between mx-2 mt-2 mb-2 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                      <Lucide
                        icon="ArrowLeftCircle"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary/10"
                      />
                    </div>
                    <div className="ml-2 sm:ml-2.5 text-sm sm:text-base truncate">
                      ChargeBacks
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-medium whitespace-nowrap">
                    ₹{totalCalculations?.total_chargeback_amount || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between mx-2 mt-2 mb-2 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 border rounded-full border-primary/10 bg-primary/10">
                      <Lucide
                        icon="ArrowLeftCircle"
                        className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary/10"
                      />
                    </div>
                    <div className="ml-2 sm:ml-2.5 text-sm sm:text-base truncate">
                      Adjustments
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-medium whitespace-nowrap">
                    ₹
                    {totalCalculations?.total_adjustment_amount || 0}
                  </div>
                </div>
              </fieldset>
              <fieldset className="border-2 rounded-lg border-success/30 sm:border-gray-200 my-2 sm:my-3 bg-success/5 sm:bg-success/5">
                <legend className="ml-3 sm:ml-4 pt-1 px-2 sm:px-3 text-success sm:text-success font-semibold text-xs sm:text-sm">
                  Current Balance
                </legend>
                <div className="flex items-center justify-between mx-2 sm:mx-3 my-3 sm:my-4 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border rounded-full border-success/20 sm:border-success/20 bg-success/10 sm:bg-success/10 shrink-0">
                      <Lucide
                        icon="Globe"
                        className="w-5 h-5 sm:w-6 sm:h-6 text-success sm:text-success"
                      />
                    </div>
                    <div className="hidden sm:block text-lg sm:text-xl font-semibold text-success truncate">
                      Current Balance
                    </div>
                  </div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold text-success sm:text-success break-all sm:break-normal text-right sm:whitespace-nowrap">
                    ₹{totalCalculations?.current_balance || 0}
                  </div>
                </div>
              </fieldset>
              <fieldset className="border-2 rounded-lg border-info/30 my-2 bg-info/5">
                <legend className="ml-3 sm:ml-4 pt-1 px-2 sm:px-3 text-info font-semibold text-xs sm:text-sm">
                  Net Balance
                </legend>
                <div className="flex items-center justify-between mx-2 sm:mx-3 my-3 sm:my-4 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border rounded-full border-info/20 bg-info/10 shrink-0">
                      <Lucide
                        icon="Globe"
                        className="w-5 h-5 sm:w-6 sm:h-6 text-info"
                      />
                    </div>
                  </div>
                  <div className="text-base sm:text-xl md:text-2xl font-bold text-info break-all text-right">
                    ₹
                    {calculationData?.netBalance?.merchant?.toFixed(2) ||
                      totalCalculations?.net_balance?.toFixed(2) ||
                      0}
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          {/* Calculation Chart */}
          <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 box box--stacked">
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
          {/* Deposits Chart */}
          <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 box box--stacked">
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
          <div className="flex flex-col col-span-12 p-4 sm:p-5 md:col-span-6 box box--stacked">
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
          <div className="flex flex-col col-span-12 p-5 md:col-span-6 box box--stacked">
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

export default MerchantBoard;
