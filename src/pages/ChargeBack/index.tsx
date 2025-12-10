/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Lucide from '@/components/Base/Lucide';
import { Menu, Popover } from '@/components/Base/Headless';
import { FormInput, FormSelect } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useCallback, useEffect } from 'react';
import LoadingIcon from '@/components/Base/LoadingIcon';
import {
  selectChargeback,
  getRefreshChargeBacks,
} from '@/redux-toolkit/slices/chargebacks/chargebackSelectors';
import {
  getChargebacks,
  addChargebacks,
  setRefreshChargeBacks,

  // updateChargebacks
  onload,
  getChargeBackCount,
} from '@/redux-toolkit/slices/chargebacks/chargebackSlice';
import { EditChargeBacksFields } from '@/constants';
import {
  getChargeBacksApi,
  getChargeBacksReportsApi,
  updateChargeBackApi,
  createChargeBackApi,
  // getChargeBacksBySearchApi,
  blockUserChargeback,
} from '@/redux-toolkit/slices/chargebacks/chargebackAPI';
import { ChargeBacksFormFields, Role } from '@/constants';
import { useState } from 'react';
import Modal from '../../components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
import CommonTable from '@/components/TableComponent/CommonTable';
import { Columns, Status } from '@/constants';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import { downloadCSV } from '@/components/ExportComponent';
import Litepicker from '@/components/Base/Litepicker';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
// import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

function ChargeBack() {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  const [selectedFilterExport, setSelectedFilterExport] = useState<string[]>(
    [],
  );
  const [selectedFilterVendorExport, setSelectedFilterVendorExport] = useState<
    any[]
  >([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [newUserModal, setNewUserModal] = useState<boolean>(false);
  const [formData, setFormData] = useState(null);
  const [selectedFilterVendor, setSelectedFilterVendor] = useState<any[]>([]);
  const [merchantCodes, setMerchantCodes] = useState<string[]>([]);
  const [vendorCodes, setVendorCodes] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [idUpdate, setIdUpdate] = useState<string>('');
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD'); //---current date added
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${date} - ${date}`,
  );
  const allChargeBacks = useAppSelector(selectChargeback);
  const refreshChargeBacks = useAppSelector(getRefreshChargeBacks);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>(''); // Added search state
  const [valueFilter, setvalueFilter] = useState<any>('');
  const [isLoading, setIsLoading] = useState(false);
  const chargebackModal = () => {
    setNewUserModal((prev) => !prev);
  };
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;

  let includeMerchants = false;
  let includeVendor = false;

  let role: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
    includeMerchants =
      role === Role.MERCHANT ||
      role === Role.ADMIN ||
      role === Role.MERCHANT_OPERATIONS ||
      role === Role.SUB_MERCHANT;
    includeVendor =
      role === Role.ADMIN ||
      role === Role.VENDOR ||
      role === Role.VENDOR_OPERATIONS ||
      role === Role.ADMIN;
  }
  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';
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

  // useEffect(() => {
  //   if (refreshChargeBacks) {
  //     fetchChargebacks();
  //     dispatch(resetPagination());
  //     dispatch(setRefreshChargeBacks(false));
  //   }
  // }, [dispatch, refreshChargeBacks]);

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
  const handleGetAllMerchantCodes = useCallback(async () => {
    if (role !== Role.MERCHANT && role !== Role.ADMIN) {
      return;
    }
    const res = await getAllMerchantCodes();
    setMerchantCodes(
      res.map((el: any) => ({
        label: el.label,
        value: el.value,
      })),
    );
  }, []);

  const handleGetAllVendorCodes = useCallback(async () => {
    if (role !== Role.VENDOR && role !== Role.ADMIN) {
      return;
    }
    const res = await getAllVendorCodes();
    setVendorCodes(
      res.map((el: any) => ({
        label: el.label,
        value: el.value,
      })),
    );
  }, []);

  useEffect(() => {
    handleGetAllMerchantCodes();
  }, [handleGetAllMerchantCodes]);

  useEffect(() => {
    handleGetAllVendorCodes();
  }, [handleGetAllVendorCodes]);
  // const fetchCount = async () => {
  //   const getCountData = await getCount('ChargeBack');
  //   dispatch(getChargeBackCount(getCountData.count)); // Update the count in the Redux store
  // };
  // useEffect(() => {
  //   fetchCount();
  // }, [dispatch]);

  const fetchChargebacks = useCallback(
    async (
      searchQuery?: string,
      filters: Record<string, string | string[]> = {},
    ) => {
      setIsPageLoading(true);
      try {
        const params = new URLSearchParams({
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 20).toString(),
          ...(searchQuery && { search: searchQuery }),
        });

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            params.append(
              key,
              Array.isArray(value) ? value.join(',') : String(value),
            );
          });
        }
        let response = await getChargeBacksApi(params.toString());
        dispatch(getChargeBackCount(response.totalCount)); // Update the count in the Redux store
        dispatch(getChargebacks(response.chargeBacks));
      } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Error fetching chargebacks',
          }),
        );
      } finally {
        setIsPageLoading(false);
      }
    },
    [pagination?.page, pagination?.limit, dispatch],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchChargebacks(debouncedSearchQuery, valueFilter);
  }, [
    debouncedSearchQuery,
    pagination?.page,
    pagination?.limit,
    valueFilter,
    fetchChargebacks,
  ]);

  // const debouncedFetchBankAccounts = useCallback(
  //   debounce((query: string) => {
  //     fetchChargebacks(query);
  //   }, 500),
  //   [fetchChargebacks, debouncedSearchQuery],
  // );

  const handleRefresh = useCallback(async () => {
    try {
      await fetchChargebacks(debouncedSearchQuery, valueFilter);
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: 'Chargebacks refreshed successfully',
        }),
      );
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Failed to refresh chargebacks',
        }),
      );
    } finally {
      dispatch(setRefreshChargeBacks(false));
    }
  }, [dispatch, fetchChargebacks, debouncedSearchQuery, valueFilter]);

  useEffect(() => {
    if (refreshChargeBacks) {
      handleRefresh();
    }
  }, [refreshChargeBacks, handleRefresh]);

  const handleSubmitData = async (data: any) => {
    setIsLoading(true);
    chargebackModal();
    const d = new Date(data?.reference_date);
    const istOffset = d.getTime() + 330 * 60000;
    const istDateObj = new Date(istOffset);
    const dateOnly = istDateObj.toISOString().slice(0, 10);
    const chargebackData = { ...data, reference_date: dateOnly };
    const addedChargeBack = await createChargeBackApi(chargebackData);
    if (addedChargeBack && 'meta' in addedChargeBack) {
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: `Added ChargeBacks Successfully`,
        }),
      );
      dispatch(addChargebacks(addedChargeBack));
      dispatch(setRefreshChargeBacks(true));
      dispatch(onload());
    } else {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            (addedChargeBack as any)?.error?.message ||
            'An unknown error occurred',
        }),
      );
    }
    setIsLoading(false);
    // }
  };

  useEffect(() => {
    if (!newUserModal) {
      setFormData(null);
    }
  }, [newUserModal]);

  const handleEditChargeBack = async (chargeback: any) => {
    setEditModalOpen(true);
    setIdUpdate(chargeback.id);
  };

  const handleEditSubmit = useCallback(
    async (data: any) => {
      try {
        setIsLoading(true);
        await updateChargeBackApi(idUpdate, data);
        setIsLoading(false);
        setEditModalOpen(false);
        // dispatch(onload());
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Chargeback Updated Successfully',
          }),
        );
        await fetchChargebacks(debouncedSearchQuery, valueFilter);
      } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Failed to Updated  chargebacks',
          }),
        );
      } finally {
        dispatch(setRefreshChargeBacks(false));
      }
    },
    [dispatch, idUpdate, debouncedSearchQuery, valueFilter, fetchChargebacks],
  );

  const handleReset = useCallback(async () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedFilter([]);
    setSelectedFilterVendor([]);
    setSelectedFilterDates(date);
    setSelectedColumn('');
    setFilterValue('');
    dispatch(resetPagination());
    dispatch(onload());
    dispatch(setRefreshChargeBacks(true));
    setvalueFilter({});
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully',
      }),
    );
  }, [dispatch, date]);

  const handleDownload = async (type: string) => {
    setSelectedFilter([]);
    const isMerchantSelected = selectedFilterExport.length > 0;
    const isVendorSelected = selectedFilterVendorExport.length > 0;
    const hasDateRange = !!selectedFilterDates;

    if ((!(isMerchantSelected || isVendorSelected) || !hasDateRange) && role === Role.ADMIN) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            'Please select at least one merchant or vendor code and a date range.',
        }),
      );
      return;
    }
    else if ((!(isMerchantSelected || isVendorSelected) || !hasDateRange) && [Role.MERCHANT, Role.VENDOR].includes(role || '')) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            role === Role.MERCHANT
              ? 'Please select at least one merchant code and a date range.'
              : 'Please select at least one vendor code and a date range.',
        }),
      );
      return;
    }

    if (!selectedFilterDates || !selectedFilterDates.includes(' - ')) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Invalid date range format',
        }),
      );
      return;
    }

    const [startDate, endDate] = selectedFilterDates.split(' - ');

    if (!startDate || !endDate) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Both start and end dates are required',
        }),
      );
      return;
    }

    let merchant_user_id = '';
    let vendor_user_id = '';

    if (isMerchantSelected) {
      merchant_user_id = selectedFilterExport
        .map((code: any) => code.value)
        .join(',');
    }
    if (isVendorSelected) {
      vendor_user_id = selectedFilterVendorExport
        .map((code: any) => code.value)
        .join(',');
    }

    const queryParams = new URLSearchParams();
    if (merchant_user_id) {
      queryParams.append('merchant_user_id', merchant_user_id);
    }
    if (vendor_user_id) {
      queryParams.append('vendor_user_id', vendor_user_id);
    }
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
    queryParams.append('page', 'no_pagination');
    queryParams.append('limit', 'no_pagination');
    queryParams.append('sortOrder', 'ASC');

    const selectedMerchantReports = await getChargeBacksReportsApi(
      queryParams.toString(),
    );
    const reportsLength = (selectedMerchantReports ?? []).length;

    if (reportsLength > 0) {
      interface ExportedData {
        Sno: string;
        'Vendor Name'?: string;
        'Merchant Name'?: string;
        'Merchant Order ID'?: string;
        User?: string;
        Amount: number;
        'Reference ID': string;
        'Bank Name'?: string;
        RefernceDate: string;
        CreatedAt: string;
      }

      const filteredData: ExportedData[] = selectedMerchantReports.map(
        (item: any) => {
          const row: Partial<ExportedData> = {
            Sno: item.sno ?? 'N/A',
            Amount: item.amount ?? 0,
            'Reference ID': item.utr ?? 'N/A',
          };

          if (includeVendor) {
            row['Bank Name'] = item.bank_name ?? 'N/A';
            row['Vendor Name'] = item.vendor_name ?? 'N/A';
          }

          if (includeMerchants) {
            row['Merchant Name'] = item.merchant_name ?? 'N/A';
            row['Merchant Order ID'] = item.merchant_order_id ?? 'N/A';
            row['User'] = item.user ?? 'N/A';
          }

          // Append date fields at the end
          row['RefernceDate'] = item.reference_date
            ? dayjs(item.reference_date).format('DD-MM-YYYY h:mm:ss A')
            : 'N/A';

          row['CreatedAt'] = item.created_at
            ? dayjs(item.created_at)
                .tz('Asia/Kolkata')
                .format('DD-MM-YYYY h:mm:ss A')
            : 'N/A';

          return row as ExportedData;
        },
      );

      downloadCSV(
        filteredData,
        type as ExportFormat,
        `ChargebackReport_${startDate}_to_${endDate}`,
      );
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: `Report exported successfully as ${type}`,
        }),
      );
      setExportModalOpen(false);
    } else {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'No data available for export',
        }),
      );
    }
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

    const filters: Record<string, any> = {};

    if (selectedFilter.length) {
      filters['merchant_user_id'] = selectedFilter.map((f: any) => f.value);
    }

    if (selectedColumn && filterValue) {
      filters[selectedColumn] = filterValue;
    }
    setvalueFilter(filters);
    fetchChargebacks(searchQuery, filters);
  }, [selectedFilter, selectedColumn, filterValue, fetchChargebacks, dispatch]);

  const handleBlockUser = async (row: {
    merchant_user_id: any;
    user: any;
    user_ip: any;
    id?: string;
  }) => {
    try {
      const blocked = await blockUserChargeback(
        { id: row.id },
        {
          config: {
            userId: row?.user,
            user_ip: row?.user_ip,
            merchant_user_id: row?.merchant_user_id,
          },
        },
      );
      if ((blocked as any)?.error?.message) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: (blocked as any).error.message || 'An error occurred',
          }),
        );
      } else {
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: (blocked as any)?.meta?.message,
          }),
        );
        dispatch(setRefreshChargeBacks(true));
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'ERROR blocking user!';
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: errorMessage,
        }),
      );
    }
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        {editModalOpen && (
          <Modal
            handleModal={() => setEditModalOpen(false)}
            forOpen={editModalOpen}
            title="Edit ChargeBack"
          >
            <DynamicForm
              sections={EditChargeBacksFields}
              onSubmit={handleEditSubmit}
              defaultValues={{}}
              isEditMode={true}
              handleCancel={() => setEditModalOpen(false)}
              isLoading={isLoading}
            />
          </Modal>
        )}
        <div className="flex items-center h-10 justify-between">
          <div className="text-lg font-medium group-[.mode--light]:text-white">
            ChargeBacks
          </div>
          {role &&
            ![Role.MERCHANT, Role.SUB_MERCHANT, Role.VENDOR].includes(role) && (
              <Modal
                handleModal={chargebackModal}
                forOpen={newUserModal}
                buttonTitle={`Add ChargeBack`}
              >
                <DynamicForm
                  sections={ChargeBacksFormFields}
                  onSubmit={handleSubmitData}
                  defaultValues={formData || {}}
                  isEditMode={formData ? true : false}
                  handleCancel={chargebackModal}
                  isLoading={isLoading}
                />
              </Modal>
            )}
        </div>
        <div className="mt-3.5">
          <div className="flex flex-col box box--stacked">
            <div className="flex flex-col p-5 sm:items-center sm:flex-row gap-y-2">
              <div>
                <div className="relative">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="Search ChargeBacks..."
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
                    onClick={() => {
                      setExportModalOpen(true);
                      setSelectedFilterExport([]);
                      setSelectedFilterVendorExport([]);
                      setSelectedFilterDates(`${date} - ${date}`);
                    }}
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
                  {selectedFilterExport && (
                    <Modal
                      handleModal={() => {
                        setExportModalOpen((prev) => !prev);
                      }}
                      forOpen={exportModalOpen}
                      title="Export Chargebacks"
                    >
                      <div className="py-2 my-2 mb-4">
                        <Litepicker
                          value={selectedFilterDates || ''}
                          onChange={(e) => {
                            setSelectedFilterDates(e.target.value);
                          }}
                          enforceRange={false}
                          options={{
                            autoApply: false,
                            singleMode: false,
                            numberOfColumns: 1,
                            numberOfMonths: 1,
                            showWeekNumbers: true,
                            dropdowns: {
                              minYear: 1990,
                              maxYear: null,
                              months: true,
                              years: true,
                            },
                            startDate: date, //today date
                            endDate: date, //today date
                          }}
                          placeholder="Select a date range"
                          className="w-full pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                        />
                      </div>

                      <div className="my-2 py-2 flex flex-col justify-center">
                        {role === Role.ADMIN ? (
                          <div className="my-2 py-2 flex flex-col justify-center">
                            <div className="flex flex-row">
                              <MultiSelect
                                codes={merchantCodes}
                                selectedFilter={selectedFilterExport}
                                setSelectedFilter={(value: any[]) => {
                                  setSelectedFilterExport(value);
                                  if (value.length > 0)
                                    setSelectedFilterVendorExport([]);
                                }}
                                placeholder="Select Merchant Codes ..."
                                disabled={selectedFilterVendor?.length > 0}
                              />
                            </div>
                            <div className="p-2 flex justify-center">OR</div>
                            <div className="flex flex-row">
                              <MultiSelect
                                codes={vendorCodes}
                                selectedFilter={selectedFilterVendorExport}
                                setSelectedFilter={(value: any[]) => {
                                  setSelectedFilterVendorExport(value);
                                  if (value.length > 0) {
                                    setSelectedFilter([]);
                                    setSelectedFilterExport([]);
                                  }
                                }}
                                placeholder="Select Vendor Codes ..."
                                disabled={selectedFilter?.length > 0}
                              />
                            </div>
                          </div>
                        ) : role === Role.MERCHANT ? (
                          <MultiSelect
                            codes={merchantCodes}
                            selectedFilter={selectedFilterExport}
                            setSelectedFilter={setSelectedFilterExport}
                            placeholder="Select Merchant Codes ..."
                          />
                        ) : (
                          <MultiSelect
                            codes={vendorCodes}
                            selectedFilter={selectedFilterVendorExport}
                            setSelectedFilter={setSelectedFilterVendorExport}
                            placeholder="Select Vendor Codes ..."
                          />
                        )}
                      </div>

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
                            {role === Role.ADMIN && (
                              <div className="mt-3">
                                <div className="text-left text-slate-500 mb-2">
                                  Merchant
                                </div>
                                <MultiSelect
                                  codes={merchantCodes}
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
                                {(role === Role.ADMIN
                                  ? Columns.ADMIN_CHARGEBACK
                                  : Columns.CHARGEBACK
                                )
                                  .filter(
                                    (col) =>
                                      col.key !== 'merchant_name' &&
                                      col.key !== 'more_details' &&
                                      col.key !== 'status' &&
                                      col.key !== 'sno' &&
                                      col.key !== 'reference_date' &&
                                      col.key !== 'button' &&
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
                                        ? Columns.ADMIN_CHARGEBACK
                                        : Columns.CHARGEBACK
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
            <div className="overflow-auto xl:overflow-visible">
              {isPageLoading ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CommonTable
                  columns={
                    role === Role.ADMIN
                      ? Columns.ADMIN_CHARGEBACK
                      : role === Role.MERCHANT
                      ? Columns.CHARGEBACK_MERCHANT
                      : Columns.CHARGEBACK
                  }
                  data={{
                    rows: allChargeBacks.chargeback,
                    totalCount: allChargeBacks.count,
                  }}
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 10}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  actionButtonItems={(row: any) => [
                    {
                      label: row.config?.blocked_users?.some(
                        (userIs: { userId: string; user_ip: string }) =>
                          userIs.userId === row.user &&
                          userIs.user_ip === row.user_ip,
                      )
                        ? 'UnBlock'
                        : 'Block',
                      color: row.config?.blocked_users?.some(
                        (userIs: { userId: string; user_ip: string }) =>
                          userIs.userId === row.user &&
                          userIs.user_ip === row.user_ip,
                      )
                        ? 'green'
                        : 'red',
                      onClick: () => {
                        handleBlockUser(row);
                      },
                    },
                  ]}
                  actionMenuItems={(row: any) => {
                    const items: {
                      label?: string;
                      icon: 'Pencil';
                      onClick: () => void;
                    }[] = [];

                    const isValidDate = (dateString: string): boolean => {
                      if (!dateString || typeof dateString !== 'string')
                        return false;
                      const date = new Date(dateString);
                      return !isNaN(date.getTime());
                    };

                    let isToday = false;
                    if (isValidDate(row.created_at)) {
                      isToday =
                        new Date(row.created_at).toISOString().split('T')[0] ===
                        date;
                    } else {
                      console.warn(
                        `Invalid date value for row.created_at: ${row.created_at}`,
                      );
                    }

                    if (role === Role.ADMIN && isToday) {
                      items.push({
                        label: 'Edit',
                        icon: 'Pencil',
                        onClick: () => handleEditChargeBack(row),
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
  );
}

export default ChargeBack;
