/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import React, { useEffect, useState } from 'react';
import Modal from '@/components/Modal/modals';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import LineChart from '@/components/LineChart';
import Litepicker from '@/components/Base/Litepicker';
import CustomTooltip from '@/pages/Tooltip/tooltip';
import { FormLabel } from '@/components/Base/Form';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  getAllMerchantsSuccessRate,
  getClaimCalculations
} from '@/redux-toolkit/slices/calculations/calcuationsAPI';
import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSelectors';

dayjs.extend(utc);
dayjs.extend(timezone);

interface MerchantBoardProps {
  merchantCodes: Array<{ label: string; value: string }>;
}

function MiscellaneousBoard({ merchantCodes }: MerchantBoardProps) {
  const [merchantSuccessRate, setMerchantSuccessRate] = useState<any[]>([]);
  const [claims, setClaims] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedMerchants, setSelectedMerchants] = useState<any[]>([]);

  const [banks, setBanks] = useState<Array<{ label: string; value: string }>>([]);
  const vendorCodeOptions = useAppSelector(selectAllVendorCodes);

  // Filters
  const [filterModal, setFilterModal] = useState(false);
  const [claimFilterModal, setClaimFilterModal] = useState(false);
  // Set default date range to today
  const today = dayjs().format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState(`${today} - ${today}`);
  const [selectedFilter, setSelectedFilter] = useState<any[]>([]);
  const [selectedFilterVendor, setSelectedFilterVendor] = useState<any[]>([]);

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getSuccessRate = async () => {
    const payload = {
      user_ids: selectedMerchants.map(m => m.value),
      date: selectedDate
    };
    const response = await getAllMerchantsSuccessRate(payload);
    if (response) {
      setMerchantSuccessRate(response?.data?.successRatios);
    }
  };

  const fetchBanks = async () => {
    try {
      // Pass only the array of values, not the whole objects
      const vendorUserIds = selectedFilterVendor.map((v: any) => v.value);
      const queryParams = new URLSearchParams();
      vendorUserIds.forEach(id => queryParams.append('user', id));
      const queryString = queryParams.toString(); 
      const response = await getAllBankNames('PayIn', queryString);
      if (response) {
        setBanks(response.bankNames);
      }
    } catch {
      // Handle error silently
    }
  };

  const getClaim = async (queryParams?: URLSearchParams) => {
    const response = await getClaimCalculations(queryParams?.toString() || '');
    if (response) {
      setClaims(response.data);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [selectedFilterVendor]);

  useEffect(() => {
    fetchBanks();
    getClaim();
  }, []);

  const handleFilterModal = () => {
    setFilterModal(!filterModal);
  };

  const handleFilterData = async () => {
    await getSuccessRate();
    setFilterModal(false);
  };


  const handleFilterSubmit = async (data: any) => {
    const queryParams = new URLSearchParams();
  
    data.banks.forEach((m: any) => queryParams.append('bank_ids', m.value));
    data.vendors.forEach((v: any) => queryParams.append('vendors', v.value));
  
    const [startDate, endDate] = data.date.split(' - ');
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
    await getClaim(queryParams); // ✅ Now it matches the expected type
    setClaimFilterModal(false);
  };

  const renderChart = () => {
    if (!selectedMerchants || selectedMerchants.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] text-lg text-slate-500">
          Please select merchants to show success ratios
        </div>
      );
    }

    return (
      <LineChart 
        height={400} 
        className="relative z-10" 
        datasets={merchantSuccessRate}
        options={{
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Success Ratio (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time Interval'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const merchant = merchantSuccessRate[context.datasetIndex];
                  const stat = merchant.stats[context.dataIndex];
                  return [
                    `${merchant.merchantCode}:`,
                    `Success Ratio: ${stat.successRatio}%`,
                    `Total Transactions: ${stat.total}`,
                    `Successful: ${stat.success}`,
                    `UTR Submitted: ${stat.utrSubmitted}`,
                    `UTR Ratio: ${stat.utrRatio}%`
                  ];
                }
              }
            }
          }
        }}
      />
    );
  };

  return (
    <div className="p-4">
      {/* Export Modal */}
      <div className="flex justify-end mb-4 gap-2">
      <Modal
        handleModal={() => {
          setClaimFilterModal(prev => !prev);
          setSelectedFilter([]);
          setSelectedFilterVendor([]);
          // setSelectedFilterDates('');
        }}
        forOpen={claimFilterModal}
        title="Claims Filter"
        buttonTitle="Claims Filter"
      >
        <div className="py-2 mb-4">
          <Litepicker
            value={selectedFilterDates}
            onChange={e => setSelectedFilterDates(e.target.value)}
            enforceRange
            options={{
              autoApply: false,
              singleMode: false,
              numberOfMonths: 1,
              numberOfColumns: 1,
              showWeekNumbers: true,
              startDate: selectedFilterDates?.split(' - ')[0] || today,
              endDate: selectedFilterDates?.split(' - ')[1] || today,
              dropdowns: { minYear: 1990, maxYear: null, months: true, years: true }
            }}
            className="w-full pl-9"
          />
        </div>

        <div className="flex flex-col justify-center">
        <MultiSelect
            codes={vendorCodeOptions}
            selectedFilter={selectedFilterVendor}
            setSelectedFilter={(val: Array<{ label: string; value: string }>) => {
              setSelectedFilterVendor(val);
              // if (val.length > 0) setSelectedFilter([]);
            }}
            placeholder="Select Vendor Codes ..."
            disabled={selectedFilter.length > 0}
          />
          <MultiSelect
            codes={banks}
            selectedFilter={selectedFilter}
            setSelectedFilter={(val: Array<{ label: string; value: string }>) => {
              setSelectedFilter(val);
              // if (val.length > 0) setSelectedFilterVendor([]);
            }}
            placeholder="Select Banks ..."
            disabled={selectedFilterVendor.length > 0}
          />
          {/* <div className="p-2 text-center">OR</div> */}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 w-35 my-2 bg-primary text-white h-10 rounded-lg ml-auto"
            // disabled={!selectedFilterDates || (!selectedFilter.length && !selectedFilterVendor.length)}
            onClick={() => handleFilterSubmit({
              date: selectedFilterDates,
              banks: selectedFilter,
              vendors: selectedFilterVendor
            })}
          >
            Apply Filters
          </button>
        </div>
      </Modal>
      </div>
      {/* Claim Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 mt-4">
        {/* Claimed */}
        <div className="box border border-dashed p-4">
          <div className="text-slate-500">Claim Amount</div>
          <div className="text-xl font-semibold">{claims?.claimed24h?.amount}</div>
          <div className="text-success text-sm mt-2">
            Count: {claims?.claimed24h?.count}
          </div>
        </div>

        {/* Unclaimed */}
        <div className="box border border-dashed p-4">
          <div className="text-slate-500">Unclaim Amount</div>
          <div className="text-xl font-semibold">{claims?.unclaimed24h?.amount}</div>
          <div className="text-danger text-sm mt-2">
            Count: {claims?.unclaimed24h?.count}
          </div>
        </div>

        {/* Total Unclaimed */}
        <div className="box border border-dashed p-4">
          <div className="flex items-center">
            <span className="text-slate-500">Total Unclaimed Amount</span>
            <CustomTooltip
              content={
                <div className="text-sm">
                  <div className="font-bold mb-2">Banks Unclaimed Amount</div>
                  {claims.banks_unclaims_amount?.sort((a: any, b: any) => a.nick_name.localeCompare(b.nick_name)).map((bank: any) => (
                    <div key={bank.bank_id}>
                      {bank.nick_name}: {bank.amount}
                    </div>
                  ))}
                </div>
              }
            >
              <Lucide icon="Info" className="ml-2 w-4 h-4 text-slate-500 cursor-pointer" />
            </CustomTooltip>
          </div>
          <div className="text-xl font-semibold mt-2">
            {claims?.totalUnclaimed?.amount}
          </div>
          <div className="text-danger text-sm mt-2">
            Count: {claims?.totalUnclaimed?.count}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="box p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 border rounded-full border-primary/10 bg-primary/10">
            <Lucide icon="LineChart" className="w-6 h-6 text-primary" />
          </div>
          <div className="ml-4 text-2xl font-semibold">Success Ratio</div>
        </div>
        {/* Move the filter button here, just above the chart */}
        <div className="flex justify-end mb-4">
          <Modal
            handleModal={handleFilterModal}
            forOpen={filterModal}
            title="Filter Data"
            buttonTitle="Filter"
          >
            <div className="py-2 my-2" onClick={stopPropagation}>
              <div className="relative mb-4">
                <FormLabel htmlFor="modal-form-1">Select Merchants</FormLabel>
                <div onClick={stopPropagation}>
                  <MultiSelect
                    codes={merchantCodes}
                    selectedFilter={selectedMerchants}
                    setSelectedFilter={setSelectedMerchants}
                  />
                </div>
              </div>
              <div className="relative">
                <Lucide
                  icon="Calendar"
                  className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
                />
                <Litepicker
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                  }}
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
                    startDate: selectedFilterDates?.split(' - ')[0] || selectedDate,
                    endDate: selectedFilterDates?.split(' - ')[1] || selectedDate,
                  }}
                  placeholder="Select a date"
                  className="w-full pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFilterData}
                className="px-4 w-35 my-2 bg-primary text-white h-10 rounded-lg ml-auto"
              >
                Apply
              </button>
            </div>
          </Modal>
        </div>
        {renderChart()}
      </div>
    </div>
  );
}

export default MiscellaneousBoard;