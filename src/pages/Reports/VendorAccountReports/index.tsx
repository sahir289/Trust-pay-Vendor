/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Lucide from '@/components/Base/Lucide';
import React from 'react';
import { Role, Status, Columns, VerificationformFields } from '@/constants';
import Button from '@/components/Base/Button';
import { useCallback, useEffect, useState } from 'react';
import { Menu } from '@/components/Base/Headless';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import { getSelectedMerchantsReports } from '@/redux-toolkit/slices/reports/reportAPI';
import {
  getMerchantReports,
  setRefreshReports,
} from '@/redux-toolkit/slices/reports/reportSlice';
import CustomTable from '@/components/TableComponent/CommonTable';
import { selectReports } from '@/redux-toolkit/slices/reports/reportSelectors';
import { downloadCSV } from '@/components/ExportComponent';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import Litepicker from '@/components/Base/Litepicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';
import Modal from '@/components/Modal/modals';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
import { updateCalculations } from '@/redux-toolkit/slices/calculations/calcuationsAPI';
import DynamicForm from '@/components/CommonForm';
import { verifyPassword } from '@/redux-toolkit/slices/auth/authAPI';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

interface VendorCode {
  label: string;
  value: string;
}

interface VendorAccountReportsProps {
  role: string;
  name?: string;
}

interface Reports {
  id: string;
  user_id: string;
  total_payin_count: number;
  total_payin_amount: number;
  total_payin_commission: number;
  total_payout_count: number;
  total_payout_amount: number;
  total_payout_commission: number;
  total_settlement_count: number;
  total_settlement_amount: number;
  total_chargeback_count: number;
  total_chargeback_amount: number;
  current_balance: number;
  net_balance: number;
  created_at: number;
  updated_at: number;
  total_reverse_payout_count: number;
  total_reverse_payout_amount: number;
  total_reverse_payout_commission: number;
  code: string;
  calculation_user_id: string;
}
const VendorAccountReports: React.FC<VendorAccountReportsProps> = ({
  role,
  name,
}) => {
  const [vendorCode, setVendorCode] = useState<VendorCode[]>([]);
  const [countReport, setCountReports] = useState<number>(0);
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const allVendorReports = useAppSelector(selectReports);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const today: string = dayjs().format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${today} - ${today}`,
  );
  const [selectedData, setSelectedData] = useState<Reports | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [vendorReportsData, setVendorReportsData] = useState<Reports[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<VendorCode[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorCode[]>([]);
  const [isLoaded, setIsLoaded] = useState(true);
  const [verificationDelete, setVerificationDelete] = useState(false);
  const [showPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';

  // Fetch vendor codes and initial data
  useEffect(() => {
    const fetchCodes = async () => {
      try {
       const res = await getAllVendorCodes(true, true, false, false, true,true);
        const codes = res.map((el: any) => ({
          label: el.label,
          value: el.value,
        }));
        setVendorCode(codes);
        setSelectedFilter(codes); // Set all codes as default
        if (codes.length > 0 || role !== Role.ADMIN) {
          fetchDailyReport(codes);
        }
        return codes;
      } catch {
        dispatch(setRefreshReports(true));
        return [];
      }
    };

    fetchCodes();
  }, [role]);

  // Reset pagination on mount
  useEffect(() => {
    dispatch(resetPagination());
  }, [dispatch]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(
        setPagination({
          page,
          limit: pagination?.limit || 10,
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

  const fetchDailyReport = useCallback(
    async (codes: VendorCode[] = vendorCode) => {
      if (isSearchActive) return;
      try {
        const startDate = dayjs()
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
        const endDate = dayjs()
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
        const codesToUse = codes.length > 0 ? codes : vendorCode;

        const countParams: {
          startDate: string;
          endDate: string;
          user_id?: string;
        } = {
          startDate,
          endDate,
        };
        if (codesToUse.length > 0) {
          countParams.user_id = codesToUse.map((code) => code.value).join(',');
        }

        const count = await getCount('Calculation', 'VENDOR', {
          startDate: startDate,
          endDate: endDate,
          user_id: codes.map((code: VendorCode) => code.value),
        });
        if (count) {
          setCountReports(count.count);
        }

        const queryString = new URLSearchParams({
          code: codesToUse.map((code: VendorCode) => code.value).join(','),
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 10).toString(),
          role_name: 'VENDOR',
          startDate,
          endDate,
        }).toString();

        const vendorReport = await getSelectedMerchantsReports(queryString);
        setVendorReportsData(vendorReport);
        if (vendorReport) {
          dispatch(
            getMerchantReports(
              Array.isArray(vendorReport) ? vendorReport : [vendorReport],
            ),
          );
          setIsLoaded(false);
        }
        dispatch(setRefreshReports(false));
      } catch {
        dispatch(setRefreshReports(true)); // Keep refresh true on error
        setVendorReportsData([]);
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Error fetching default reports.',
          }),
        );
      }
    },
    [pagination?.page, pagination?.limit, dispatch, vendorCode],
  );

  useEffect(() => {
    if (isSearchActive) {
      handleSearch(selectedFilter, selectedFilterDates);
    } else {
      fetchDailyReport(vendorCode);
    }
  }, [
    pagination?.page,
    pagination?.limit,
    isSearchActive,
    fetchDailyReport,
    vendorCode,
  ]);

  const handleSearch = useCallback(
    async (codes: VendorCode[], dateRange: string) => {
      if (!codes.length || !dateRange) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Please select both vendors and date range.',
          }),
        );
        return;
      }
      setIsSearchActive(true);
      try {
        const dates = dateRange.split(' - ');
        const [startStr, endStr] = dates;
        const formattedstartDate = dayjs(startStr)
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
        const formattedendDate = dayjs(endStr)
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
        const codesToUse = codes.length > 0 ? codes : vendorCode;

        const countParams: {
          startDate: string;
          endDate: string;
          user_id?: string;
        } = {
          startDate: formattedstartDate,
          endDate: formattedendDate,
        };
        //get count basis of selected codes also
        if (codesToUse.length > 0) {
          countParams.user_id = codesToUse.map((code) => code.value).join(',');
        }
        const count = await getCount('Calculation', 'VENDOR', {
          startDate: formattedstartDate,
          endDate: formattedendDate,
          user_id: codes.map((code: VendorCode) => code.value),
        });
        if (count) {
          setCountReports(count.count);
        }
        const queryParams = {
          code: codes.map((code: VendorCode) => code.value).join(','),
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 10).toString(),
          role_name: 'VENDOR',
          startDate: formattedstartDate,
          endDate: formattedendDate,
        };

        const queryString = new URLSearchParams(queryParams).toString();
        const vendorData = await getSelectedMerchantsReports(queryString);

        if (!vendorData?.length) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'No data found for the selected filters.',
            }),
          );
          return;
        }

        setVendorReportsData(vendorData);
        setIsLoaded(false);
        dispatch(getMerchantReports(vendorData));
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Search completed successfully',
          }),
        );
      } catch {
        setCountReports(0);
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Error fetching reports.',
          }),
        );
      }
    },
    [pagination?.page, pagination?.limit, dispatch],
  );

  const handleDownload = async (type: string) => {
    if (!selectedFilter.length || !selectedFilterDates) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Please select both vendors and date range.',
        }),
      );
      return;
    }

    try {
      const dates = selectedFilterDates?.split(' - ') || [];
      const startStr = dates[0];
      const endStr = dates[1];
      let formattedstartDate = '';
      let formattedendDate = '';
      if (!startStr || !endStr) {
        formattedstartDate = dayjs()
          .tz('Asia/Kolkata')
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
        formattedendDate = dayjs()
          .tz('Asia/Kolkata')
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
      } else {
        formattedstartDate = dayjs(startStr, 'YYYY-MM-DD')
          .tz('Asia/Kolkata')
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
        formattedendDate = dayjs(endStr, 'YYYY-MM-DD')
          .tz('Asia/Kolkata')
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss.SSSSSS+05:30');
      }

      const queryString = new URLSearchParams({
        role_name: 'VENDOR',
        code: selectedFilter.map((code: VendorCode) => code.value).join(','),
        startDate: formattedstartDate,
        endDate: formattedendDate,
      }).toString();

      const selectedVendor = (await getSelectedMerchantsReports(
        queryString,
      )) as Reports[];

      if (!selectedVendor.length) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No data found for the selected criteria.',
          }),
        );
        return;
      }

      dispatch(
        getMerchantReports([
          ...allVendorReports,
          ...(Array.isArray(selectedVendor)
            ? selectedVendor
            : [selectedVendor]),
        ]),
      );

      if (selectedVendor.length > 0) {
        const fieldMappings = {
          code: 'Vendor Code',
          updated_at: 'Date',
          total_payin_amount: 'PayIn Amount',
          total_payin_commission: 'PayIn Commission',
          total_payin_count: 'PayIn Count',
          total_payout_amount: 'PayOut Amount',
          total_payout_commission: 'PayOut Commission',
          total_payout_count: 'PayOut Count',
          total_settlement_amount: 'Settlement Amount',
          total_aed_sent_settlement_amount: 'Aed Sent Settlement',
          total_bank_sent_settlement_amount: 'Bank Sent Settlement',
          total_cash_sent_settlement_amount: 'Cash Sent Settlement',
          total_crypto_sent_settlement_amount: 'Crypto Sent Settlement',
          total_aed_received_settlement_amount: 'Aed Recieved Settlement',
          total_bank_received_settlement_amount: 'Aed Recieved Settlement',
          total_cash_received_settlement_amount: 'Aed Recieved Settlement',
          total_crypto_received_settlement_amount: 'Aed Recieved Settlement',
          total_internal_settlement_amount: 'Internal Qr Settlement',
          total_internal_bank_settlement_amount: 'Internal Bank Settlement',
          total_chargeback_amount: 'Chargeback Amount',
          total_reverse_payout_amount: 'Reverse Payout Amount',
          total_reverse_payout_commission: 'Reverse Payout Commission',
          total_reverse_payout_count: 'Reverse Payout Count',
          total_adjustment_amount: 'Adjustment Amount',
          current_balance: 'Current Balance',
          net_balance: 'Net Balance',
          created_at: 'Created At',
        };
        const filteredData = selectedVendor.map((item: any) => ({
          [fieldMappings.updated_at]: dayjs(item.created_at)
            .tz('Asia/Kolkata')
            .format('DD-MM-YYYY'),
          [fieldMappings.code]: item.code || '0',
          [fieldMappings.total_payin_amount]:
            item.total_payin_amount.toFixed(2) || '0',
          [fieldMappings.total_payin_commission]:
            item.total_payin_commission.toFixed(2) || '0',
          [fieldMappings.total_payin_count]: item.total_payin_count || '0',
          [fieldMappings.total_payout_amount]:
            item.total_payout_amount.toFixed(2) || '0',
          [fieldMappings.total_payout_commission]:
            item.total_payout_commission.toFixed(2) || '0',
          [fieldMappings.total_payout_count]: item.total_payout_count || '0',
          [fieldMappings.total_settlement_amount]:
            item.total_settlement_amount.toFixed(2) || '0',
          [fieldMappings.total_aed_sent_settlement_amount]:
            item.total_aed_sent_settlement_amount || '0',
          [fieldMappings.total_bank_sent_settlement_amount]:
            item.total_bank_sent_settlement_amount || '0',
          [fieldMappings.total_cash_sent_settlement_amount]:
            item.total_cash_sent_settlement_amount || '0',
          [fieldMappings.total_crypto_sent_settlement_amount]:
            item.total_crypto_sent_settlement_amount || '0',
          [fieldMappings.total_aed_received_settlement_amount]:
            item.total_aed_received_settlement_amount|| '0',
          [fieldMappings.total_bank_received_settlement_amount]:
            item.total_bank_received_settlement_amount || '0',
          [fieldMappings.total_cash_received_settlement_amount]:
            item.total_cash_received_settlement_amount || '0',
          [fieldMappings.total_crypto_received_settlement_amount]:
            item.total_crypto_received_settlement_amount || '0',
          [fieldMappings.total_internal_settlement_amount]:
            item.total_internal_settlement_amount || '0',
          [fieldMappings.total_internal_bank_settlement_amount]:
            item.total_internal_bank_settlement_amount || '0',
          [fieldMappings.total_chargeback_amount]:
            item.total_chargeback_amount.toFixed(2) || '0',
          [fieldMappings.total_reverse_payout_amount]:
            item.total_reverse_payout_amount.toFixed(2) || '0',
          [fieldMappings.total_reverse_payout_commission]:
            item.total_reverse_payout_commission.toFixed(2) || '0',
          [fieldMappings.total_reverse_payout_count]:
            item.total_reverse_payout_count || '0',
          [fieldMappings.total_adjustment_amount]:
            item.total_adjustment_amount.toFixed(2) || '0',
          [fieldMappings.current_balance]:
            item.current_balance.toFixed(2) || '0',
          [fieldMappings.net_balance]: item.net_balance.toFixed(2) || '0',
        }));
        const codeid = selectedFilter
          .map((code: VendorCode) => code.label)
          .join(',');
        downloadCSV(
          filteredData,
          type as ExportFormat,
          role === Role.VENDOR
            ? `Vendor-report_${name}_${startStr}_to_${endStr}`
            : `Vendor-report_${codeid}_${startStr}_to_${endStr}`,
        );

        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: `Report exported successfully as ${type}`,
          }),
        );
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No data available for export',
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

  const handleSelectedVendors = () => {
    const selectedVendorData = vendorCode.filter((item) =>
      selectedFilter.some((filterItem) => filterItem.value === item.value),
    );
    setSelectedVendor(
      selectedVendorData.length > 0 ? selectedVendorData : vendorCode,
    );
  };

  const handleEditClick = (row: Reports) => {
    setSelectedData(row);
    setEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setSelectedData(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedData) {
      setVerificationDelete(true);
    }
    setEditModalOpen(false);
  };

  const handleVerificationdelete = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const passwordVerified = await verifyPassword(passwordData.password);
      if (!passwordVerified) {
        throw new Error('Invalid password');
      }
      if (selectedData) {
        const apiData = {
          date: selectedData.created_at,
          user_id: selectedData.calculation_user_id,
          // company_id: (selectedData as any).company_id, // If company_id is not in Reports, keep this cast or add to Reports interface
        };
        const response = await updateCalculations(apiData);
        if (response?.meta?.message) {
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: response?.meta?.message,
            }),
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: response?.error?.message,
            }),
          );
        }
        setVerificationDelete(false);
        setErrorMessage(null);
        setSelectedData(null);
      } else {
        throw new Error('x');
      }
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="col-span-12">
        <div className="flex w-full flex-col py-4 sm:py-10 px-2 sm:px-6">
          <div className="flex w-full flex-col gap-3 sm:gap-y-7 px-2 sm:px-4 py-2 rounded-lg">
            <div className="p-3 sm:p-5 w-full flex flex-col sm:flex-row mt-2 sm:mt-3.5 box box--stacked gap-3 sm:gap-0 sm:justify-between">
              <div className="w-full sm:mr-2 sm:w-[70%]">
                <label className="block text-xs sm:text-sm mb-2 px-1 sm:px-2">
                  Vendor Codes
                </label>
                <MultiSelect
                  value={selectedVendor}
                  codes={vendorCode}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                  onChange={handleSelectedVendors}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:mt-3 w-full sm:w-auto">
                <Litepicker
                  value={selectedFilterDates}
                  onChange={(e) => {
                    setSelectedFilterDates(
                      e.target.value || `${today} - ${today}`,
                    );
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
                    startDate: today,
                    endDate: today,
                  }}
                  enforceRange={false}
                  placeholder="Select a date range"
                  className="w-full px-2 sm:px-3 py-2 sm:py-1 h-9 sm:h-10 text-[10px] xs:text-xs sm:text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-row gap-2 sm:gap-3">
                  <button
                    className={`px-3 sm:px-4 w-full sm:w-35 h-9 sm:h-10 text-xs sm:text-sm rounded-lg ${
                      selectedFilter.length &&
                      selectedFilterDates &&
                      vendorCode.length
                        ? 'bg-primary text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={
                      !selectedFilter.length ||
                      !selectedFilterDates ||
                      !vendorCode.length
                    }
                    onClick={() => {
                      if (!selectedFilter.length || !selectedFilterDates) {
                        dispatch(
                          addAllNotification({
                            status: Status.ERROR,
                            message:
                              'Please select both vendors and date range.',
                          }),
                        );
                        return;
                      }
                      handleSearch(selectedFilter, selectedFilterDates);
                    }}
                  >
                    Search
                  </button>
                  <Menu>
                    <Menu.Button
                      as={Button}
                      rounded
                      variant="primary"
                      className="px-3 sm:px-4 w-full sm:w-35 h-9 sm:h-10 text-xs sm:text-sm border-primary/50 rounded-lg"
                    >
                      Download
                      <Lucide
                        icon="ChevronDown"
                        className="stroke-[1.3] w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2"
                      />
                    </Menu.Button>
                    <Menu.Items className="w-40">
                      <Menu.Item onClick={() => handleDownload('CSV')}>
                        <Lucide
                          icon="FileText"
                          className="stroke-[1.3] w-4 h-4 mr-2"
                        />
                        CSV
                      </Menu.Item>
                      <Menu.Item onClick={() => handleDownload('XLSX')}>
                        <Lucide
                          icon="FileSpreadsheet"
                          className="stroke-[1.3] w-4 h-4 mr-2"
                        />
                        XLSX
                      </Menu.Item>
                      <Menu.Item onClick={() => handleDownload('PDF')}>
                        <Lucide
                          icon="FileText"
                          className="stroke-[1.3] w-4 h-4 mr-2"
                        />
                        PDF
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-y-10 gap-x-6">
        <div className="col-span-12">
          <div className="mt-3.5">
            <div className="flex flex-col rounded-lg">
              {isLoaded ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CustomTable
                  columns={
                    role === Role.ADMIN
                      ? Columns.REPORT_VENDOR_MASTER
                      : Columns.REPORT_VENDOR
                  }
                  data={{
                    rows: vendorReportsData,
                    totalCount: countReport || 0,
                  }}
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 10}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  handleDeleteData={() => {
                    throw new Error('Function not implemented.');
                  }}
                  actionMenuItems={(row: any) => {
                    const items: {
                      label?: string;
                      icon: 'Pencil';
                      onClick: (row: any) => void;
                    }[] = [];
                    if (role === Role.ADMIN) {
                      items.push({
                        label: 'Edit',
                        icon: 'Pencil',
                        onClick: () => handleEditClick(row),
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
      {editModalOpen && (
        <Modal
          handleModal={handleEditCancel}
          forOpen={editModalOpen}
          title="Edit Transaction"
        >
          <ModalContent
            handleCancelDelete={handleEditCancel}
            handleConfirmDelete={handleConfirmDelete}
          >
            Are you sure you want to Edit this Calculation?
          </ModalContent>
        </Modal>
      )}
      <Modal
        handleModal={() => setVerificationDelete(false)}
        forOpen={verificationDelete}
      >
        <DynamicForm
          sections={VerificationformFields(showPassword)}
          onSubmit={handleVerificationdelete}
          defaultValues={selectedData || {}}
          isEditMode={true}
          handleCancel={() => setVerificationDelete(false)}
          isLoading={isLoading}
        />
        {errorMessage && (
          <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
        )}
      </Modal>
    </>
  );
};

export default VendorAccountReports;
