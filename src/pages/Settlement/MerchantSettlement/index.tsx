/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Lucide from '@/components/Base/Lucide';
import { Menu, Popover } from '@/components/Base/Headless';
import { FormInput, FormSelect } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createSettlement,
  getAllSettlements,
  getAllSettlementsExport,
  updateSettlement,
  // getAllSettlementsBySearchApi,
} from '@/redux-toolkit/slices/settlement/settlementAPI';
import {
  addSettlement,
  getSettlements,
  onload,
  setRefreshSettlement,
  updateReset,
  updateStatus,
  updateUTR,
  getMerchantSettlementCount,
} from '@/redux-toolkit/slices/settlement/settlementSlice';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import {
  Columns,
  deleteSettlementFormFields,
  editSettlementFormFields,
  SettlementStatusOptions,
  resetSettlementFormFields,
  Role,
  Status,
} from '@/constants';
import CustomTable from '@/components/TableComponent/CommonTable';
import { getAllSettlementData } from '@/redux-toolkit/slices/settlement/settlementSelectors';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import Modal from '@/components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import {
  resetPagination,
  setPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { downloadCSV } from '@/components/ExportComponent';
import Litepicker from '@/components/Base/Litepicker';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import Drawer from '@/components/Base/Drawer';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

dayjs.extend(utc);
dayjs.extend(timezone);

interface SettlementConfig {
  reference_id?: string;
  rejected_reason?: string;
  [key: string]: any;
}

interface SettlementData {
  id?: string;
  user_id?: string;
  amount?: string;
  method?: string;
  updated_by?: string;
  status?: string;
  config?: SettlementConfig;
}

interface MerchantCode {
  label: string;
  value: string;
}

function MerchantSettlement({
  refreshSettlement,
}: {
  refreshSettlement: boolean;
}) {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [formData, setFormData] = useState<SettlementData | null>(null);
  const [newSettlementModal, setNewSettlementModal] = useState(false);
  const [newdeleteModal, setNewdeleteModal] = useState(false);
  const [newResetSettlementModal, setResetNewSettlementModal] = useState(false);
  const allSettlement = useAppSelector(getAllSettlementData) || [];
  const [merchantCodes, setMerchantCodes] = useState<MerchantCode[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [totalSettlementAmount, setTotalSettlementAmount] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<MerchantCode[]>([]);
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${date} - ${date}`,
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [exportSelectedFilter, setExportSelectedFilter] = useState<
    MerchantCode[]
  >([]);
  const [exportSelectedFilterDates, setExportSelectedFilterDates] =
    useState<string>(`${date} - ${date}`);
  const [exportSelectedReportStatus, setExportSelectedReportStatus] =
    useState<string>('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const isFetching = useRef(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filterStateRef = useRef({
    selectedFilter: [] as MerchantCode[],
    selectedFilterDates: `${date} - ${date}`,
    selectedStatus: '',
    selectedColumn: '',
    filterValue: '',
  });

  useEffect(() => {
    filterStateRef.current = {
      selectedFilter,
      selectedFilterDates,
      selectedStatus,
      selectedColumn,
      filterValue,
    };
  }, [
    selectedFilter,
    selectedFilterDates,
    selectedStatus,
    selectedColumn,
    filterValue,
  ]);

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

  const handleSelectAll = () => {
    if (selectedRows.length) {
      setSelectedRows([]);
      setDrawerOpen(false);
      setTotalSettlementAmount(0);
    } else {
      const newSelectedRows = allSettlement.settlement
        .filter((item: any) =>
          [Status.INITIATED, Status.SUCCESS, Status.REJECTED, Status.REVERSED].includes(
            item.status,
          ),
        )
        .map((item: any) => item.id);

      const totalAmount = allSettlement.settlement
        .filter((item: any) =>
          [Status.INITIATED, Status.SUCCESS, Status.REJECTED].includes(
            item.status,
          ),
        )
        .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      setSelectedRows(newSelectedRows);
      setDrawerOpen(true);
      setTotalSettlementAmount(totalAmount);
    }
  };

  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';
  const data = localStorage.getItem('userData');
  let role: string | undefined;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role as string;
  } else {
    // No user data found in localStorage
  }

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      // dispatch(
      //   setPagination({
      //     page: 1, // Reset to first page
      //     limit: pagination?.limit || 10,
      //   }),
      // );
    }, 1000);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleGetAllMerchantCodes = useCallback(async () => {
    let res = await getAllMerchantCodes(false, true);
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

  // Utility function to build query parameters or filters object
  const buildQueryParams = (
    pagination: { page?: any; limit?: any },
    selectedFilter: MerchantCode[],
    selectedFilterDates: string,
    selectedStatus: string,
    selectedColumn: string,
    filterValue: string,
    searchQuery?: string,
    output: 'queryString' | 'filtersObject' = 'queryString',
    includeDates: boolean = false,
  ) => {
    const filters: { [key: string]: any } = {};

    // Include page and limit only if pagination is provided and not empty
    if (pagination?.page && pagination?.limit) {
      filters.page = pagination.page;
      filters.limit = pagination.limit;
    }

    // Include role_name only for queryString output (for settlement APIs)
    if (output === 'queryString') {
      filters.role_name = 'MERCHANT';
    }

    if (searchQuery) {
      filters.search = searchQuery;
    }

    if (selectedFilter.length) {
      if (output === 'filtersObject') {
        filters.user_id = selectedFilter.map((f: MerchantCode) => f.value);
      } else {
        filters.user_id = selectedFilter
          .map((f: MerchantCode) => f.value)
          .join(',');
      }
    }

    if (includeDates && selectedFilterDates) {
      const [startStr, endStr] = selectedFilterDates.split(' - ');
      const startDate = dayjs(startStr).format('YYYY-MM-DD');
      const endDate = dayjs(endStr).format('YYYY-MM-DD');
      if (output === 'filtersObject') {
        filters.startDate = startDate;
        filters.endDate = endDate;
      } else {
        filters.start_date = startDate;
        filters.end_date = endDate;
      }
    }

    if (selectedStatus) {
      filters.status = selectedStatus;
    }

    if (selectedColumn && filterValue) {
      filters[selectedColumn] = filterValue;
    }

    if (output === 'filtersObject') {
      return filters;
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    return params.toString();
  };

  const fetchSettlements = useCallback(
    async (
      searchQuery?: string,
      filterColumn?: string,
      filterVal?: string | string[],
      filters?: {
        selectedFilter: MerchantCode[];
        selectedFilterDates: string;
        selectedStatus: string;
        selectedColumn: string;
        filterValue: string;
      },
    ) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setIsPageLoading(true);
      try {
        const appliedFilters = filters || filterStateRef.current;
        const queryString = buildQueryParams(
          pagination,
          appliedFilters.selectedFilter,
          appliedFilters.selectedFilterDates,
          appliedFilters.selectedStatus,
          filterColumn || appliedFilters.selectedColumn,
          filterVal
            ? Array.isArray(filterVal)
              ? filterVal.join(',')
              : filterVal
            : appliedFilters.filterValue,
          searchQuery,
          'queryString',
          false, // Exclude dates
        ) as string;

        // if (!searchQuery) {
        let  response = await getAllSettlements(queryString);
        dispatch(getSettlements(response.data.settlements));
        dispatch(
          getMerchantSettlementCount(
            response.data.totalCount || response.data.length,
          ),
        );
        // } else {
        //   response = await getAllSettlementsBySearchApi(queryString);
        //   dispatch(getSettlements(response.settlements));
        //   dispatch(getMerchantSettlementCount(response.totalCount));
        // }
        isFetching.current = false;
      } catch {
        isFetching.current = false;
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Error fetching settlements'
          })
        );
      } finally {
        setIsPageLoading(false);
      }
    },
    [pagination, dispatch],
  );
  const debouncedFetchBankAccounts = useCallback(
    debounce((query: string) => {
      fetchSettlements(query);
    }, 500),
    [fetchSettlements],
  );

  // const fetchCount = useCallback(async () => {
  //     let filters = {};
  //     if (
  //       filterStateRef.current.selectedFilter.length ||
  //       filterStateRef.current.selectedStatus ||
  //       (filterStateRef.current.selectedColumn &&
  //         filterStateRef.current.filterValue)
  //     ) {
  //       filters = buildQueryParams(
  //         {}, // Empty pagination to exclude page and limit
  //         filterStateRef.current.selectedFilter,
  //         filterStateRef.current.selectedFilterDates,
  //         filterStateRef.current.selectedStatus,
  //         filterStateRef.current.selectedColumn,
  //         filterStateRef.current.filterValue,
  //         undefined,
  //         'filtersObject',
  //         false, // Exclude dates
  //       );
  //     }
  //   try {
  //     const getCountData = await getCount('Settlement', 'MERCHANT', filters);
  //     dispatch(getMerchantSettlementCount(getCountData.count));
  //   } catch {
  //     dispatch(
  //       addAllNotification({
  //         status: Status.ERROR,
  //         message: 'Error fetching settlement count'
  //       })
  //     );
  //   }
  // }, [dispatch]);

  useEffect(() => {
    fetchSettlements(debouncedSearchQuery);
    // fetchCount();
  }, [debouncedSearchQuery, pagination, fetchSettlements]);

  useEffect(() => {
    if (refreshSettlement && !isFetching.current) {
      dispatch(resetPagination());
      fetchSettlements(
        debouncedSearchQuery,
        undefined,
        undefined,
        filterStateRef.current,
      );
      // fetchCount();
      dispatch(setRefreshSettlement(false));
    }
  }, [
    refreshSettlement,
    debouncedFetchBankAccounts,
    dispatch,
    fetchSettlements,
    debouncedSearchQuery,
    // fetchCount,
  ]);

  useEffect(() => {
    fetchSettlements();
    // fetchCount();
  }, [fetchSettlements]);

  useEffect(() => {
    if (!newSettlementModal) {
      setFormData(null);
    }
  }, [newSettlementModal]);

  const handleEditModal = (data: any) => {
    setFormData(data);
    settlementModal();
  };

  const resetModal = () => {
    setResetNewSettlementModal((prev) => !prev);
  };

  const handleResetModal = (data: any) => {
    setFormData(data);
    resetModal();
  };

  const deleteModal = () => {
    setNewdeleteModal((prev) => !prev);
  };

  const handleDeleteModal = (data: any) => {
    setFormData(data);
    deleteModal();
  };

  function getUpdatedFields(
    originalData: any,
    updatedData: any,
  ): { [key: string]: any } {
    const updatedFields: { [key: string]: any } = {};
    Object.keys(updatedData).forEach((key) => {
      if (typeof updatedData[key] === 'object' && updatedData[key] !== null) {
        const nestedUpdates = getUpdatedFields(
          originalData[key] || {},
          updatedData[key],
        );
        if (Object.keys(nestedUpdates).length > 0) {
          updatedFields[key] = nestedUpdates;
        }
      } else {
        if (updatedData[key] !== originalData[key]) {
          updatedFields[key] = updatedData[key];
        }
      }
    });
    return updatedFields;
  }

  const settlementModal = () => {
    setNewSettlementModal((prev) => !prev);
  };

  const resetSettlement = () => {
    setResetNewSettlementModal((prev) => !prev);
  };

  const rejectSettlement = () => {
    setNewdeleteModal((prev) => !prev);
  };

  const handleSubmitData = async (data: any) => {
    setIsLoading(true);
    let prevData: SettlementData = formData as SettlementData;
    const newData = getUpdatedFields(prevData, data);
    const settlementData = { ...newData, ...data };
    const { reference_id, user_id, amount, method, updated_by, status } =
      settlementData;

    const result = {
      user_id,
      amount,
      method,
      updated_by,
      status,
      config: { ...(prevData?.config || {}), reference_id },
    };

    try {
      const updatedSettlement = (await updateSettlement(data?.id, result)) ?? {
        id: '',
        config: { reference_id: '' },
      };
      dispatch(
        updateUTR({
          id: updatedSettlement.id ?? '',
          reference_id: updatedSettlement.config?.reference_id ?? '',
        }),
      );
      dispatch(setRefreshSettlement(true));
      setFormData(null);
      setNewSettlementModal(false);
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: 'Settlement updated successfully'
        })
      );
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Failed to update settlement'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async (data: any) => {
    setIsLoading(true);
    if (data) {
      const { config, user_id, amount, method, updated_by } = data;
      const result = {
        user_id,
        amount,
        method,
        updated_by,
        status: 'INITIATED',
        config: {
          ...config,
          reference_id: '',
          rejected_reason: '',
        },
      };
      try {
        const updated = await updateSettlement(data?.id, result);
        dispatch(
          updateStatus({
            id: updated?.id ?? '',
            reference_id: updated?.config?.reference_id ?? '',
            status: updated?.status ?? 'INITIATED',
            rejected_reason: updated?.config?.rejected_reason ?? '',
          }),
        );
        dispatch(setRefreshSettlement(true));
        setResetNewSettlementModal(false);
        setFormData(null);
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Settlement reset successfully'
          })
        );
      } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Failed to reset settlement'
          })
        );
      }
    } else {
      const addedSettlement = await createSettlement(data);
      dispatch(addSettlement(addedSettlement));
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: 'Settlement added successfully'
        })
      );
      dispatch(setRefreshSettlement(true));
    }
    setIsLoading(false);
  };

  const handleDeleteSettlement = async (data: any) => {
    setIsLoading(true);
    if (data) {
      let prevData: SettlementData = formData as SettlementData;
      const newData = getUpdatedFields(prevData, data);
      const settlementData = { ...newData, ...data };
      const { rejected_reason, user_id, amount, method, updated_by, status } =
        settlementData;
      const result = {
        user_id,
        amount,
        method,
        updated_by,
        status,
        config: { ...(prevData?.config || {}), rejected_reason },
      };
      try {
        const updatedSettlement = await updateSettlement(data?.id, result);
        dispatch(
          updateReset({
            id: updatedSettlement?.id ?? '',
            rejected_reason: updatedSettlement?.config?.rejected_reason ?? '',
            status: updatedSettlement?.status ?? '',
          }),
        );
        dispatch(setRefreshSettlement(true));
        setNewdeleteModal(false);
        setFormData(null);
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Settlement rejected successfully'
          })
        );
      } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Failed to reject settlement'
          })
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async (type: string) => {
    if (!exportSelectedFilter.length || !exportSelectedFilterDates) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Please select both merchants and date range.'
        })
      );
      return;
    }

    try {
      const queryParams = buildQueryParams(
        { page: 'no_pagination', limit: 'no_pagination' },
        exportSelectedFilter,
        exportSelectedFilterDates,
        exportSelectedReportStatus,
        '',
        '',
        undefined,
        'queryString',
        true, // Include dates
      ) as string;
      const selectedMerchantReports = await getAllSettlementsExport(
        queryParams,
      );
      const reportsLength = (selectedMerchantReports?.data ?? []).length;
      if (reportsLength > 0) {
        interface ExportedData {
          Sno: string;
          Code: string;
          Status: string;
          Amount: string;
          Method: string;
          ReferenceID: string;
          Description: string;
          CreatedBy?: string;
          UpdatedBy?: string;
          CreatedAt: string;
          UpdatedAt: string;
        }
        type ConfigType = {
          description?: string;
          reference_id?: string;
          bank_name?: string;
          acc_holder_name?: string;
          acc_no?: string;
          ifsc?: string;
          wallet_balance?: string;
          debit_credit?: string;
        };
        const filteredData: ExportedData[] = selectedMerchantReports.data.map(
          (item: {
            sno: string;
            code: string;
            status: string;
            amount: string;
            method?: string;
            config?: ConfigType;
            created_by?: string;
            updated_by?: string;
            created_at: string;
            updated_at: string;
          }) => ({
            Sno: item.sno,
            Code: item.code,
            Status: item.status,
            Amount: String(item.amount),
            Method: item.method || 'N/A',
            ReferenceID: item.config?.reference_id || 'N/A',
            Description:
              item.method === 'BANK'
                ? [
                    item.config?.bank_name,
                    item.config?.acc_holder_name,
                    item.config?.acc_no,
                    item.config?.ifsc,
                  ].join(', ')
                : item.method === 'CRYPTO'
                ? [item.config?.wallet_balance, item.config?.description].join(
                    ', ',
                  )
                : item.config?.description || 'N/A',
            "SendBy/ReceivedBy": item.config?.debit_credit === "RECEIVED" ? 'Received by Admin' : 'Sent by Admin',
            CreatedBy: item.created_by || 'N/A',
            UpdatedBy: item.updated_by || 'N/A',
            CreatedAt: dayjs(item.created_at)
              .tz('Asia/Kolkata')
              .format('DD-MM-YYYY hh:mm:ss A'),
            UpdatedAt: dayjs(item.updated_at)
              .tz('Asia/Kolkata')
              .format('DD-MM-YYYY hh:mm:ss A'),
          }),
        );
        downloadCSV(
          filteredData,
          type as ExportFormat,
          `Merchant-Settlement-Report_${
            exportSelectedFilterDates.split(' - ')[0]
          }_to_${exportSelectedFilterDates.split(' - ')[1]}`,
        );
        setExportModalOpen(false);
        setExportSelectedFilter([]);
        setExportSelectedFilterDates(`${date} - ${date}`);
        setExportSelectedReportStatus('');
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: `Report exported successfully as ${type}`
          })
        );
      } else {
        setTimeout(() => {
          setExportModalOpen(false);
          setExportSelectedFilter([]);
          setExportSelectedFilterDates(`${date} - ${date}`);
          setExportSelectedReportStatus('');
        }, 100);
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No data available for export'
          })
        );
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Error exporting report'
        })
      );
    }
  };

  const handleRefresh = useCallback(() => {
    dispatch(onload());
    fetchSettlements(
      debouncedSearchQuery,
      undefined,
      undefined,
      filterStateRef.current,
    );
    // fetchCount();
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Settlements refreshed successfully'
      })
    );
  }, [
    dispatch,
    fetchSettlements,
    debouncedSearchQuery,
    // fetchCount,
  ]);

  const handleReset = useCallback(async () => {
    dispatch(onload());
    dispatch(resetPagination());
    setSearchQuery('');
    setFilterValue('');
    setSelectedColumn('');
    setSelectedFilter([]);
    setSelectedStatus('');
    setSelectedFilterDates(`${date} - ${date}`);
    // Update ref to ensure fetch uses reset values
    filterStateRef.current = {
      selectedFilter: [],
      selectedFilterDates: `${date} - ${date}`,
      selectedStatus: '',
      selectedColumn: '',
      filterValue: '',
    };
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully'
      })
    );
    await fetchSettlements();
    // await fetchCount();
  }, [dispatch, fetchSettlements, date]);

  const applyFilter = useCallback(() => {
  dispatch(
      setPagination({
        page: 1,
        limit: pagination?.limit || 20,
      }),
    );
    fetchSettlements(
      debouncedSearchQuery,
      undefined,
      undefined,
      filterStateRef.current,
    );
    // fetchCount();
  }, [fetchSettlements, dispatch, debouncedSearchQuery]);

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <Modal
        handleModal={settlementModal}
        forOpen={newSettlementModal}
        title={''}
      >
        <DynamicForm
          sections={editSettlementFormFields(null)}
          onSubmit={handleSubmitData}
          defaultValues={formData || {}}
          isEditMode={formData ? true : false}
          handleCancel={settlementModal}
          isLoading={isLoading}
        />
      </Modal>

      <Modal handleModal={deleteModal} forOpen={newdeleteModal} title="">
        <DynamicForm
          sections={deleteSettlementFormFields()}
          onSubmit={handleDeleteSettlement}
          defaultValues={formData || {}}
          isEditMode={true}
          handleCancel={rejectSettlement}
          isLoading={isLoading}
        />
      </Modal>

      <Modal
        handleModal={resetModal}
        forOpen={newResetSettlementModal}
        title={''}
      >
        <DynamicForm
          sections={resetSettlementFormFields()}
          onSubmit={handleResetData}
          defaultValues={formData || {}}
          isEditMode={true}
          handleCancel={resetSettlement}
          isLoading={isLoading}
        />
      </Modal>
      <div className="col-span-12">
        <div className="mt-3.5">
          <div className="flex flex-col">
            <div className="flex flex-col p-5 sm:items-center sm:flex-row gap-y-2">
              <div>
                <div className="relative">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="Search transactions..."
                    className="pl-9 sm:w-64 rounded-[0.5rem]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Lucide
                      icon="X"
                      className="absolute inset-y-0 right-0 z-10 w-4 h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
                      onClick={() => setSearchQuery('')}
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
                    <Lucide
                      icon="ChevronDown"
                      className="stroke-[1.3] w-4 h-4 ml-2"
                    />
                  </Menu.Button>
                  {exportModalOpen && (
                    <Modal
                      handleModal={() => {
                        setExportModalOpen(false);
                        setExportSelectedFilter([]);
                        setExportSelectedFilterDates(`${date} - ${date}`);
                        setExportSelectedReportStatus('');
                      }}
                      forOpen={exportModalOpen}
                      title="Export Settlements"
                    >
                      <div className="py-2 my-2 mb-4">
                        <Litepicker
                          value={exportSelectedFilterDates || ''}
                          onChange={(e) => {
                            setExportSelectedFilterDates(e.target.value);
                          }}
                          enforceRange={false}
                          options={{
                            autoApply: false,
                            singleMode: false,
                            numberOfMonths: 1,
                            numberOfColumns: 1,
                            startDate:
                              exportSelectedFilterDates.split(' - ')[0],
                            endDate: exportSelectedFilterDates.split(' - ')[1],
                            showWeekNumbers: true,
                            dropdowns: {
                              minYear: 1990,
                              maxYear: null,
                              months: true,
                              years: true,
                            },
                          }}
                          className="w-full pl-9 rounded-[0.5rem]"
                        />
                      </div>

                      <div className="my-2 py-2 flex flex-col justify-center">
                        <div className="flex flex-row">
                          <MultiSelect
                            codes={merchantCodes}
                            selectedFilter={exportSelectedFilter}
                            setSelectedFilter={(value: MerchantCode[]) => {
                              setExportSelectedFilter(value);
                            }}
                            placeholder="Select Merchant Codes..."
                          />
                        </div>
                      </div>
                      <FormSelect
                        className="flex-1 mt-2"
                        value={exportSelectedReportStatus}
                        onChange={(e) => {
                          setExportSelectedReportStatus(e.target.value);
                        }}
                      >
                        <option value="">Select status...</option>
                        {Object.entries(SettlementStatusOptions).map(
                          ([key, value]) => (
                            <option key={key} value={value.value}>
                              {value.label}
                            </option>
                          ),
                        )}
                      </FormSelect>
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
                              <div className="text-left text-slate-500 mb-2">
                                Merchant
                              </div>
                              <MultiSelect
                                codes={merchantCodes}
                                selectedFilter={selectedFilter}
                                setSelectedFilter={(value: MerchantCode[]) => {
                                  setSelectedFilter(value);
                                }}
                              />
                            </div>
                            <div className="mt-3">
                              <div className="text-left text-slate-500">
                                Status
                              </div>
                              <FormSelect
                                className="flex-1 mt-2"
                                value={selectedStatus}
                                onChange={(e) =>
                                  setSelectedStatus(e.target.value)
                                }
                              >
                                <option value="">Select a status</option>
                                {Object.entries(SettlementStatusOptions).map(
                                  ([key, value]) => (
                                    <option key={key} value={value.value}>
                                      {value.label}
                                    </option>
                                  ),
                                )}
                              </FormSelect>
                            </div>
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
                                {(role === Role.ADMIN
                                  ? Columns.SETTLEMENT
                                  : Columns.MERCHANT_SETTLEMENT
                                )
                                  .filter(
                                    (col) =>
                                      col.key !== 'merchant_details' &&
                                      col.key !== 'more_details' &&
                                      col.key !== 'status' &&
                                      col.key !== 'sno' &&
                                      col.key !== '' &&
                                      col.key !== 'config' &&
                                      col.key !== 'code' &&
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
                                      (role === Role.ADMIN
                                        ? Columns.SETTLEMENT
                                        : Columns.MERCHANT_SETTLEMENT
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
            <div className="overflow-auto xl:overflow-visible">
              {isPageLoading ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CustomTable
                  columns={
                    role === Role.ADMIN
                      ? Columns.SETTLEMENT
                      : Columns.MERCHANT_SETTLEMENT
                  }
                  data={{
                    rows: allSettlement.settlement,
                    totalCount: allSettlement.totalCount,
                  }}
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 20}
                  onPageChange={handlePageChange}
                  handleRowClick={handleRowSelect}
                  handleSelectAll={handleSelectAll}
                  selectedRows={selectedRows}
                  isSettlement={true}
                  setTotalPayoutAmount={setTotalSettlementAmount}
                  onPageSizeChange={handlePageSizeChange}
                  actionMenuItems={(row: any) => {
                    const items: {
                      label?: string;
                      icon: 'RotateCcw' | 'CheckSquare' | 'XSquare';
                      onClick: (row: any) => void;
                      className?: string;
                    }[] = [];

                    if (row?.status === Status.INITIATED) {
                      items.push({
                        label: 'Approve',
                        icon: 'CheckSquare',
                        onClick: () => handleEditModal(row),
                      });
                      items.push({
                        label: 'Reject',
                        icon: 'XSquare',
                        onClick: () => handleDeleteModal(row),
                      });
                    } else if (
                      role === Role.ADMIN && //-- reset icon not required on rejected settlement
                      row?.status === Status.SUCCESS
                    ) {
                      items.push({
                        label: 'Reset',
                        icon: 'RotateCcw',
                        onClick: () => handleResetModal(row),
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
      {drawerOpen && (
        <Drawer open={drawerOpen} position="bottom">
          <div className="flex justify-between items-center mx-8 ">
            <div>
              <span className="ml-4 text-lg">
                Total: {totalSettlementAmount}
              </span>
              <span className="ml-4">{selectedRows.length} rows selected</span>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}

export default MerchantSettlement;
