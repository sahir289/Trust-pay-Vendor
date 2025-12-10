/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import Lucide from '@/components/Base/Lucide';
import { Menu, Popover } from '@/components/Base/Headless';
import { FormInput, FormSelect } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import CustomTable from '../../../components/TableComponent/CommonTable';
import { Columns, Role, Status } from '@/constants';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import {
  getAllPayOutData,
  getRefreshPayOut,
  getIsLoadPayOut,
} from '@/redux-toolkit/slices/payout/payoutSelectors';
import {
  getPayOuts,
  onload,
  setRefreshPayOut,
  getTotalCount,
  setIsloadingPayOutEntries,
} from '@/redux-toolkit/slices/payout/payoutSlice';
import {getAllPayOuts} from '@/redux-toolkit/slices/payout/payoutAPI';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import { updatePayIns } from '@/redux-toolkit/slices/payin/payinAPI';
import LoadingIcon from '@/components/Base/LoadingIcon';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import { getPayOutReportSlice } from '@/redux-toolkit/slices/reports/reportSlice';
import { downloadCSV } from '@/components/ExportComponent';
import { getSelectedPayoutReport } from '@/redux-toolkit/slices/reports/reportAPI';
import { selectPayoutReports } from '@/redux-toolkit/slices/reports/reportSelectors';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import Litepicker from '@/components/Base/Litepicker';
import Modal from '@/components/Modal/modals';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

dayjs.extend(utc);
dayjs.extend(timezone);

interface AllPayOutProps {
  vendorCodes: { label: string; value: string }[];
  merchantCodes: { label: string; value: string }[];
  merchantCodesData: { label: string; value: string }[];
  setCallMerchant: React.Dispatch<React.SetStateAction<boolean>>;
  setCallVendor: React.Dispatch<React.SetStateAction<boolean>>;}


const RejectedPayOut: React.FC<AllPayOutProps> = ({
  vendorCodes,
  merchantCodes,
  merchantCodesData,
  setCallMerchant,
  setCallVendor,
}) => {
  const pagination = useAppSelector(getPaginationData);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${date} - ${date}`,
  );
  const allPayoutReports = useAppSelector(selectPayoutReports);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  const [selectedFilterVendor, setSelectedFilterVendor] = useState<string[]>(
    [],
  );
  const [selectedFilterData, setSelectedFilterData] = useState<any>();
  const isLoad = useAppSelector(getIsLoadPayOut);
  const isFetching = useRef(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [utrId, setUtrId] = useState<string>('');
  const [merchantOrderId, setMerchantOrderId] = useState<string>('');
  const [nickName, setNickName] = useState<string>('');
  const [debouncedUtrId, setDebouncedUtrId] = useState<string>('');
  const [debouncedMerchantOrderId, setDebouncedMerchantOrderId] = useState<string>('');
  const [debouncedNickName, setDebouncedNickName] = useState<string>('');
  const [isReset, setIsReset] = useState(false);

  const dispatch = useAppDispatch();

  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';
  const data = localStorage.getItem('userData');
  let includeMerchants = false;
  let includeVendors = false;

  type RoleType = 'ADMIN' | 'MERCHANT' | 'VENDOR'; // Define RoleType if not imported
  let role: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
    includeMerchants =
      role === Role.MERCHANT ||
      role === Role.ADMIN ||
      role === Role.MERCHANT_OPERATIONS ||
      role === Role.SUB_MERCHANT;
    includeVendors =
      role === Role.VENDOR ||
      role === Role.ADMIN ||
      role === Role.VENDOR_OPERATIONS;
  }

  const handleDownload = async (type: string) => {
    setSelectedFilter([]);
    const [startDate, endDate] = selectedFilterDates.split(' - ');
    const isEmpty = (arr: any[]) => !arr || !arr.length;

    const isMerchantRole = [
      Role.MERCHANT,
      Role.MERCHANT_ADMIN,
      Role.SUB_MERCHANT,
      Role.MERCHANT_OPERATIONS,
    ].includes(role || '');
    if (role === Role.ADMIN) {
      if (
        (isEmpty(selectedFilter) || isEmpty(selectedFilterVendor)) &&
        !selectedFilterDates
      ) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `Please select both merchant/vendor and date range.`,
          }),
        );
        return;
      }
    } else if (isMerchantRole) {
      if (isEmpty(selectedFilter) || !selectedFilterDates) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `Please select both merchant and date range.`,
          }),
        );
        return;
      }
    } else {
      if (isEmpty(selectedFilterVendor) || !selectedFilterDates) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `Please select both vendor and date range.`,
          }),
        );
        return;
      }
    }

    const isMerchantExport = selectedFilter.length > 0;
    const selectedCodes = isMerchantExport
      ? selectedFilter.map((code: any) => code.value).join(',')
      : selectedFilterVendor.map((code: any) => code.value).join(',');

    const selectedPayoutReports = await getSelectedPayoutReport(
      selectedCodes,
      startDate,
      endDate,
      ['REJECTED', 'REVERSED'],
    );

    if (!selectedPayoutReports.length) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: `No payouts found for the selected criteria.`,
        }),
      );
      return;
    }
    dispatch(
      getPayOutReportSlice([...allPayoutReports, ...selectedPayoutReports]),
    );

    if (selectedPayoutReports.length > 0) {
      const fieldMappings = {
        sno: 'SNO',
        merchant_details: 'Merchant Code',
        merchant_order_id: 'Merchant Order ID',
        utr_id: 'UTR',
        amount: 'Requested Amount',
        status: 'Status',
        nick_name: 'From Bank',
        vendor_code: 'Vendor Code',
        updated_at: 'Updated At',
        created_at: 'Created At',
        approved_at: 'Approved At',
        rejected_at: 'Rejected At',
      };

      const filteredData = selectedPayoutReports.map((item: any) => {
        const result: Record<string, any> = {};
        result[fieldMappings.sno] = item.sno || '';
        if (includeMerchants) {
          result[fieldMappings.merchant_details] =
            item.merchant_details?.merchant_code || '';
          result[fieldMappings.merchant_order_id] =
            item.merchant_order_id || '';
        }
        // result[fieldMappings.payout_id] = item.payout_id;
        (result[fieldMappings.amount] = item.amount || '0'),
          (result[fieldMappings.status] = item.status || ''),
          (result[fieldMappings.utr_id] = item.utr_id || '');
        if (includeVendors) {
          result[fieldMappings.vendor_code] = item.vendor_code || '';
          result[fieldMappings.nick_name] = item.nick_name || '';
        }
        result[fieldMappings.created_at] = dayjs(item.created_at)
          .tz('Asia/Kolkata')
          .format('DD-MM-YYYY h:mm:ss A');
        result[fieldMappings.updated_at] = dayjs(item.updated_at)
          .tz('Asia/Kolkata')
          .format('DD-MM-YYYY h:mm:ss A');

        return result;
      });

      downloadCSV(
        filteredData,
        type as ExportFormat,
        `rejected-payout-report_${startDate}_to_${endDate}`,
      );
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: `Completed payouts exported successfully as ${type}`,
        }),
      );
      setExportModalOpen(false);
    }
  };

  const refreshPayOut = useAppSelector(getRefreshPayOut);

  useEffect(() => {
    dispatch(resetPagination());
    setIsReset(true);
  }, [dispatch]);

  // useEffect(() => {
  //   getPayOutData();
  // }, [JSON.stringify(params)]);

  // useEffect(() => {
  //   if (refreshPayOut) {
  //     getPayOutData();
  //     dispatch(setRefreshPayOut(false));
  //   }
  // }, [refreshPayOut, dispatch]);
  const setExportModal = () => {
    setCallMerchant(true);
    setCallVendor(true);
    setExportModalOpen(true);
  };
  const openfilter = () => {
    setCallMerchant(true);
  };
  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(
        setPagination({
          page,
          limit: pagination?.limit || 20,
        }),
      );
    },
    [dispatch, pagination?.limit],
  );

  const handlePageSizeChange = useCallback(
    (newLimit: number) => {
      dispatch(
        setPagination({
          page: 1,
          limit: newLimit,
        }),
      );
    },
    [dispatch],
  );

  const getPayOutData = useCallback(
    async (filters: Record<string, string | string[]> = {}) => {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const isRejected = [Status.REJECTED, Status.REVERSED];
        const params = new URLSearchParams({
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 20).toString(),
          status: isRejected.join(','),
        });
        if (debouncedUtrId) params.append('id', debouncedUtrId);
        if (debouncedMerchantOrderId)
          params.append('merchant_order_id', debouncedMerchantOrderId);
        if (debouncedNickName) params.append('user', debouncedNickName);

        Object.entries(filters).forEach(([key, value]) => {
          params.append(
            key,
            Array.isArray(value) ? value.join(',') : String(value),
          );
        });

        isLoad && dispatch(onload());
        const response = await getAllPayOuts(params.toString());
        dispatch(getTotalCount(response.data.totalCount));
        dispatch(getPayOuts(response.data));
        !isLoad && dispatch(setIsloadingPayOutEntries(true));
      } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Error fetching payouts',
          }),
        );
      } finally {
        isFetching.current = false;
      }
    },
    [
      pagination?.page,
      pagination?.limit,
      dispatch,
      debouncedUtrId,
      debouncedMerchantOrderId,
      debouncedNickName,
    ],
  );

  const handleRefresh = useCallback(async () => {
    dispatch(onload());
    dispatch(setIsloadingPayOutEntries(true));
    await getPayOutData(selectedFilterData || {});
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'PayOuts refreshed successfully',
      }),
    );
  }, [dispatch, getPayOutData, selectedFilterData]);

  const handleReset = useCallback(async () => {
    dispatch(onload());
    setSelectedFilter([]);
    setSelectedFilterVendor([]);
    setSelectedFilterDates('');
    setUtrId('');
    setMerchantOrderId('');
    setNickName('');
    setSelectedColumn('');
    setFilterValue('');
    setSelectedFilterData({});
    dispatch(resetPagination());
    dispatch(setIsloadingPayOutEntries(true));
    dispatch(setRefreshPayOut(true));
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully',
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUtrId(utrId.trim());
      setDebouncedMerchantOrderId(merchantOrderId.trim());
      setDebouncedNickName(nickName.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [utrId, merchantOrderId, nickName]);

  useEffect(() => {
    if (isReset) {
      getPayOutData(selectedFilterData || {});
    }
  }, [
    debouncedUtrId,
    debouncedMerchantOrderId,
    debouncedNickName,
    selectedFilterData,
    getPayOutData,
    isReset,
  ]);

  useEffect(() => {
    dispatch(resetPagination());
    setIsReset(true);
  }, [dispatch]);
  useEffect(() => {
    if (refreshPayOut) {
      getPayOutData(selectedFilterData || {}).then(() => {
        dispatch(setRefreshPayOut(false));
      });
    }
  }, [refreshPayOut, getPayOutData, selectedFilterData, dispatch]);
  const payOuts = useAppSelector(getAllPayOutData);

  const applyFilter = useCallback(() => {
    const hasNoFilters =
      !selectedFilter.length && !(selectedColumn && filterValue);

    if (hasNoFilters) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Please select at least one filter',
        }),
      );
      return;
    }
    dispatch(
      setPagination({
        page: 1,
        limit: pagination?.limit || 20,
      }),
    );
    const filters: Record<string, any> = {};

    if (selectedFilter.length) {
      filters['merchant_id'] = selectedFilter.map((f: any) => f.value);
    }

    if (selectedColumn && filterValue) {
      filters[selectedColumn] = filterValue;
    }
    setSelectedFilterData(filters);
    getPayOutData(filters);
  }, [selectedFilter, selectedColumn, filterValue, getPayOutData, dispatch]);

  const handleNotifyData = async (id: string) => {
    const url = `update-payment-notified-status/${id}`;
    const apiData = { type: 'PAYOUT' };
    dispatch(onload());
    const res = await updatePayIns(`${url}`, apiData);
    if (res.meta.message) {
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: res.meta.message,
        }),
      );
      dispatch(setRefreshPayOut(true));
    } else {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: res.error.message,
        }),
      );
    }
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-y-10 gap-x-6">
        <div className="col-span-12">
          <div className="mt-3.5">
            <div className="flex flex-col overflow-x-hidden">
              <div className="flex flex-col p-5 gap-y-2 mx-3">
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                  {(role === Role.ADMIN || role === Role.MERCHANT) && (
                    <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                      <Lucide
                        icon="Search"
                        className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                      />
                      <FormInput
                        type="text"
                        placeholder="Order ID..."
                        className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                        value={merchantOrderId}
                        onChange={(e) => setMerchantOrderId(e.target.value)}
                      />
                      {merchantOrderId && (
                        <Lucide
                          icon="X"
                          className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                          onClick={() => setMerchantOrderId('')}
                        />
                      )}
                    </div>
                  )}
                  {(role === Role.ADMIN || role === Role.MERCHANT) && (
                    <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                      <Lucide
                        icon="Search"
                        className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                      />
                      <FormInput
                        type="text"
                        placeholder="User ID..."
                        className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                        value={nickName}
                        onChange={(e) => setNickName(e.target.value)}
                      />
                      {nickName && (
                        <Lucide
                          icon="X"
                          className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                          onClick={() => setNickName('')}
                        />
                      )}
                    </div>
                  )}
                  {(role === Role.ADMIN ||
                    role === Role.MERCHANT ||
                    role === Role.VENDOR) && (
                    <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                      <Lucide
                        icon="Search"
                        className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                      />
                      <FormInput
                        type="text"
                        placeholder="Payout ID..."
                        className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                        value={utrId}
                        onChange={(e) => setUtrId(e.target.value)}
                      />
                      {utrId && (
                        <Lucide
                          icon="X"
                          className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                          onClick={() => setUtrId('')}
                        />
                      )}
                    </div>
                  )}
                
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto sm:ml-auto">
                  <Menu>
                    <Menu.Button
                      as={Button}
                      variant="outline-secondary"
                      className="w-full sm:w-auto"
                      onClick={handleRefresh}
                    >
                      <Lucide
                        icon="RefreshCw"
                        className="stroke-[1.3] w-4 h-4 mr-2"
                      />
                      Refresh
                    </Menu.Button>
                  </Menu>
                  <Menu>
                    <Menu.Button
                      as={Button}
                      variant="outline-secondary"
                      className="w-full sm:w-auto"
                      onClick={handleReset}
                    >
                      <Lucide
                        icon="RotateCcw"
                        className="stroke-[1.3] w-4 h-4 mr-2"
                      />
                      Reset
                    </Menu.Button>
                  </Menu>
                  <Menu>
                    <Menu.Button
                      as={Button}
                      variant="outline-secondary"
                      className="w-full sm:w-auto"
                      onClick={setExportModal}
                    >
                      <Lucide
                        icon="Download"
                        className="stroke-[1.3] w-4 h-4 mr-2"
                      />
                      Export
                      <Lucide
                        icon="ChevronDown"
                        className="stroke-[1.3] w-4 h-4 ml-2"
                      />
                    </Menu.Button>
                    {exportModalOpen && (
                      <Modal
                        handleModal={() => {
                          setExportModalOpen((prev) => !prev);
                          setSelectedFilter([]);
                          setSelectedFilterVendor([]);
                        }}
                        forOpen={exportModalOpen}
                        title="Export PayOuts"
                      >
                        <div className="py-2 my-2 mb-4">
                          <Litepicker
                            value={selectedFilterDates || ''}
                            onChange={(e) => {
                              setSelectedFilterDates(e.target.value);
                            }}
                            enforceRange={true}
                            options={{
                              autoApply: false,
                              singleMode: false,
                              numberOfMonths: 1,
                              numberOfColumns: 1,
                              showWeekNumbers: true,
                              startDate: selectedFilterDates.split(' - ')[0],
                              endDate: selectedFilterDates.split(' - ')[1],
                              dropdowns: {
                                minYear: 1990,
                                maxYear: null,
                                months: true,
                                years: true,
                              },
                            }}
                            className="w-full pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                          />
                        </div>
                        {role === Role.ADMIN ? (
                          <div className="my-2 py-2 flex flex-col justify-center">
                            <div className="flex flex-row">
                              <MultiSelect
                                codes={merchantCodes}
                                selectedFilter={selectedFilter}
                                setSelectedFilter={(value: any[]) => {
                                  setSelectedFilter(value);
                                  if (value.length > 0)
                                    setSelectedFilterVendor([]);
                                }}
                                placeholder="Select Merchant Codes ..."
                                disabled={selectedFilterVendor?.length > 0}
                              />
                            </div>
                            <div className="p-2 flex justify-center">OR</div>
                            <div className="flex flex-row">
                              <MultiSelect
                                codes={vendorCodes}
                                selectedFilter={selectedFilterVendor}
                                setSelectedFilter={(value: any[]) => {
                                  setSelectedFilterVendor(value);
                                  if (value.length > 0) setSelectedFilter([]);
                                }}
                                placeholder="Select Vendor Codes ..."
                                disabled={selectedFilter?.length > 0}
                              />
                            </div>
                          </div>
                        ) : role === Role.MERCHANT ? (
                          <MultiSelect
                            codes={merchantCodes}
                            selectedFilter={selectedFilter}
                            setSelectedFilter={setSelectedFilter}
                            placeholder="Select Merchant Codes ..."
                          />
                        ) : (
                          <MultiSelect
                            codes={vendorCodes}
                            selectedFilter={selectedFilterVendor}
                            setSelectedFilter={setSelectedFilterVendor}
                            placeholder="Select Vendor Codes ..."
                          />
                        )}
                        <div className="flex flex-row gap-4 my-4 pt-6">
                          <Button onClick={() => handleDownload('PDF')}>
                            Export as PDF
                          </Button>
                          <Button onClick={() => handleDownload('CSV')}>
                            Export as CSV
                          </Button>
                          <Button onClick={() => handleDownload('XLSX')}>
                            Export as XLSX
                          </Button>
                        </div>
                      </Modal>
                    )}
                  </Menu>
                  <Popover className="inline-block">
                    {({ close }: { close: () => void }) => (
                      <>
                        <Popover.Button
                          as={Button}
                          variant="outline-secondary"
                          className="w-full sm:w-auto"
                          onClick={openfilter}
                        >
                          <Lucide
                            icon="ArrowDownWideNarrow"
                            className="stroke-[1.3] w-4 h-4 mr-2"
                          />
                          Filter
                        </Popover.Button>
                        <Popover.Panel placement="bottom-end">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              applyFilter();
                              close();
                            }}
                          >
                            <div className="p-2">
                              {role &&
                                [Role.ADMIN, Role.MERCHANT_ADMIN].includes(
                                  role,
                                ) && (
                                  <div className="mt-3">
                                    <div className="text-left text-slate-500 mb-2">
                                      Merchant
                                    </div>
                                    <MultiSelect
                                      codes={merchantCodesData}
                                      selectedFilter={selectedFilter}
                                      setSelectedFilter={setSelectedFilter}
                                    />
                                  </div>
                                )}
                              <div className="mt-3">
                                <div className="text-left text-slate-500">
                                  Additional Filters
                                </div>
                                <FormSelect
                                  className="flex-1 mt-2"
                                  value={selectedColumn}
                                  onChange={(e) => {
                                    setSelectedColumn(e.target.value);
                                    setFilterValue('');
                                  }}
                                >
                                  <option value="">Select a column</option>
                                  {(role &&
                                  [
                                    Role.MERCHANT,
                                    Role.MERCHANT_ADMIN,
                                    Role.SUB_MERCHANT,
                                    Role.MERCHANT_OPERATIONS,
                                  ].includes(role)
                                    ? Columns.PAYOUT_MERCHANT
                                    : role &&
                                      [
                                        Role.VENDOR,
                                        Role.VENDOR_OPERATIONS,
                                      ].includes(role)
                                    ? Columns.PAYOUT_DROPPED_VENDOR
                                    : Columns.PAYOUT
                                  )
                                    .filter(
                                      (col) =>
                                        col.key !== 'merchant_details' &&
                                        col.key !== 'more_details' &&
                                        col.key !== 'status' &&
                                        col.key !== 'sno' &&
                                        col.key !== '' &&
                                        col.key !== 'actions',
                                    )
                                    .map((col) => (
                                      <option key={col.key} value={col.key}>
                                        {col.label}
                                      </option>
                                    ))}
                                </FormSelect>
                                {selectedColumn && (
                                  <div className="mt-3">
                                    <div className="text-left text-slate-500">
                                      Value for{' '}
                                      {
                                        (role &&
                                        [
                                          Role.MERCHANT,
                                          Role.MERCHANT_ADMIN,
                                          Role.SUB_MERCHANT,
                                          Role.MERCHANT_OPERATIONS,
                                        ].includes(role)
                                          ? Columns.PAYOUT_MERCHANT
                                          : role &&
                                            [
                                              Role.VENDOR,
                                              Role.VENDOR_OPERATIONS,
                                            ].includes(role)
                                          ? Columns.PAYOUT_DROPPED_VENDOR
                                          : Columns.PAYOUT
                                        ).find(
                                          (col) => col.key === selectedColumn,
                                        )?.label
                                      }
                                    </div>
                                    <FormInput
                                      type="text"
                                      className="mt-2"
                                      value={filterValue}
                                      onChange={(e) =>
                                        setFilterValue(e.target.value)
                                      }
                                      placeholder={`Enter value for ${selectedColumn}`}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center mt-4">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => {
                                    setSelectedColumn('');
                                    setFilterValue('');
                                    close();
                                  }}
                                  className="w-32 ml-auto"
                                >
                                  Close
                                </Button>
                                <Button
                                  variant="primary"
                                  type="submit"
                                  className="w-32 ml-2"
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </form>
                        </Popover.Panel>
                      </>
                    )}
                  </Popover>
                </div>
                </div>
              </div>
              {payOuts.loading && isLoad ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CustomTable
                  columns={
                    role &&
                    [
                      Role.MERCHANT,
                      Role.MERCHANT_ADMIN,
                      Role.SUB_MERCHANT,
                      Role.MERCHANT_OPERATIONS,
                    ].includes(role)
                      ? Columns.PAYOUT_MERCHANT
                      : role &&
                        [Role.VENDOR, Role.VENDOR_OPERATIONS].includes(role)
                      ? Columns.PAYOUT_DROPPED_VENDOR
                      : Columns.PAYOUT_REJECTED
                  }
                  data={{
                    rows: payOuts.payout,
                    totalCount: payOuts.totalCount,
                  }}
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 20}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  source="Payout"
                  actionMenuItems={(row: any) => [
                    {
                      label: 'Notify',
                      icon: 'Bell', // Change to an allowed icon type
                      onClick: () => handleNotifyData(row.id),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RejectedPayOut;
