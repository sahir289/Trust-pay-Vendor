/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Table from '@/components/Base/Table';
import Pagination from '@/components/Base/Pagination';
import Lucide, { icons } from '@/components/Base/Lucide';
import { FormCheck, FormSwitch, FormSelect } from '@/components/Base/Form';
import Tippy from '@/components/Base/Tippy';
import Modal from '../Modal/modals';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
import CustomTooltip from '@/pages/Tooltip/tooltip';
import { NotificationElement } from '@/components/Base/Notification';
import { MAX_AMOUNT, Role, Status } from '@/constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import MoreDetailsModal from '@/components/Modal/MoreDetails/MoreDetails';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import {
  addAllNotification,
  removeNotificationById,
} from '@/redux-toolkit/slices/AllNoti/allNotifications';
dayjs.extend(utc);
dayjs.extend(timezone);
const s3EndPoint = import.meta.env.VITE_API_S3_URL;
type ConfigField = {
  type: string; // like 'bool', 'string', etc.
  value: unknown;
};
interface Column {
  label: string;
  key: string;
  copy?: boolean;
  type?:
    | 'status'
    | 'image'
    | 'text'
    | 'checkbox'
    | 'toggle'
    | 'expand'
    | 'range'
    | 'object'
    | 'action'
    | 'limits'
    | 'Bank_details'
    | 'commission'
    | 'button'
    | 'number'
    | 'date'
    | 'boolean'
    | 'format'
    | 'more_details' // Added new type for More Details button
    | string;
  objectKey?: string | string[];
  disabled?: boolean;
  actions?: {
    label: string;
    icon: keyof typeof icons;
    onClick: (row: any) => void;
  }[];
  format?: 'amount' | string;
}

interface CommonTableProps {
  columns: Column[];
  data: { rows: any[]; totalCount: number };
  expandable?: boolean;
  handleRowClick?: (id: any) => void;
  handleEditModal?: (data: any, type: string) => void;
  handleDeleteData?: (id: string) => void;
  handleShowAllData?: (data: any) => void;
  handleToggleClick?: (id: string, status: boolean, type: string) => void;
  handleNumberChange?: (row: any, value: number) => void;
  actionMenuItems?: (row: any) => {
    label?: string;
    icon: keyof typeof icons;
    onClick?: (row: any) => void;
    onMouseEnter?: (row: any) => void;
    hover?: boolean;
  }[];
  expandedActionMenuItems?: (row: any) => {
    label?: string;
    icon: keyof typeof icons;
    onClick?: (row: any) => void;
    onMouseEnter?: (row: any) => void;
    hover?: boolean;
  }[];
  actionButtonItems?: (row: any) => {
    label?: string;
    onClick: (row: any) => void;
    color?: string;
  }[];
  expandedRow?: number | null;
  handleSort?: (key: string) => void;
  handleFilter?: (key: string, value: string) => void;
  expandedRowKey?: string;
  handleSelectAll?: () => void;
  selectedRows?: string[];
  source?: string;
  role?: string;
  handleRetrieve?: (row: any) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number | string;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  isSettlement?: boolean;
  setTotalPayoutAmount?: React.Dispatch<React.SetStateAction<number>>;
  setImgUtr?: (value: {
    bool: boolean;
    merchantOrderId: string;
    data: {
      userSubmittedUtr: string;
      amount: string;
      code: string;
      user_submitted_image: File;
    };
  }) => void;
}

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const CommonTable: React.FC<CommonTableProps> = ({
  columns,
  data,
  isSettlement,
  handleRowClick,
  handleToggleClick,
  handleNumberChange,
  actionMenuItems,
  expandedActionMenuItems,
  actionButtonItems,
  handleShowAllData,
  expandedRow,
  expandedRowKey,
  expandable,
  handleSelectAll,
  selectedRows = [],
  source,
  role,
  handleRetrieve,
  onPageChange,
  currentPage = 1,
  pageSize = 20,
  onPageSizeChange,
  handleEditModal,
  setImgUtr,
  setTotalPayoutAmount,
}) => {
  const getStatusStyles = (status: string) => {
    const statusStyles: Record<
      string,
      { color: string; icon: keyof typeof icons }
    > = {
      IMG_PENDING: { color: 'text-yellow-500', icon: 'Globe' },
      PENDING: { color: 'text-yellow-500', icon: 'Globe' },
      FAILED: { color: 'text-red-500', icon: 'XCircle' },
      DROPPED: { color: 'text-red-500', icon: 'XCircle' },
      REJECTED: { color: 'text-red-500', icon: 'XCircle' },
      REVERSED: { color: 'text-orange-500', icon: 'XCircle' },
      BANK_MISMATCH: { color: 'text-orange-500', icon: 'FileWarning' },
      DUPLICATE: { color: 'text-orange-500', icon: 'FileWarning' },
      DISPUTE: { color: 'text-orange-500', icon: 'FileWarning' },
      ASSIGNED: { color: 'text-blue-500', icon: 'ListChecks' },
      SUCCESS: { color: 'text-green-500', icon: 'CheckCircle' },
      APPROVED: { color: 'text-green-500', icon: 'CheckCircle' },
    };
    return statusStyles[status] || { color: 'text-gray-500', icon: 'Info' };
  };
  const roleData = localStorage.getItem('userData');
  let user_name = '';
  if (roleData) {
    const parsedData = JSON.parse(roleData);
    user_name = parsedData.name || '';
  }

  const [hoveredAction, setHoveredAction] = useState<{
    rowIndex: number | null;
    actionIndex: number | null;
    type?: 'menu' | 'button';
  }>({ rowIndex: null, actionIndex: null });

  const [showAllDataModal, setShowAllDataModal] = useState<boolean>(false);
  const [showAllData, setShowAllData] = useState<{ [key: string]: any }>({});
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    (state) => state.allNotification.allNotifications,
  );
  const notificationRefs = useRef<Map<string, NotificationElement>>(new Map());
  const [editingNumber, setEditingNumber] = useState<{
    rowIndex: number | null;
    colKey: string | null;
    value: string;
  }>({ rowIndex: null, colKey: null, value: '' });

  const debouncedSetHoveredAction = useCallback(
    debounce(
      (newState: {
        rowIndex: number | null;
        actionIndex: number | null;
        type?: 'menu' | 'button';
      }) => {
        setHoveredAction(newState);
      },
      100,
    ),
    [],
  );

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      if (latestNotification) {
        const ref = notificationRefs.current.get(latestNotification.id);
        if (ref && latestNotification.id) {
          notificationRefs.current.forEach((_, id) => {
            if (id !== latestNotification.id) {
              dispatch(removeNotificationById(id));
              notificationRefs.current.delete(id);
            }
          });
          ref.showToast();
          setTimeout(() => {
            dispatch(removeNotificationById(latestNotification.id));
            notificationRefs.current.delete(latestNotification.id);
          }, 3000);
        }
      }
    }
  }, [notifications.length, dispatch]);

  const tableData = data.rows || [];
  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  handleShowAllData = (row: Record<string, any>) => {
    const displayedKeys = columns.map((col) => col.key);
    const formatKey = (key: string): string => {
      if (key === 'config') {
        return 'More Details';
      }
      return key
        .split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
    };
    let filteredEntries: [string, any][] = Object.entries(row).filter(
      ([key, value]) =>
        !displayedKeys.includes(key) &&
        key.toLowerCase() !== 'total' &&
        value !== null &&
        value !== '' &&
        value !== '--',
    );

    const processedData = filteredEntries.map(([key, value]) => {
      const isDateField =
        key.toLowerCase().includes('date') ||
        key.toLowerCase().includes('time') ||
        key.toLowerCase().includes('at') ||
        key.toLowerCase().endsWith('_on') ||
        key.toLowerCase().endsWith('_date') ||
        key.toLowerCase().endsWith('_format') ||
        key.toLowerCase().endsWith('_time');
      function parseBoolean(val: unknown): boolean | undefined {
        if (typeof val === 'boolean') return val;
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      }
      const configField: ConfigField = row.config?.[key];
      const isBooleanField =
        configField?.type === 'bool' || configField?.type === 'boolean';
      const parsedValue = isBooleanField
        ? parseBoolean(configField?.value)
        : undefined;

      const isAmountField =
        key.toLowerCase().includes('amount') ||
        key.toLowerCase().includes('price') ||
        key.toLowerCase().includes('cost') ||
        key.toLowerCase().includes('balance') ||
        key.toLowerCase().endsWith('_amount');

      if (isDateField && value) {
        try {
          if (typeof value === 'number' || !isNaN(Number(value))) {
            const numValue = Number(value);
            if (dayjs(numValue).isValid()) {
              return [
                formatKey(key),
                dayjs(numValue)
                  .tz('Asia/Kolkata')
                  .format('DD-MM-YYYY h:mm:ss A'),
              ] as [string, string];
            }
            if (dayjs(numValue * 1000).isValid()) {
              return [
                formatKey(key),
                dayjs(numValue * 1000)
                  .tz('Asia/Kolkata')
                  .format('DD-MM-YYYY h:mm:ss A'),
              ] as [string, string];
            }
          }
          if (typeof value === 'string' || value instanceof Date) {
            if (dayjs(value).isValid()) {
              return [
                formatKey(key),
                dayjs(value).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm:ss A'),
              ] as [string, string];
            }
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(`Could not format date field ${key}:`, value);
          // eslint-disable-next-line no-console
          console.log(`Error while formatting date field ${key}:`, e);
        }
      } else if (parsedValue) {
        const boolValue =
          typeof value === 'boolean'
            ? value
            : value === 'true'
            ? true
            : value === 'false'
            ? false
            : row.config && row.config[key] !== undefined
            ? row.config[key]
            : false;

        return [
          formatKey(key),
          <FormSwitch key={key} className="dark:border-red-500 rounded-lg">
            <FormSwitch.Label className="ml-0">
              <FormSwitch.Input
                className="ml-0 mr-0 border-2 border-slate-300 h-5 w-10 appearance-none rounded-full bg-gray-300 checked:bg-blue-500 checked:border-blue-500 cursor-pointer transition-colors"
                type="checkbox"
                checked={boolValue}
                disabled={true}
                onClick={(e) => e.stopPropagation()}
              />
            </FormSwitch.Label>
          </FormSwitch>,
        ] as [string, JSX.Element];
      } else if (isAmountField && typeof value === 'number') {
        return [
          formatKey(key),
          new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
          }).format(value),
        ] as [string, string];
      }

      return [formatKey(key), value] as [string, any];
    });

    const idEntries = processedData.filter(([key]) =>
      key.toLowerCase().includes('id'),
    );
    const nonIdEntries = processedData.filter(
      ([key]) => !key.toLowerCase().includes('id'),
    );
    const reorderedEntries = [...nonIdEntries, ...idEntries];

    setShowAllDataModal(!showAllDataModal);
    setShowAllData(reorderedEntries);
  };

  const handleCopy = (values: string) => {
    navigator.clipboard.writeText(values);
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Copied to Clipboard!',
      }),
    );
  };

  const handleNumberKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: any,
  ) => {
    if (e.key === 'Enter') {
      const newValue = parseFloat(editingNumber.value);
      if (
        !isNaN(newValue) &&
        newValue >= 0 &&
        newValue <= MAX_AMOUNT &&
        handleNumberChange
      ) {
        handleNumberChange(row, newValue);
        setEditingNumber({ rowIndex: null, colKey: null, value: '' });
      } else if (newValue > MAX_AMOUNT) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Amount cannot exceed 5 crore (50,000,000)',
          }),
        );
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Please enter a positive number',
          }),
        );
      }
    }
  };

  const handleNumberChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    if (
      value === '' ||
      (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_AMOUNT)
    ) {
      setEditingNumber({ ...editingNumber, value });
    } else if (numValue > MAX_AMOUNT) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Amount cannot exceed 5 crore (50,000,000)',
        }),
      );
    }
  };

  const handlePageChange = (page: number) => {
    if (onPageChange && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange && newSize !== pageSize) {
      onPageSizeChange(newSize);
    }
  };

  const renderPaginationLinks = () => {
    const pageNumbers = [];
    const pagesToShow = 5;

    if (totalPages <= pagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, Number(currentPage) - 2);
      let endPage = Math.min(totalPages - 1, Number(currentPage) + 2);

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers.map((page, index) =>
      typeof page === 'number' ? (
        <Pagination.Link
          key={index}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Link>
      ) : (
        <span key={index} className="px-2">
          ...
        </span>
      ),
    );
  };

  const isVendorRow = (row: any) => {
    return columns.some(
      (col) =>
        col.key === 'vendor_code' && row[col.key] && col.format === 'vendor',
    );
  };

  return (
    <div className="relative w-full min-h-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-5 border border-white/10 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.16),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.14),transparent_22%)]"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="relative z-10 space-y-5">
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-white/15 dark:border-darkmode-500 bg-white/85 dark:bg-darkmode-800/90 table-responsive w-full backdrop-blur">
        {fullScreenImage && (
          <Modal
            handleModal={() => setFullScreenImage(null)}
            title="Image Preview"
            forOpen={!!fullScreenImage}
          >
            <ModalContent
              handleCancelDelete={() => setFullScreenImage(null)}
              check={false}
            >
              <div className="relative w-full h-[60vh] flex items-center justify-center">
                <img
                  src={fullScreenImage}
                  alt="Full screen screenshot"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const utrValue = e.currentTarget.utr.value.trim();
                    const selectedRow = tableData.find(
                      (row) =>
                        `${s3EndPoint}${row.user_submitted_image}` ===
                        fullScreenImage,
                    );
                    const merchantOrderId = selectedRow?.merchant_order_id;
                    if (!merchantOrderId) {
                      dispatch(
                        addAllNotification({
                          status: Status.ERROR,
                          message: 'Merchant Order ID not found',
                        }),
                      );
                      return;
                    }

                    if (!utrValue) {
                      dispatch(
                        addAllNotification({
                          status: Status.ERROR,
                          message: 'Please enter a valid UTR',
                        }),
                      );
                      return;
                    }
                    if (setImgUtr) {
                      setImgUtr({
                        bool: true,
                        merchantOrderId: merchantOrderId,
                        data: {
                          userSubmittedUtr: utrValue,
                          amount: selectedRow?.amount,
                          code: selectedRow?.merchant_details?.merchant_code,
                          user_submitted_image:
                            selectedRow?.user_submitted_image,
                        },
                      });
                    } else {
                      dispatch(
                        addAllNotification({
                          status: Status.ERROR,
                          message:
                            'Unable to update UTR: setImgUtr is not provided',
                        }),
                      );
                    }
                  }}
                >
                  {(() => {
                    const selectedRow = tableData.find(
                      (row) =>
                        `${s3EndPoint}${row.user_submitted_image}` ===
                        fullScreenImage,
                    );

                    const extractedUtr =
                      !!selectedRow?.user_submitted_utr ||
                      !!selectedRow?.bank_res_details?.utr;

                    if (!extractedUtr) {
                      return (
                        <>
                          <input
                            name="utr"
                            placeholder="Enter UTR"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                          />
                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Update
                            </button>
                          </div>
                        </>
                      );
                    }
                    return '';
                  })()}
                </form>
              </div>
            </ModalContent>
          </Modal>
        )}
        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 xl:ml-auto">
          <MoreDetailsModal
            isOpen={showAllDataModal}
            onClose={() => setShowAllDataModal(false)}
            title="Additional Details"
            data={showAllData}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 xl:ml-auto">
          {/* <Modal
            handleModal={handleCancelRowData}
            title={'Additional Details'}
            forOpen={showAllDataModal}
          >
            <ModalContent handleCancelDelete={handleCancelRowData}>
              {showAllData && showAllData.length > 0 ? (
                renderObjectData(showAllData as any)
              ) : (
                <div className="text-gray-500 text-center p-4">
                  No additional details available
                </div>
              )}
            </ModalContent>
          </Modal> */}
        </div>
        <Table className="border-b border-slate-200/60 w-full min-w-full table-mobile-friendly">
          <Table.Thead>
            <Table.Tr>
              {columns?.map((col, index) => (
                <Table.Td
                  key={index}
                  className={`py-3 px-2 sm:px-3 font-medium border-t bg-slate-50 text-slate-500 dark:bg-darkmode-400 whitespace-nowrap ${
                    col.type === 'checkbox'
                      ? 'w-8 sm:w-10'
                      : col.type === 'more_details'
                      ? 'w-8 sm:w-10'
                      : ''
                  }`}
                >
                  <div className="flex">
                    {col.label ? (
                      col.label
                    ) : (
                      <FormCheck.Input
                        type="checkbox"
                        checked={!!selectedRows.length}
                        onChange={handleSelectAll}
                      />
                    )}

                    {/* remove down arrow in header as these are non functional */}

                    {/* {col.type !== 'actions' &&
                      col.type !== 'checkbox' &&
                      col.type !== 'button' &&
                      col.type !== 'more_details' && (
                        <Lucide icon="ChevronDown" className="w-4 h-4 ml-2" />
                      )} */}
                  </div>
                </Table.Td>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tableData?.length > 0 ? (
              tableData?.map((row, rowIndex) => (
                <React.Fragment key={row.id || rowIndex}>
                  <Table.Tr
                    className={`[&_td]:last:border-b-0 ${
                      isVendorRow(row)
                        ? 'bg-gray-200'
                        : columns.some(
                            (col) =>
                              col.type === 'amount_hover' &&
                              row.config?.previousAmount,
                          )
                        ? 'bg-gray-100'
                        : ''
                    } 
                    ${
                      row.config?.is_freeze || row.is_freezed || row.is_obsolete
                        ? 'text-gray-400 dark:text-gray-500'
                        : ''
                    }`}
                  >
                    {columns?.map((col, colIndex) => (
                      <Table.Td
                        key={colIndex}
                        className={`py-1 sm:py-2 px-2 sm:px-3 border-dashed dark:bg-darkmode-600 text-[10px] sm:text-xs md:text-sm ${
                          col.type === 'checkbox'
                            ? 'w-8 sm:w-10'
                            : col.type === 'more_details'
                            ? 'w-8 sm:w-10'
                            : col.key === 'merchant_order_id'
                            ? 'min-w-[250px] sm:min-w-[300px] md:min-w-[400px]'
                            : col.key === 'merchant_code' ||
                              col.key === 'merchant_name' ||
                              col.key === 'vendor_code' ||
                              col.key === 'vendor_name'
                            ? 'min-w-[100px] sm:min-w-[120px]'
                            : 'min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'
                        }`}
                      >
                        {col.type === 'more_details' ? (
                          <div
                            className="flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomTooltip
                              content="More Details"
                              trigger={['hover']}
                            >
                              <Lucide
                                icon="PlusCircle"
                                className="w-6 h-6 cursor-pointer text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                                onClick={() =>
                                  handleShowAllData && handleShowAllData(row)
                                }
                              />
                            </CustomTooltip>
                          </div>
                        ) : col.type === 'number' ? (
                          editingNumber.rowIndex === rowIndex &&
                          editingNumber.colKey === col.key ? (
                            <input
                              type="number"
                              value={editingNumber.value}
                              onChange={handleNumberChangeInput}
                              onKeyPress={(e) => handleNumberKeyPress(e, row)}
                              onBlur={() =>
                                setEditingNumber({
                                  rowIndex: null,
                                  colKey: null,
                                  value: '',
                                })
                              }
                              onClick={(e) => e.stopPropagation()}
                              onWheel={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.blur();
                              }}
                              className="w-full p-1 border rounded text-gray-900 dark:text-gray-200 dark:bg-darkmode-700 dark:border-darkmode-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              min="0"
                              max={MAX_AMOUNT}
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                !row.disabled &&
                                  !row.is_obsolete &&
                                  setEditingNumber({
                                    rowIndex,
                                    colKey: col.key,
                                    value:
                                      col.key === 'max_limit' &&
                                      row.config?.max_limit
                                        ? row.config.max_limit.toString()
                                        : row[col.key]?.toString() || '₹0.00',
                                  });
                              }}
                              onWheel={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                              }}
                              className="cursor-text"
                            >
                              {col.key === 'max_limit' && row.config?.max_limit
                                ? row.config.max_limit
                                : row[col.key] ?? 0}
                            </div>
                          )
                        ) : role === Role.ADMIN &&
                          (source === 'BankResponse' || source === 'Payout') &&
                          ((source !== 'Payout' && col.key === 'amount') ||
                            col.key === 'utr' ||
                            col.key === 'utr_id') ? (
                          <div className="flex items-center gap-2">
                            <span>{row[col.key] ?? 'N/A'}</span>
                            <Lucide
                              icon="Pencil"
                              className="w-4 h-4 cursor-pointer text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                !row.disabled &&
                                  handleEditModal &&
                                  handleEditModal(row, col.key);
                              }}
                            />
                          </div>
                        ) : col.type === 'checkbox' &&
                          (isSettlement
                            ? row.status === Status.INITIATED ||
                              row.status === Status.REJECTED ||
                              row.status === Status.SUCCESS ||
                              row.status === Status.REVERSED
                            : row.status === Status.INITIATED) &&
                          !row.vendor_code ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <FormCheck.Input
                              type="checkbox"
                              checked={selectedRows.includes(row.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!row.disabled && handleRowClick) {
                                  handleRowClick(row.id);
                                  const isChecked = e.target.checked;
                                  if (setTotalPayoutAmount) {
                                    setTotalPayoutAmount((prevAmount: any) => {
                                      return isChecked
                                        ? prevAmount + row.amount
                                        : prevAmount - row.amount;
                                    });
                                  }
                                }
                              }}
                              disabled={
                                row?.config?.is_freeze ||
                                row.is_freezed ||
                                row.is_obsolete === true
                                  ? true
                                  : false
                              }
                            />
                          </div>
                        ) : col.type === 'date' ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="inline-flex">
                              {row[col.key]
                                ? (() => {
                                    const date = dayjs(row[col.key]);
                                    return date.isValid()
                                      ? date
                                          .tz('Asia/Kolkata')
                                          .format('DD-MM-YYYY h:mm:ss A')
                                      : 'Invalid date';
                                  })()
                                : 'N/A'}
                            </span>
                            {col.copy && (
                              <Lucide
                                icon="Copy"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!row.disabled && row[col.key]) {
                                    const date = dayjs(row[col.key]);
                                    if (date.isValid()) {
                                      handleCopy(
                                        date
                                          .tz('Asia/Kolkata')
                                          .format('DD-MM-YYYY'),
                                      );
                                    }
                                  }
                                }}
                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              />
                            )}
                          </div>
                        ) : //rendering array
                        col.type === 'array' ? (
                          <div>
                            {Array.isArray(row[col.key]) &&
                            row[col.key].length > 0
                              ? row[col.key].map(
                                  (arr: string, index: number) => (
                                    <div key={index}>{arr}</div>
                                  ),
                                )
                              : 'N/A'}
                          </div>
                        ) : col.type === 'dateReport' ? (
                          <div className="">
                            {row[col.key]
                              ? (() => {
                                  const date = dayjs(row[col.key]);
                                  return date.isValid()
                                    ? date
                                        .tz('Asia/Kolkata')
                                        .format('DD-MM-YYYY')
                                    : 'Invalid date';
                                })()
                              : 'N/A'}
                          </div>
                        ) : col.type === 'amount' ||
                          col.type === 'today_balance' ? (
                          col.copy ? (
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span className="inline-flex">
                                {row[col.key] &&
                                !isNaN(row[col.key]) &&
                                isFinite(row[col.key])
                                  ? new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).format(Math.round(row[col.key]))
                                  : '₹ 0'}
                              </span>
                              <Lucide
                                icon="Copy"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  !row.disabled &&
                                    handleCopy(row[col.key] || 0);
                                }}
                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              />
                            </div>
                          ) : (
                            <div className="whitespace-nowrap">
                              <span className="inline-flex">
                                {row[col.key] &&
                                !isNaN(row[col.key]) &&
                                isFinite(row[col.key])
                                  ? new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).format(Math.round(row[col.key]))
                                  : '₹ 0'}
                              </span>
                            </div>
                          )
                        ) : col.type === 'bank_balance' ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="whitespace-nowrap"
                          >
                            <div className="inline-flex">
                              {row[col.key]
                                ? // new Intl.NumberFormat('en-IN', {
                                  //     style: 'currency',
                                  //     currency: 'INR',
                                  //     minimumFractionDigits: 0,
                                  //     maximumFractionDigits: 0,
                                  //   }).format(Math.floor(row[col.key]))
                                  `₹ ${row[col.key]}`
                                : '₹ 0'}
                              <span className="px-1">
                                ({row.payin_count || 0})
                              </span>
                            </div>
                          </div>
                        ) : col.type === 'vendor_commission_info' ? (
                          <div className="flex items-center whitespace-nowrap">
                            <span className="inline-flex">
                              {row[col.key] &&
                              !isNaN(row[col.key]) &&
                              isFinite(row[col.key])
                                ? new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(Math.round(row[col.key]))
                                : '₹ 0'}
                            </span>
                            <CustomTooltip
                              content={
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 w-[280px] max-w-[85vw] overflow-hidden">
                                  <div className="font-semibold mb-2 text-base text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-600 pb-1">
                                    Commission Breakdown
                                  </div>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                                        Vendor Commission:
                                      </span>
                                      <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-xs ml-2 flex-shrink-0">
                                        {(() => {
                                          const vendorCommission =
                                            row.actual_vendor_commission ||
                                            row.payout_actual_vendor_commission ||
                                            (row[col.key] &&
                                              row[col.key] * 0.7) ||
                                            0;
                                          return vendorCommission &&
                                            !isNaN(vendorCommission) &&
                                            isFinite(vendorCommission)
                                            ? new Intl.NumberFormat('en-IN', {
                                                style: 'currency',
                                                currency: 'INR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                              }).format(
                                                Math.round(vendorCommission),
                                              )
                                            : '₹ 0';
                                        })()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                                        Mediator Commission:
                                      </span>
                                      <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs ml-2 flex-shrink-0">
                                        {(() => {
                                          const mediatorCommission =
                                            row.brokerage_commission ||
                                            row.payout_brokerage_commission ||
                                            (row[col.key] &&
                                              row[col.key] * 0.3) ||
                                            0;
                                          return mediatorCommission &&
                                            !isNaN(mediatorCommission) &&
                                            isFinite(mediatorCommission)
                                            ? new Intl.NumberFormat('en-IN', {
                                                style: 'currency',
                                                currency: 'INR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                              }).format(
                                                Math.round(mediatorCommission),
                                              )
                                            : '₹ 0';
                                        })()}
                                      </span>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-600 pt-1.5 mt-2">
                                      <div className="flex justify-between items-center font-semibold bg-slate-50 dark:bg-slate-700 p-1.5 rounded">
                                        <span className="text-slate-700 dark:text-slate-200 text-xs truncate">
                                          Total:
                                        </span>
                                        <span className="text-slate-900 dark:text-slate-100 text-xs ml-2 flex-shrink-0">
                                          {row[col.key] &&
                                          !isNaN(row[col.key]) &&
                                          isFinite(row[col.key])
                                            ? new Intl.NumberFormat('en-IN', {
                                                style: 'currency',
                                                currency: 'INR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                              }).format(
                                                Math.round(row[col.key]),
                                              )
                                            : '₹ 0'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              }
                            >
                              <Lucide
                                icon="Info"
                                className="w-4 h-4 ml-2 cursor-pointer text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                              />
                            </CustomTooltip>
                          </div>
                        ) : col.type ===
                          'conditional_vendor_commission_info' ? (
                          <div className="flex items-center whitespace-nowrap">
                            <span className="inline-flex">
                              {row[col.key] &&
                              !isNaN(row[col.key]) &&
                              isFinite(row[col.key])
                                ? new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(Math.round(row[col.key]))
                                : '₹ 0'}
                            </span>
                            {(row.subVendors && row.subVendors.length > 0) ||
                              (row.sub_vendors && row.sub_vendors.length > 0) ||
                              (row.subvendors && row.subvendors.length > 0 && (
                                <CustomTooltip
                                  content={
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 w-[280px] max-w-[85vw] overflow-hidden">
                                      <div className="font-semibold mb-2 text-base text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-600 pb-1">
                                        Commission Breakdown
                                      </div>
                                      <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                                            Main Vendor:
                                          </span>
                                          <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-xs ml-2 flex-shrink-0">
                                            {(() => {
                                              const vendorCommission =
                                                row.actual_vendor_commission ||
                                                row.payout_actual_vendor_commission ||
                                                (row[col.key] &&
                                                  row[col.key] * 0.7) ||
                                                0;
                                              return vendorCommission &&
                                                !isNaN(vendorCommission) &&
                                                isFinite(vendorCommission)
                                                ? new Intl.NumberFormat(
                                                    'en-IN',
                                                    {
                                                      style: 'currency',
                                                      currency: 'INR',
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 0,
                                                    },
                                                  ).format(
                                                    Math.round(
                                                      vendorCommission,
                                                    ),
                                                  )
                                                : '₹ 0';
                                            })()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                                            Sub-Vendors:
                                          </span>
                                          <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs ml-2 flex-shrink-0">
                                            {(() => {
                                              const mediatorCommission =
                                                row.brokerage_commission ||
                                                row.payout_brokerage_commission ||
                                                (row[col.key] &&
                                                  row[col.key] * 0.3) ||
                                                0;
                                              return mediatorCommission &&
                                                !isNaN(mediatorCommission) &&
                                                isFinite(mediatorCommission)
                                                ? new Intl.NumberFormat(
                                                    'en-IN',
                                                    {
                                                      style: 'currency',
                                                      currency: 'INR',
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 0,
                                                    },
                                                  ).format(
                                                    Math.round(
                                                      mediatorCommission,
                                                    ),
                                                  )
                                                : '₹ 0';
                                            })()}
                                          </span>
                                        </div>
                                        <div className="border-t border-slate-200 dark:border-slate-600 pt-1.5 mt-2">
                                          <div className="flex justify-between items-center font-semibold bg-slate-50 dark:bg-slate-700 p-1.5 rounded">
                                            <span className="text-slate-700 dark:text-slate-200 text-xs truncate">
                                              Total:
                                            </span>
                                            <span className="text-slate-900 dark:text-slate-100 text-xs ml-2 flex-shrink-0">
                                              {row[col.key] &&
                                              !isNaN(row[col.key]) &&
                                              isFinite(row[col.key])
                                                ? new Intl.NumberFormat(
                                                    'en-IN',
                                                    {
                                                      style: 'currency',
                                                      currency: 'INR',
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 0,
                                                    },
                                                  ).format(
                                                    Math.round(row[col.key]),
                                                  )
                                                : '₹ 0'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  }
                                >
                                  <Lucide
                                    icon="Info"
                                    className="w-4 h-4 ml-2 cursor-pointer text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                                  />
                                </CustomTooltip>
                              ))}
                          </div>
                        ) : col.type === 'checkbox' &&
                          row.status === 'INITIATED' &&
                          row.vendor_code ? (
                          <button
                            className="text-blue-500 underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              !row.disabled &&
                                handleRetrieve &&
                                handleRetrieve(row);
                            }}
                            disabled={row.disabled}
                          >
                            Retrieve
                          </button>
                        ) : col.type === 'image' && row[col.key] ? (
                          <div className="flex items-center gap-2">
                            <Tippy content={row.name || 'UTR Screen Shot'}>
                              <img
                                src={`${s3EndPoint}${row[col.key]}`}
                                alt="UTR Screenshot"
                                className="w-10 h-10 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFullScreenImage(
                                    `${s3EndPoint}${row[col.key]}`,
                                  );
                                }}
                              />
                            </Tippy>
                          </div>
                        ) : col.type === 'status' ? (
                          <div
                            className={`flex items-center ${
                              getStatusStyles(row[col.key]).color
                            }`}
                          >
                            {['FAILED', 'PENDING', 'REJECTED'].includes(
                              row[col.key],
                            ) ? (
                              <CustomTooltip
                                content={
                                  row[col.key] === 'FAILED'
                                    ? !row.user_submitted_utr
                                      ? 'Failed due Expired URL'
                                      : 'Failed Due to Dispute'
                                    : row[col.key] === 'PENDING'
                                    ? 'Pending from the Portal'
                                    : row[col.key] === 'REJECTED'
                                    ? row.rejected_reason ||
                                      row?.payout_details?.rejected_reason ||
                                      row?.config?.rejected_reason ||
                                      'No reason provided'
                                    : row[col.key]
                                }
                              >
                                <div className="flex items-center">
                                  <Lucide
                                    icon={getStatusStyles(row[col.key]).icon}
                                    className="w-5 h-5 ml-px stroke-[2.5] mr-2"
                                  />
                                  {row[col.key]}
                                </div>
                              </CustomTooltip>
                            ) : (
                              <div className="flex items-center">
                                <Lucide
                                  icon={getStatusStyles(row[col.key]).icon}
                                  className="w-5 h-5 ml-px stroke-[2.5] mr-2"
                                />
                                {row[col.key]}
                              </div>
                            )}
                          </div>
                        ) : col.type === 'amount_hover' ? (
                          row.config?.previousAmount ? (
                            <div className="flex items-center">
                              <CustomTooltip
                                content={`Previous Amount: ${
                                  row.previousAmount ||
                                  row?.config?.previousAmount ||
                                  row.amount
                                }`}
                              >
                                <span className="flex items-center">
                                  <Lucide
                                    icon="Info"
                                    className="w-4 h-4 mr-2 ml-2 cursor-pointer text-black-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                                  />
                                  {row[col.key] &&
                                  !isNaN(row[col.key]) &&
                                  isFinite(row[col.key])
                                    ? new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                      }).format(row[col.key])
                                    : '₹ 0'}
                                </span>
                              </CustomTooltip>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>
                                {row[col.key] &&
                                !isNaN(row[col.key]) &&
                                isFinite(row[col.key])
                                  ? new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                    }).format(row[col.key])
                                  : '₹ 0'}
                              </span>
                            </div>
                          )
                        ) : col.type === 'utr_hover' ? (
                          row.config?.previousUTR ? (
                            <div className="flex items-center">
                              <CustomTooltip
                                content={`Previous UTR: ${
                                  row.previousUTR ||
                                  row?.config?.previousUTR ||
                                  row.utr
                                }`}
                              >
                                <span className="flex items-center">
                                  <Lucide
                                    icon="Info"
                                    className="w-4 h-4 mr-2 ml-2 cursor-pointer text-black-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                                  />
                                  <div className="flex items-center gap-2">
                                    {row[col.key]}
                                    {row[col.key] && (
                                      <Lucide
                                        icon="Copy"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          !row.disabled &&
                                            handleCopy(row[col.key]);
                                        }}
                                        className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                      />
                                    )}
                                  </div>
                                </span>
                              </CustomTooltip>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {row[col.key]}
                              {row[col.key] && (
                                <Lucide
                                  icon="Copy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    !row.disabled && handleCopy(row[col.key]);
                                  }}
                                  className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                />
                              )}
                            </div>
                          )
                        ) : col.type === 'bank_hover' ? (
                          row.config?.previousBank ? (
                            <div className="flex items-center">
                              <CustomTooltip
                                content={`Previous Bank: ${
                                  row.previousBank ||
                                  row?.config?.previousBank ||
                                  row.nick_name
                                }`}
                              >
                                <span className="flex items-center">
                                  <Lucide
                                    icon="Info"
                                    className="w-4 h-4 mr-2 ml-2 cursor-pointer text-black-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                                  />
                                  <div className="flex items-center gap-2">
                                    {row[col.key]}
                                    {row[col.key] && (
                                      <Lucide
                                        icon="Copy"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          !row.disabled &&
                                            handleCopy(row[col.key]);
                                        }}
                                        className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                      />
                                    )}
                                  </div>
                                </span>
                              </CustomTooltip>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {row[col.key]}
                              {row[col.key] && (
                                <Lucide
                                  icon="Copy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    !row.disabled && handleCopy(row[col.key]);
                                  }}
                                  className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                />
                              )}
                            </div>
                          )
                        ) : col.type === 'actions' ? (
                          <div
                            className="flex items-center justify-start"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(() => {
                              const actions = actionMenuItems
                                ? actionMenuItems(row)
                                : [];
                              return (actions?.length ?? 0) >
                                ([
                                  'BankDetails',
                                  'Beneficiaries',
                                  'Vendors',
                                ].includes(source ?? '')
                                  ? 5
                                  : 3) ? (
                                <CustomTooltip
                                  content={
                                    <div className="w-40 shadow-md rounded-md z-[9999] p-2">
                                      <div className="flex flex-col">
                                        {actions.map((action, index) => (
                                          <div
                                            key={index}
                                            className="relative"
                                            onMouseLeave={() =>
                                              debouncedSetHoveredAction({
                                                rowIndex: null,
                                                actionIndex: null,
                                                type: 'menu',
                                              })
                                            }
                                          >
                                            <CustomTooltip
                                              content={
                                                action.label ? (
                                                  <div className="text-white p-2 shadow-md rounded-md z-[9999] dark:bg-darkmode-600 dark:text-gray-200">
                                                    {action.label}
                                                    {action.hover &&
                                                      row.merchant_details && (
                                                        <div className="mt-2">
                                                          <div className="font-bold">
                                                            {row
                                                              .merchant_details
                                                              .length > 0
                                                              ? 'Merchant List'
                                                              : 'No Merchants'}
                                                          </div>
                                                          {row.merchant_details.map(
                                                            (merchant: any) => (
                                                              <p
                                                                key={
                                                                  merchant.id
                                                                }
                                                              >
                                                                {merchant.code}
                                                              </p>
                                                            ),
                                                          )}
                                                        </div>
                                                      )}
                                                    {action.hover &&
                                                      row.vendors && (
                                                        <div className="mt-2">
                                                          <div className="font-bold">
                                                            {row.vendors
                                                              .length > 0
                                                              ? 'Vendor List'
                                                              : 'No Vendors'}
                                                          </div>
                                                          {row.vendors.map(
                                                            (
                                                              vendor: any,
                                                              vendorIndex: number,
                                                            ) => (
                                                              <p
                                                                key={
                                                                  vendorIndex
                                                                }
                                                              >
                                                                {vendor}
                                                              </p>
                                                            ),
                                                          )}
                                                        </div>
                                                      )}
                                                  </div>
                                                ) : (
                                                  <div />
                                                )
                                              }
                                            >
                                              <button
                                                onClick={() =>
                                                  !action.hover &&
                                                  action.onClick &&
                                                  action.onClick(row)
                                                }
                                                onMouseEnter={() => {
                                                  if (action.hover) {
                                                    debouncedSetHoveredAction({
                                                      rowIndex,
                                                      actionIndex: index,
                                                      type: 'menu',
                                                    });
                                                  }
                                                  if (action.onMouseEnter)
                                                    action.onMouseEnter(row);
                                                }}
                                                className={`flex items-center rounded-md ${
                                                  action.icon === 'Download'
                                                    ? 'text-blue-500'
                                                    : action.icon === 'Plus'
                                                    ? 'text-green-500'
                                                    : action.label === 'Edit'
                                                    ? 'text-yellow-500'
                                                    : action.icon === 'Trash2'
                                                    ? 'text-red-500'
                                                    : action.label === 'Delete'
                                                    ? 'text-red-500'
                                                    : action.label === 'Approve'
                                                    ? 'text-green-500'
                                                    : action.label === 'Link'
                                                    ? 'text-green-500'
                                                    : action.label === 'Unlink'
                                                    ? 'text-red-500'
                                                    : action.label === 'Reject'
                                                    ? 'text-red-500'
                                                    : action.icon === 'Bell'
                                                    ? 'text-blue-500'
                                                    : action.icon === 'Repeat'
                                                    ? 'text-blue-500'
                                                    : action.label === 'Reset'
                                                    ? 'text-yellow-500'
                                                    : action.icon === 'Eye'
                                                    ? 'text-pink-300'
                                                    : 'text-gray-500 bg-gray-100 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-darkmode-500'
                                                } 
                                                ${
                                                  (row.disabled === true &&
                                                    action.icon !==
                                                      'Download' &&
                                                    action.icon !== 'Trash2') ||
                                                  (row.is_obsolete === true &&
                                                    action.icon !== 'Download')
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                                }`}
                                                disabled={
                                                  (row.disabled === true ||
                                                    row.is_obsolete) &&
                                                  action.icon !== 'Download' &&
                                                  action.icon !== 'Trash2'
                                                }
                                              >
                                                <Lucide
                                                  style={{
                                                    stroke: 'currentColor',
                                                    strokeWidth: 2.1,
                                                  }}
                                                  icon={action.icon}
                                                  className={`w-5 h-5 rounded-sm ${
                                                    action.icon === 'Download'
                                                      ? 'text-blue-500'
                                                      : action.icon === 'Plus'
                                                      ? 'text-green-500'
                                                      : action.label === 'Edit'
                                                      ? 'text-yellow-500'
                                                      : action.icon === 'Trash2'
                                                      ? 'text-red-500'
                                                      : action.label ===
                                                        'Approve'
                                                      ? 'text-green-500'
                                                      : action.label === 'Link'
                                                      ? 'text-green-500'
                                                      : action.label ===
                                                        'Unlink'
                                                      ? 'text-red-500'
                                                      : action.label ===
                                                        'Reject'
                                                      ? 'text-red-500'
                                                      : action.icon === 'Bell'
                                                      ? 'text-blue-500'
                                                      : action.icon === 'Repeat'
                                                      ? 'text-blue-500'
                                                      : action.label === 'Reset'
                                                      ? 'text-yellow-500'
                                                      : action.icon === 'Eye'
                                                      ? 'text-orange-700'
                                                      : 'text-gray-700 bg-gray-100'
                                                  }`}
                                                />
                                              </button>
                                            </CustomTooltip>
                                            {hoveredAction.rowIndex ===
                                              rowIndex &&
                                            hoveredAction.actionIndex ===
                                              index &&
                                            hoveredAction.type === 'menu' &&
                                            source === 'BankDetails' ? (
                                              <CustomTooltip
                                                content={
                                                  <div className="w-40 text-gray-700 p-2 shadow-md rounded-md z-[10000]">
                                                    <div className="font-bold">
                                                      {row.merchant_details
                                                        .length > 0
                                                        ? 'Merchant List'
                                                        : 'No Merchants'}
                                                    </div>
                                                    {row.merchant_details.map(
                                                      (merchant: any) => (
                                                        <p key={merchant.id}>
                                                          {merchant.code}
                                                        </p>
                                                      ),
                                                    )}
                                                  </div>
                                                }
                                              >
                                                <span className="absolute inset-0" />
                                              </CustomTooltip>
                                            ) : null}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  }
                                >
                                  <button
                                    className={`w-5 h-5 text-slate-500 focus:outline-none ${
                                      row.disabled === true &&
                                      !actions.some(
                                        (action) =>
                                          action.icon === 'Download' ||
                                          action.icon === 'Trash2',
                                      )
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                    disabled={
                                      row.disabled === true &&
                                      !actions.some(
                                        (action) =>
                                          action.icon === 'Download' ||
                                          action.icon === 'Trash2',
                                      )
                                    }
                                  >
                                    <Lucide
                                      icon="MoreVertical"
                                      className="w-5 h-5 stroke-slate-400/70 fill-slate-400/70"
                                    />
                                  </button>
                                </CustomTooltip>
                              ) : (
                                <div className="flex space-x-3">
                                  {actions.map((action, index) => (
                                    <div
                                      key={index}
                                      className="relative"
                                      onMouseLeave={() =>
                                        debouncedSetHoveredAction({
                                          rowIndex: null,
                                          actionIndex: null,
                                          type: 'menu',
                                        })
                                      }
                                    >
                                      <CustomTooltip
                                        content={
                                          action.label ? (
                                            <div className="text-white p-2 shadow-md rounded-md z-[9999] dark:bg-darkmode-600 dark:text-gray-200">
                                              {action.label}
                                              {action.hover &&
                                                row.merchant_details && (
                                                  <div className="mt-2">
                                                    <div className="font-bold">
                                                      {row.merchant_details
                                                        .length > 0
                                                        ? 'Merchant List'
                                                        : 'No Merchants'}
                                                    </div>
                                                    {row.merchant_details.map(
                                                      (merchant: any) => (
                                                        <p key={merchant.id}>
                                                          {merchant.code}
                                                        </p>
                                                      ),
                                                    )}
                                                  </div>
                                                )}
                                              {action.hover && row.vendors && (
                                                <div className="mt-2">
                                                  <div className="font-bold">
                                                    {row.vendors.length > 0
                                                      ? 'Vendor List'
                                                      : 'No Vendors'}
                                                  </div>
                                                  {row.vendors.map(
                                                    (
                                                      vendor: any,
                                                      vendorIndex: number,
                                                    ) => (
                                                      <p key={vendorIndex}>
                                                        {vendor}
                                                      </p>
                                                    ),
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div />
                                          )
                                        }
                                      >
                                        <button
                                          onClick={() =>
                                            !action.hover &&
                                            action.onClick &&
                                            action.onClick(row)
                                          }
                                          onMouseEnter={() => {
                                            if (action.hover) {
                                              debouncedSetHoveredAction({
                                                rowIndex,
                                                actionIndex: index,
                                                type: 'menu',
                                              });
                                            }
                                            if (action.onMouseEnter)
                                              action.onMouseEnter(row);
                                          }}
                                          className={`flex items-center rounded-md ${
                                            action.icon === 'Download'
                                              ? 'text-blue-500'
                                              : action.icon === 'Plus'
                                              ? 'text-green-500'
                                              : action.label === 'Edit'
                                              ? 'text-yellow-500'
                                              : action.icon === 'Trash2'
                                              ? 'text-red-500'
                                              : action.label === 'Delete'
                                              ? 'text-red-500'
                                              : action.label === 'Approve'
                                              ? 'text-green-500'
                                              : action.label === 'Link'
                                              ? 'text-green-500'
                                              : action.label === 'Unlink'
                                              ? 'text-red-500'
                                              : action.label === 'Reject'
                                              ? 'text-red-500'
                                              : action.icon === 'Bell'
                                              ? 'text-blue-500'
                                              : action.icon === 'Repeat'
                                              ? 'text-blue-500'
                                              : action.label === 'Reset'
                                              ? 'text-yellow-500'
                                              : action.icon === 'Eye'
                                              ? 'text-pink-300'
                                              : action.label === 'Unrestrict'
                                              ? 'text-green-700 bg-none'
                                              : 'text-gray-500 bg-gray-100 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-darkmode-500'
                                          } 
                                          ${
                                            (row.disabled === true &&
                                              action.icon !== 'Download' &&
                                              action.icon !== 'Trash2') ||
                                            (row.is_obsolete === true &&
                                              action.icon !== 'Download')
                                              ? 'opacity-50 cursor-not-allowed'
                                              : ''
                                          }`}
                                          disabled={
                                            ((row.disabled === true ||
                                              row.is_obsolete) &&
                                              action.icon !== 'Download' &&
                                              action.icon !== 'Trash2') ||
                                            (row.is_obsolete &&
                                              action.icon === 'Trash2')
                                          }
                                        >
                                          <Lucide
                                            style={{
                                              stroke: 'currentColor',
                                              strokeWidth: 2.1,
                                            }}
                                            icon={action.icon}
                                            className={`w-5 h-5 rounded-sm ${
                                              action.icon === 'Download'
                                                ? 'text-blue-500'
                                                : action.icon === 'Plus'
                                                ? 'text-green-500'
                                                : action.label === 'Edit'
                                                ? 'text-yellow-500'
                                                : action.icon === 'Trash2'
                                                ? 'text-red-500'
                                                : action.label === 'Approve'
                                                ? 'text-green-500'
                                                : action.label === 'Link'
                                                ? 'text-green-500'
                                                : action.label === 'Unlink'
                                                ? 'text-red-500'
                                                : action.label === 'Reject'
                                                ? 'text-red-500'
                                                : action.icon === 'Bell'
                                                ? 'text-blue-500'
                                                : action.icon === 'Repeat'
                                                ? 'text-blue-500'
                                                : action.label === 'Reset'
                                                ? 'text-yellow-500'
                                                : action.icon === 'Eye'
                                                ? 'text-orange-700'
                                                : action.label === 'Unrestrict'
                                                ? 'text-green-700 bg-none'
                                                : 'text-gray-700 bg-gray-100'
                                            }`}
                                          />
                                        </button>
                                      </CustomTooltip>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        ) : col.type === 'button' && actionButtonItems ? (
                          <div
                            className="flex space-x-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {actionButtonItems(row).map((button, index) => (
                              <div
                                key={index}
                                className="relative"
                                onMouseLeave={() =>
                                  debouncedSetHoveredAction({
                                    rowIndex: null,
                                    actionIndex: null,
                                    type: 'button',
                                  })
                                }
                              >
                                <button
                                  onClick={() => {
                                    if (!row.is_obsolete) {
                                      button.onClick(row);
                                    }
                                  }}
                                  className={`px-2 py-1 text-white rounded-md text-sm ${
                                    button.color
                                      ? `bg-${button.color}-500 hover:bg-${button.color}-600`
                                      : 'bg-blue-500 hover:bg-blue-600'
                                  }`}
                                >
                                  {button.label || 'Action'}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : col.type === 'toggle' ? (
                          source === 'Beneficiaries' && row.vendors ? null : (
                            <FormSwitch
                              className="dark:border-red-500 rounded-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FormSwitch.Label
                                htmlFor={`toggle-${rowIndex}-${colIndex}`}
                                className="ml-0"
                              >
                                {user_name !== row.user_name && (
                                  <FormSwitch.Input
                                    id={`toggle-${rowIndex}-${colIndex}`}
                                    className="ml-0 mr-0 border-2 border-slate-300"
                                    type="checkbox"
                                    checked={
                                      row
                                        ? typeof row[col.key] === 'undefined'
                                          ? row.config &&
                                            row.config[col.key] !== undefined
                                            ? row.config[col.key]
                                            : false
                                          : row[col.key]
                                        : false
                                    }
                                    onClick={() => {
                                      if (row && !row.disabled && !row.is_obsolete && handleToggleClick) {
                                        // Get current value considering both direct property and config
                                        const currentValue = typeof row[col.key] === 'undefined'
                                          ? (row.config && row.config[col.key] !== undefined
                                              ? row.config[col.key]
                                              : false)
                                          : row[col.key];
                                        
                                        handleToggleClick(row.id, !currentValue, col.key);
                                      }
                                    }}
                                    disabled={
                                      (row.config?.is_freeze &&
                                        row.config?.is_freeze === true) ||
                                      row.is_freezed === true ||
                                      row.is_obsolete === true ||
                                      row?.disabled === true
                                    }
                                  />
                                )}
                              </FormSwitch.Label>
                            </FormSwitch>
                          )
                        ) : col.type === 'limits' ? (
                          <div>
                            <span>{row.min}</span>-<span>{row.max}</span>
                          </div>
                        ) : col.type === 'Bank_details' ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <div>{row.acc_holder_name}</div>
                            <div>{row.bank_name}</div>
                            <div>{row.ifsc ? row.ifsc : row.ifsc_code}</div>
                            <div>{row.acc_no}</div>
                          </div>
                        ) : col.type === 'range' ? (
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              {row[col.key] || 0}
                            </span>
                          </div>
                        ) : col.type === 'payin_range' ? (
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                              }).format(row.min_payin)}{' '}
                              -{' '}
                              {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                              }).format(row.max_payin)}
                            </span>
                          </div>
                        ) : col.type === 'payout_range' ? (
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                              }).format(row.min_payout)}{' '}
                              -{' '}
                              {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                              }).format(row.max_payout)}
                            </span>
                          </div>
                        ) : col.type === 'expand' &&
                          (row.subMerchants?.length > 0 ||
                            row.subVendors?.length > 0 ||
                            row?.history?.length > 0) ? (
                          <div
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              !row.disabled &&
                                handleRowClick &&
                                handleRowClick(rowIndex);
                            }}
                          >
                            {row[col.key]?.length > 0 && (
                              <Lucide
                                icon={
                                  expandedRow === rowIndex
                                    ? 'ChevronUp'
                                    : 'ChevronDown'
                                }
                                className="w-5 h-5"
                              />
                            )}
                          </div>
                        ) : col.type === 'object' &&
                          typeof row[col.key] === 'object' &&
                          row[col.key] !== null ? (
                          Array.isArray(col.objectKey) ? (
                            <>
                              {col.objectKey.map((key, index) => (
                                <div
                                  key={index}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {col.format === 'amount' &&
                                  typeof row[col.key]?.[key] === 'number'
                                    ? (() => {
                                        const value = row[col.key]?.[key];
                                        return value &&
                                          !isNaN(value) &&
                                          isFinite(value)
                                          ? new Intl.NumberFormat('en-IN', {
                                              style: 'currency',
                                              currency: 'INR',
                                            }).format(value)
                                          : '₹ 0';
                                      })()
                                    : row[col.key]?.[key] ?? ''}
                                </div>
                              ))}
                            </>
                          ) : col.objectKey === 'utr' && col.copy ? (
                            <div className="flex items-center gap-2">
                              {row[col.key]?.[col.objectKey ?? '']}
                              {row[col.key]?.[col.objectKey ?? ''] && (
                                <Lucide
                                  icon="Copy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      !row.disabled &&
                                      col.objectKey &&
                                      typeof col.objectKey === 'string'
                                    ) {
                                      handleCopy(
                                        row[col.key]?.[col.objectKey] ?? '',
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                />
                              )}
                            </div>
                          ) : col.objectKey === 'reference_id' && col.copy ? (
                            <div className="flex items-center gap-2">
                              {row[col.key]?.[col.objectKey ?? '']}
                              {row[col.key]?.[col.objectKey ?? ''] && (
                                <Lucide
                                  icon="Copy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      !row.disabled &&
                                      col.objectKey &&
                                      typeof col.objectKey === 'string'
                                    ) {
                                      handleCopy(
                                        row[col.key]?.[col.objectKey] ?? '',
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                />
                              )}
                            </div>
                          ) : col.format === 'amount' &&
                            typeof row[col.key]?.[col.objectKey ?? ''] ===
                              'number' ? (
                            (() => {
                              const value = row[col.key]?.[col.objectKey ?? ''];
                              return value && !isNaN(value) && isFinite(value)
                                ? new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(Math.round(value))
                                : '₹ 0';
                            })()
                          ) : (
                            row[col.key]?.[col.objectKey ?? ''] ?? '₹ 0'
                          )
                        ) : col.copy && row[col.key] ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="break-words max-w-full">
                              {row[col.key]}
                            </span>
                            <Lucide
                              icon="Copy"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(row[col.key]);
                              }}
                              className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            />
                          </div>
                        ) : (
                          <div className="break-words max-w-full">
                            {row[col.key]}
                          </div>
                        )}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                  {expandedRow === rowIndex &&
                    expandedRowKey &&
                    row[expandedRowKey]?.length > 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={columns.length}>
                          <CommonTable
                            columns={columns.filter(
                              (col) => col.type !== 'expand',
                            )}
                            data={{
                              rows: expandedRowKey ? row[expandedRowKey] : [],
                              totalCount: expandedRowKey
                                ? row[expandedRowKey].length
                                : 0,
                            }}
                            handleRowClick={handleRowClick}
                            handleToggleClick={handleToggleClick}
                            handleNumberChange={handleNumberChange}
                            actionMenuItems={
                              source === 'Vendors'
                                ? expandedActionMenuItems
                                : actionMenuItems
                            }
                            actionButtonItems={actionButtonItems}
                            handleShowAllData={handleShowAllData}
                            expandable={true}
                          />
                        </Table.Td>
                      </Table.Tr>
                    )}
                </React.Fragment>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={100}>
                  <div className="flex flex-col justify-center items-center h-40 w-full text-gray-500">
                    <svg
                      className="w-8 h-8 mb-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M12 2a10 10 0 11-10 10A10 10 0 0112 2z"
                      />
                    </svg>
                    <p className="text-base md:text-lg">No Records found</p>
                  </div>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>

      {!expandable && totalPages > 0 && (
        <div className="flex flex-col-reverse flex-wrap items-center p-3 sm:p-5 flex-reverse gap-y-2 sm:flex-row">
          <Pagination className="flex-1 w-full sm:w-auto text-xs sm:text-sm">
            <Pagination.Link
              onClick={() => handlePageChange(1)}
              active={currentPage === 1}
            >
              <Lucide icon="ChevronsLeft" className="w-3 h-3 sm:w-4 sm:h-4" />
            </Pagination.Link>
            <Pagination.Link
              onClick={() =>
                Number(currentPage) > 1 &&
                handlePageChange(Number(currentPage) - 1)
              }
              active={currentPage === 1}
            >
              <Lucide icon="ChevronLeft" className="w-3 h-3 sm:w-4 sm:h-4" />
            </Pagination.Link>
            {renderPaginationLinks()}
            <Pagination.Link
              onClick={() =>
                Number(currentPage) < totalPages &&
                handlePageChange(Number(currentPage) + 1)
              }
              active={currentPage === totalPages}
            >
              <Lucide icon="ChevronRight" className="w-3 h-3 sm:w-4 sm:h-4" />
            </Pagination.Link>
            <Pagination.Link
              onClick={() => handlePageChange(totalPages)}
              active={currentPage === totalPages}
            >
              <Lucide icon="ChevronsRight" className="w-3 h-3 sm:w-4 sm:h-4" />
            </Pagination.Link>
          </Pagination>
          <h2 className="mx-1 sm:mx-2 text-[10px] sm:text-xs md:text-sm flex items-center gap-1 sm:gap-2">
            <span className="hidden sm:inline">Total Rows</span>
            <span className="sm:hidden">Total</span>
            <span className="w-12 sm:w-20 px-1 sm:px-2 py-1 sm:py-2 rounded-[0.5rem] dark:bg-darkmode-700 dark:text-gray-200 dark:border-darkmode-500 text-center text-[10px] sm:text-xs font-semibold">
              {data.totalCount}
            </span>
            <span className="mx-0.5">/</span>
          </h2>
          <FormSelect
            className="w-16 sm:w-20 rounded-[0.5rem] dark:bg-darkmode-700 dark:text-gray-200 dark:border-darkmode-500 text-[10px] sm:text-xs md:text-sm py-1 sm:py-2"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </FormSelect>
        </div>
      )}
      </div>
    </div>
  );
};

export default CommonTable;
