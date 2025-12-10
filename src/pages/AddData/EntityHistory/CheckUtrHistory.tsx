/* eslint-disable no-undef */
import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import {
  getAllCheckUtrHistoryData,
  getRefreshDataEntries,
} from '@/redux-toolkit/slices/dataEntries/dataEntrySelectors';
import {
  getCheckUtrHistories,
  setRefreshDataEntries,
} from '@/redux-toolkit/slices/dataEntries/dataEntrySlice';
import { getAllCheckUtrHistories,
  // getAllCheckUtrHistoriesBySearchApi
 } from '@/redux-toolkit/slices/dataEntries/dataEntryAPI';
import { Columns, Status } from '@/constants';
import LoadingIcon from '@/components/Base/LoadingIcon';
import CommonTable from '@/components/TableComponent/CommonTable';
import Lucide from '@/components/Base/Lucide';
import { Menu } from '@/components/Base/Headless';
import { FormInput } from '@/components/Base/Form';
// import users from '@/fakers/users';
// import transactionStatus from '@/fakers/transaction-status';
import Button from '@/components/Base/Button';
// import { downloadCSV } from '@/components/ExportComponent';
// import Modal from '@/components/Modal/modals';
// import Litepicker from '@/components/Base/Litepicker';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CheckUTR {
  selectedIndex: number;
  tabState: number;
}

const CheckUtrHistory: React.FC<CheckUTR> = ({selectedIndex, tabState}) => {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const refreshDataEntries = useAppSelector(getRefreshDataEntries);
  const checkUtrHistory = useAppSelector(getAllCheckUtrHistoryData);
  const [isLoading, setIsLoading] = useState(false);
  // const [exportModalOpen, setExportModalOpen] = useState(false);
  // const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  // const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
  //     `${date} - ${date}`,
  //   );
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState<string>(''); // Added search state
  // type ExportFormat = 'PDF' | 'CSV' | 'XLSX';
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

  const fetchCheckUtrData = useCallback(async (searchQuery?: string) => {
    setIsLoading(true);
    try {
      const queryString = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        ...(searchQuery && { search: searchQuery }),
      }).toString();
      let response;
      // let totalCount;
      // if (!searchQuery) {
      response = await getAllCheckUtrHistories(queryString);
        // totalCount = await getCount('CheckUtrHistory');
        if (response) {
        dispatch(
          getCheckUtrHistories({
            bankResponse: response.data.rows,
            checkUtrHistory: response.data.checkUtr,
            totalCount: response.data.totalCount,
            loading: false,
            error: null,
          }),
        );
      }
      //  }
        // else if (searchQuery) {
        // response = await getAllCheckUtrHistories(queryString);        totalCount = await getCount('CheckUtrHistory');
        // if (response) {
        //   dispatch(
        //   getCheckUtrHistories({
        //     bankResponse: [] ,
        //     checkUtrHistory: response.data.checkUtr ,
        //     totalCount: response.data.totalCount,
        //     loading: false,
        //     error: null,
        //   }),
        // );
        //       }
        //     }
      else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'No History Found!'
          })
        );
      }
    } catch  {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Error fetching history'
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
            fetchCheckUtrData(debouncedSearchQuery);
          } 
          // else {
          //   fetchCheckUtrData();
          // }
        }, [debouncedSearchQuery, fetchCheckUtrData]);
      
        const debouncedFetchBankAccounts = useCallback(
            debounce((query: string) => {
              fetchCheckUtrData(query);
            }, 500),
            [fetchCheckUtrData, debouncedSearchQuery],
          );
        useEffect(() => {
            if (refreshDataEntries) {
              fetchCheckUtrData(debouncedSearchQuery).then(() => {
          dispatch(setRefreshDataEntries(false));
              });
            }
          }, [
            fetchCheckUtrData,
            debouncedFetchBankAccounts,
            searchQuery,
            refreshDataEntries,
            pagination?.page,
            pagination?.limit,
          ]);
  // Fetch data when pagination changes
  useEffect(() => {
    if( selectedIndex){
      fetchCheckUtrData();
    }
  }, [pagination?.page, pagination?.limit, fetchCheckUtrData]);

  // Fetch data when refresh flag changes
  useEffect(() => {
    if (refreshDataEntries && selectedIndex === tabState) {
      fetchCheckUtrData();
      dispatch(setRefreshDataEntries(false));
    }
  }, [refreshDataEntries, fetchCheckUtrData, dispatch]);
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

  //     const queryString = new URLSearchParams(
  //       params as Record<string, string>,
  //     ).toString();
  //     const response = await getAllCheckUtrHistories(queryString);

  //     const dataToExport = response?.data?.checkUtr || [];

  //     if (!dataToExport.length) {
  //       dispatch(
  //         addAllNotification({
  //           status: Status.ERROR,
  //           message: 'No data found for the selected criteria',
  //         })
  //       );
  //       return;
  //     }
  //     interface ExportedData {
  //       Sno : string;
  //       MerchantOrderID: string;
  //       UTR: string;
  //       CreatedBy: string;
  //       CreatedAt: string;
  //     }

  //     const filteredData: ExportedData[] = dataToExport.map(
  //       (item: {
  //         sno : string;
  //         merchant_order_id: string;
  //         utr?: string;
  //         updated_at: string;
  //         updated_by?: string;
  //       }) => ({
  //         Sno: item.sno,
  //         MerchantOrderID: item.merchant_order_id,
  //         UTR: item.utr,
          
  //         CreatedAt: dayjs(item.updated_at,
  //         ).tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A'),
  //         CreatedBy: item.updated_by,
  //       }),

  //     );
  //     const filename = `check-utr-report_${startDate}_to_${endDate}`;

  //     downloadCSV(filteredData, type, filename);
  //     dispatch(
  //       addAllNotification({
  //         status: Status.SUCCESS,
  //         message: `Report exported successfully as ${type}`,
  //       })
  //     );
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       dispatch(
  //         addAllNotification({
  //           status: Status.ERROR,
  //           message: error.message || 'Failed to export report',
  //         })
  //       );
  //     } else {
  //       dispatch(
  //         addAllNotification({
  //           status: Status.ERROR,
  //           message: 'Failed to export report',
  //         })
  //       );
  //     }
  //   } finally {
  //     setExportModalOpen(false);
  //   }
  // };

const handleRefresh = useCallback(async() => {
      setIsLoading(true);
       //---- prevent page size shrink on clicking on refresh
    // dispatch(resetPagination()); 
    await fetchCheckUtrData(searchQuery.trim());
  dispatch(
    addAllNotification({
      status: Status.SUCCESS,
      message: 'CheckUtrData refreshed successfully',
    })
  );
  setIsLoading(false);
  }, [dispatch, fetchCheckUtrData, searchQuery]);
  
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
          <div className="flex flex-col">
            <div className="flex flex-col p-2 sm:p-4 md:p-5 sm:items-center sm:flex-row gap-y-2">
              <div>
                <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="Search transactions..."
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
                      {/* <div className="flex flex-row gap-4 my-4 pt-6">
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
                      </div> */}
                    {/* </Modal>
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
                <CommonTable
                  columns={Columns.CHECK_UTR_HISTORY}
                  data={{
                    rows: checkUtrHistory?.checkUtrHistory || [],
                    totalCount: checkUtrHistory.totalCount,
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
};

export default CheckUtrHistory;
