/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import { FormInput } from '@/components/Base/Form';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
import { Tab } from '@/components/Base/Headless';
import React, { useState, useCallback, useEffect } from 'react';
import { Columns, Role, Status, VerificationformFields } from '@/constants';
import CommonTable from '@/components/TableComponent/CommonTable';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import AssignMerchantModal from '@/components/Modal/Assign Merchant Modal';
import LoadingIcon from '@/components/Base/LoadingIcon';
import {
  getRefreshBakDetails,
  selectAllBankDetails,
} from '@/redux-toolkit/slices/bankDetails/bankDetailsSelectors';
import {
  getBankDetailsSlice,
  updateBankDetailSlice,
  addBankDetailSlice,
  deleteBankDetailSlice,
  onload,
  setRefreshBankDetails,
  getBankCount,
} from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
import {
  updateBankDetailsApi,
  addBankDetailsApi,
  getAllBankDetailsApi,
  deleteBankDetailsApi,
  // getAllBankDetailsBySearchApi,
} from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { selectAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantSelector';
import Modal from '@/components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
import { BankDetailsFormFields } from '@/constants';
import { getMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantSlice';
import { selectAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSelectors';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { getVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSlice';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import {
  resetPagination,
  setPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import { getParentTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { setParentTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { verifyPassword } from '@/redux-toolkit/slices/auth/authAPI';
import { Menu } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import debounce from 'lodash/debounce';
import Litepicker from '@/components/Base/Litepicker';
import { downloadCSV } from '@/components/ExportComponent';
import { getBankResponsesReports } from '@/redux-toolkit/slices/dataEntries/dataEntryAPI';
import dayjs from 'dayjs';
import { getPayOutsReports } from '@/redux-toolkit/slices/payout/payoutAPI';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';
import MultiSelect from '@/components/MultiSelect/MultiSelect';

dayjs.extend(utc);
dayjs.extend(timezone);

interface FormData {
  config: {
    [x: string]: any;
    is_phonepay?: boolean;
    is_intent?: boolean;
    is_freeze?: boolean;
    is_staticQR?: boolean;
  };
  [key: string]: any;
}

const BankAccount: React.FC = () => {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const pagination = useAppSelector(getPaginationData);
  const [verificationDelete, setVerificationDelete] = useState(false);
  const refreshBankDetails = useAppSelector(getRefreshBakDetails);
  const [newUserModal, setNewUserModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [freezeModal, setFreezeModal] = useState(false);
  const [bankToEdit, setBankToEdit] = useState<any>(null);
  const [formInitialValues, setFormInitialValues] = useState<any>(null);
  const [selectedVendorExport, setSelectedVendorExport] =
    useState<boolean>(false);
  const [selectedFilterVendorExport, setSelectedFilterVendorExport] =
    useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [dailyLimitModal, setDailyLimitModal] = useState(false);
  const [maxLimit, setMaxLimit] = useState(0);
  const [verificationFreeze, setVerificationFreeze] = useState(false);
  const [freezeVerify, setFreezeVerify] = useState({});
  const [freezeId, setFreezeId] = useState('');
  const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
  const [selectedFilterDates, setSelectedFilterDates] = useState<string>(
    `${date} - ${date}`,
  );
  const [selectedSubTab, setSelectedSubTab] = useState<boolean>(true); 
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());
  interface ExportModalState {
    open: boolean;
    selectedBankId: string | null;
    data: any; // Use a more specific type if possible
  }

  const [exportModalState, setExportModalState] = useState<ExportModalState>({
    open: false,
    selectedBankId: null,
    data: {},
  });
  const [selectedMerchantIdVerififed, setSelectedMerchantIdVerififed] =
    useState<string | null>(null);
  const [addMerchant, setaddMerchant] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [addMerchantFlag, setAddMerchantFlag] = useState(false);
  const [showPassword] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<any>({});
  const allBankDetails = useAppSelector(selectAllBankDetails);
  const parentTab = useAppSelector(getParentTabs);
  const [selectedMethod, setSelectedMethod] = useState<string>(
    parentTab === 0 ? 'PayIn' : 'PayOut',
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  type ExportFormat = 'PDF' | 'CSV' | 'XLSX';

  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let includeMerchants = false;
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
  }

  // let bankDetails: any[] = [];
  let designationIs;
  designationIs = localStorage.getItem('userData');
  const userData = designationIs ? JSON.parse(designationIs) : {};
  const isRestricted =
    userData.designation === Role.VENDOR ||
    userData.designation === Role.SUB_VENDOR ||
    userData.designation === Role.VENDOR_ADMIN ||
    userData.designation === Role.VENDOR_OPERATIONS;
  const bankModal = (): void => {
    setNewUserModal((prev) => {
      if (!prev) {
        // Opening modal - clear form data
        setFormData(null);
      }
      // Just toggle the modal state, don't clear edit state here
      return !prev;
    });
    // setVerification(false);
  };

  // Update formInitialValues whenever bankToEdit changes
  useEffect(() => {
    if (bankToEdit) {
      setFormInitialValues({
        ...bankToEdit,
        is_phonepay: bankToEdit?.config?.is_phonepay ?? false,
        is_intent: bankToEdit?.config?.is_intent ?? false,
        is_staticQR: bankToEdit?.config?.is_staticQR ?? false,
      });
    } else {
      setFormInitialValues(null);
    }
  }, [bankToEdit]);

  // Reset form state after modal closes
  useEffect(() => {
    if (!newUserModal) {
      setTimeout(() => {
        // Modal is closed, reset all form-related state
        setBankToEdit(null);
        setFormInitialValues(null);
        setFormData(null);
        setaddMerchant(false);
      }, 300);
    }
  }, [newUserModal]);
  useEffect(() => {
    setSelectedMethod(parentTab === 0 ? 'PayIn' : 'PayOut');
  }, [parentTab]);

  const addMerchantModal = (): void => {
    setaddMerchant((prev) => !prev);
  };

  const merchantCodes = useAppSelector(selectAllMerchantCodes);
  const vendorCodes = useAppSelector(selectAllVendorCodes);

  const userOptions = (() => {
    const allOptions = vendorCodes.flatMap((vendor: any) => {
      // If vendor has no subvendors, include the vendor itself
      if (!vendor.subvendors || vendor.subvendors.length === 0) {
        return [{
          value: vendor.value,
          label: vendor.label,
        }];
      }
      // If vendor has subvendors, include only the subvendors
      return vendor.subvendors.map((subvendor: any) => ({
        value: subvendor.value,
        label: subvendor.label,
      }));
    });

    // Remove duplicates based on value
    const uniqueOptions = Array.from(
      new Map(allOptions.map((option) => [option.value, option])).values()
    );

    return uniqueOptions;
  })();

  const merchantsOptions = [
    ...merchantCodes.map((merchant) => ({
      value: merchant.merchant_id,
      label: merchant.label,
    })),
  ];

  const fetchClientsDetails = useCallback(async () => {
    dispatch(resetPagination());
    // Construct the array of promises based on role
    const promises = [
      role === Role.ADMIN
        ? getAllMerchantCodes(true, undefined, true)
        : Promise.resolve(null),
      designation === Role.VENDOR_OPERATIONS
        ? getAllVendorCodes(false, true, false, false,false)
        : getAllVendorCodes(true, false, false, false,false),
    ];

    const [merchantCodesList, vendorCodesList] = await Promise.all(promises);

    if (merchantCodesList) {
      dispatch(getMerchantCodes(merchantCodesList));
    }
    if (vendorCodesList) {
      dispatch(getVendorCodes(vendorCodesList));
    }
  }, [dispatch, role]); // Include role in dependencies

  // it will debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchBankAccounts = useCallback(
    async (value: string, query: string = '', active: boolean) => {
      const queryString = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        bank_used_for: value,
        active: active.toString(), // Add is_enabled filter
        ...(query && { search: query }),
      }).toString();

      dispatch(onload());
      // let response;
      // if (!query) {
      let response = await getAllBankDetailsApi(queryString);
      dispatch(getBankDetailsSlice(response.banks));
      dispatch(getBankCount(response.totalCount));

      // } else {
      //   response = await getAllBankDetailsBySearchApi(queryString);
      //   dispatch(getBankDetailsSlice(response.bankAccounts));
      //   dispatch(getBankCount(response.totalCount));
      // }
      // if (response) {
      //   setNotificationStatus(Status.SUCCESS);
      //   setNotificationMessage('Bank Accounts fetched successfully');
      // } else {
      //   setNotificationStatus(Status.ERROR);
      //   setNotificationMessage('No Records Found!');
      // }
      // basicNonStickyNotificationToggle();
    },
    [pagination?.page, pagination?.limit, dispatch],
  );

  useEffect(() => {
    fetchBankAccounts(selectedMethod, debouncedSearchQuery, selectedSubTab);
  }, [debouncedSearchQuery, selectedMethod, selectedSubTab, fetchBankAccounts]);

  const debouncedFetchBankAccounts = useCallback(
    debounce((method: string, query: string, active: boolean) => {
      fetchBankAccounts(method, query, active);
    }, 500),
    [fetchBankAccounts, debouncedSearchQuery],
  );

  useEffect(() => {
    fetchClientsDetails();
  }, [fetchClientsDetails]);

  useEffect(() => {
    if (refreshBankDetails) {
      fetchBankAccounts(
        selectedMethod,
        debouncedSearchQuery,
        selectedSubTab,
      ).then(() => {
        dispatch(setRefreshBankDetails(false));
      });
    }
  }, [
    fetchBankAccounts,
    debouncedFetchBankAccounts,
    selectedMethod,
    searchQuery,
    selectedSubTab,
    refreshBankDetails,
    pagination?.page,
    pagination?.limit,
  ]);
  // const fetchCount = async () => {
  //   const getCountData = await getCount('BankAccount', '', {
  //     bank_used_for: selectedMethod,
  //   });
  //   dispatch(getBankCount(getCountData.count));
  // };

  // useEffect(() => {
  //   fetchCount();
  // }, [dispatch, selectedMethod]);

  const handleAddMerchantModal = (data: any) => {
    setAddMerchantFlag(true);
    setNewUserModal(false);
    setSelectedBankId({
      id: data.id,
      config: data.config,
      merchants: data.merchant_details,
    });
    addMerchantModal();
  };

  const handleConfirmDelete = async () => {
    if (selectedBank) {
      setVerificationDelete(true);
      setSelectedMerchantIdVerififed(selectedBank);
      setErrorMessage(null);
    }
    setDeleteModal(false);
    setSelectedBank(null);
  };

  const handleConfirmFreeze = async (formData: FormData) => {
    if (!formData) return;
    const {
      config = {},
      id,
      is_qr,
      is_bank,
      is_enabled,
      bank_used_for,
    } = formData;
    if (config?.isFromDeletedParent) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Vendor is not active',
        }),
      );

      return;
    }
    const isFreeze = !config?.is_freeze;
    let updatedConfig;
    if (bank_used_for == 'PayIn') {
      updatedConfig = {
        is_freeze: isFreeze,
        is_phonepay: isFreeze ? false : config.is_phonepay,
        is_intent: isFreeze ? false : config.is_intent,
        is_staticQR: isFreeze ? false : config.is_staticQR,
        merchants: [],
      };
    } else {
      updatedConfig = {
        is_freeze: isFreeze,
      };
    }

    const updatedData = {
      is_qr: isFreeze ? false : is_qr,
      is_bank: isFreeze ? false : is_bank,
      is_enabled: isFreeze ? false : is_enabled,
      config: updatedConfig,
    };

    setVerificationFreeze(true);
    setFreezeVerify(updatedData);
    setFreezeId(id);
    setFreezeModal(false);
    setIsLoading(false);
  };

  const handleConfirmLimitUpdate = async () => {
    if (!formData) return;

    const { id } = formData;

    const updatedConfig = {
      max_limit: maxLimit,
    };

    const updatedData = {
      config: updatedConfig,
    };

    try {
      const updatedBank = await updateBankDetailsApi(
        id,
        updatedData as Partial<any>,
      );
      if (updatedBank) {
        dispatch(updateBankDetailSlice(updatedBank));
        dispatch(setRefreshBankDetails(true));
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Failed to update bank details',
        }),
      );
    } finally {
      setDailyLimitModal(false);
      setFormData(null);
    }
  };

  const handledeleteData = async (id: string) => {
    setSelectedBank(id);
    setDeleteModal(true);
  };

  const handleFreezeData = async (data: any) => {
    setFormData(data);
    setFreezeModal(true);
  };

  const handleUnfreezeData = async (data: any) => {
    let formData: FormData = {
      config: {
        is_phonepay: false,
        is_intent: false,
        is_freeze: false,
        is_staticQR: false,
      },
    };

    formData = {
      ...data,
      config: {
        ...data.config,
      },
    };

    setFormData(formData);
    handleConfirmFreeze(formData);
  };

  const handleSubmitData = async (data: any) => {
    setIsLoading(true);
    try {
      if (bankToEdit && !addMerchantFlag) {
        //stop opening verification on adding merchant
        // if (!verified) {
        //   setErrorMessage('Please verify your password before updating.');
        //   setVerification(true);
        //   setFormData(data);
        //   return;
        // }
        if (!bankToEdit) {
          throw new Error('Form data or bank to edit is missing');
        }
        const prevData = {
          ...data,
          config: {
            ...data.config,
            is_phonepay: data.config?.is_phonepay || false,
            is_intent: data.config?.is_intent || false,
            is_staticQR: data.config?.is_staticQR || false,
          },
        };

        const newData = getUpdatedFields(bankToEdit, prevData);
        const booleanKeys = ['is_phonepay', 'is_intent', 'is_staticQR'];
        const config: Record<string, any> = {};
        const cleanedData: Record<string, any> = { ...newData };

        booleanKeys.forEach((key) => {
          if (key in newData) {
            config[key] = newData[key];
            delete cleanedData[key];
          }
        });

        cleanedData.config = config;

        if (Object.keys(newData).length === 0) {
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'No changes detected',
            }),
          );
          // setVerification(false);
          return;
        }

        const updatedBank = await updateBankDetailsApi(
          bankToEdit.id,
          cleanedData,
        );

        if (updatedBank) {
          dispatch(updateBankDetailSlice(updatedBank));
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'Bank Account Updated Successfully',
            }),
          );
          // setVerification(false);
          bankModal(); // Use bankModal() to properly close and cleanup
          setFormData(null);
          dispatch(setRefreshBankDetails(true));
        } else {
          throw new Error('Failed to update bank');
        }
      } else if (addMerchantFlag) {
        addMerchantModal();
        //merchant codes date wise shown
        // Only date without time to avoid new object in merchant_added every time merchant assign to bank
        const currentDate = new Date().toISOString().split('T')[0];
        const existingConfig = selectedBankId.config || {};
        const previousMerchantDetails = existingConfig.merchant_added || {};
        const newMerchants: string[] = data;
        const newMerchantDetails: Record<string, string[]> = {};
        newMerchants.forEach((merchantId) => {
          const merchant = merchantCodes.find(
            (m) => m.merchant_id === merchantId,
          );
          const merchantCode = merchant ? merchant.label : merchantId;
          const timestamp =
            previousMerchantDetails[merchantCode] || currentDate;
          newMerchantDetails[timestamp] = newMerchantDetails[timestamp] || [];
          (newMerchantDetails[timestamp] as string[]).push(merchantCode);
        });

        const config = {
          ...existingConfig,
          merchants: newMerchants,
          merchant_added: newMerchantDetails,
        };
        const updatedData: any = { config };
        const updatedBank = await updateBankDetailsApi(
          selectedBankId.id,
          updatedData,
        );
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Merchants assigned successfully.',
          }),
        );
        setSelectedBankId('');
        setAddMerchantFlag(false);
        setFormData(null);
        dispatch(updateBankDetailSlice(updatedBank));
        dispatch(setRefreshBankDetails(true));
      } else {
        const bank_used_for = selectedMethod;
        Object.assign(data, { bank_used_for });
        // sending userId for sub vendor and vendor operations
        if (userData.designation === Role.SUB_VENDOR) {
          data = {
            ...data,
            user_id: userData.userId,
          };
        }
        if (userData.designation === Role.VENDOR_OPERATIONS) {
          data = {
            ...data,
            user_id: userData.userId,
          };
        }
        const addedBank = await addBankDetailsApi(data);
        if (addedBank?.error?.message) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: `${addedBank?.error?.message}`,
            }),
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'Add Bank Details Successfully',
            }),
          );
          dispatch(addBankDetailSlice(addedBank));
          dispatch(setRefreshBankDetails(true));
          setFormData(null);
          bankModal();
        }
      }
    } catch (error) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: `${error}`,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  function getUpdatedFields(
    originalData: any,
    updatedData: any,
  ): { [key: string]: any } {
    const updatedFields: { [key: string]: any } = {};
    Object.keys(updatedData).forEach((key) => {
      if (key === 'config') {
        const configUpdates = getUpdatedFields(
          originalData.config || {},
          updatedData.config || {},
        );
        if (Object.keys(configUpdates).length > 0) {
          updatedFields.config = configUpdates;
        }
      } else if (
        JSON.stringify(updatedData[key]) !== JSON.stringify(originalData[key])
      ) {
        updatedFields[key] = updatedData[key];
      }
    });
    return updatedFields;
  }

  const handleCancelDelete = () => {
    setDeleteModal(false);
    setSelectedBank(null);
  };

  const handleCancelFreeze = () => {
    setFreezeModal(false);
    setFormData(null);
  };

  const handleCancelLimitUpdate = () => {
    setDailyLimitModal(false);
    setFormData(null);
  };

  const handleToggleClick = async (
    id: string,
    status: boolean,
    type: string,
  ) => {
    const toggleKey = `${id}-${type}`;
    
    // Prevent duplicate requests
    if (pendingToggles.has(toggleKey)) {
      return;
    }

    try {
      setPendingToggles(prev => new Set([...prev, toggleKey]));
      
      // Optimistic update: immediately update the state
      const user = allBankDetails.bankdetails.find((user) => user.id === id);
      if (user) {
        const updatedUser: any = { ...user };
        if (type in updatedUser) {
          // Direct property update
          updatedUser[type] = status;
        } else if (updatedUser.config) {
          // Config property update
          updatedUser.config = { ...updatedUser.config, [type]: status };
        } else {
          // Create config if it doesn't exist
          updatedUser.config = { [type]: status };
        }
        dispatch(updateBankDetailSlice(updatedUser));
      }
      
      // Make API call
      const userUpdate: any = await updateBankDetailsApi(id, { [type]: status });
      
      // Handle API response errors
      if (userUpdate?.error?.message) {
        // Revert optimistic update on error
        if (user) {
          dispatch(updateBankDetailSlice(user));
        }
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `${userUpdate?.error?.message}`,
          }),
        );
        dispatch(setRefreshBankDetails(true));
      } else if (userUpdate) {
        // Update with actual API response if available
        dispatch(updateBankDetailSlice(userUpdate));
      }
    } catch (error) {
      // Revert optimistic update on error
      const user = allBankDetails.bankdetails.find((user) => user.id === id);
      if (user) {
        dispatch(updateBankDetailSlice(user));
      }
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Failed to update status. Please try again.',
        }),
      );
    } finally {
      setPendingToggles(prev => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const handleDataTabChange = (value: string) => {
    if (value !== selectedMethod) {
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setSelectedMethod(value);
      setSelectedSubTab(true); 
      dispatch(resetPagination());
      // fetchBankAccounts(value);
    }
  };
  const handleSubTabChange = (active: boolean) => {
    setSelectedSubTab(active);
    dispatch(resetPagination());
  };

  const handlePageChange = useCallback(
    (page: number) => {
      const currentLimit = pagination?.limit || 10;
      dispatch(setPagination({ page, limit: currentLimit }));
    },
    [dispatch, pagination?.limit],
  );

  const handlePageSizeChange = useCallback(
    (newLimit: number) => {
      dispatch(setPagination({ page: 1, limit: newLimit }));
    },
    [dispatch],
  );

  const handleRefresh = useCallback(() => {
    dispatch(onload());
    dispatch(setRefreshBankDetails(true));
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Data refreshed successfully',
      }),
    );
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(resetPagination());
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedSubTab(true); 
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully',
      }),
    );
  }, [dispatch, fetchBankAccounts, selectedMethod]);

  const handleNumberChange = (row: any, value: number) => {
    setDailyLimitModal(true);
    setFormData(row);
    setMaxLimit(value);
  };

  // const handleVerification = async (passwordData: { password: string }) => {
  //   setIsLoading(true);
  //   try {
  //     setErrorMessage(null);
  //     const response = await verifyPassword(passwordData.password);
  //     setBankToEdit(bankToEdit);
  //     setVerififed(response);
  //     bankModal();
  //   } catch  {
  //     setErrorMessage('Invalid details. Please try again.');
  //   }
  //   finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleVerificationdelete = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const passwordVerified = await verifyPassword(passwordData.password);
      if (!passwordVerified) {
        throw new Error('Invalid password');
      }
      if (selectedMerchantIdVerififed) {
        await deleteBankDetailsApi(selectedMerchantIdVerififed);
        dispatch(deleteBankDetailSlice(selectedMerchantIdVerififed));
        dispatch(setRefreshBankDetails(true));
        setVerificationDelete(false);
        setErrorMessage(null);
      } else {
        throw new Error('Bank ID is null');
      }
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationFreeze = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const passwordVerified = await verifyPassword(passwordData.password);
      if (!passwordVerified) {
        throw new Error('Invalid password');
      }
      const updatedBank = await updateBankDetailsApi(
        freezeId,
        freezeVerify as Partial<any>,
      );
      dispatch(setRefreshBankDetails(true));
      if (updatedBank) {
        dispatch(updateBankDetailSlice(updatedBank));
        dispatch(setRefreshBankDetails(true));
      }
      setVerificationFreeze(false);
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'Invalid password',
        }),
      );
    } finally {
      setFreezeModal(false);
      setFormData(null);
      setIsLoading(false);
    }
  };

  const handleParentTabChange = (index: number) => {
    const newMethod = index === 0 ? 'PayIn' : 'PayOut';
    dispatch(setParentTab(index));
    setSelectedMethod(newMethod);
    setSelectedSubTab(true);
  };

  let bankDetails: any[] = [];

  bankDetails = allBankDetails?.bankdetails;

  bankDetails = bankDetails?.map((item) => ({
    ...item,
    disabled: item.config?.is_freeze === true ? true : false,
  }));

  // Helper function to reset export states
  const resetExportStates = useCallback(() => {
    setSelectedVendorExport(false);
    setSelectedStatus('');
    setSelectedFilterVendorExport('');
  }, []);

  // Helper function to show notification and close modal
  const showNotificationAndCloseModal = useCallback(
    (status: any, message: string) => {
      dispatch(addAllNotification({ status, message }));
      setExportModalState({ open: false, selectedBankId: null, data: [] });
    },
    [dispatch],
  );

  // Helper function to filter admin columns
  const filterAdminColumns = useCallback(
    (item: any) => {
      if (role !== Role.ADMIN) {
        const { UsedWith, ...rest } = item;
        return rest;
      }
      return item;
    },
    [role],
  );

  // Helper function to format date
  const formatDate = useCallback(
    (date: string) =>
      dayjs(date).tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A'),
    [],
  );

  // Helper function to get date range
  const getDateRange = useCallback(() => {
    const [startDate = '', endDate = ''] = selectedFilterDates.split(' - ');
    return { startDate, endDate };
  }, [selectedFilterDates]);

  // Helper function to build query params for PayIn vendor export
  const buildPayInVendorQuery = useCallback(() => {
    const { startDate, endDate } = getDateRange();
    const queryParams = new URLSearchParams();

    if (!selectedFilterVendorExport?.length) {
      showNotificationAndCloseModal(
        Status.ERROR,
        'Please select at least one vendor to export.',
      );
      resetExportStates();
      return null;
    }

    const userIds = selectedFilterVendorExport.map((obj: any) => obj.value);
    queryParams.append('userId', JSON.stringify(userIds));

    // Process status filters
    const isUsedValues: string[] = [];
    const statuses: string[] = [];
    if (selectedStatus?.length > 0) {
      selectedStatus?.forEach((item: any) => {
        if (item.value === 'used') isUsedValues.push('true');
        else if (item.value === 'unused') isUsedValues.push('false');
        else statuses.push(item.value);
      });
    }
    if (isUsedValues.length > 0)
      queryParams.append('is_used', isUsedValues.join(','));
    if (statuses.length > 0) queryParams.append('status', statuses.join(','));

    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
    queryParams.append('bank_used', 'PAYIN');
    queryParams.append('sortBy', 'sno');
    queryParams.append('sortOrder', 'ASC');
    queryParams.append('page', '');
    queryParams.append('limit', '');

    resetExportStates();
    return queryParams.toString();
  }, [
    selectedFilterVendorExport,
    selectedStatus,
    getDateRange,
    showNotificationAndCloseModal,
    resetExportStates,
  ]);

  // Helper function to process PayIn vendor reports
  const processPayInVendorReports = useCallback(
    (reports: any[], type: string) => {
      if (!reports.length) {
        showNotificationAndCloseModal(Status.ERROR, 'No Data Available!');
        return;
      }

      const csvData = reports
        .filter((item) => item.utr)
        .map((item) => ({
          Sno: item.sno || '',
          Vendor: item.vendor_code || '',
          Status: item.status,
          Amount: item.amount?.toString() || '',
          UTR: item.utr || '',
          'Used/Unused': item.is_used ? 'Used' : 'Unused',
          UsedWith: role === Role.ADMIN ? item.merchant_code || '' : '',
          BankName: item.nick_name || '',
          Date: item.created_at ? formatDate(item.created_at) : '',
        }));

      const { startDate, endDate } = getDateRange();
      const bankName = Array.isArray(exportModalState?.data)
        ? ''
        : exportModalState?.data?.bank_name || '';
      const fileName = `Bank-Report:${bankName}_${startDate}_to_${endDate}`;

      downloadCSV(
        csvData.map(filterAdminColumns),
        type as ExportFormat,
        fileName,
      );
      showNotificationAndCloseModal(
        Status.SUCCESS,
        `Report exported successfully as ${type}`,
      );
    },
    [
      role,
      formatDate,
      getDateRange,
      exportModalState,
      filterAdminColumns,
      showNotificationAndCloseModal,
    ],
  );

  // Helper function to build query params for PayOut vendor export
  const buildPayOutVendorQuery = useCallback(() => {
    const { startDate, endDate } = getDateRange();
    const queryParams = new URLSearchParams();

    if (!selectedFilterVendorExport?.length) {
      showNotificationAndCloseModal(
        Status.ERROR,
        'Please select at least one vendor to export.',
      );
      resetExportStates();
      return null;
    }

    const userIds = selectedFilterVendorExport.map((obj: any) => obj.vendor_id);
    queryParams.append('userId', JSON.stringify(userIds));

    if (selectedStatus?.length > 0) {
      const statusValues = selectedStatus.map((item: any) => item.value);
      queryParams.append('status', JSON.stringify(statusValues));
    }

    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
    queryParams.append('page', '');
    queryParams.append('limit', '');
    queryParams.append('sortOrder', 'ASC');

    resetExportStates();
    return queryParams.toString();
  }, [
    selectedFilterVendorExport,
    selectedStatus,
    getDateRange,
    showNotificationAndCloseModal,
    resetExportStates,
  ]);

  // Helper function to process PayOut vendor reports
  const processPayOutVendorReports = useCallback(
    (reports: any[], type: string) => {
      if (!reports.length) {
        showNotificationAndCloseModal(Status.ERROR, 'No Data Available!');
        return;
      }

      const processedSnos = new Set<string>();
      const csvData: any[] = [];

      reports.forEach((item) => {
        if (
          (item.status === 'APPROVED' || item.status === 'REVERSED') &&
          item.sno &&
          !processedSnos.has(item.sno)
        ) {
          processedSnos.add(item.sno);

          const bankDetailsObj = item.user_bank_details || {};
          const formattedBankDetails = `Name: ${
            bankDetailsObj.account_holder_name || ''
          }, Account No: ${bankDetailsObj.account_no || ''}, IFSC: ${
            bankDetailsObj.ifsc_code || ''
          }, Bank Code: ${bankDetailsObj.bank_name || ''}`;

          csvData.push({
            SNO: item.sno,
            VendorCode: item.vendor_code || '',
            Status: item.status === 'APPROVED' ? 'APPROVED' : 'REVERSED',
            Amount: item.amount?.toString() || '',
            UTR: item.utr_id || '',
            UsedWith:
              role === Role.ADMIN
                ? item.merchant_details?.merchant_code || ''
                : '',
            Reversed: item.rejected_at || '',
            BankDetails: formattedBankDetails,
            BankName: item.nick_name || '',
            Date: item.approved_at ? formatDate(item.approved_at) : '',
          });
        }
      });

      const { startDate, endDate } = getDateRange();
      const fileName = `Bank-Report:${
        exportModalState?.data?.bank_name || ''
      }_${startDate}_to_${endDate}`;

      downloadCSV(
        csvData.map(filterAdminColumns),
        type as ExportFormat,
        fileName,
      );
      showNotificationAndCloseModal(
        Status.SUCCESS,
        `Report exported successfully as ${type}`,
      );
    },
    [
      role,
      formatDate,
      getDateRange,
      exportModalState,
      filterAdminColumns,
      showNotificationAndCloseModal,
    ],
  );

  // Helper function to handle PayIn regular reports
  const handlePayInRegularReports = useCallback(
    async (type: string, apiData?: any[]) => {
      if (!selectedFilterDates?.includes(' - ')) {
        showNotificationAndCloseModal(
          Status.ERROR,
          'Please select both vendors and a valid date range.',
        );
        setSelectedStatus('');
        setSelectedFilterVendorExport('');
        return;
      }

      try {
        let bankReports: any[];

        if (apiData) {
          bankReports = apiData;
        } else {
          const { startDate, endDate } = getDateRange();
          const queryParams = new URLSearchParams({
            bank_id: exportModalState.selectedBankId ?? '',
            startDate,
            endDate,
            sortBy: 'sno',
            sortOrder: 'ASC',
            page: '',
            limit: '',
            status: '/success,/internalTransfer,/freezed',
          }).toString();

          const response = await getBankResponsesReports(queryParams);
          bankReports = response.data.rows;
        }

        if (!bankReports.length) {
          showNotificationAndCloseModal(
            Status.ERROR,
            'No records available to export based on the selected criteria.',
          );
          return;
        }

        const { startDate, endDate } = getDateRange();
        const fileName = `Bank-Report:${
          exportModalState?.data?.bank_name || ''
        }_${startDate}_to_${endDate}`;

        if (includeMerchants) {
          // Process reports with merchant details
          const dateGroupedReports: Record<
            string,
            { items: any[]; merchants: Set<string> }
          > = {};
          const csvData: any[] = [];
          const processedSnos = new Set<string>();

          // Group items by date and extract merchants
          bankReports.forEach((item) => {
            const createdAt = item.created_at
              ? new Date(item.created_at)
              : null;
            if (createdAt && !isNaN(createdAt.getTime())) {
              const dateKey = dayjs(createdAt)
                .tz('Asia/Kolkata')
                .format('DD-MM-YYYY');
              if (!dateGroupedReports[dateKey]) {
                dateGroupedReports[dateKey] = {
                  items: [],
                  merchants: new Set(),
                };
              }
              dateGroupedReports[dateKey]?.items.push(item);
            }

            // Process merchant_added
            const merchantAdded = item.details?.merchant_added || {};
            Object.entries(merchantAdded).forEach(
              ([rawDateKey, merchantsList]) => {
                const parsedDate = dayjs(rawDateKey)
                  .tz('Asia/Kolkata')
                  .format('DD-MM-YYYY');
                if (!dateGroupedReports[parsedDate]) {
                  dateGroupedReports[parsedDate] = {
                    items: [],
                    merchants: new Set(),
                  };
                }
                (merchantsList as string[]).forEach((merchant) => {
                  if (merchant && dateGroupedReports[parsedDate]?.merchants) {
                    dateGroupedReports[parsedDate]?.merchants.add(merchant);
                  }
                });
              },
            );
          });

          // Generate CSV data
          Object.entries(dateGroupedReports).forEach(
            ([date, { items, merchants }]) => {
              items.forEach((item) => {
                if (item.sno && !processedSnos.has(item.sno)) {
                  processedSnos.add(item.sno);
                  csvData.push({
                    Sno: item.sno,
                    Status: item.status,
                    Amount: item.amount?.toString() || '',
                    UTR: item.utr || '',
                    'Used/Unused': item.is_used ? 'Used' : 'Unused',
                    Merchants: '',
                    UsedWith:
                      role === Role.ADMIN ? item.merchant_code || '' : '',
                    BankName: item.nick_name ?? '',
                    Date: formatDate(item.created_at),
                  });
                }
              });

              if (merchants.size > 0) {
                const merchantList = Array.from(merchants);
                csvData.push({
                  Sno: '',
                  Status: '',
                  UTR: '',
                  Amount: '',
                  'Used/Unused': '',
                  Merchants: `${merchantList.join(', ')} (${
                    merchantList.length
                  } merchant${merchantList.length !== 1 ? 's' : ''})`,
                  UsedWith: role === Role.ADMIN ? '' : '',
                  BankName: '',
                  Date: date,
                });
              }
            },
          );

          downloadCSV(
            csvData.map(filterAdminColumns),
            type as ExportFormat,
            fileName,
          );
        } else {
          // Process vendor reports
          const csvData = bankReports
            .filter(
              (item) =>
                item.sno &&
                (item.status === '/success' ||
                  item.status === '/internalTransfer'),
            )
            .map((item) => ({
              Sno: item.sno,
              Status: item.status,
              Amount: item.amount?.toString() || '',
              UTR: item.utr || '',
              'Used/Unused': item.is_used ? 'Used' : 'Unused',
              UsedWith: role === Role.ADMIN ? item.merchant_code || '' : '',
              BankName: item.nick_name || '',
              Date: item.created_at ? formatDate(item.created_at) : '',
            }));

          downloadCSV(
            csvData.map(filterAdminColumns),
            type as ExportFormat,
            fileName,
          );
        }

        showNotificationAndCloseModal(
          Status.SUCCESS,
          `Report exported successfully as ${type}`,
        );
      } catch (error) {
        showNotificationAndCloseModal(Status.ERROR, 'Error exporting report');
      }
    },
    [
      selectedFilterDates,
      exportModalState,
      includeMerchants,
      role,
      formatDate,
      getDateRange,
      filterAdminColumns,
      showNotificationAndCloseModal,
    ],
  );

  // Helper function to handle PayOut regular reports
  const handlePayOutRegularReports = useCallback(
    async (type: string) => {
      const { startDate, endDate } = getDateRange();
      const queryParams = new URLSearchParams({
        bank_acc_id: exportModalState.selectedBankId ?? '',
        startDate,
        endDate,
        page: '',
        limit: '',
        sortOrder: 'ASC',
      }).toString();

      try {
        const payoutBank = await getPayOutsReports(queryParams);
        const bankReports = payoutBank.payout;

        if (!bankReports.length) {
          showNotificationAndCloseModal(
            Status.ERROR,
            'No records available to export based on the selected criteria.',
          );
          return;
        }

        const processedSnos = new Set<string>();
        interface BankDetailsObj {
          account_holder_name?: string;
          account_no?: string;
          ifsc_code?: string;
          bank_name?: string;
        }

        interface BankReportItem {
          sno: string;
          status: string;
          amount?: number;
          utr_id?: string;
          merchant_details?: {
            merchant_code?: string;
          };
          rejected_at?: string;
          user_bank_details?: BankDetailsObj;
          nick_name?: string;
          approved_at?: string;
        }

        interface CsvDataItem {
          SNO: string;
          Status: string;
          Amount: string;
          UTR: string;
          UsedWith: string;
          Reversed: string;
          BankDetails: string;
          BankName: string;
          Date: string;
        }

        const csvData: CsvDataItem[] = bankReports
          .filter(
            (item: BankReportItem) =>
              (item.status === 'APPROVED' || item.status === 'REVERSED') &&
              item.sno &&
              !processedSnos.has(item.sno),
          )
          .map((item: BankReportItem): CsvDataItem => {
            processedSnos.add(item.sno);
            const bankDetailsObj: BankDetailsObj = item.user_bank_details || {};
            const formattedBankDetails = `Name: ${
              bankDetailsObj.account_holder_name || ''
            }, Account No: ${bankDetailsObj.account_no || ''}, IFSC: ${
              bankDetailsObj.ifsc_code || ''
            }, Bank Code: ${bankDetailsObj.bank_name || ''}`;

            return {
              SNO: item.sno,
              Status: item.status === 'APPROVED' ? 'APPROVED' : 'REVERSED',
              Amount: item.amount?.toString() || '',
              UTR: item.utr_id || '',
              UsedWith:
                role === Role.ADMIN
                  ? item.merchant_details?.merchant_code || ''
                  : '',
              Reversed: item.rejected_at || '',
              BankDetails: formattedBankDetails,
              BankName: item.nick_name || '',
              Date: item.approved_at ? formatDate(item.approved_at) : '',
            };
          });

        const fileName = `Bank-Report:${
          exportModalState?.data?.bank_name || ''
        }_${startDate}_to_${endDate}`;
        downloadCSV(
          csvData.map(filterAdminColumns),
          type as ExportFormat,
          fileName,
        );
        showNotificationAndCloseModal(
          Status.SUCCESS,
          `Report exported successfully as ${type}`,
        );
      } catch (error) {
        showNotificationAndCloseModal(Status.ERROR, 'Error exporting report');
      }
    },
    [
      exportModalState,
      role,
      formatDate,
      getDateRange,
      filterAdminColumns,
      showNotificationAndCloseModal,
    ],
  );

  // Main optimized handleDownload function
  const handleDownload = useCallback(
    async (type: string, apiData?: any[]) => {
      try {
        if (selectedMethod === 'PayIn') {
          if (selectedVendorExport) {
            const queryString = buildPayInVendorQuery();
            if (!queryString) return;

            const response = await getBankResponsesReports(queryString);
            processPayInVendorReports(response.data.rows, type);
          } else {
            await handlePayInRegularReports(type, apiData);
          }
        } else {
          // PayOut
          if (selectedVendorExport) {
            const queryString = buildPayOutVendorQuery();
            if (!queryString) return;

            const response = await getPayOutsReports(queryString);
            processPayOutVendorReports(response.payout, type);
          } else {
            await handlePayOutRegularReports(type);
          }
        }
      } catch (error) {
        showNotificationAndCloseModal(Status.ERROR, 'Error exporting report');
      }
    },
    [
      selectedMethod,
      selectedVendorExport,
      buildPayInVendorQuery,
      buildPayOutVendorQuery,
      processPayInVendorReports,
      processPayOutVendorReports,
      handlePayInRegularReports,
      handlePayOutRegularReports,
      showNotificationAndCloseModal,
    ],
  );

  return (
    <div className="flex flex-col p-5 ">
      <div className="col-span-12">
        <div className="flex flex-col  md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Bank Accounts
          </div>
          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
            <Modal
              handleModal={bankModal}
              forOpen={newUserModal}
              buttonTitle={`${bankToEdit ? 'Edit ' : 'Add '} Bank Details`}
            >
              <DynamicForm
                sections={BankDetailsFormFields(
                  bankToEdit ? [] : userOptions,
                  selectedMethod,
                  role || undefined,
                  designation || undefined,
                  bankToEdit ? true : false,
                )}
                onSubmit={handleSubmitData}
                //edit toggle
                defaultValues={formInitialValues || {}}
                // defaultValues={bankToEdit || {}}
                isEditMode={!!bankToEdit}
                handleCancel={bankModal}
                isLoading={isLoading}
              />
            </Modal>
            <Modal handleModal={handleCancelDelete} forOpen={deleteModal}>
              <ModalContent
                handleCancelDelete={handleCancelDelete}
                handleConfirmDelete={handleConfirmDelete}
              >
                Are you sure you want to delete this bank?
              </ModalContent>
            </Modal>
            <Modal handleModal={handleCancelFreeze} forOpen={freezeModal}>
              <ModalContent
                handleCancelDelete={handleCancelFreeze}
                handleConfirmDelete={() =>
                  formData && handleConfirmFreeze(formData)
                }
              >
                Are you sure you want to Freeze this bank?
              </ModalContent>
            </Modal>
            <Modal
              handleModal={handleCancelLimitUpdate}
              forOpen={dailyLimitModal}
            >
              <ModalContent
                handleCancelDelete={handleCancelLimitUpdate}
                handleConfirmDelete={handleConfirmLimitUpdate}
              >
                Are you sure you want to update the Max Limit to {maxLimit}?
              </ModalContent>
            </Modal>
            {/* <Modal
              handleModal={() => setVerification(false)}
              forOpen={verification}
            >
              <DynamicForm
                sections={VerificationformFields(showPassword)}
                onSubmit={handleVerification}
                defaultValues={formData || {}}
                isEditMode={formData ? true : false}
                handleCancel={() => setVerification(false)}
                isLoading={isLoading}
              />
              {errorMessage && (
                <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
              )}
            </Modal> */}
            <Modal
              handleModal={() => setVerificationDelete(false)}
              forOpen={verificationDelete}
            >
              <DynamicForm
                sections={VerificationformFields(showPassword)}
                onSubmit={handleVerificationdelete}
                defaultValues={formData || {}}
                isEditMode={true}
                handleCancel={() => setVerificationDelete(false)}
                isLoading={isLoading}
              />
              {errorMessage && (
                <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
              )}
            </Modal>
            <Modal
              handleModal={() => setVerificationFreeze(false)}
              forOpen={verificationFreeze}
            >
              <DynamicForm
                sections={VerificationformFields(showPassword)}
                onSubmit={handleVerificationFreeze}
                defaultValues={{ password: '' }}
                isEditMode={true}
                handleCancel={() => setVerificationFreeze(false)}
                isLoading={isLoading}
              />
              {errorMessage && (
                <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
              )}
            </Modal>
            <AssignMerchantModal
              title={'Assign Merchants'}
              forOpen={addMerchant}
              handleModal={addMerchantModal}
              userOptions={merchantsOptions}
              merchants={selectedBankId.merchants}
              merchantsCodes={merchantCodes}
              onSubmit={handleSubmitData}
            />
            {exportModalState && (
              <Modal
                handleModal={() =>
                  setExportModalState((prev) => ({
                    ...prev,
                    open: !prev.open,
                  }))
                }
                forOpen={exportModalState.open}
                title="Export Bank Account"
              >
                <div className="py-2 my-2 mb-4">
                  <Litepicker
                    value={selectedFilterDates}
                    onChange={(e) => {
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
                    placeholder="Select a date range"
                    className="w-full pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                  />
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
          </div>
        </div>
        <div className="flex flex-col p-5 box box--stacked mt-4">
          <div className="flex flex-col gap-8 mt-3.5 rounded-lg">
            <div className="flex flex-col ">
              <Tab.Group
                selectedIndex={parentTab}
                onChange={handleParentTabChange}
              >
                <Tab.List className="flex border-b-0 bg-transparent relative">
                  <Tab className="relative flex-1">
                    {({ selected }) => (
                      <Tab.Button
                        className={`w-full py-2 flex items-center justify-center transition-all duration-200 relative ${
                          selected
                            ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                            : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                        }`}
                        as="button"
                        onClick={() => handleDataTabChange('PayIn')}
                        style={selected ? {
                          position: 'relative',
                          zIndex: 10
                        } : {}}
                      >
                        <Lucide
                          icon="BadgeIndianRupee"
                          className="w-5 h-5 mr-2"
                        />
                        PayIn
                      </Tab.Button>
                    )}
                  </Tab>
                  <Tab className="relative flex-1">
                    {({ selected }) => (
                      <Tab.Button
                        className={`w-full py-2 flex items-center justify-center transition-all duration-200 relative ${
                          selected
                            ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                            : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                        }`}
                        as="button"
                        onClick={() => handleDataTabChange('PayOut')}
                        style={selected ? {
                          position: 'relative',
                          zIndex: 10
                        } : {}}
                      >
                        <Lucide
                          icon="ArrowRightCircle"
                          className="w-5 h-5 mr-2"
                        />
                        PayOut
                      </Tab.Button>
                    )}
                  </Tab>
                </Tab.List>
                <div className="flex flex-col border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400 p-5 sm:items-center sm:flex-row gap-y-2">
                  <div>
                    <div className="relative">
                      <Lucide
                        icon="Search"
                        className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                      />
                      <FormInput
                        type="text"
                        placeholder="Search Banks..."
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
                        className="w-full sm:w-auto mx-3"
                        onClick={() => {
                          setSelectedVendorExport(true);
                          setSelectedFilterVendorExport('');
                          setSelectedStatus('');
                        }}
                      >
                        <Lucide
                          icon="Download"
                          className="stroke-[1.3] w-4 h-4 mr-2"
                        />
                        Export
                      </Menu.Button>
                      {selectedVendorExport && (
                        <Modal
                          handleModal={() => {
                            setSelectedVendorExport((prev) => !prev);
                          }}
                          forOpen={selectedVendorExport}
                          title="Export Bank Details"
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
                                startDate: date,
                                endDate: date,
                              }}
                              placeholder="Select a date range"
                              className="w-full pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                            />
                          </div>

                          <div className="my-2 py-2 flex flex-col justify-center">
                            <div className="flex flex-row">
                              <MultiSelect
                                codes={vendorCodes}
                                selectedFilter={selectedFilterVendorExport}
                                setSelectedFilter={(value: any[]) => {
                                  setSelectedFilterVendorExport(value);
                                }}
                                placeholder="Select Vendor Codes ..."
                                // disabled={selectedFilter?.length > 0}
                              />
                            </div>
                            {selectedMethod === 'PayIn' ? (
                              <div className="flex flex-row mt-4">
                                <MultiSelect
                                  codes={[
                                    { label: 'Used', value: 'used' },
                                    { label: 'Unused', value: 'unused' },
                                    {
                                      label: 'Internal Transfer',
                                      value: '/internalTransfer',
                                    },
                                    { label: 'Repeated', value: '/repeated' },
                                    { label: 'Freezed', value: '/freezed' },
                                  ]}
                                  selectedFilter={selectedStatus}
                                  setSelectedFilter={(value: any[]) => {
                                    setSelectedStatus(value);
                                  }}
                                  placeholder="Select Status ..."
                                  // disabled={selectedFilter?.length > 0}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-row mt-4">
                                <MultiSelect
                                  codes={[
                                    { label: 'Approved', value: 'APPROVED' },
                                    { label: 'Reversed', value: 'REVERSED' },
                                  ]}
                                  selectedFilter={selectedStatus}
                                  setSelectedFilter={(value: any[]) => {
                                    setSelectedStatus(value);
                                  }}
                                  placeholder="Select Status ..."
                                  // disabled={selectedFilter?.length > 0}
                                />
                              </div>
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
                  </div>
                </div>
                <Tab.Group
                  selectedIndex={selectedSubTab ? 0 : 1}
                  onChange={(index) => handleSubTabChange(index === 0)}
                >
                  <Tab.List variant="tabs">
                    <Tab>
                      <Tab.Button
                        className="w-full py-2 flex items-center justify-center"
                        as="button"
                      >
                        <Lucide icon="CheckCircle" className="w-4 h-4 mr-2" />
                        Active {selectedMethod} Bank
                      </Tab.Button>
                    </Tab>
                    <Tab>
                      <Tab.Button
                        className="w-full py-2 flex items-center justify-center"
                        as="button"
                      >
                        <Lucide icon="XCircle" className="w-4 h-4 mr-2" />
                        Inactive {selectedMethod} Bank
                      </Tab.Button>
                    </Tab>
                  </Tab.List>
                </Tab.Group>
              </Tab.Group>
              <div className="overflow-auto border-b border-l border-r xl:overflow-visible">
                {allBankDetails.loading ? (
                  <div className="flex justify-center items-center w-full h-screen">
                    <LoadingIcon
                      icon="ball-triangle"
                      className="w-[5%] h-auto"
                    />
                  </div>
                ) : (
                  <CommonTable
                    columns={
                      role &&
                      [
                        Role.VENDOR,
                          Role.SUB_VENDOR,
                        Role.VENDOR_ADMIN,
                        Role.VENDOR_OPERATIONS,
                      ].includes(role)
                        ? Columns.BankDetails_VENDOR(selectedMethod)
                        : designation &&
                          [Role.TRANSACTIONS, Role.OPERATIONS].includes(
                            designation || '',
                          )
                        ? Columns.BankDetails_TXN_OP(selectedMethod)
                        : Columns.BankDetails(selectedMethod)
                    }
                    data={{
                      rows: bankDetails,
                      totalCount: allBankDetails.count,
                    }}
                    currentPage={Number(pagination?.page) || 1}
                    pageSize={Number(pagination?.limit) || 10}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    handleToggleClick={handleToggleClick}
                    handleNumberChange={handleNumberChange}
                    source="BankDetails"
                    actionMenuItems={(row: any) => {
                      const items: Array<{
                        label: string;
                        icon: 'Eye' | 'Plus' | 'Pencil' | 'Download' | 'Trash2';
                        onClick?: () => void;
                        onMouseEnter?: () => void;
                        hover?: boolean;
                      }> = [
                        //show icons role wise
                        {
                          label: 'Download',
                          icon: 'Download',
                          onClick: () =>
                            setExportModalState({
                              open: true,
                              selectedBankId: row.id,
                              data: row,
                            }),
                        },
                      ];
                      if (
                        !role ||
                        ![
                          Role.VENDOR,
                          Role.SUB_VENDOR,
                          Role.VENDOR_ADMIN,
                          Role.VENDOR_OPERATIONS,
                        ].includes(role)
                      ) {
                        items.push(
                          {
                            label: 'Edit',
                            icon: 'Pencil',
                            onClick: () => {
                              setBankToEdit(row);
                              setNewUserModal(true);
                              setaddMerchant(false);
                              setAddMerchantFlag(false);
                              // setVerification(true);
                            },
                          },
                          {
                            label: 'Delete',
                            icon: 'Trash2',
                            onClick: async () => handledeleteData(row.id),
                          },
                        );
                      }
                      if (selectedMethod === 'PayIn' && !isRestricted) {
                        items.unshift(
                          {
                            label: 'View',
                            icon: 'Eye',
                            onMouseEnter: () => row,
                            hover: true,
                          },
                          {
                            label: 'Add Merchant',
                            icon: 'Plus',
                            onClick: () => handleAddMerchantModal(row),
                          },
                        );
                      }

                      return items;
                    }}
                    actionButtonItems={(row: any) => [
                      {
                        label: row.config?.is_freeze ? 'Unfreeze' : 'Freeze',
                        color: row.is_obsolete
                          ? 'gray'
                          : row.config?.is_freeze
                          ? 'green'
                          : 'red',
                        onClick: () => {
                          if (row.is_obsolete) return;
                          if (row.config?.is_freeze) {
                            handleUnfreezeData(row);
                          } else {
                            handleFreezeData(row);
                          }
                        },
                        disabled: row.is_obsolete,
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccount;
