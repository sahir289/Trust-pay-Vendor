/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lucide from '@/components/Base/Lucide';
import { Menu, Popover, Tab } from '@/components/Base/Headless';
import { FormInput, FormSelect } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import CustomTable from '../../../components/TableComponent/CommonTable';
import {
  approvePayOutFormFields,
  addVendorForBank,
  Columns,
  Status,
  addBatchVendors,
  getBatchWithdrawalForm,
} from '@/constants';
import { Role } from '@/constants';
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
import {
  getAllPayOuts,
  // getPayOutsSearch,
  updatePayOuts,
  assigenedPayOuts,
  getWalletBalance,
  getTataPayBalance,
  getClickrrWalletBalance,
  tataPayBulkPayout,
} from '@/redux-toolkit/slices/payout/payoutAPI';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import DynamicForm from '@/components/CommonForm';
import Modal from '@/components/Modal/modals';
import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { getBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
import { selectAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSelectors';
// import { getVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSlice';
// import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import Drawer from '@/components/Base/Drawer';
// import { selectAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSelectors';
import LoadingIcon from '@/components/Base/LoadingIcon';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import { getPayOutReportSlice } from '@/redux-toolkit/slices/reports/reportSlice';
import { downloadCSV } from '@/components/ExportComponent';
import { getSelectedPayoutReport } from '@/redux-toolkit/slices/reports/reportAPI';
// import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { selectPayoutReports } from '@/redux-toolkit/slices/reports/reportSelectors';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import Litepicker from '@/components/Base/Litepicker';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
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
  vendor_user_id?: string; // Added this property
  amount?: number; // Added amount property
  id?: string;
}

interface AllPayOutProps {
  vendorCodes: { label: string; value: string }[];
  merchantCodes: { label: string; value: string }[];
  merchantCodesData: { label: string; value: string }[];
  vendorCodesData: { label: string; value: string }[];
  setCallMerchant: React.Dispatch<React.SetStateAction<boolean>>;
  setCallVendor: React.Dispatch<React.SetStateAction<boolean>>;
}

const InProgressPayOut: React.FC<AllPayOutProps> = ({
  vendorCodes,
  merchantCodes,
  merchantCodesData,
  vendorCodesData,
  setCallMerchant,
  setCallVendor,
}) => {
  const [totalPayoutAmount, setTotalPayoutAmount] = useState<number>(0);
  const [payOutData, setPayOutData] = useState<PayOutData>({});
  const [payOutType, setPayOutType] = useState('');
  const [newTransactionModal, setNewTransactionModal] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${date} - ${date}`,
  );
  const [selectedSubTab, setSelectedSubTab] = useState<string>(
    Status.INITIATED,
  );
  const allPayoutReports = useAppSelector(selectPayoutReports);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  const [selectedFilterVendor, setSelectedFilterVendor] = useState<string[]>(
    [],
  );
  const isLoad = useAppSelector(getIsLoadPayOut);
  const [selectedFilterData, setSelectedFilterData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [selectedReason, setSelectedReason] = useState<string>(
    'Invalid account details',
  );
  const [selectedMethod, setSelectedMethod] = useState<string>('manual');
  const [availableBalance, setAvailableBalance] = useState<string>('0');
  const [batchSelectedMethod, setBatchSelectedMethod] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const pagination = useAppSelector(getPaginationData);
  const [utrId, setUtrId] = useState<string>('');
  const [merchantOrderId, setMerchantOrderId] = useState<string>('');
  const [debouncedUtrId, setDebouncedUtrId] = useState<string>('');
  const [debouncedMerchantOrderId, setDebouncedMerchantOrderId] =
    useState<string>('');
  const [isReset, setIsReset] = useState(false);
  const [batchWithdrawalModal, setBatchWithdrawalModal] = useState(false);

  const handleMethod = async (value: string) => {
    setSelectedMethod(value);
    if (value === 'eko' || value === 'payassist') {
      const balance = await getWalletBalance();
      setAvailableBalance(balance.data.walletBalance); // Reset available balance when method changes
    } else if (value === 'tatapay') {
      const balance = await getTataPayBalance();
      setAvailableBalance(balance.data.walletBalance); // Reset available balance when method changes
    } else if (value === 'clickrr') {
      const balance = await getClickrrWalletBalance();
      setAvailableBalance(balance?.data?.walletBalance || '0');
    } else {
      setAvailableBalance('0'); // Clear available balance for other methods
    }
  };
  const handleReason = (value: string) => {
    setSelectedReason(value);
  };

  const fetchBankNames = async (user: string) => {
    const bankNamesList = await getAllBankNames('PayOut', user);
    if (bankNamesList) {
      dispatch(getBankNames(bankNamesList.bankNames));
    }
  };

  const bankNames = useAppSelector(selectAllBankNames);
  const bankOptions = [...bankNames];
  const isFetching = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [vendorModal, setVendorModal] = useState(false);
  const [batchModal, setBatchModal] = useState(false);

  const dispatch = useAppDispatch();
  const refreshPayOut = useAppSelector(getRefreshPayOut);
  const data = localStorage.getItem('userData');
  let includeMerchants = false;
  let includeVendors = false;
  let allowPayAssist = false;
  let allowTataPay = false;
  let allowClickrr = false;

  type RoleType = keyof typeof Role;
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

  // Check if PayAssist is enabled
  if (
    role === Role.ADMIN ||
    role === Role.TRANSACTIONS ||
    role === Role.OPERATIONS
  ) {
    allowPayAssist = localStorage.getItem('allowPayAssist') === 'true';
    allowTataPay = localStorage.getItem('allowTataPay') === 'true';
    allowClickrr = localStorage.getItem('allowClickrr') === 'true';
  } else {
    allowPayAssist = false;
    allowTataPay = false;
    allowClickrr = false;
  }
  const handleSubTabChange = useCallback(
    (isInitiated: boolean) => {
      const newStatus = isInitiated ? Status.INITIATED : Status.PENDING;
      setSelectedSubTab(newStatus);
      dispatch(setPagination({ page: 1, limit: pagination?.limit || 20 }));
      const updatedFilters = { ...selectedFilterData, status: newStatus };
      setSelectedFilterData(updatedFilters);
      getPayOutData(updatedFilters);
    },
    [dispatch, pagination?.limit, selectedFilterData],
  );
  const transactionModal = (data?: PayOutData) => {
    if (!newTransactionModal) {
      if (
        role &&
        ([Role.ADMIN].includes(role) || [Role.VENDOR].includes(role))
      ) {
        fetchBankNames(data?.vendor_user_id || '');
      }
      // Reset method to manual when opening modal
      setSelectedMethod('manual');
      setAvailableBalance('0');
    }
    setPayOutData(data || {});
    setNewTransactionModal(!newTransactionModal);
  };
  const VendorAssignedModal = () => {
    setCallVendor(true);
    setVendorModal(true);
  };
  const setExportModal = () => {
    setCallMerchant(true);
    setCallVendor(true);
    setExportModalOpen(true);
  };
  const openfilter = () => {
    setCallMerchant(true);
    // setCallVendor(true);
  };

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

      // Determine if we're exporting merchant or vendor data
      const isMerchantExport = selectedFilter.length > 0;
      const selectedCodes = isMerchantExport
        ? selectedFilter.map((code: any) => code.value).join(',')
        : selectedFilterVendor.map((code: any) => code.value).join(',');

      const selectedMerchantReports = await getSelectedPayoutReport(
        selectedCodes,
        startDate,
        endDate,
        ['INITIATED', 'PENDING'],
      );

      // Filter to include only in-progress (ASSIGNED) entries

      if (!selectedMerchantReports.length) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No in-progress payins found for the selected criteria.',
          }),
        );
        return;
      }

      dispatch(
        getPayOutReportSlice([...allPayoutReports, ...selectedMerchantReports]),
      );

      if (selectedMerchantReports.length > 0) {

        const fieldMappings = {
          sno: 'SNO',
          merchant_details: 'Merchant Code',
          merchant_order_id: 'Merchant Order ID',
          // payout_id: 'PayOut ID',
          status: 'Status',
          user: 'User',
          amount: 'Requested Amount',
          vendor_code: 'Vendor Code',
          updated_at: 'Updated At',
          created_at: 'Created At',
          approved_at: 'Approved At',
          rejected_at: 'Rejected At',
        };

        const filteredData = selectedMerchantReports.map((item: any) => {
          const result: Record<string, any> = {};
          result[fieldMappings.sno] = item.sno || '';
          if (includeMerchants) {
            result[fieldMappings.merchant_details] =
              item.merchant_details?.merchant_code || '';
            result[fieldMappings.merchant_order_id] =
              item.merchant_order_id || '';
            result[fieldMappings.user] = item.user;
          }
          // result[fieldMappings.payout_id] = item.payout_id;
          (result[fieldMappings.amount] = item.amount || '0'),
            (result[fieldMappings.status] = item.status || ''),
            (result[fieldMappings.amount] = item.amount || 0);
          if (includeVendors) {
            result[fieldMappings.vendor_code] = item.vendor_code || '';
          }
          result[fieldMappings.created_at] = result[fieldMappings.created_at] =
            dayjs(item.created_at)
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
          `in-progress-payout-report_${startDate}_to_${endDate}`,
        );
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: `In-progress payins exported successfully as ${type}`,
          }),
        );
        setExportModalOpen(false);
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No in-progress payins available for export',
          }),
        );
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Error exporting in-progress payins',
        }),
      );
    }
  };

  const handleRetrieve = async (row: any) => {
    const payoutData = {
      vendor_id: null, // Ensure payout is created without vendor_id
    };

    const response = await updatePayOuts(row.id, payoutData);
    if (response.data) {
      dispatch(setRefreshPayOut(true));
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length) {
      setSelectedRows([]);
      setDrawerOpen(false);
      setTotalPayoutAmount(0);
    } else {
      const newSelectedRows = payOuts.payout
        .filter(
          (item: any) =>
            item.vendor_code === null && item.status === Status.INITIATED,
        )
        .map((item: any) => item.id);

      const totalAmount = payOuts.payout
        .filter(
          (item: any) =>
            item.vendor_code === null && item.status === Status.INITIATED,
        )
        .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

      setSelectedRows(newSelectedRows);
      setDrawerOpen(true);
      setTotalPayoutAmount(totalAmount);
    }
  };

  const handleRowSelect = useCallback(
    (id: string) => {
      if (selectedRows.includes(id)) {
        const newSelectedRows = selectedRows.filter((i) => i !== id);
        setSelectedRows(newSelectedRows);
        if (newSelectedRows.length === 0) {
          setDrawerOpen(false);
        }
      } else {
        setSelectedRows([...selectedRows, id]);
        setDrawerOpen(true);
      }
    },
    [selectedRows],
  );

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
    async (
      filters: Record<string, string | string[]> = {}, // Filters from selectedFilterData
    ) => {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        // Ensure status is INITIATED if not specified, but merge with existing filters
        const inProgressStatuses = [Status.INITIATED];
        const mergedFilters = {
          ...filters,
          status: filters.status || inProgressStatuses, // Default to INITIATED if not provided
        };
        let params = new URLSearchParams({
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 20).toString(),
        });
        // const searchParams = new URLSearchParams({
        //   ...(searchQuery && { search: searchQuery }),
        // });
        if (
          role === Role.ADMIN ||
          role === Role.OPERATIONS ||
          role === Role.TRANSACTIONS
        ) {
          params = new URLSearchParams({
            page: (pagination?.page || 1).toString(),
            limit: (pagination?.limit || 20).toString(),
            sortOrder: 'ASC',
            isAmount: 'true',
          });
        }

        // Append all filters to params
        Object.entries(mergedFilters).forEach(([key, value]) => {
          params.append(
            key,
            Array.isArray(value) ? value.join(',') : String(value),
          );
        });

        if (debouncedUtrId) {
          params.append('user', debouncedUtrId);
        }

        if (debouncedMerchantOrderId) {
          params.append('merchant_order_id', debouncedMerchantOrderId);
        }
        // if (debouncedNickName) {
        //   params.append('nick_name', debouncedNickName);
        // }

        isLoad && dispatch(onload());
        let response;
        response = await getAllPayOuts(params.toString());
        // totalCount = await getCount('Payout', '', mergedFilters);
        dispatch(getTotalCount(response.data.totalCount));
        dispatch(getPayOuts(response.data));
        if (
          role === Role.ADMIN ||
          role === Role.OPERATIONS ||
          role === Role.TRANSACTIONS
        ) {
          setPendingAmount(response.data.totalAmount);
        }
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
      // debouncedNickName
    ],
  );
  const handlePageChange = useCallback(
    (page: number) => {
      // Only update if page actually changed
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
  //refresh
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

  //reset
  const handleReset = useCallback(async () => {
    dispatch(onload());
    setSelectedFilter([]);
    setSelectedFilterVendor([]);
    setSelectedFilterDates('');
    setUtrId('');
    setMerchantOrderId('');
    // setNickName('');
    setSelectedColumn('');
    setFilterValue('');
    setSelectedSubTab(Status.INITIATED);
    setSelectedFilterData({ status: Status.INITIATED });
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

  // Debounce the searchQuery to reduce API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUtrId(utrId.trim());
      setDebouncedMerchantOrderId(merchantOrderId.trim());
      // setDebouncedNickName(nickName.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [
    utrId,
    merchantOrderId,
    // nickName
  ]);

  // Fetch payout data when debounced search, filters, or pagination changes
  useEffect(() => {
    setIsReset(true);
  }, [
    debouncedUtrId,
    debouncedMerchantOrderId,
    // debouncedNickName,
    selectedFilterData,
  ]);

  useEffect(() => {
    if (isReset) {
      getPayOutData(selectedFilterData || {});
    }
  }, [
    debouncedUtrId,
    debouncedMerchantOrderId,
    // debouncedNickName,
    selectedFilterData,
    pagination?.page,
    pagination?.limit,
    getPayOutData,
    isReset,
  ]);

  // Refresh payout data on external trigger
  useEffect(() => {
    if (refreshPayOut) {
      getPayOutData(selectedFilterData || {}).then(() => {
        dispatch(setRefreshPayOut(false));
      });
    }
  }, [refreshPayOut, getPayOutData, selectedFilterData, dispatch]);

  const payOuts = useAppSelector(getAllPayOutData);

  const handlePayOutChange = async (data: any) => {
    setIsLoading(true);
    let res;
    try {
      if (selectedMethod === 'eko' || selectedMethod === 'payassist') {
        let newPayload = { ...data, config: {} };
        const apiData = {
          amount: payOutData.amount,
          config: { ...newPayload.config, method: 'PAYASSIST' },
        };
        const id = payOutData.id;
        res = await updatePayOuts(id, apiData);
      } else if (selectedMethod === 'tatapay') {
        let newPayload = { ...data, config: {} };
        const apiData = {
          amount: payOutData.amount,
          config: { ...newPayload.config, method: 'TATAPAY' },
        };
        const id = payOutData.id;
        res = await updatePayOuts(id, apiData);
      } else if (selectedMethod === 'clickrr') {
        let newPayload = { ...data, config: {} };
        const apiData = {
          amount: payOutData.amount,
          config: { ...newPayload.config, method: 'CLICKRR' },
        };
        const id = payOutData.id;
        res = await updatePayOuts(id, apiData);
      } else {
        const apiData =
          payOutData.status === Status.INITIATED
            ? { ...data }
            : { ...payOutData };
        const id = payOutData.id;
        const method = apiData.method;
        let newPayload = { ...data, config: {} };

        // Only include rejected_reason and reason_details for REJECTED status
        if (payOutType === Status.REJECTED) {
          let rejectedReason = data.rejected_reason;
          if (data.rejected_reason === 'other') {
            rejectedReason = data.reason_details;
          }
          if (rejectedReason) {
            newPayload = {
              ...data,
              config: { rejected_reason: rejectedReason },
            };
          }
        } else if (method) {
          // Include method in config only if not REJECTED
          newPayload = {
            ...data,
            config: { ...newPayload.config, method: method },
          };
        }
        delete newPayload.method;
        delete newPayload.rejected_reason;
        delete newPayload.reason_details;
        res = await updatePayOuts(id, newPayload);
      }

      // Handle different response structures
      const isSuccess =
        res?.meta?.message ||
        (res?.message && res?.statusCode >= 200 && res?.statusCode < 300);

      if (isSuccess) {
        const successMessage =
          res?.meta?.message || res?.message || 'Payout updated successfully';
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: successMessage,
          }),
        );
        setNewTransactionModal(false);
        setPayOutData({});
        setSelectedReason('Invalid account details'); // Reset after submission
        setNewTransactionModal(false);
        dispatch(setRefreshPayOut(true));
      } else {
        // Safely handle error response
        const errorMessage =
          res?.error?.message || res?.message || 'An error occurred';
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: errorMessage,
          }),
        );
      }
    } catch {
      // Catch any network or API errors to prevent error boundary from causing reloads
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Failed to update payout. Please try again.',
        }),
      );
    }
    setIsLoading(false);
  };

  const handleVendorCancel = () => {
    setVendorModal(false);
  };

  const handleBatchCancel = () => {
    setBatchModal(false);
  };

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
      status: selectedSubTab,
    };

    if (selectedFilter.length) {
      filters['merchant_id'] = selectedFilter.map((f: any) => f.value);
    }

    if (selectedColumn && filterValue) {
      filters[selectedColumn] = filterValue;
    }

    setSelectedFilterData(filters);
    getPayOutData(filters);
  }, [
    selectedFilter,
    selectedColumn,
    filterValue,
    selectedSubTab,
    getPayOutData,
    dispatch,
  ]);

  const handleVendorSubmit = async (data: any) => {
    setIsLoading(true);

    const selectedPayOuts = payOuts.payout.filter(
      (payout) => payout && payout.id && selectedRows.includes(payout.id),
    );
    const payoutIds = selectedPayOuts.map((payout) => payout.id);
    const updatedData = {
      payouts_ids: payoutIds,
    };
    if (payoutIds.length > 0) {
      await assigenedPayOuts(`${data.verdor_user_id}`, updatedData);
      dispatch(setRefreshPayOut(false)); // Refresh after
    }

    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Vendor updated for selected rows',
      }),
    );
    setVendorModal(false);
    setSelectedRows([]);
    setTotalPayoutAmount(0);
    setDrawerOpen(false);
    setIsLoading(false);
    dispatch(setRefreshPayOut(true));
  };

  const handleBatchSubmit = async (data: any) => {
    setIsLoading(true);
    const vendorCode = data.verdor_user_id;

    const selectedPayOuts = payOuts.payout.filter(
      (payout) => payout && payout.id && selectedRows.includes(payout.id),
    );
    for (const payOut of selectedPayOuts) {
      if (payOut) {
        const updatedData = { vendor_id: vendorCode };
        await updatePayOuts(`${payOut.id}`, updatedData);
      }
    }

    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Batch updated for selected rows',
      }),
    );
    setVendorModal(false);
    setSelectedRows([]);
    setDrawerOpen(false);
    setIsLoading(false);
    dispatch(setRefreshPayOut(true));
  };

  // conflicting refresh in retrive and add vendor
  const triggerRefresh = async () => {
    try {
      await getPayOutData();
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Failed to refresh data',
        }),
      );
    }
  };

  const toggleBatchWithdrawal = async () => {
    // Reset balance and method when opening modal
    setAvailableBalance('0');
    setBatchSelectedMethod('');
    setBatchWithdrawalModal(!batchWithdrawalModal);
  };

  const handleBatchWithdrawal = async () => {
    setIsLoading(true);
    const selectedPayOuts = payOuts.payout.filter(
      (payout) => payout && payout.id && selectedRows.includes(payout.id),
    );
    try {
      const validPayOuts = selectedPayOuts.filter(
        (p) =>
          p &&
          p?.id &&
          (p?.status === Status.APPROVED || p?.status === Status.INITIATED),
      );

      if (validPayOuts.length === 0) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message:
              'No valid payouts selected for batch withdrawal. Only Approved or Initiated payouts can be processed.',
          }),
        );
        setIsLoading(false);
        return;
      }

      if (validPayOuts.length !== selectedPayOuts.length) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `Only ${validPayOuts.length} out of ${selectedPayOuts.length} selected payouts are eligible for batch withdrawal.`,
          }),
        );
        setIsLoading(false);
        return;
      }

      // Check available balance
      if (Number(availableBalance) < Number(totalPayoutAmount)) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message:
              'Cannot process batch withdrawal due to insufficient wallet balance.',
          }),
        );
        setIsLoading(false);
        return;
      }

      const payoutIds = validPayOuts.map((p) => p?.id);

      // Prepare batch withdrawal data
      const batchData = {
        payoutIds: payoutIds,
      };

      // Call batch withdrawal API based on selected payment method
      let result;
      if (batchSelectedMethod === 'tatapay') {
        result = await tataPayBulkPayout(batchData);
      } else {
        throw new Error('No payment method selected for batch withdrawal');
      }

      if (result?.error?.message) {
        await triggerRefresh();
        dispatch(setRefreshPayOut(true));
        setBatchWithdrawalModal(false);
        setSelectedRows([]);
        setDrawerOpen(false);
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: result.error.message || 'Batch withdrawal failed',
          }),
        );
      } else {
        await triggerRefresh();
        dispatch(setRefreshPayOut(true));
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: `Batch withdrawal initiated for ${payoutIds.length} payouts`,
          }),
        );
        setBatchWithdrawalModal(false);
        setSelectedRows([]);
        setDrawerOpen(false);
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'An unexpected error occurred during batch withdrawal',
        }),
      );
    } finally {
      setIsLoading(false);
      setSelectedRows([]);
      setTotalPayoutAmount(0); // Reset total payout amount after batch withdrawal
    }
  };

  const handleBatchWithdrawalCancel = () => {
    setBatchWithdrawalModal(false);
  };

  const handleBatchMethodChange = async (value: string) => {
    setBatchSelectedMethod(value);
    try {
      if (value === 'payassist') {
        const balance = await getWalletBalance();
        setAvailableBalance(balance?.data?.walletBalance || '0');
      } else if (value === 'tatapay') {
        const balance = await getTataPayBalance();
        setAvailableBalance(balance?.data?.walletBalance || '0');
      } else if (value === 'clickrr') {
        const balance = await getClickrrWalletBalance();
        setAvailableBalance(balance?.data?.walletBalance || '0');
      } else {
        setAvailableBalance('0');
      }
    } catch {
      setAvailableBalance('0');
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Failed to fetch wallet balance',
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
                    {(role === Role.ADMIN ||
                      role === Role.OPERATIONS ||
                      role === Role.TRANSACTIONS) && (
                      <div className="w-full sm:w-auto bg-white dark:bg-darkmode-800 border border-dashed border-slate-300 dark:border-darkmode-600 rounded-lg shadow-md px-3 py-2 flex items-center justify-center h-10">
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          InProcess Total :
                        </span>
                        <span
                          className={`font-medium ml-1 ${
                            pendingAmount > 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          ₹{pendingAmount}
                        </span>
                      </div>
                    )}

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
                        onClick={() => setExportModal()}
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
                          title="Export PayIns"
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
                            onClick={() => openfilter()}
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
                                      ? Columns.PAYOUT_PROGRESS_VENDOR
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
                                            ? Columns.PAYOUT_PROGRESS_VENDOR
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
              <div className="mb-4 border-b border-slate-200/60 dark:border-darkmode-400">
                <Tab.Group
                  selectedIndex={selectedSubTab === Status.INITIATED ? 0 : 1}
                  onChange={(tabIndex) => handleSubTabChange(tabIndex === 0)}
                >
                  {Role.VENDOR !== role && <Tab.List variant="tabs">
                    <Tab>
                      <Tab.Button
                        className="w-full py-2 flex items-center justify-center"
                        as="button"
                      >
                        <Lucide icon="Database" className="w-4 h-4 mr-2" />
                        INITIATED
                      </Tab.Button>
                    </Tab>
                    <Tab>
                      <Tab.Button
                        className="w-full py-2 flex items-center justify-center"
                        as="button"
                      >
                        <Lucide icon="Clock" className="w-4 h-4 mr-2" />
                        PENDING
                      </Tab.Button>
                    </Tab>
                  </Tab.List>}
                </Tab.Group>
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
                      ? Columns.PAYOUT_PROGRESS_VENDOR
                      : Columns.PAYOUT
                  }
                  data={{
                    rows: payOuts.payout,
                    totalCount: payOuts.totalCount,
                  }}
                  handleRowClick={handleRowSelect}
                  selectedRows={selectedRows}
                  handleRetrieve={handleRetrieve}
                  setTotalPayoutAmount={setTotalPayoutAmount}
                  actionMenuItems={(row: any) => {
                    const items: {
                      label?: string;
                      icon: 'Bell' | 'RotateCcw' | 'CheckSquare' | 'XSquare';
                      onClick: (row: any) => void;
                    }[] = [];
                    if (
                      row?.status &&
                      [Status.INITIATED, Status.PENDING].includes(row?.status)
                    ) {
                      const isAdminWithVendor =
                        designation !== Role.ADMIN && row?.vendor_id;
                      if (
                        !isAdminWithVendor ||
                        row?.status === Status.PENDING
                      ) {
                        items.push({
                          label: 'Approve',
                          icon: 'CheckSquare',
                          onClick: () => {
                            transactionModal(row);
                            setSelectedRows([]);
                            setDrawerOpen(false);
                            setPayOutType(Status.APPROVED);
                          },
                        });
                        items.push({
                          label: 'Reject',
                          icon: 'XSquare',
                          onClick: () => {
                            transactionModal(row);
                            setSelectedRows([]);
                            setDrawerOpen(false);
                            setPayOutType(Status.REJECTED);
                          },
                        });
                      }
                    }
                    return items;
                  }}
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 20}
                  onPageChange={handlePageChange}
                  source="Payout"
                  onPageSizeChange={handlePageSizeChange}
                  handleSelectAll={handleSelectAll}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {newTransactionModal && (
        <Modal
          handleModal={transactionModal}
          forOpen={newTransactionModal}
          title={`Update Payout`}
        >
          <DynamicForm
            sections={
              payOutType === Status.APPROVED
                ? approvePayOutFormFields(
                    bankOptions,
                    handleMethod,
                    selectedMethod,
                    availableBalance,
                    undefined,
                    undefined,
                    payOutData.amount,
                    allowPayAssist,
                    allowTataPay,
                    payOutData.vendor_user_id,
                    allowClickrr,
                  ).APPROVE_PAYOUT
                : approvePayOutFormFields(
                    bankOptions,
                    undefined,
                    undefined,
                    undefined,
                    handleReason,
                    selectedReason,
                    payOutData.amount,
                    allowPayAssist,
                    allowTataPay,
                    payOutData.vendor_user_id,
                    allowClickrr,
                  ).REJECT_PAYOUT
            }
            onSubmit={handlePayOutChange}
            defaultValues={{
              rejected_reason: selectedReason,
              reason_details: '',
              method: selectedMethod,
            }}
            isEditMode={true}
            handleCancel={transactionModal}
            isLoading={isLoading}
          />
        </Modal>
      )}

      <Modal handleModal={handleVendorCancel} forOpen={vendorModal}>
        <DynamicForm
          sections={addVendorForBank(vendorCodesData)}
          onSubmit={handleVendorSubmit}
          defaultValues={{}}
          isEditMode={true}
          handleCancel={handleVendorCancel}
          isLoading={isLoading}
        />
      </Modal>

      <Modal handleModal={handleBatchCancel} forOpen={batchModal}>
        <DynamicForm
          sections={addBatchVendors}
          onSubmit={handleBatchSubmit}
          defaultValues={{ amount: 1000 }}
          isEditMode={false}
          handleCancel={handleBatchCancel}
          isLoading={isLoading}
        />
      </Modal>
      {(allowPayAssist || allowTataPay) && (
        <Modal
          handleModal={handleBatchWithdrawalCancel}
          forOpen={batchWithdrawalModal}
          title="Batch Withdrawal"
        >
          <DynamicForm
            key={`batch-withdrawal-${batchSelectedMethod}-${availableBalance}`}
            sections={getBatchWithdrawalForm(
              totalPayoutAmount,
              availableBalance,
              handleBatchMethodChange,
              // allowPayAssist,
              allowTataPay,
            )}
            onSubmit={handleBatchWithdrawal}
            defaultValues={{
              method: batchSelectedMethod,
              totalAmount: totalPayoutAmount,
              availableBalance: availableBalance,
              TransactionType: 'IMPS',
            }}
            isEditMode={true}
            handleCancel={handleBatchWithdrawalCancel}
            isLoading={isLoading}
          />
        </Modal>
      )}

      {/* Drawer for selected rows count */}
      {drawerOpen && (
        <Drawer open={drawerOpen} position="bottom">
          <div className="flex flex-row">
            <div className="flex items-center">
              <div>
                <span className="text-lg">Total: {totalPayoutAmount}</span>
                <span className="ml-4">
                  {selectedRows.length} rows selected
                </span>
              </div>
            </div>
            <Button
              className="my-4 ml-20"
              variant="primary"
              onClick={() => VendorAssignedModal()}
            >
              Add Vendor
            </Button>
            {(allowPayAssist || allowTataPay) &&
              [Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(
                role || '',
              ) && (
                <Button
                  className="my-4 ml-5"
                  variant="primary"
                  onClick={() => toggleBatchWithdrawal()}
                >
                  Batch Withdrawal
                </Button>
              )}
          </div>
        </Drawer>
      )}
    </>
  );
};

export default InProgressPayOut;
