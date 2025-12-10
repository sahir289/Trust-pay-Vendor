/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Lucide from '@/components/Base/Lucide';
import { Menu, Popover, Tab } from '@/components/Base/Headless';
import { FormInput, FormSelect } from '@/components/Base/Form';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import Button from '@/components/Base/Button';
import CustomTable from '@/components/TableComponent/CommonTable';
import { DataEntryOptions, Role, Status } from '@/constants';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  EditAmountOrUTR,
  Columns,
  resetAddData,
  VerificationformFields,
} from '@/constants';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import {
  getBankResponses,
  onload,
  updateSingleBankResponseEntry,
  setIsloadingDataEntries,
  clearBankResponseFilters,
  setBankResponseFilter,
} from '@/redux-toolkit/slices/dataEntries/dataEntrySlice';
import {
  getAllBankResponseData,
  getRefreshDataEntries,
  isloadingDataEntries,
} from '@/redux-toolkit/slices/dataEntries/dataEntrySelectors';
import {
  getAllBankResponses,
  getBankResponsesReports,
  resetBankResponse,
  updateBankResponse,
  // getBankResponseBySearchApi,
  importBankResponse,
} from '@/redux-toolkit/slices/dataEntries/dataEntryAPI';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import LoadingIcon from '@/components/Base/LoadingIcon';
import Modal from '@/components/Modal/modals';
import Litepicker from '@/components/Base/Litepicker';
import { downloadCSV } from '@/components/ExportComponent';
import DynamicForm from '@/components/CommonForm';
import Select from 'react-select';
import { verifyPassword } from '@/redux-toolkit/slices/auth/authAPI';
import dayjs from 'dayjs';
import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { getBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
import { selectAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSelectors';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

dayjs.extend(utc);
dayjs.extend(timezone);

interface ResetUTR {
  bank_id: string;
  amount?: number | string;
  utr?: string;
  status?: string | boolean;
  id?: string;
  previousAmount?: number | string;
}

interface BankResponseRow {
  id: string;
  amount: number;
  utr: string;
  status: string;
  is_used: boolean;
}

interface FilterState {
  merchant_id?: string[];
  status?: string;
  [key: string]: string | string[] | undefined;
}

interface AddDataHistoryProps {
  selectedIndex: number;
  tabState: number;
}

const AddDataHistory: React.FC<AddDataHistoryProps> = ({ selectedIndex }) => {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [callBank, setCallBank] = useState(false);
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${date} - ${date}`,
  );
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<
    { value: string; label: string }[]
  >([]);
  const [passwordModal, setPasswordModal] = useState(false);
  const [resetUTRVerified, setResetUTRVerified] = useState<ResetUTR>({
    bank_id: '',
    amount: undefined,
    utr: undefined,
    status: undefined,
    id: undefined,
    previousAmount: undefined,
  });
  const [formData, setFormData] = useState<ResetUTR | null>(null);
  const [newTransactionModal, setNewTransactionModal] = useState(false);
  const refreshDataEntries = useAppSelector(getRefreshDataEntries);
  const isLoad = useAppSelector(isloadingDataEntries);
  const [editModal, setEditModal] = useState(false);
  const [selectedData, setSelectedData] = useState<BankResponseRow | null>(
    null,
  );
  const [selectedValue, setSelectedValue] = useState<{
    amount?: number | string;
    utr?: string;
  } | null>(null);
  const [editModalType, setEditModalType] = useState<string>('');
  const [editEditingField, setEditEditingField] = useState<
    'amount' | 'utr' | 'utr_id' | 'bank_acc_id' | null
  >(null);
  const [resetUTREditingField, setResetUTREditingField] = useState<
    'utr' | 'amount' | 'bank_id' | null
  >(null);
  const [isGloballyEditing, setIsGloballyEditing] = useState(false); // Prevent multiple edit operations
  const [isFieldBeingEdited, setIsFieldBeingEdited] = useState(false); // Track when any field is being actively edited
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBank, setSelectedBank] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [nickName, setNickName] = useState<string>('');
  const [utr, setUtr] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [debouncedAmount, setDebouncedAmount] = useState<string>('');
  const [debouncedNickName, setDebouncedNickName] = useState<string>('');
  const [debouncedUtr, setDebouncedUtr] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPDFLoading, setIsPDFLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFilterBank, setSelectedFilterBank] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({});
  const [activeDataTab, setActiveDataTab] = useState(0);
  const [isUpdatedFilterActive, setIsUpdatedFilterActive] = useState(
    sessionStorage.getItem('searchInAddData') === 'true',
  );
  const isFetching = useRef(false);
  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';
  const userData = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  let designation: string | undefined;

  if (userData) {
    const parsedData = JSON.parse(userData);
    role = parsedData.role;
    designation = parsedData.designation;
  }

  useEffect(() => {
    dispatch(resetPagination());
  }, [dispatch]);

  useEffect(() => {
    sessionStorage.setItem('searchInAddData', 'false');
    setIsUpdatedFilterActive(false);
  }, []);

  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const bankNamesPayInList = await getAllBankNames('PayIn');
        if (bankNamesPayInList) {
          dispatch(getBankNames([...bankNamesPayInList.bankNames]));
        }
      } catch (error) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: (error as any)?.message || 'UTR verified successfully',
          }),
        );
      }
    };
    if (callBank) {
      fetchBankNames();
    }
  }, [callBank, dispatch]);

  const bankNames = useAppSelector(selectAllBankNames);
  const bankOptions = [...bankNames];

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

  const updateBank = () => {
    setCallBank(true);
    setResetUTREditingField('bank_id');
  };

  const shouldSetSearchInAddData = (nickName: string, utr: string,
    amount : string)=> {
    if (nickName || utr || amount) {
      return true;
    }

    // Check filters from FilterState
    // const hasFilterStateValues = Boolean(
    //   filters.is_used ||
    //   filters.bank_id ||
    //   filters.status ||
    //   filters.amount ||
    //   filters.utr ||
    //   filters.upi_short_code ||
    //   filters.updated_at ||
    //   filters.updated_by
    // );

    // // Check additional filters from component state
    // const hasAdditionalFilters = Boolean(
    //   selectedColumn && filterValue
    // );

    // return hasFilterStateValues || hasAdditionalFilters;
  };

  const getBankResponseData = useCallback(
    async (filters: FilterState = {}, filterUpdated?: boolean) => {
      if (isFetching.current) return;
      isFetching.current = true;
      isLoad && setIsPageLoading(true);
      try {
        const queryParams: Record<string, string> = {
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 20).toString(),
        };

        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            queryParams[key] = Array.isArray(value)
              ? value.join(',')
              : String(value);
          }
        });

        if (debouncedNickName) {
          queryParams.nick_name = debouncedNickName;
        }
        if (debouncedAmount) {
          queryParams.amount = debouncedAmount;
        }
        if (debouncedUtr) {
          queryParams.utr = debouncedUtr;
        }
        if (shouldSetSearchInAddData(debouncedNickName, debouncedUtr ,debouncedAmount)) {
          sessionStorage.setItem('searchInAddData', 'true');
        } else {
          sessionStorage.setItem('searchInAddData', 'false');
        }
        if (
          filterUpdated ||
          (isUpdatedFilterActive !== false && filterUpdated !== false)
        ) {
          queryParams.updated = 'true';
        }
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await getAllBankResponses(queryString);
        if (response) {
          const payload = {
            bankResponse: response.data?.rows || [],
            resetHistory: [],
            totalCount: response.data.totalCount || 0,
            loading: false,
            error: null,
          };
          dispatch(getBankResponses(payload));
          !isLoad && dispatch(setIsloadingDataEntries(true));
        } else {
          throw new Error('Failed to fetch bank responses');
        }
      } catch (error) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: (error as Error).message,
          }),
        );
      } finally {
        setIsPageLoading(false);
        isFetching.current = false;
      }
    },
    [
      pagination?.page,
      pagination?.limit,
      dispatch,
      debouncedNickName,
      debouncedUtr,
      debouncedAmount,
      filters,
      isUpdatedFilterActive,
    ],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNickName(nickName.trim());
      setDebouncedUtr(utr.trim());
      setDebouncedAmount(amount.trim());
    }, 1000);
    return () => clearTimeout(handler);
  }, [nickName, utr , amount]);

  useEffect(() => {
    getBankResponseData(filters, isUpdatedFilterActive);
  }, [
    debouncedNickName,
    debouncedUtr,
    debouncedAmount,
    filters,
    isUpdatedFilterActive,
    getBankResponseData,
  ]);

  useEffect(() => {
    if (refreshDataEntries && !isFetching.current) {
      getBankResponseData(filters).then(() => {
        // dispatch(setRefreshDataEntries(false));
      });
    }
  }, [refreshDataEntries, dispatch, getBankResponseData, filters]);

  const bankResponses = useAppSelector(getAllBankResponseData);

  const handleRefresh = useCallback(async () => {
    dispatch(onload());
    dispatch(setIsloadingDataEntries(true));
    await getBankResponseData(filters, isUpdatedFilterActive);
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Bank responses refreshed successfully',
      }),
    );
  }, [dispatch, getBankResponseData, filters, isUpdatedFilterActive]);

  const handleReset = useCallback(async () => {
    setNickName('');
    setUtr('');
    setDebouncedNickName('');
    setDebouncedUtr('');
    setAmount('');
    setDebouncedAmount('');
    dispatch(onload());
    dispatch(setIsloadingDataEntries(true));
    dispatch(clearBankResponseFilters());
    sessionStorage.setItem('searchInAddData', 'false');
    setSelectedFilterStatus([]);
    setSelectedFilterDates('');
    setIsUpdatedFilterActive(false);
    setSelectedFilterBank('');
    setSelectedStatus('');
    setSelectedColumn('');
    setFilterValue('');
    setFilters({});
    dispatch(resetPagination());
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully',
      }),
    );
  }, [dispatch]);

  const handleViewAllData = useCallback(async () => {
    dispatch(onload());
    sessionStorage.setItem('searchInAddData', 'false');
    setSelectedFilterStatus([]);
    setSelectedFilterDates('');
    setFilterValue('');
    setFilters({});
    setNickName('');
    setUtr('');
    setAmount('');
    setDebouncedAmount('');
    setDebouncedNickName('');
    setDebouncedUtr('');
    setIsUpdatedFilterActive(false);
    dispatch(resetPagination());
    setActiveDataTab(0);
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Data loaded successfully',
      }),
    );
  }, [dispatch]);

  const handleViewUpdatedData = useCallback(async () => {
    dispatch(onload());
    sessionStorage.setItem('searchInAddData', 'true');
    setSelectedFilterStatus([]);
    setSelectedFilterDates('');
    setFilterValue('');
    setFilters({});
    setNickName('');
    setUtr('');
    setDebouncedNickName('');
    setDebouncedUtr('');
    setAmount('');
    setDebouncedAmount('');
    setIsUpdatedFilterActive(true);
    dispatch(resetPagination());
    setActiveDataTab(1);
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Data loaded successfully',
      }),
    );
  }, [dispatch]);

  const handleDownload = async (type: ExportFormat) => {
    try {
      if (!selectedFilterDates) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Please select a date range',
          }),
        );
        return;
      }
      const [startDateStr, endDateStr] = selectedFilterDates.split(' - ');
      const startDate = new Date(startDateStr ?? '')
        .toISOString()
        .split('T')[0];
      const endDate = endDateStr
        ? new Date(endDateStr).toISOString().split('T')[0]
        : '';
      const selectedStatus =
        selectedFilterStatus?.map((status) => status.value).join(',') || '';
      const params = {
        status: selectedStatus,
        startDate,
        endDate,
        page: '',
        limit: '',
        sortOrder: 'ASC',
        ...(isUpdatedFilterActive ? { updated: 'true' } : {}),
      };
      const queryString = new URLSearchParams(
        params as Record<string, string>,
      ).toString();
      let response;
      if (selectedIndex === 0) {
        response = await getBankResponsesReports(queryString);
      }
      const dataToExport = response?.data?.rows || response?.rows || [];
      if (!dataToExport.length) {
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'No data found for the selected criteria',
          }),
        );
        return;
      }
      type ExportedData = {
        ID?: string; // Optional - only for admin
        Status: string;
        Amount: number;
        AmountCode?: string; // Optional - only for admin
        UTR: string;
        Used?: string; // Optional - only for admin
        BankName: string;
        CreatedAt: string;
        UpdatedAt?: string; // Optional - only for admin
        CreatedBy?: string; // Optional - only for admin
        UpdatedBy?: string; // Optional - only for admin
      };
      const filteredData: ExportedData[] = dataToExport.map(
        (item: {
          sno: string;
          status: string;
          amount?: number;
          upi_short_code?: string;
          utr?: string;
          is_used?: boolean;
          nick_name?: string;
          created_by?: string;
          updated_by?: string;
          created_at: string;
          updated_at: string;
        }) => {
          const baseData = {
            ...(role === Role.ADMIN && { Sno: item.sno }),
            Status: item.status,
            Amount: item.amount || 0,
            ...(role === Role.ADMIN && {
              AmountCode: item.upi_short_code || '',
            }),
            UTR: item.utr || '',
            ...(role === Role.ADMIN && {
              Used: item.is_used ? 'Used' : 'Unused',
            }),
            BankName: item.nick_name || '',
            CreatedAt: dayjs(item.created_at)
              .tz('Asia/Kolkata')
              .format('DD-MM-YYYY hh:mm:ss A'),
          };

          // Add admin-only fields if user is admin
          if (role === Role.ADMIN) {
            return {
              ...baseData,
              UpdatedAt: dayjs(item.updated_at)
                .tz('Asia/Kolkata')
                .format('DD-MM-YYYY hh:mm:ss A'),
              CreatedBy: item.created_by || 'N/A',
              UpdatedBy: item.updated_by || 'N/A',
            };
          }

          return baseData;
        },
      );
      const filename = `bank-response-report_${startDate}_to_${endDate}`;
      downloadCSV(filteredData, type, filename);
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: `Report exported successfully as ${type}`,
        }),
      );
    } catch (error) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            error instanceof Error
              ? error.message || 'Failed to export report'
              : 'Failed to export report',
        }),
      );
    } finally {
      setExportModalOpen(false);
    }
  };

  const handleUpload = async (type: ExportFormat) => {
    try {
      setIsPDFLoading(true);
      if (!selectedFile) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Please select a file to upload',
          }),
        );
        return;
      }
      if (!selectedBank) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Please select a bank',
          }),
        );
        return;
      }
      const formData = new FormData();
      formData.append('bank_id', selectedBank.value);
      formData.append('fileType', type);
      formData.append('file', selectedFile);
      const response = await importBankResponse(formData);
      if (response.meta?.message) {
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: response.meta.message,
          }),
        );
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: response.error?.message || 'Failed to import report',
          }),
        );
      }
    } catch (error) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            error instanceof Error ? error.message : 'Failed to import report',
        }),
      );
    } finally {
      setImportModalOpen(false);
      setSelectedFile(null);
      setSelectedBank(null);
      setIsPDFLoading(false);
    }
  };

  const handleEditModal = (data: any, type: string) => {
    if (isGloballyEditing) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            'Another edit operation is already in progress. Please complete or cancel it first.',
        }),
      );
      return;
    }

    setIsGloballyEditing(true);
    setSelectedData(data);
    setSelectedValue({ [type]: type === 'amount' ? data.amount : data.utr });
    setEditModalType(type);
    setEditModal(true);
  };

  const handleEditCancel = () => {
    setSelectedData(null);
    setIsGloballyEditing(false);
    setEditEditingField(null);
    setIsFieldBeingEdited(false);
    setEditModal(false);
  };

  const handleEditSubmit = async (data: any) => {
    setIsLoading(true);
    if (!selectedData) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'No data selected for editing',
        }),
      );
      setEditModal(false);
      return;
    }

    const fieldKeys = Object.keys(data).filter(
      (key) =>
        data[key] !== undefined && data[key] !== null && data[key] !== '',
    );
    if (fieldKeys.length > 1) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Only one field can be updated at a time',
        }),
      );
      setIsLoading(false);
      return;
    }

    if (fieldKeys.length === 0) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'No changes detected',
        }),
      );
      setIsLoading(false);
      return;
    }

    dispatch(onload());
    const res = await updateBankResponse(selectedData.id, data);
    if (res.meta.message) {
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
    setSelectedData(null);
    setIsGloballyEditing(false);
    setEditEditingField(null);
    setIsFieldBeingEdited(false);
    setEditModal(false);
    setIsLoading(false);
  };

  const resetModal = (data?: any) => {
    if (isGloballyEditing) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            'Another edit operation is already in progress. Please complete or cancel it first.',
        }),
      );
      return;
    }

    setIsGloballyEditing(true);
    setErrorMessage('');
    const updatedData: ResetUTR = {
      utr: data?.utr || '',
      status: data?.status || '',
      id: data?.id || '',
      bank_id: data?.bank_id || '',
      amount: data?.amount || '',
    };
    if (data?.bank_id !== formData?.bank_id) {
      updatedData.bank_id = data?.bank_id || '';
    }
    setResetUTRVerified(updatedData);
    setFormData(data);
    setNewTransactionModal(true);
  };

  const handleResetUTRCancel = () => {
    setResetUTREditingField(null);
    setIsGloballyEditing(false);
    setIsFieldBeingEdited(false);
    setNewTransactionModal(false);
  };

  const handleUTRFormSubmit = (values: ResetUTR) => {
    setIsLoading(true);

    const submittedFields = Object.keys(values || {});
    const unexpectedFields = submittedFields.filter(
      (field) =>
        field !== resetUTREditingField &&
        values[field as keyof ResetUTR] !== undefined &&
        values[field as keyof ResetUTR] !== null &&
        values[field as keyof ResetUTR] !== '',
    );

    if (unexpectedFields.length > 0) {
      setIsLoading(false);
      alert(
        `Error: Cannot modify multiple fields at once. Only ${resetUTREditingField} is allowed to be edited.`,
      );
      return;
    }

    const updatedData: ResetUTR = {
      ...resetUTRVerified,
      id: formData?.id || resetUTRVerified.id,
    };

    if (
      resetUTREditingField === 'utr' &&
      values.utr !== undefined &&
      values.utr !== null
    ) {
      updatedData.utr = values.utr;
    } else if (
      resetUTREditingField === 'amount' &&
      values.amount !== undefined &&
      values.amount !== null
    ) {
      updatedData.amount =
        values.amount === ''
          ? formData
            ? formData.amount
            : ''
          : Number(values.amount);
    } else if (
      resetUTREditingField === 'bank_id' &&
      values.bank_id !== undefined &&
      values.bank_id !== null
    ) {
      updatedData.bank_id = values.bank_id;
    } else {
      setIsLoading(false);
      alert(`Error: No valid value provided for ${resetUTREditingField}`);
      return;
    }

    setResetUTRVerified(updatedData);
    setResetUTREditingField(null);
    setIsGloballyEditing(false);
    setIsFieldBeingEdited(false);
    setNewTransactionModal(false);
    setPasswordModal(true);
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (formValues: { password: string }) => {
    setIsLoading(true);
    try {
      const verified = await verifyPassword(formValues.password);
      if (!resetUTRVerified.id) {
        throw new Error('Missing required ID data');
      }
      if (verified) {
        const updateData: any = {};
        let hasChanges = false;
        if (
          resetUTRVerified.amount !== undefined &&
          resetUTRVerified.amount !== '' &&
          !isNaN(Number(resetUTRVerified.amount)) &&
          isFinite(Number(resetUTRVerified.amount))
        ) {
          updateData.amount = Number(resetUTRVerified.amount);
          hasChanges = true;
        }
        if (
          resetUTRVerified.bank_id !== undefined &&
          resetUTRVerified.bank_id !== formData?.bank_id
        ) {
          updateData.bank_id = resetUTRVerified.bank_id;
          hasChanges = true;
        }
        if (
          resetUTRVerified.utr !== undefined &&
          resetUTRVerified.utr !== formData?.utr
        ) {
          updateData.utr = resetUTRVerified.utr;
          hasChanges = true;
        }
        if (!hasChanges) {
          updateData.is_used = false;
        }
        const res = await resetBankResponse(resetUTRVerified.id, updateData);
        if (res.meta?.message) {
          if (res.data) {
            dispatch(updateSingleBankResponseEntry(res.data.data));
          }
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: res.meta?.message,
            }),
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: res.error?.message,
            }),
          );
        }
        setPasswordModal(false);
      }
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    const hasNoFilters =
      !selectedStatus &&
      !selectedFilterBank &&
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

    if (selectedStatus) {
      newFilters['is_used'] = selectedStatus;
    }

    if (selectedFilterBank) {
      newFilters['bank_id'] = selectedFilterBank;
    }

    if (selectedColumn && filterValue) {
      newFilters[selectedColumn] = filterValue;
    }

    dispatch(setBankResponseFilter(newFilters));
    setFilters(newFilters);
    getBankResponseData(newFilters, isUpdatedFilterActive);
  }, [
    selectedStatus,
    selectedFilterBank,
    selectedColumn,
    filterValue,
    dispatch,
    isUpdatedFilterActive,
    getBankResponseData,
  ]);

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="mt-3.5">
          <div className="flex flex-col">
            <div className="flex flex-col p-2 sm:p-4 md:p-5 sm:items-center sm:flex-row gap-y-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="UTR..."
                    className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                  />
                  {utr && (
                    <Lucide
                      icon="X"
                      className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                      onClick={() => {
                        setUtr('');
                        sessionStorage.setItem('searchInAddData', 'false');
                      }}
                    />
                  )}
                </div>
                <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="Bank Name..."
                    className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                  />
                  {nickName && (
                    <Lucide
                      icon="X"
                      className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                      onClick={() => {
                        setNickName('');
                        sessionStorage.setItem('searchInAddData', 'false');
                      }}
                    />
                  )}
                </div>
                <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="Amount..."
                    className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {nickName && (
                    <Lucide
                      icon="X"
                      className="absolute inset-y-0 right-0 z-10 w-4 h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                      onClick={() => {
                        setAmount('');
                        sessionStorage.setItem('searchInAddData', 'false');
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 sm:ml-auto">
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
                    onClick={() => setExportModalOpen(true)}
                  >
                    <Lucide
                      icon="Download"
                      className="stroke-[1.3] w-4 h-4 mr-2"
                    />
                    Export
                  </Menu.Button>
                </Menu>
                <Popover className="inline-block">
                  {({ close }: { close: () => void }) => (
                    <>
                      <Popover.Button
                        as={Button}
                        variant="outline-secondary"
                        className="w-full sm:w-auto"
                        onClick={() => setCallBank(true)}
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
                            <div className="mt-3">
                              <div className="text-left text-slate-500">
                                Bank
                              </div>
                              <FormSelect
                                className="flex-1 mt-2"
                                value={selectedFilterBank}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setSelectedFilterBank(newValue);
                                }}
                              >
                                <option value="">Select a Bank</option>
                                {Object.entries(bankOptions).map(
                                  ([key, value]) => (
                                    <option key={key} value={value.value}>
                                      {value.label}
                                    </option>
                                  ),
                                )}
                              </FormSelect>
                            </div>
                            {role && role === Role.ADMIN && (
                              <div className="mt-3">
                                <div className="text-left text-slate-500">
                                  Status
                                </div>
                                <FormSelect
                                  className="flex-1 mt-2"
                                  value={selectedStatus}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setSelectedStatus(newValue);
                                  }}
                                >
                                  <option value="">Select a status</option>
                                  {Object.entries(DataEntryOptions).map(
                                    ([key, value]) => (
                                      <option key={key} value={value.value}>
                                        {value.label}
                                      </option>
                                    ),
                                  )}
                                </FormSelect>
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
                                {(designation === Role.TRANSACTIONS
                                  ? Columns.BANK_RESPONSE_TRANSACTIONS
                                  : [
                                      Role.VENDOR,
                                      Role.VENDOR_OPERATIONS,
                                    ].includes(role ?? '')
                                  ? Columns.BANK_RESPONSE_VENDOR
                                  : Columns.BANK_RESPONSE
                                )
                                  .filter(
                                    (col) =>
                                      col.key !== 'nick_name' &&
                                      col.key !== 'is_used' &&
                                      col.key !== 'sno' &&
                                      col.key !== 'more_details' &&
                                      col.key !== 'vendor_code' &&
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
                                      (designation === Role.TRANSACTIONS
                                        ? Columns.BANK_RESPONSE_TRANSACTIONS
                                        : Columns.BANK_RESPONSE
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
                                variant="secondary"
                                onClick={() => {
                                  setSelectedColumn('');
                                  setFilterValue('');
                                  setSelectedStatus('');
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
            <div className="mb-4 border-b border-slate-200/60 dark:border-darkmode-400">
              <Tab.Group
                selectedIndex={activeDataTab}
                onChange={setActiveDataTab}
              >
                <Tab.List variant="tabs">
                  {role &&
                    ![Role.VENDOR, Role.VENDOR_OPERATIONS].includes(role) && (
                      <>
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
                      </>
                    )}
                </Tab.List>
              </Tab.Group>
            </div>
            <div className="overflow-auto xl:overflow-visible">
              {isPageLoading && isLoad ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CustomTable
                  columns={
                    [Role.TRANSACTIONS, Role.OPERATIONS].includes(
                      designation || '',
                    )
                      ? Columns.BANK_RESPONSE_TRANSACTIONS
                      : [Role.VENDOR, Role.VENDOR_OPERATIONS].includes(
                          role || '',
                        )
                      ? Columns.BANK_RESPONSE_VENDOR
                      : Columns.BANK_RESPONSE
                  }
                  data={{
                    rows: bankResponses?.bankResponse || [],
                    totalCount: bankResponses.totalCount,
                  }}
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 20}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  source="BankResponse"
                  handleEditModal={handleEditModal}
                  actionMenuItems={(row: BankResponseRow) => {
                    const items: {
                      label: string;
                      icon: 'RotateCcw';
                      onClick: () => void;
                      previousAmount?: number | string;
                    }[] = [];
                    if (row?.status === Status.BOT_SUCCESS) {
                      items.push({
                        label: 'Reset',
                        icon: 'RotateCcw',
                        onClick: () => resetModal({ ...row }),
                        previousAmount: row.amount,
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
      {editModal && (
        <Modal
          handleModal={handleEditCancel}
          forOpen={editModal}
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
                    setEditEditingField(
                      editModalType === 'utr_id' ? 'utr_id' : 'utr',
                    );
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
                    : editEditingField === 'utr' ||
                      editEditingField === 'utr_id'
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
                sections={Object.fromEntries(
                  Object.entries(
                    EditAmountOrUTR(editModalType, {
                      isUpdating: isLoading,
                      editingField: editEditingField,
                      isFieldBeingEdited: isFieldBeingEdited,
                      bankOptions: bankOptions,
                    }),
                  ).filter(([_, value]) => Array.isArray(value)),
                )}
                onSubmit={handleEditSubmit}
                defaultValues={selectedValue ?? {}}
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
      {newTransactionModal && (
        <Modal
          handleModal={handleResetUTRCancel}
          forOpen={newTransactionModal}
          title="Reset UTR"
        >
          {!resetUTREditingField ? (
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">
                Select field to edit:
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setResetUTREditingField('utr');
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
                    setResetUTREditingField('amount');
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
                    updateBank();
                    setIsFieldBeingEdited(false);
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
                  {resetUTREditingField === 'utr'
                    ? 'UTR'
                    : resetUTREditingField === 'amount'
                    ? 'Amount'
                    : 'Bank'}
                </h3>
                <button
                  onClick={() => {
                    setResetUTREditingField(null);
                    setIsFieldBeingEdited(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  ← Back to field selection
                </button>
              </div>
              <DynamicForm
                key={`reset-utr-${resetUTREditingField}`}
                sections={{
                  UTR_Reset: resetAddData(bankOptions, {
                    isUpdating: isLoading,
                    editingField: resetUTREditingField,
                    isFieldBeingEdited: isFieldBeingEdited,
                  }).UTR_Reset,
                }}
                onSubmit={handleUTRFormSubmit}
                defaultValues={{
                  [resetUTREditingField]:
                    resetUTREditingField === 'amount'
                      ? resetUTRVerified.amount
                      : resetUTREditingField === 'utr'
                      ? resetUTRVerified.utr
                      : resetUTREditingField === 'bank_id'
                      ? resetUTRVerified.bank_id
                      : undefined,
                }}
                isEditMode={true}
                handleCancel={handleResetUTRCancel}
                isLoading={isLoading}
                onFieldFocus={() => setIsFieldBeingEdited(true)}
                onFieldBlur={() => setIsFieldBeingEdited(false)}
                onFieldChange={() => setIsFieldBeingEdited(true)}
              />
            </div>
          )}
        </Modal>
      )}
      {passwordModal && (
        <Modal
          handleModal={() => setPasswordModal(false)}
          forOpen={passwordModal}
        >
          <DynamicForm
            sections={VerificationformFields(false)}
            onSubmit={handlePasswordSubmit}
            defaultValues={{ password: '' }}
            isEditMode={true}
            handleCancel={() => setPasswordModal(false)}
            isLoading={isLoading}
          />
          {errorMessage && (
            <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
          )}
        </Modal>
      )}
      {importModalOpen && (
        <Modal
          handleModal={() => setImportModalOpen(false)}
          forOpen={importModalOpen}
          title="Import PayIns"
        >
          <div className="py-4 my-4">
            <div className="w-[90%] mx-4">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Upload File (PDF or XLSX)
              </label>
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) {
                      const validTypes = [
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      ];
                      if (validTypes.includes(file.type)) {
                        setSelectedFile(file);
                      } else {
                        dispatch(
                          addAllNotification({
                            status: Status.ERROR,
                            message: 'Please select a PDF or XLSX file.',
                          }),
                        );
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center">
                  <Lucide
                    icon="UploadCloud"
                    className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop or click to upload a file
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Supported formats: PDF, XLSX
                  </p>
                </div>
              </div>
              {selectedFile && (
                <div className="mt-4 flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-md p-3">
                  <div className="flex items-center">
                    <Lucide
                      icon="File"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.getElementById('file-upload');
                      if (fileInput) {
                        (fileInput as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600"
                  >
                    <Lucide icon="Trash2" className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="w-[90%] mx-4 my-4">
              <label
                htmlFor="bank-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Bank
              </label>
              <Select
                id="bankly"
                options={bankOptions}
                value={selectedBank}
                onChange={(selected) => setSelectedBank(selected)}
                classNames={{
                  control: () =>
                    'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-md',
                  menu: () =>
                    'bg-white dark:bg-gray-700 mt-1 rounded-md shadow-lg',
                  option: ({ isFocused, isSelected }) =>
                    [
                      'cursor-pointer px-3 py-2',
                      isSelected
                        ? 'bg-gray-300 dark:bg-gray-600 text-black dark:text-white'
                        : isFocused
                        ? 'bg-gray-200 dark:bg-gray-500'
                        : 'bg-white dark:bg-gray-700',
                    ].join(' '),
                  singleValue: () => 'text-black dark:text-white',
                }}
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 my-4 pt-4 justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isPDFLoading}
              onClick={() =>
                handleUpload(
                  selectedFile?.type ===
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    ? 'XLSX'
                    : 'PDF',
                )
              }
            >
              {isPDFLoading ? (
                <div className="flex items-center">
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
                  Loading...
                </div>
              ) : (
                'Import'
              )}
            </Button>
          </div>
        </Modal>
      )}
      {exportModalOpen && (
        <Modal
          handleModal={() => setExportModalOpen(false)}
          forOpen={exportModalOpen}
          title="Export Bank Response Data"
        >
          <div className="py-2 my-2 mb-4">
            <Litepicker
              value={selectedFilterDates || ''}
              onChange={(e: { target: { value: string } }) => {
                setSelectedFilterDates(e.target.value);
              }}
              enforceRange={false}
              options={{
                autoApply: false,
                singleMode: false,
                numberOfMonths: 2,
                numberOfColumns: 2,
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
              className="w-[90%] mx-4 pl-9 sm:rounded-[0.5rem] rounded-lg dark:bg-darkmode-800/30 dark:text-gray-200 dark:border-gray-700"
            />
            <Select
              isMulti
              options={[
                { value: '/success', label: 'Success' },
                { value: '/repeated', label: 'Repeated' },
                { value: '/internalTransfer', label: 'Internal Transfer' },
                { value: '/freezed', label: 'Freeze' },
              ]}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              value={selectedFilterStatus}
              onChange={(selected) => setSelectedFilterStatus([...selected])}
              classNames={{
                control: () =>
                  'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-md',
                menu: () =>
                  'bg-white dark:bg-gray-700 mt-1 rounded-md shadow-lg',
                option: ({ isFocused, isSelected }) =>
                  [
                    'cursor-pointer px-3 py-2',
                    isSelected
                      ? 'bg-gray-300 dark:bg-gray-600 text-black dark:text-white'
                      : isFocused
                      ? 'bg-gray-200 dark:bg-gray-500'
                      : 'bg-white dark:bg-gray-700',
                  ].join(' '),
                multiValue: () =>
                  'bg-gray-200 dark:bg-gray-600 text-black dark:text-white',
                multiValueLabel: () => 'text-black dark:text-white',
                multiValueRemove: () =>
                  'text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500',
              }}
              className="w-[90%] mx-4 mt-4"
            />
          </div>
          <div className="flex flex-row gap-4 my-4 pt-6 justify-end">
            <Button
              variant="outline-secondary"
              onClick={() => handleDownload('PDF')}
            >
              Export as PDF
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleDownload('CSV')}
            >
              Export as CSV
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleDownload('XLSX')}
            >
              Export as XLSX
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddDataHistory;
