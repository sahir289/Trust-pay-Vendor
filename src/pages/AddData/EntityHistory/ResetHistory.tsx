/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { Columns, Status } from '@/constants';
import Lucide from '@/components/Base/Lucide';
import { Menu } from '@/components/Base/Headless';
import { FormInput } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import CustomTable from '@/components/TableComponent/CommonTable';
import { getAllResetHistory} from '@/redux-toolkit/slices/dataEntries/dataEntryAPI';
import { getResetHistory, setRefreshDataEntries } from '@/redux-toolkit/slices/dataEntries/dataEntrySlice';
import { getAllResestHistory, getRefreshDataEntries } from '@/redux-toolkit/slices/dataEntries/dataEntrySelectors';
// import Modal from '@/components/Modal/modals';
// import Litepicker from '@/components/Base/Litepicker';
// import { downloadCSV } from '@/components/ExportComponent';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

dayjs.extend(utc);
dayjs.extend(timezone);

type ResetHistoryProps = {
  selectedIndex: number;
  tabState: number;
};

function ResetHistory({ selectedIndex, tabState }: ResetHistoryProps) {

  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const allresetHistory = useAppSelector(getAllResestHistory);
  const [isLoading, setIsLoading] = useState(false);
  const refreshDataEntries = useAppSelector(getRefreshDataEntries);
  // const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  // const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
  //     `${date} - ${date}`,
  //   );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>(''); // Added search state
  // const [exportModalOpen, setExportModalOpen] = useState(false);
  // type ExportFormat = 'PDF' | 'CSV' | 'XLSX';

  // Reset pagination when component mounts
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

  const fetchResetHistory = useCallback(async (searchQuery?: string) => {
    setIsLoading(true);
    try {
      const queryString = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        ...(searchQuery && { search: searchQuery }),
      }).toString();
      let response;
     
        response = await getAllResetHistory(queryString);
        // totalCount = await getCount('ResetDataHistory');
         if (response) {
        const payload = {
          bankResponse: [],
          resetHistory: response.resetHistory || [],
          totalCount: response?.totalCount,
          loading: false,
          error: null,
        };
          
        dispatch(getResetHistory(payload));
      }
      // else if (searchQuery) { 
      //   response = await getAllResetHistory(queryString);
      //   if (response) {
      //     const payload = {
      //       bankResponse: [],
      //       resetHistory: response.resetHistory || [],
      //       totalCount: response?.totalCount,
      //       loading: false,
      //       error: null,
      //     };
      //     dispatch(getResetHistory(payload));
      //   }
      // }
      else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No Records Found!'
          })
        );
      }

    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'No Records Found!'
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [pagination?.page, pagination?.limit, dispatch]);

 useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery.trim());
      }, 1000);
  
      return () => {
        clearTimeout(handler);
      };
    }, [searchQuery]);
   useEffect(() => {
      if (debouncedSearchQuery) {
        fetchResetHistory(debouncedSearchQuery);
      } 
      // else {
      //   fetchResetHistory();
      // }
    }, [debouncedSearchQuery, fetchResetHistory]);
  
    const debouncedFetchBankAccounts = useCallback(
        debounce((query: string) => {
          fetchResetHistory(query);
        }, 500),
        [fetchResetHistory, debouncedSearchQuery],
      );
    useEffect(() => {
        if (refreshDataEntries) {
          fetchResetHistory(debouncedSearchQuery).then(() => {
      dispatch(setRefreshDataEntries(false));
          });
        }
      }, [
        fetchResetHistory,
        debouncedFetchBankAccounts,
        searchQuery,
        refreshDataEntries,
        pagination?.page,
        pagination?.limit,
      ]);

  useEffect(() => {
    if(selectedIndex){
    fetchResetHistory();
    }
  }, [pagination?.page, pagination?.limit, fetchResetHistory]);
  useEffect(() => {
    if (refreshDataEntries && selectedIndex === tabState) {
      fetchResetHistory();
      dispatch(setRefreshDataEntries(false));
    }
  }, [refreshDataEntries, fetchResetHistory, dispatch]);
  // const handleDownload = async (type: ExportFormat) => {
  //   try {
  //     // Validate date selection
  //     if (!selectedFilterDates) {
  //       dispatch(
  //         addAllNotification({
  //           status: Status.ERROR,
  //           message: 'Please select a date range',
  //         })
  //       );
  //       return;
  //     }

  //     // Parse dates
  //     const [startDateStr, endDateStr] = selectedFilterDates.split(' - ');
  //     const startDate = new Date(startDateStr ?? '')
  //       .toISOString()
  //       .split('T')[0];
  //     const endDate = endDateStr
  //       ? new Date(endDateStr).toISOString().split('T')[0]
  //       : '';

  //     const params = {
  //       startDate,
  //       endDate,
  //       page: '', 
  //       limit: '',
  //       sortOrder: 'ASC'
  //     };

  //     // Get data from API
  //     const queryString = new URLSearchParams(
  //       params as Record<string, string>,
  //     ).toString();
  //     const response = await getAllResetHistory(queryString);
  //     const dataToExport = response?.resetHistory || [];

  //     if (!dataToExport.length) {
  //       dispatch(
  //         addAllNotification({
  //           status: Status.ERROR,
  //           message: 'No data found for the selected criteria'
  //         })
  //       );
  //       return;
  //     }
  //     interface ResetHistoryItem {
  //       sno : string;
  //       merchant_order_id: string;
  //       new_details: object | object[]; // updated type
  //       previous_details: object | object[]; // updated type
  //       created_by?: string;
  //       created_at: string;
  //   }

  //     interface FilteredResetHistoryItem {
  //       sno : string;
  //       merchant_order_id: string;
  //       new_details: { status: string; user_submitted_utr: string }[];
  //       previous_details: {
  //       amount: string;
  //       utr: string;
  //       previous_status: string;
  //       created_by?: string;
  //       created_at: string;
  //      }[];
  //     }

  //     const formatDetails = (details: any) => {
  //       if (!details) return '';
  //       return Object.entries(details)
  //         .map(([key, value]) => `${key}: ${value}`)
  //         .join(', ');
  //     };

  //     const filteredData: FilteredResetHistoryItem[] = dataToExport.map(
  //       (item: ResetHistoryItem) => ({
  //         Sno: item.sno,
  //         MerchantOderID: item.merchant_order_id,
  //         NewDetails: formatDetails(item.new_details),
  //         PreviousDetails: formatDetails(item.previous_details),
  //         ResetBy: item.created_by || 'N/A',
  //         ResetAt: dayjs(item.created_at,
  //         ).tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A'),

  //       }),
  //     );

  //     const filename = `reset-history-report_${startDate}_to_${endDate}`;
  //     downloadCSV(filteredData, type, filename);
  //     dispatch(
  //       addAllNotification({
  //         status: Status.SUCCESS,
  //         message: `Report exported successfully as ${type}`,
  //       })
  //     );
  //   } catch {
  //     dispatch(
  //       addAllNotification({
  //         status: Status.ERROR,
  //         message: 'Failed to export report',
  //       })
  //     );
  //   } finally {
  //     setExportModalOpen(false);
  //   }
  // };

  // const handleRefresh = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     dispatch(resetPagination());
  //     const queryString = new URLSearchParams({
  //       page: '1',
  //       limit: (pagination?.limit || 10).toString(),
  //     }).toString();

  //     const resetHistoryData = await getAllResetHistory(queryString);

  //     if (resetHistoryData) {
  //       dispatch(getResetHistory(resetHistoryData));
  //       setNotificationStatus(Status.SUCCESS);
  //       setNotificationMessage('Data refreshed successfully');
  //       basicNonStickyNotificationToggle();
  //     }
  //   } catch (error) {
  //     console.error('Refresh failed:', error);
  //     setNotificationStatus(Status.ERROR);
  //     setNotificationMessage('Failed to refresh data');
  //     basicNonStickyNotificationToggle();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [dispatch, pagination?.limit]);

  // const handleReset = useCallback(async () => {
  //   try {
  //     setSelectedFilterDates('');
  //     dispatch(resetPagination());

  //     const queryString = new URLSearchParams({
  //       page: '1',
  //       limit: '10',
  //     }).toString();

  //     setIsLoading(true);
  //     const resetHistoryData = await getAllResetHistory(queryString);
  //     if (resetHistoryData) {
  //       dispatch(getResetHistory(resetHistoryData));
  //       setNotificationStatus(Status.SUCCESS);
  //       setNotificationMessage('All filters reset successfully');
  //       basicNonStickyNotificationToggle();
  //     }
  //   } catch (error) {
  //     console.error('Reset failed:', error);
  //     setNotificationStatus(Status.ERROR);
  //     setNotificationMessage('Failed to reset data');
  //     basicNonStickyNotificationToggle();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [dispatch]);
const handleRefresh = useCallback(async() => {
    setIsLoading(true);
     //---- prevent page size shrink on clicking on refresh
    // dispatch(resetPagination()); 
    await fetchResetHistory(searchQuery.trim());
    dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: 'ResetHistory refreshed successfully',
        })
      );
      setIsLoading(false);
  }, [dispatch, fetchResetHistory, searchQuery]);
  
  //reset
const handleReset = useCallback(async () => {
  setIsLoading(true);
  // setSelectedFilterDates('');
  dispatch(resetPagination());
  setSearchQuery('');
  dispatch(
    addAllNotification({
      status: Status.SUCCESS,
      message: 'All filters reset successfully',
    })
  );
  setIsLoading(false);
}, [dispatch]);
  
  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="mt-3.5">
          <div className="flex flex-col ">
            <div className="flex flex-col p-2 sm:p-4 md:p-5 sm:items-center sm:flex-row gap-y-2">
              <div>
                <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                
                   <FormInput
                    type="text"
                    placeholder="Merchant Order ID ..."
                    className="w-full pl-9 pr-9 sm:w-40 lg:w-48 rounded-[0.5rem] text-xs sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                   {searchQuery && (
                      <Lucide
                        icon="X" 
                        className="absolute inset-y-0 right-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto mr-3 stroke-[1.3] text-slate-500 cursor-pointer"
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
                {/* <Menu>
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
                      handleModal={() => setExportModalOpen((prev) => !prev)}
                      forOpen={exportModalOpen}
                      title="Export PayIns"
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
                          className="w-[90%] mx-4 pl-9 rounded-lg dark:bg-darkmode-900/30 dark:text-gray-200 dark:border-gray-700"
                        />
                      </div>
                      <div className="flex flex-row gap-4 my-4 pt-6">
                        <Button
                          className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                          onClick={() => handleDownload('PDF')}
                        >
                          Export as PDF
                        </Button>
                        <Button
                          className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                          onClick={() => handleDownload('CSV')}
                        >
                          Export as CSV
                        </Button>
                        <Button
                          className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                          onClick={() => handleDownload('XLSX')}
                        >
                          Export as XLSX
                        </Button>
                      </div>
                    </Modal>
                  )}
                </Menu> */}
                {/* <Popover className="inline-block">
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
                        <div className="flex items-center justify-center h-5 px-1.5 ml-2 text-xs font-medium border rounded-full bg-slate-100 dark:bg-darkmode-400">
                          3
                        </div>
                      </Popover.Button>
                      <Popover.Panel placement="bottom-end">
                        <div className="p-2">
                          <div>
                            <div className="text-left text-slate-500">User</div>
                            <FormSelect className="flex-1 mt-2">
                              {users.fakeUsers().map((faker, fakerKey) => (
                                <option key={fakerKey} value={fakerKey}>
                                  {faker.name}
                                </option>
                              ))}
                            </FormSelect>
                          </div>
                          <div className="mt-3">
                            <div className="text-left text-slate-500">
                              Status
                            </div>
                            <FormSelect className="flex-1 mt-2">
                              {transactionStatus
                                .fakeTransactionStatus()
                                .map((faker, fakerKey) => (
                                  <option key={fakerKey} value={fakerKey}>
                                    {faker.name}
                                  </option>
                                ))}
                            </FormSelect>
                          </div>
                          <div className="flex items-center mt-4">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                close();
                              }}
                              className="w-32 ml-auto"
                            >
                              Close
                            </Button>
                            <Button variant="primary" className="w-32 ml-2">
                              Apply
                            </Button>
                          </div>
                        </div>
                      </Popover.Panel>
                    </>
                  )}
                </Popover> */}
              </div>
            </div>

            <div className="overflow-auto xl:overflow-visible">
              {isLoading ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CustomTable
                  columns={Columns.RESETHISTORY}
                  data={{
                    rows: allresetHistory.resetHistory || [],
                    totalCount: allresetHistory?.totalCount,
                  }}
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 10}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetHistory;
