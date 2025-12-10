/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lucide from '@/components/Base/Lucide';
import { Menu, Popover } from '@/components/Base/Headless';
import { FormInput, FormSelect } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import CustomTable from '../../../components/TableComponent/CommonTable';
import { Columns, EditAmountOrUTR, Role, Status } from '@/constants';
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
import { getAllPayOuts } from '@/redux-toolkit/slices/payout/payoutAPI';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import { updatePayIns } from '@/redux-toolkit/slices/payin/payinAPI';
import Modal from '@/components/Modal/modals';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
import { updatePayOuts } from '@/redux-toolkit/slices/payout/payoutAPI';
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
import DynamicForm from '@/components/CommonForm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

dayjs.extend(utc);
dayjs.extend(timezone);
interface PayOutData {
  status?: string;
  reason?: string;
  method?: string;
  utr_id?: string;
  bank_acc_id?: string;
  id?: string;
}

interface AllPayOutProps {
  vendorCodes: { label: string; value: string }[];
  merchantCodes: { label: string; value: string }[];
  merchantCodesData: { label: string; value: string }[];
setCallMerchant: React.Dispatch<React.SetStateAction<boolean>>;
  setCallVendor: React.Dispatch<React.SetStateAction<boolean>>;}

const CompletedPayOut: React.FC<AllPayOutProps> = ({
  vendorCodes,
  merchantCodes,
  merchantCodesData,
  setCallMerchant,
  setCallVendor,
}) => {
  const [payOutData, setPayOutData] = useState<PayOutData>({});
  const [payOutModal, setPayOutModal] = useState(false);
  const [newTransactionModal, setNewTransactionModal] = useState(false);
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
  const [editModal, setEditModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState<any>(null);
  const [editModalType, setEditModalType] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [utrId, setUtrId] = useState<string>('');
  const [merchantOrderId, setMerchantOrderId] = useState<string>('');
  const [nickName, setNickName] = useState<string>('');
  const [debouncedUtrId, setDebouncedUtrId] = useState<string>('');
  const [debouncedMerchantOrderId, setDebouncedMerchantOrderId] =
    useState<string>('');
  const [debouncedNickName, setDebouncedNickName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const pagination = useAppSelector(getPaginationData);
  const isFetching = useRef(false);
  const isLoad = useAppSelector(getIsLoadPayOut);
  const dispatch = useAppDispatch();
  const refreshPayOut = useAppSelector(getRefreshPayOut);

  const data = localStorage.getItem('userData');
  let includeMerchants = false;
  let includeVendors = false;

  type RoleType = keyof typeof Role;
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

  const transactionModal = (data?: any) => {
    setPayOutData(data);
    setNewTransactionModal(!newTransactionModal);
  };

  const handleReject = async () => {
    if (payOutData.id) {
      handlePayOutReject(payOutData?.id, { status: Status.REVERSED });
    }
    setPayOutModal(false);
  };

  const setExportModal = () => {
    setCallMerchant(true);
    setCallVendor(true);
    setExportModalOpen(true);
  };
  const openfilter = () => {
    setCallMerchant(true);
  };
  const handleCancel = () => {
    setPayOutModal(false);
  };
  const handlePayOutReject = async (id: string, data: any) => {
    const res = await updatePayOuts(id, data);
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
          message: res.error.message || 'An error occurred',
        }),
      );
    }
  };

  useEffect(() => {
    dispatch(resetPagination());
    setIsReset(true);
  }, [dispatch]);

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
    async (filters?: Record<string, string | string[]>) => {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const defaultFilters = {
          status: Status.APPROVED,
        };
        const finalFilters = {
          ...defaultFilters,
          ...(filters || {}),
        };

        const params = new URLSearchParams({
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 20).toString(),
        });
        if (debouncedUtrId) {
          params.append('utr_id', debouncedUtrId);
        }

        if (debouncedMerchantOrderId) {
          params.append('merchant_order_id', debouncedMerchantOrderId);
        }
        if (debouncedNickName) {
          params.append('user', debouncedNickName);
        }
        Object.entries(finalFilters).forEach(([key, value]) => {
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
  }, [dispatch, getPayOutData]);

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
    setIsReset(true);
  }, [
    debouncedUtrId,
    debouncedMerchantOrderId,
    debouncedNickName,
    selectedFilterData,
  ]);

  useEffect(() => {
    if (isReset) {
      getPayOutData(selectedFilterData || {});
    }
  }, [
    debouncedUtrId,
    debouncedMerchantOrderId,
    debouncedNickName,
    selectedFilterData,
    pagination?.page,
    pagination?.limit,
    getPayOutData,
    isReset,
  ]);

  useEffect(() => {
    if (refreshPayOut) {
      getPayOutData(selectedFilterData || {}).then(() => {
        dispatch(setRefreshPayOut(false));
      });
    }
  }, [refreshPayOut, getPayOutData, selectedFilterData, dispatch]);

  const payOuts = useAppSelector(getAllPayOutData);

  const handleNotifyData = async (id: string) => {
    const url = `update-payment-notified-status/${id}`;
    const apiData = { type: 'PAYOUT' };
    dispatch(onload());
    const res = await updatePayIns(`${url}`, apiData);
    if (res.meta.message) {
      dispatch(setRefreshPayOut(true));
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: res.meta.message,
        }),
      );
    } else {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: res.error.message,
        }),
      );
    }
  };
  const handlePageChange = useCallback(
    (page: number) => {
      if (page !== pagination?.page) {
        dispatch(
          setPagination({
            page,
            limit: pagination?.limit || 20,
          }),
        );
      }
    },
    [dispatch, pagination?.page, pagination?.limit],
  );

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
    const filters: Record<string, any> = {
      status: Status.APPROVED,
    };
    if (selectedFilter.length) {
      filters['merchant_id'] = selectedFilter.map((f: any) => f.value);
    }

    if (selectedColumn && filterValue) {
      filters[selectedColumn] = filterValue;
    }
    setSelectedFilterData(filters);
    getPayOutData(filters);
  }, [selectedFilter, selectedColumn, filterValue, getPayOutData, dispatch]);

  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';
  const handleDownload = async (type: string) => {
    setSelectedFilter([]);
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

    try {
      const [startDate, endDate] = selectedFilterDates.split(' - ');

      const isMerchantExport = selectedFilter.length > 0;
      const selectedCodes = isMerchantExport
        ? selectedFilter.map((code: any) => code.value).join(',')
        : selectedFilterVendor.map((code: any) => code.value).join(',');

      const selectedPayoutReports = await getSelectedPayoutReport(
        selectedCodes,
        startDate,
        endDate,
        ['APPROVED', 'REVERSED'],
      );

      const completedReports = selectedPayoutReports;

      if (!completedReports.length) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No completed payouts found for the selected criteria.',
          }),
        );
        return;
      }

      dispatch(
        getPayOutReportSlice([...allPayoutReports, ...completedReports]),
      );

      if (completedReports.length > 0) {
        const fieldMappings = {
          sno: 'SNO',
          merchant_details: 'Merchant Code',
          merchant_order_id: 'Merchant Order ID',
          status: 'Status',
          utr_id: 'UTR',
          user: 'User',
          amount: 'Requested Amount',
          payout_merchant_commission: 'Payout Commission',
          description: 'Description',
          nick_name: 'From Bank',
          vendor_code: 'Vendor Code',
          updated_at: 'Updated At',
          approved_at: 'Approved At',
          created_at: 'Created At',
          rejected_at: 'Rejected At',
        };

        const filteredData = completedReports.map((item: any) => {
          const getStatusDate = () => {
            if (item.status === Status.SUCCESS) return item.approved_at;
            if (item.status === Status.FAILED) return item.failed_at;
            return item.updated_at;
          };
          const result: Record<string, any> = {};
          result[fieldMappings.sno] = item.sno || '';
          if (includeMerchants) {
            result[fieldMappings.merchant_details] =
              item.merchant_details?.merchant_code || '';
            result[fieldMappings.merchant_order_id] =
              item.merchant_order_id || '';
            result[fieldMappings.user] = item.user;
          }
          (result[fieldMappings.status] =
            item.status === Status.APPROVED ? 'APPROVED' : `REVERSED`),
            (result[fieldMappings.status] = item.status || '');
          result[fieldMappings.amount] = item.amount || 0;
          result[fieldMappings.payout_merchant_commission] = Number(
            item.payout_merchant_commission || 0,
          );
          result[fieldMappings.utr_id] = item.utr_id;
          result[fieldMappings.description] =
            item.status !== Status.APPROVED
              ? `Transaction was REVERSED ${dayjs(getStatusDate()).format(
                  'YYYY-MM-DD HH:mm:ss',
                )}`
              : '';
          if (includeVendors) {
            result[fieldMappings.vendor_code] = item.vendor_code || '';
            (result[fieldMappings.nick_name] = item.nick_name || '');
          }
            (result[fieldMappings.updated_at] = result[
              fieldMappings.created_at
            ] =
              dayjs(item.created_at)
                .tz('Asia/Kolkata')
                .format('DD-MM-YYYY h:mm:ss A'));
          result[fieldMappings.updated_at] = dayjs(item.updated_at)
            .tz('Asia/Kolkata')
            .format('DD-MM-YYYY h:mm:ss A');
          return result;
        });
        downloadCSV(
          filteredData,
          type as ExportFormat,
          `completed-payout-report_${startDate}_to_${endDate}`,
        );
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: `Completed payouts exported successfully as ${type}`,
          }),
        );
        setExportModalOpen(false);
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No completed payouts available for export',
          }),
        );
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Error exporting completed payouts',
        }),
      );
    }
  };

  const handleEditModal = (data: any, type: string) => {
    setSelectedData(data);
    setSelectedValue({ [type]: data.utr_id });
    setEditModalType(type);
    setEditModal(true);
  };

  const handleEditCancel = () => {
    setSelectedData(null);
    setEditModal(false);
  };

  const handleEditSubmit = async (data: any) => {
    setIsLoading(true);
    dispatch(onload());
    const res = await updatePayOuts(selectedData.id, data);
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
          message: res.meta.message,
        }),
      );
    }
    setSelectedData(null);
    setIsLoading(false);
    setEditModal(false);
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
                        placeholder="UTR..."
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
                              startDate: selectedFilterDates.split(' - ')[0],
                              endDate: selectedFilterDates.split(' - ')[1],
                              showWeekNumbers: true,
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
                              {/* <div className="px-2 flex ">Select Vendor : </div> */}
                              <MultiSelect
                                codes={vendorCodes}
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
                                  {[
                                    ...(role &&
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
                                      ? Columns.PAYOUT_COMPLETED_VENDOR
                                      : Columns.PAYOUT_COMPLETED),
                                    { key: 'id', label: 'Payout ID' },
                                  ]
                                    .filter(
                                      (col) =>
                                        col.key !== 'merchant_details' &&
                                        col.key !== 'more_details' &&
                                        col.key !== 'status' &&
                                        col.key !== 'sno' &&
                                        // col.key !== 'user_bank_details' &&
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
                                          ? Columns.PAYOUT_COMPLETED_VENDOR
                                          : Columns.PAYOUT_COMPLETED
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
                      ? Columns.PAYOUT_COMPLETED_VENDOR
                      : Columns.PAYOUT_COMPLETED
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
                  handleEditModal={handleEditModal}
                  role={role || undefined}
                  actionMenuItems={(row: any) => {
                    const items: {
                      label?: string;
                      icon: 'Bell' | 'RotateCcw';
                      onClick: (row: any) => void;
                    }[] = [];

                    // Restrict Reset action for vendor logins
                    if (
                      role &&
                      ![Role.VENDOR, Role.SUB_VENDOR, Role.VENDOR_OPERATIONS].includes(role)
                    ) {
                      items.push({
                        label: 'Reset',
                        icon: 'RotateCcw',
                        onClick: () => {
                          transactionModal(row), setPayOutModal(true);
                        },
                      });
                    }

                    // Always add Notify action
                    items.push({
                      label: 'Notify',
                      icon: 'Bell',
                      onClick: () => handleNotifyData(row.id),
                    });

                    return items;
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal handleModal={handleCancel} forOpen={payOutModal}>
        <ModalContent
          handleCancelDelete={handleCancel}
          handleConfirmDelete={handleReject}
        >
          Are you sure you want to reset this Transaction?
        </ModalContent>
      </Modal>
      <Modal handleModal={handleEditCancel} forOpen={editModal}>
        <DynamicForm
          sections={Object.fromEntries(
            Object.entries(EditAmountOrUTR(editModalType)).filter(
              ([_, value]) => Array.isArray(value),
            ),
          )}
          onSubmit={handleEditSubmit}
          defaultValues={selectedValue}
          isEditMode={true}
          handleCancel={handleEditCancel}
          isLoading={isLoading}
        />
      </Modal>
    </>
  );
};

export default CompletedPayOut;
