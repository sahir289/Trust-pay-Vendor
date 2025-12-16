/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lucide from '@/components/Base/Lucide';
import { Menu, Popover, Tab } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import CustomTable from '../../../components/TableComponent/CommonTable';
import { FormInput, FormSelect } from '@/components/Base/Form';
import {
  Columns,
  EditRowFormFields,
  resetPayInFormFields,
  Role,
  Status,
} from '@/constants';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import {
  getAllPayInData,
  getRefreshPayIn,
  getIsloadingPayinEntries,
} from '@/redux-toolkit/slices/payin/payinSelectors';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import {
  getAllPayIns,
  // getPayInsSearch,
  updatePayIns,
  updatePayInsData,
} from '@/redux-toolkit/slices/payin/payinAPI';
import {
  getPayIns,
  onload,
  // setRefreshPayIn,
  setIsloadingPayinEntries,
} from '@/redux-toolkit/slices/payin/payinSlice';
import Modal from '@/components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
// import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
// import { getBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
// import { selectAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSelectors';
import LoadingIcon from '@/components/Base/LoadingIcon';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import Litepicker from '@/components/Base/Litepicker';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
// import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
// import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { downloadCSV } from '@/components/ExportComponent';
import { getSelectedPayinReport } from '@/redux-toolkit/slices/reports/reportAPI';
import { getPayInReportSlice } from '@/redux-toolkit/slices/reports/reportSlice';
import { selectPayinReports } from '@/redux-toolkit/slices/reports/reportSelectors';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

dayjs.extend(utc);
dayjs.extend(timezone);

interface PayInData {
  id?: string;
  status?: string;
  merchant_order_id?: string;
  amount?: number;
  bank_res_details?: any;
  bank_id?: string;
}

interface FilterState {
  merchant_id?: string[];
  status?: string;
  updatedPayin?: boolean;
  [key: string]: string | string[] | boolean | undefined;
}
interface AllPayInProps {
  vendorCodes: { label: string; value: string }[];
  merchantCodes: { label: string; value: string }[];
  merchantCodesData: { label: string; value: string }[];
  bankNames: { label: string; value: string }[];
  setCallMerchant: React.Dispatch<React.SetStateAction<boolean>>;
  setCallVendor: React.Dispatch<React.SetStateAction<boolean>>;
  setCallBank: React.Dispatch<React.SetStateAction<boolean>>;
}

const CompletedPayIn: React.FC<AllPayInProps> = ({
  vendorCodes,
  merchantCodes,
  merchantCodesData,
  bankNames,
  setCallMerchant,
  setCallVendor,
  setCallBank,
}) => {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const [payInData, setPayInData] = useState<PayInData>({});
  const [newTransactionModal, setNewTransactionModal] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${date} - ${date}`,
  );
  const [selectedVendor, setSelectedVendor] = useState<any[]>([]);
  // const [merchantCodes, setMerchantCodes] = useState<any[]>([]);
  // const [merchantCodesData, setMerchantCodesData] = useState<any[]>([]);
  // const [vendorCodes, setVendorCodes] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<any[]>([]);
  const [selectedFilterVendor, setSelectedFilterVendor] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(Status.SUCCESS);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: Status.SUCCESS,
  });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEditingField, setEditEditingField] = useState<
    'amount' | 'bank_res_details' | 'bank_acc_id' | null
  >(null);
  const [isFieldBeingEdited, setIsFieldBeingEdited] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [activeDataTab, setActiveDataTab] = useState(0);
  const [merchantOrderId, setMerchantOrderId] = useState<string>('');
  const [userSubmittedUtr, setUserSubmittedUtr] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [debouncedMerchantOrderId, setDebouncedMerchantOrderId] =
    useState<string>('');
  const [debouncedUserSubmittedUtr, setDebouncedUserSubmittedUtr] =
    useState<string>('');
  const [debouncedbankName, setDebouncedbankName] = useState<string>('');

  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let includeMerchants = false;
  let includeVendors = false;
  let role: RoleType | null = null;
  let designation: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
    designation = parsedData.designation;
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
  const isFetching = useRef(false);
  const isLoad = useAppSelector(getIsloadingPayinEntries);
  const refreshPayIn = useAppSelector(getRefreshPayIn);

  // useEffect(() => {
  //   const fetchBankNames = async () => {
  //     const bankNamesList = await getAllBankNames('PayIn');
  //     if (bankNamesList) {
  //       dispatch(getBankNames(bankNamesList.bankNames));
  //     }
  //   };

  //   if (role && [Role.ADMIN].includes(role)) {
  //     fetchBankNames();
  //   }
  // }, [dispatch]);
  // const bankNames = useAppSelector(selectAllBankNames);
  const bankOptions = bankNames;

  const transactionModal = (data?: any) => {
    setPayInData(data);
    setNewTransactionModal(!newTransactionModal);
  };

  const handleRowClick = (index: number): void => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  useEffect(() => {
    dispatch(resetPagination());
  }, [dispatch]);

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

  const shouldSetSearchInAddData = (
    merchantOrderId: string,
    userSubmittedUtr: string,
    bankName: string,
  ) => {
    if (merchantOrderId || userSubmittedUtr || bankName) {
      return true;
    }

    // Check filters from FilterState
    const hasFilterStateValues = Boolean(
      filters.merchant_id?.length ||
        filters.updated_at ||
        filters.user_submitted_utr ||
        filters.merchant_order_id ||
        filters.utr ||
        filters.nick_name ||
        filters.bank_acc_id ||
        filters.amount ||
        filters.user,
    );

    // Check additional filters from component state
    const hasAdditionalFilters = Boolean(selectedColumn && filterValue);

    return hasFilterStateValues || hasAdditionalFilters;
  };

  const getPayInData = useCallback(
    async (filters: FilterState = {}) => {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const params = new URLSearchParams({
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 20).toString(),
          status: Status.SUCCESS,
        });

        Object.entries(filters).forEach(([key, value]) => {
          if (value && key !== 'status') {
            params.append(
              key,
              Array.isArray(value) ? value.join(',') : String(value),
            );
          }
        });

        if (debouncedMerchantOrderId) {
          params.append('merchant_order_id', debouncedMerchantOrderId);
        }

        if (debouncedUserSubmittedUtr) {
          params.append('user_submitted_utr', debouncedUserSubmittedUtr);
        }
        if (debouncedbankName) {
          params.append('nick_name', debouncedbankName);
        }
        if (
          shouldSetSearchInAddData(
            debouncedMerchantOrderId,
            debouncedUserSubmittedUtr,
            debouncedbankName,
          )
        ) {
          sessionStorage.setItem('searchInAddData', 'true');
        } else {
          sessionStorage.setItem('searchInAddData', 'false');
        }
        isLoad && dispatch(onload());
        const response = await getAllPayIns(params.toString());
        if (response) {
          dispatch(
            getPayIns({
              payin: response.payins,
              totalCount: response.totalCount,
              loading: false,
              error: null,
              refreshPayIn: false,
              isloadingPayinEntries: isLoad,
              // getSumPayin: true,
            }),
          );
          !isLoad && dispatch(setIsloadingPayinEntries(true));
        } else {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'No Completed PayIns Found!',
            }),
          );
        }
      } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Error fetching completed payins',
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
      debouncedMerchantOrderId,
      debouncedUserSubmittedUtr,
      debouncedbankName,
    ],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMerchantOrderId(merchantOrderId.trim());
      setDebouncedUserSubmittedUtr(userSubmittedUtr.trim());
      setDebouncedbankName(bankName.trim());
    }, 1000);
    return () => clearTimeout(handler);
  }, [merchantOrderId, userSubmittedUtr, bankName]);
  useEffect(() => {
    if (
      !debouncedMerchantOrderId &&
      !debouncedUserSubmittedUtr &&
      !debouncedbankName
    ) {
      setExpandedRow(null);
    }
  }, [debouncedMerchantOrderId, debouncedUserSubmittedUtr, debouncedbankName]);
  useEffect(() => {
    if (refreshPayIn) {
      getPayInData(filters).then(() => {
        //-- removed re-rendering on create payin
        // dispatch(setRefreshPayIn(false));
      });
    } else {
      getPayInData(filters);
    }
  }, [
    debouncedMerchantOrderId,
    debouncedUserSubmittedUtr,
    debouncedbankName,
    filters,
    refreshPayIn,
    getPayInData,
    dispatch,
    activeDataTab,
  ]);

  const handleRefresh = useCallback(async () => {
    // dispatch(resetPagination());
    dispatch(setIsloadingPayinEntries(true));
    await getPayInData(filters);
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Payins refreshed successfully',
      }),
    );
  }, [dispatch, getPayInData, filters]);

  const handleReset = useCallback(async () => {
    setSelectedFilter([]);
    setSelectedVendor([]);
    setSelectedFilterVendor([]);
    setSelectedFilterDates('');
    setMerchantOrderId('');
    setUserSubmittedUtr('');
    setDebouncedMerchantOrderId('');
    setDebouncedUserSubmittedUtr('');
    setBankName('');
    setDebouncedbankName('');
    setSelectedColumn('');
    setFilterValue('');
    setSelectedStatus('');
    setFilters({});
    dispatch(resetPagination());
    dispatch(setIsloadingPayinEntries(true));
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully',
      }),
    );
  }, [dispatch]);
  const payins = useAppSelector(getAllPayInData);

  const handleNotifyData = async (id: string) => {
    const url = `update-payment-notified-status/${id}`;
    const apiData = { type: 'PAYIN' };
    const res = await updatePayIns(url, apiData);
    if (res.meta?.message) {
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
          message: res.error?.message || 'An error occurred',
        }),
      );
    }
  };

  const handleResetTransaction = async (data: any) => {
    setIsLoading(true);
    const nickName = bankNames.filter((name) => name.value === data.bank_id)[0]
      ?.label;
    const apiData =
      payInData.status === Status.BANK_MISMATCH
        ? { nick_name: nickName }
        : {
            merchantOrderId: data.merchant_order_id,
            confirmed: data.amount,
            amount: data.amount,
          };
    const url =
      payInData.status === Status.BANK_MISMATCH
        ? `update-deposit-status/${payInData.merchant_order_id}`
        : `dispute-duplicate/${payInData.id}`;

    const res = await updatePayIns(url, apiData);

    if (res.meta?.message) {
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: res.meta.message,
        }),
      );
      transactionModal();
      // dispatch(setRefreshPayIn(true));
    } else {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: res.error?.message || 'An error occurred',
        }),
      );
    }
    setIsLoading(false);
  };

  const handleViewAllData = useCallback(async () => {
    dispatch(onload());
    // setSearchQuery('');
    setSelectedFilterDates('');
    dispatch(resetPagination());
    setFilters({
      ...filters,
      status: Status.SUCCESS,
      updatedPayin: false,
    });
    setExpandedRow(null);
    setActiveDataTab(0);
  }, [dispatch, getPayInData, filters]);

  const handleViewUpdatedData = useCallback(async () => {
    dispatch(onload());
    setSelectedFilterDates('');
    // setSearchQuery('');
    dispatch(resetPagination());
    setFilters({
      ...filters,
      status: Status.SUCCESS,
      updatedPayin: true,
    });
    setActiveDataTab(1);
  }, [dispatch, getPayInData, filters]);

  const openExport = () => {
    setCallMerchant(true);
    setCallVendor(true);
    setExportModalOpen(true);
  };
  const openFilter = () => {
    setCallMerchant(true);
    setCallVendor(true);
  };
  const applyFilter = useCallback(() => {
    const hasNoFilters =
      !selectedFilter.length &&
      !selectedVendor.length &&
      !selectedStatus &&
      !(selectedColumn && filterValue);

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
    const newFilters: FilterState = {};

    if (selectedFilter.length) {
      newFilters['merchant_id'] = selectedFilter.map((f: any) => f.value);
    }
    if (selectedVendor.length) {
      newFilters['user_ids'] = selectedVendor.map((f: any) => f.value);
    }
    if (selectedStatus) {
      newFilters['status'] = selectedStatus;
    }

    if (selectedColumn && filterValue) {
      newFilters[selectedColumn] = filterValue;
    }

    setFilters(newFilters);
  }, [
    selectedFilter,
    selectedStatus,
    selectedColumn,
    filterValue,
    selectedVendor,
    dispatch,
  ]);

  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';

  const handleDownload = async (type: ExportFormat) => {
    setSelectedFilter([]);
    const isEmpty = (arr: any[]) => !arr || !arr.length;

    const isMerchantRole = [
      Role.MERCHANT,
      Role.MERCHANT_ADMIN,
      Role.SUB_MERCHANT,
      Role.MERCHANT_OPERATIONS,
    ].includes(role || '');
    if (role === Role.ADMIN) {
      if (isEmpty(selectedFilter) && isEmpty(selectedFilterVendor)) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `Please select  merchant or vendor.`,
          }),
        );
        return;
      }
      if (!selectedFilterDates) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `Please select date range.`,
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
      const selectedMerchantReports = await getSelectedPayinReport(
        selectedCodes,
        startDate,
        endDate,
        'SUCCESS',
        isUpdate,
      );

      if (!selectedMerchantReports.length) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No completed payins found for the selected criteria.',
          }),
        );
        return;
      }

      dispatch(
        getPayInReportSlice([...allPayinReports, ...selectedMerchantReports]),
      );

      if (selectedMerchantReports.length > 0) {
        const fieldMappings = {
          sno: 'SNO',
          id: 'Id',
          upi_short_code: 'UPI Short Code',
          payin_merchant_commission: 'PayIn Merchant Commission',
          merchant_details: 'Merchant Code',
          merchant_order_id: 'Merchant Order ID',
          user_submitted_utr: 'User Submitted UTR',
          utr: 'UTR',
          amount: 'Requested Amount',
          status: 'Status',
          bank_res_details: {
            utr: 'Bank UTR',
            amount: 'Recieved Amount',
          },
          user: 'User',
          nick_name: 'Bank Name',
          vendor_code: 'Vendor Code',
          updated_at: 'Updated At',
          created_at: 'Created At',
          approved_at: 'Approved At',
          rejected_at: 'Rejected At',
        };

        const filteredData = selectedMerchantReports.map((item: any) => {
          const result: Record<string, any> = {};
          result[fieldMappings.id] = item?.id || '';
          if (includeMerchants) {
            result[fieldMappings.upi_short_code] = item?.upi_short_code || '';
          }
          if (includeMerchants) {
            result[fieldMappings.payin_merchant_commission] =
              item?.payin_merchant_commission || '0';
          }
          result[fieldMappings.amount] = item.amount || '0';
          result[fieldMappings.bank_res_details.utr] =
            item.bank_res_details.utr || '';
          result[fieldMappings.bank_res_details.amount] =
            item.bank_res_details.amount || '0';
          result[fieldMappings.status] = item.status || '';
          if (includeVendors) {
            result[fieldMappings.nick_name] = item.nick_name || '';
            result[fieldMappings.vendor_code] = item.vendor_code || '';
          }
          if (includeMerchants) {
            result[fieldMappings.merchant_details] =
              item.merchant_details?.merchant_code || '';
            result[fieldMappings.user] = item.user || '0';
            result[fieldMappings.merchant_order_id] =
              item.merchant_order_id || '';
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
          `completed-payin-report_${startDate}_to_${endDate}`,
        );

        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: `Completed payins exported successfully as ${type}`,
          }),
        );
        setExportModalOpen(false);
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No completed payins available for export',
          }),
        );
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Error exporting report',
        }),
      );
    }
  };

  const allPayinReports = useAppSelector(selectPayinReports);

  const handleEditClick = (row: any) => {
    setSelectedRow(row);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (!selectedRow || !editEditingField) return;

      // Create payload only with the field being edited
      const updatedData: Record<string, any> = {};

      // Only allow updating the field that is being edited
      if (
        editEditingField === 'amount' &&
        data.amount &&
        data.amount !== selectedRow.amount
      ) {
        updatedData.amount = data.amount;
      } else if (
        editEditingField === 'bank_res_details' &&
        data.bank_res_details &&
        data.bank_res_details !== selectedRow.bank_res_details?.utr
      ) {
        updatedData.utr = data.bank_res_details;
      } else if (
        editEditingField === 'bank_acc_id' &&
        data.bank_acc_id &&
        data.bank_acc_id !== selectedRow.bank_acc_id
      ) {
        updatedData.bank_acc_id = data.bank_acc_id;
      }

      // Prevent multi-field updates
      const changedFields = [];
      if (data.amount && data.amount !== selectedRow.amount)
        changedFields.push('amount');
      if (
        data.bank_res_details &&
        data.bank_res_details !== selectedRow.bank_res_details?.utr
      )
        changedFields.push('bank_res_details');
      if (data.bank_acc_id && data.bank_acc_id !== selectedRow.bank_acc_id)
        changedFields.push('bank_acc_id');

      if (changedFields.length > 1) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Only one field can be edited at a time',
          }),
        );
        return;
      }

      // Only proceed if there are changes to the selected field
      if (Object.keys(updatedData).length === 0) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No changes detected',
          }),
        );
        return;
      }

      const response = await updatePayInsData(
        selectedRow.merchant_order_id,
        updatedData,
      );

      if (response.meta?.message) {
        // dispatch(setRefreshPayIn(true));
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: response.meta.message,
          }),
        );
        await getPayInData(filters);
        handleEditCancel();
      } else {
        throw new Error(response.error?.message || 'Update failed');
      }
    } catch (error: any) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: error.message,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditEditingField(null);
    setIsFieldBeingEdited(false);
    setSelectedRow(null);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-y-10 gap-x-6">
        <div className="col-span-12">
          <div className="mt-3.5">
            <div className="flex flex-col overflow-x-hidden">
              <div className="flex flex-col py-5 gap-y-2 mx-3">
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
                        value={userSubmittedUtr}
                        onChange={(e) => setUserSubmittedUtr(e.target.value)}
                      />
                      {userSubmittedUtr && (
                        <Lucide
                          icon="X"
                          className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                          onClick={() => setUserSubmittedUtr('')}
                        />
                      )}
                    </div>
                  )}

                  {(role === Role.ADMIN || role === Role.VENDOR) && (
                    <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                      <Lucide
                        icon="Search"
                        className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                      />
                      <FormInput
                        type="text"
                        placeholder="Bank..."
                        className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                      {bankName && (
                        <Lucide
                          icon="X"
                          className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                          onClick={() => setBankName('')}
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
                      onClick={() => openExport()}
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
                        title="Export Completed PayIns"
                      >
                        <div className="py-2 my-2 mb-4">
                          <Litepicker
                            value={selectedFilterDates}
                            onChange={(e) =>
                              setSelectedFilterDates(e.target.value)
                            }
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
                              {/* <div className="px-2 flex">
                                Select Merchant :{' '}
                              </div> */}
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
                          onClick={openFilter}
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
                                      placeholder="Select Merchant..."
                                    />
                                  </div>
                                )}
                              {role && [Role.ADMIN].includes(role) && (
                                <div className="mt-3">
                                  <div className="text-left text-slate-500 mb-2">
                                    Vendor
                                  </div>
                                  <MultiSelect
                                    codes={vendorCodes}
                                    selectedFilter={selectedVendor}
                                    setSelectedFilter={setSelectedVendor}
                                    placeholder="Select Vendor..."
                                  />
                                </div>
                                )}
                                {designation &&
                                                                  [Role.VENDOR_ADMIN].includes(designation) && (
                                                                    <div className="mt-3">
                                                                      <div className="text-left text-slate-500 mb-2">
                                                                        Vendor
                                                                      </div>
                                                                      <MultiSelect
                                                                        codes={vendorCodes}
                                                                        selectedFilter={selectedVendor}
                                                                        setSelectedFilter={setSelectedVendor}
                                                                        placeholder="Select Vendor..."
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
                                  <option value="">Select column...</option>
                                  {[
                                    ...(role &&
                                    [
                                      Role.MERCHANT,
                                      Role.MERCHANT_ADMIN,
                                      Role.SUB_MERCHANT,
                                      Role.MERCHANT_OPERATIONS,
                                    ].includes(role)
                                      ? Columns.PAYIN_COMPLETED_MERCHANT(
                                          isUpdate,
                                        )
                                      : role &&
                                        [
                                          Role.VENDOR,
                                          Role.VENDOR_OPERATIONS,
                                        ].includes(role)
                                      ? Columns.PAYIN_COMPLETED_VENDOR(isUpdate)
                                      : Columns.PAYIN_COMPLETED(isUpdate)),
                                    { key: 'id', label: 'Payin ID' }, 
                                  ]
                                    .filter(
                                      (col) =>
                                        col &&
                                        col.key !== 'merchant_details' &&
                                        col.key !== 'bank_res_details' &&
                                        col.key !== 'user_submitted_image' &&
                                        col.key !== 'more_details' &&
                                        col.key !== 'status' &&
                                        col.key !== 'sno' &&
                                        col.key !== 'vendor_code' &&
                                        col.key !== 'actions' &&
                                        col.key !== 'more_details',
                                    )
                                    .map(
                                      (col) =>
                                        col && (
                                          <option key={col.key} value={col.key}>
                                            {col.label}
                                          </option>
                                        ),
                                    )}
                                </FormSelect>
                                {selectedColumn && (
                                  <div className="mt-3">
                                    <div className="text-left text-slate-500">
                                      Value for{' '}
                                      {
                                        [
                                          ...(role &&
                                          [
                                            Role.MERCHANT,
                                            Role.MERCHANT_ADMIN,
                                            Role.SUB_MERCHANT,
                                            Role.MERCHANT_OPERATIONS,
                                          ].includes(role)
                                            ? Columns.PAYIN_COMPLETED_MERCHANT(
                                                isUpdate,
                                              )
                                            : role &&
                                              [
                                                Role.VENDOR,
                                                Role.VENDOR_OPERATIONS,
                                              ].includes(role)
                                            ? Columns.PAYIN_COMPLETED_VENDOR(
                                                isUpdate,
                                              )
                                            : Columns.PAYIN_COMPLETED(
                                                isUpdate,
                                              )),
                                          { key: 'id', label: 'Payin ID' }, 
                                        ].find(
                                          (col) =>
                                            col && col.key === selectedColumn,
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
              <div className="mb-4 border-b border-slate-200/60 dark:border-darkmode-400">
                <Tab.Group
                  selectedIndex={activeDataTab}
                  onChange={(tabIndex) => {
                    setActiveDataTab(tabIndex);
                    if (tabIndex === 0) setIsUpdate(false); // Set isUpdate false when tab is 0
                    if (tabIndex === 1) setIsUpdate(true); // Optionally, set true for updated tab
                  }}
                >
                  <Tab.List variant="tabs">
                    <Tab>
                      <Tab.Button
                        className="w-full py-2 flex items-center justify-center"
                        as="button"
                        onClick={handleViewAllData}
                      >
                        <Lucide icon="Database" className="w-4 h-4 mr-2" />
                        All Data
                      </Tab.Button>
                    </Tab>
                    <Tab>
                      <Tab.Button
                        className="w-full py-2 flex items-center justify-center"
                        as="button"
                        onClick={handleViewUpdatedData}
                      >
                        <Lucide icon="Clock" className="w-4 h-4 mr-2" />
                        Updated Data
                      </Tab.Button>
                    </Tab>
                  </Tab.List>
                </Tab.Group>
              </div>
              <div className="overflow-auto xl:overflow-visible">
                {payins.loading && payins.isloadingPayinEntries ? (
                  <div className="flex justify-center items-center w-full h-screen">
                    <LoadingIcon
                      icon="ball-triangle"
                      className="w-[5%] h-auto"
                    />
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
                        ? Columns.PAYIN_COMPLETED_MERCHANT(isUpdate)
                        : role &&
                          [Role.VENDOR, Role.VENDOR_OPERATIONS].includes(role)
                        ? Columns.PAYIN_COMPLETED_VENDOR(isUpdate)
                        : Columns.PAYIN_COMPLETED(isUpdate)
                    }
                    data={{ rows: payins.payin, totalCount: payins.totalCount }}
                    currentPage={Number(pagination?.page) || 1}
                    pageSize={Number(pagination?.limit) || 20}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    expandedRow={expandedRow}
                    handleRowClick={handleRowClick}
                    expandedRowKey="history"
                    actionMenuItems={(row: PayInData) => {
                      const items: {
                        label?: string;
                        icon: 'Bell' | 'RotateCcw' | 'Pencil';
                        onClick: (row: PayInData) => void;
                      }[] = [
                        {
                          label: 'Notify',
                          icon: 'Bell',
                          onClick: () => handleNotifyData(row.id || ''),
                        },
                      ];
                      if (
                        row.status === Status.SUCCESS &&
                        ![Role.TRANSACTIONS, Role.OPERATIONS].includes(
                          designation || '',
                        )
                      ) {
                        items.push({
                          label: 'Edit',
                          icon: 'Pencil',
                          onClick: () => handleEditClick(row),
                        });
                      }
                      if (
                        row.status === Status.BANK_MISMATCH ||
                        row.status === Status.DISPUTE
                      ) {
                        items.push({
                          label: 'Reset',
                          icon: 'RotateCcw',
                          onClick: () => transactionModal(row),
                        });
                      }
                      return items;
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {newTransactionModal && (
        <Modal
          handleModal={transactionModal}
          forOpen={newTransactionModal}
          title={`Reset PayIn`}
        >
          <DynamicForm
            sections={
              payInData.status === Status.BANK_MISMATCH
                ? resetPayInFormFields(bankOptions).RESET_BANK
                : resetPayInFormFields().RESET_DISPUTE
            }
            onSubmit={handleResetTransaction}
            defaultValues={
              payInData.status === Status.DISPUTE
                ? { amount: payInData.bank_res_details.amount }
                : {}
            }
            isEditMode={true}
            handleCancel={transactionModal}
            isLoading={isLoading}
          />
        </Modal>
      )}
      {editModalOpen && (
        <Modal
          handleModal={handleEditCancel}
          forOpen={editModalOpen}
          title="Edit Transaction"
        >
          {!editEditingField ? (
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">
                Select field to edit:
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEditEditingField('amount');
                    setIsFieldBeingEdited(false);
                  }}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Amount</div>
                  <div className="text-sm text-gray-500">
                    Update transaction amount
                  </div>
                </button>
                <button
                  onClick={() => {
                    setEditEditingField('bank_res_details');
                    setIsFieldBeingEdited(false);
                  }}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">UTR</div>
                  <div className="text-sm text-gray-500">
                    Update UTR reference
                  </div>
                </button>
                <button
                  onClick={() => {
                    setEditEditingField('bank_acc_id');
                    setIsFieldBeingEdited(false);
                    setCallBank(true);
                  }}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Bank</div>
                  <div className="text-sm text-gray-500">
                    Update bank selection
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  Editing:{' '}
                  {editEditingField === 'amount'
                    ? 'Amount'
                    : editEditingField === 'bank_res_details'
                    ? 'UTR'
                    : 'Bank'}
                </h3>
                <button
                  onClick={() => {
                    setEditEditingField(null);
                    setIsFieldBeingEdited(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  ← Back to field selection
                </button>
              </div>
              <DynamicForm
                key={`edit-${editEditingField}`}
                sections={EditRowFormFields(bankOptions, {
                  editingField: editEditingField,
                  isUpdating: isLoading,
                  isFieldBeingEdited: isFieldBeingEdited,
                })}
                onSubmit={handleEditSubmit}
                defaultValues={{
                  amount: selectedRow?.amount,
                  bank_res_details: selectedRow?.bank_res_details?.utr,
                  bank_acc_id: selectedRow?.bank_acc_id,
                }}
                isEditMode={true}
                handleCancel={handleEditCancel}
                isLoading={isLoading}
                onFieldFocus={() => setIsFieldBeingEdited(true)}
                onFieldBlur={() => setIsFieldBeingEdited(false)}
                onFieldChange={() => setIsFieldBeingEdited(true)}
              />
            </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default CompletedPayIn;
