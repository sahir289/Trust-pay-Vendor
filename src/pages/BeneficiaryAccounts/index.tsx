/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import { FormInput } from '@/components/Base/Form';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
import { Tab } from '@/components/Base/Headless';
import React, { useState, useCallback, useEffect } from 'react';
import {
  BeneficiaryAccountsFormFields,
  Columns,
  Role,
  Status,
  VerificationformFields,
} from '@/constants';
import CommonTable from '@/components/TableComponent/CommonTable';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { selectAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantSelector';
import Modal from '@/components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
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
// import { setParentTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { verifyPassword } from '@/redux-toolkit/slices/auth/authAPI';
import { Menu } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import {
  addBeneficiaryAccountSlice,
  deleteBeneficiaryAccountSlice,
  getBeneficiaryAccountSlice,
  getBeneficiaryCount,
  onload,
  setRefreshBeneficiaryAccounts,
  updateBeneficiaryAccountSlice,
} from '@/redux-toolkit/slices/beneficiaryAccounts/beneficiaryAccountsSlice';
import {
  getRefreshBeneficiaryAccounts,
  selectAllBeneficiaryAccounts,
} from '@/redux-toolkit/slices/beneficiaryAccounts/beneficiaryAccountsSelectors';
import {
  addBeneficiaryApi,
  deleteBeneficiaryApi,
  getAllBeneficiaryApi,
  // getAllBeneficiaryBySearchApi,
  updateBeneficiaryApi,
} from '@/redux-toolkit/slices/beneficiaryAccounts/beneficiaryAccountsAPI';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

interface BeneficiaryAccount {
  id: string;
  vendors?: any[];
  [key: string]: any;
}

interface FormData {
  config: {
    [x: string]: any;
  };
  [key: string]: any;
}

const BeneficiaryAccounts: React.FC = () => {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const pagination = useAppSelector(getPaginationData);
  const [verificationDelete, setVerificationDelete] = useState(false);
  const refreshBankDetails = useAppSelector(getRefreshBeneficiaryAccounts);
  const [newUserModal, setNewUserModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [beneficiaryToEdit, setBeneficiaryToEdit] = useState<any>(null);
  const [verification, setVerification] = useState(false);
  const [verified, setVerififed] = useState(false);
  const [selectedBeneficiaryData, setSelectedBeneficiaryData] = useState<any>(
    {},
  );
  const [selectedMerchantIdVerififed, setSelectedMerchantIdVerififed] =
    useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showPassword] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );
  const [addVendor, setAddVendor] = useState(false);
  const allbeneficiaryAccounts = useAppSelector(selectAllBeneficiaryAccounts);
  const parentTab = useAppSelector(getParentTabs);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  let designation : RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
    designation = parsedData.designation;
  }
  const [tabRole, setTabRole] = useState<string>(
    role && [Role.ADMIN, Role.MERCHANT].includes(role) && parentTab === 0
      ? Role.MERCHANT
      : Role.VENDOR,
  );

  const beneficiaryModal = (): void => {
    setNewUserModal((prev) => {
      if (!prev) setFormData(null);
      return !prev;
    });
    setVerification(false);
    if (newUserModal) {
      setSelectedUserId(null);
      setBeneficiaryToEdit(null);
    }
  };
  const merchantCodes = useAppSelector(selectAllMerchantCodes);
  const vendorCodes = useAppSelector(selectAllVendorCodes);

  let userOptions = [];

  if (parentTab === 0 && role === Role.ADMIN) {
    userOptions = [
      ...merchantCodes.map((merchant) => ({
        value: merchant.value,
        label: merchant.label,
      })),
    ];
  } else if (role === Role.VENDOR) {
    userOptions = [
      ...vendorCodes.map((vendor) => ({
        value: vendor.value,
        label: vendor.label,
      })),
    ];
  } else if (parentTab === 1 && role === Role.ADMIN) {
    userOptions = [
      ...vendorCodes.map((vendor) => ({
        value: vendor.value,
        label: vendor.label,
      })),
    ];
  } else {
    userOptions = [
      ...merchantCodes.map((merchant) => ({
        value: merchant.value,
        label: merchant.label,
      })),
    ];
  }

  let typeOptions = [
    { value: 'Parking', label: 'Parking' },
    { value: 'Withdrawl', label: 'Withdrawl' },
    { value: 'Third Party', label: 'ThirdParty' },
  ];

  const fetchClientsDetails = useCallback(async () => {
    dispatch(resetPagination());
    const promises = [
      role && [Role.ADMIN, Role.MERCHANT].includes(role)
        ? role === Role.ADMIN
          ? getAllMerchantCodes(false, true)
          : getAllMerchantCodes()
        : Promise.resolve(null),
      role && [Role.ADMIN, Role.VENDOR, Role.SUB_VENDOR].includes(role)
        ? role === Role.ADMIN
          ? getAllVendorCodes(false, true)
          : getAllVendorCodes()
        : Promise.resolve(null),
    ];

    const [merchantCodesList, vendorCodesList] = await Promise.all(promises);

    if (merchantCodesList) {
      dispatch(getMerchantCodes(merchantCodesList));
    }
    if (vendorCodesList) {
      dispatch(getVendorCodes(vendorCodesList));
    }
  }, [dispatch, role]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchBankAccounts = useCallback(
    async (query: string = '', role: string = tabRole) => {
      const queryString = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        beneficiary_role: role,
        ...(query && { search: query }),
      }).toString();

      dispatch(onload());
      const  response = await getAllBeneficiaryApi(queryString);
        dispatch(getBeneficiaryAccountSlice(response.bankAccounts));
        dispatch(getBeneficiaryCount(response.totalCount));
    },
    [pagination?.page, pagination?.limit, dispatch, tabRole],
  );

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchBankAccounts(debouncedSearchQuery);
    } else {
      fetchBankAccounts();
    }
  }, [debouncedSearchQuery, fetchBankAccounts]);

  useEffect(() => {
    fetchClientsDetails();
  }, [fetchClientsDetails]);

  useEffect(() => {
    if (refreshBankDetails) {
      fetchBankAccounts(debouncedSearchQuery, tabRole).then(() => {
        dispatch(setRefreshBeneficiaryAccounts(false));
      });
    }
  }, [
    fetchBankAccounts,
    debouncedSearchQuery,
    refreshBankDetails,
    pagination?.page,
    pagination?.limit,
    tabRole,
  ]);

  const handleConfirmDelete = async () => {
    if (selectedBeneficiary) {
      setVerificationDelete(true);
      setSelectedMerchantIdVerififed(selectedBeneficiary);
    }
    setDeleteModal(false);
    setSelectedBeneficiary(null);
  };

  const handleDeleteData = async (id: string) => {
    setSelectedBeneficiary(id);
    setDeleteModal(true);
  };

  const handleSubmitData = async (data: any) => {
    setIsLoading(true);
    try {
      if (beneficiaryToEdit && !addVendor) {
        if (!verified) {
          setErrorMessage('Please verify your password before updating.');
          setVerification(true);
          setFormData(data);
          return;
        }
        const prevData = {
          ...data,
        };
        if (data.config_initial_balance ! == null && parentTab !== 0) {
          prevData.config = {
            ...data.config,
            initial_balance: data.config_initial_balance,
          }
        }

        const newData = getUpdatedFields(beneficiaryToEdit, prevData);
        if (!newData.config) {
          newData.config = {};
          role;
        }
        if (Object.keys(newData).length === 0) {
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'No changes detected',
            })
          );
          setVerification(false);
          return;
        }

        const updatedBeneficiary = await updateBeneficiaryApi(
          beneficiaryToEdit.id,
          newData,
        );

        if (updatedBeneficiary) {
          if (updatedBeneficiary?.meta?.message) {
            dispatch(updateBeneficiaryAccountSlice(updatedBeneficiary));
            dispatch(
              addAllNotification({
                status: Status.SUCCESS,
                message: 'Beneficiary Updated Successfully',
              }),
            );
            setVerification(false);
            setBeneficiaryToEdit(false);
            setNewUserModal(false);
            setFormData(null);
            dispatch(setRefreshBeneficiaryAccounts(true));
          }
          else {
            dispatch(
              addAllNotification({
                status: Status.ERROR,
                message: `${updatedBeneficiary?.error?.message}`,
              }),
            );
          }
        } else {
          throw new Error('Failed to update beneficiary');
        }
      } else if (addVendor) {
        try {
          const previouslyAssignedUserIds =
            selectedBeneficiaryData.user_id || [];
          const currentSelectedUserIds = Array.isArray(data) ? data : [data];

          const addedUserIds = currentSelectedUserIds.filter(
            (id) => !previouslyAssignedUserIds.includes(id),
          );
          const removedUserIds = previouslyAssignedUserIds.filter(
            (id: string) => !currentSelectedUserIds.includes(id),
          );

          let userIdsToSend: string[] = [];
          let message = '';

          if (addedUserIds.length > 0) {
            userIdsToSend = addedUserIds;
            message = 'Vendor(s) assigned successfully.';
          } else if (removedUserIds.length > 0) {
            userIdsToSend = removedUserIds;
            message = 'Vendor(s) removed successfully.';
          } else {
            return;
          }

          const updatedData = {
            user_id: userIdsToSend,
            config_uniquecode: selectedBeneficiaryData.config_uniquecode || [],
          };

          const updatedBeneficiary = await updateBeneficiaryApi(
            selectedBeneficiaryData.acc_no,
            updatedData as Partial<BeneficiaryAccount>,
          );

          if (updatedBeneficiary) {
            dispatch(updateBeneficiaryAccountSlice(updatedBeneficiary));
            dispatch(
              addAllNotification({
                status: Status.SUCCESS,
                message: message,
              })
            );
            setSelectedBeneficiaryData('');
            setAddVendor(false);
            setFormData(null);
            dispatch(setRefreshBeneficiaryAccounts(true));
          } else {
            throw new Error('Failed to update vendors');
          }
        } catch (error) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: `Failed to assign vendors: ${error}`,
            })
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        let addedBeneficiary;
        const updatedConfig = {
          ...data.config,
          role,
        };
        data = {
          ...data,
          config: updatedConfig,
        };
        if (parentTab === 0 && role === Role.ADMIN) {
          addedBeneficiary = await addBeneficiaryApi({
            ...data,
            user_id: data.user_id,
          });
        } else if (role === Role.MERCHANT) {
          addedBeneficiary = await addBeneficiaryApi({
            ...data,
            user_id: data.user_id,
          });
        } else {
          addedBeneficiary = await addBeneficiaryApi(data);
        }
        if (addedBeneficiary?.error?.message) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: `${addedBeneficiary?.error?.message}`,
            })
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'Beneficiary Added Successfully',
            })
          );
          dispatch(addBeneficiaryAccountSlice(addedBeneficiary));
          dispatch(setRefreshBeneficiaryAccounts(true));
          setFormData(null);
          beneficiaryModal();
        }
      }
    } catch (error) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: `${error}`,
        })
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
    setSelectedBeneficiary(null);
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

  const handleRefresh = useCallback(async () => {
    setTabRole(
      role === Role.ADMIN
        ? parentTab === 0
          ? Role.MERCHANT
          : Role.VENDOR
        : role === Role.MERCHANT
        ? Role.MERCHANT
        : Role.VENDOR,
    );

    dispatch(onload());
    dispatch(setRefreshBeneficiaryAccounts(true));
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Data refreshed successfully',
      })
    );
  }, [dispatch, role, parentTab]);
  const handleReset = useCallback(() => {
    setTabRole(
      role && [Role.ADMIN, Role.MERCHANT].includes(role) && parentTab === 0
        ? Role.MERCHANT
        : Role.VENDOR,
    );
    dispatch(onload());
    dispatch(resetPagination());
    setSearchQuery('');
    setDebouncedSearchQuery('');
    // fetchCount();
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully'
      })
    );
  }, [
    dispatch,
    fetchBankAccounts,
  ]);

  const handleNumberChange = (row: any) => {
    setFormData(row);
  };

  const handleVerification = async (passwordData: { password: string }) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      const response = await verifyPassword(passwordData.password);
      setBeneficiaryToEdit(beneficiaryToEdit);
      setVerififed(response);
      beneficiaryModal();
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationDelete = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const passwordVerified = await verifyPassword(passwordData.password);
      if (!passwordVerified) {
        throw new Error('Invalid password');
      }

      if (selectedMerchantIdVerififed) {
        await deleteBeneficiaryApi(selectedMerchantIdVerififed);
      }
      if (selectedMerchantIdVerififed) {
        dispatch(deleteBeneficiaryAccountSlice(selectedMerchantIdVerififed));
      }
      dispatch(setRefreshBeneficiaryAccounts(true));
      setVerificationDelete(false);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const beneficiaryAccounts = async (index: number) => {
  //   const newMethod = index === 0 ? Role.MERCHANT : Role.VENDOR;

  //   // Reset pagination
  //   dispatch(setPagination({ page: 1, limit: pagination?.limit || 10 }));

  //   // Update Redux and local state
  //   dispatch(setParentTab(index));
  //   setTabRole(newMethod);
  //   setSearchQuery('');
  //   setDebouncedSearchQuery('')

  // };

  useEffect(() => {
    if (role === Role.ADMIN) {
      setTabRole(parentTab === 0 ? Role.MERCHANT : Role.VENDOR);
    } else if (role === Role.MERCHANT) {
      {
        setTabRole(Role.MERCHANT);
      }
    } else {
      setTabRole(Role.VENDOR);
    }
  }, [parentTab]);

  const handleUserChange = (event: any) => {
    const selectedUserId = event.target.value;
    setSelectedUserId(selectedUserId);
  };

  const handleToggleClick = async (
    id: string,
    status: boolean,
    type: string,
  ) => {
    // dispatch(onload());
    const payload: Partial<BeneficiaryAccount> = {
      config: {
        [type]: status,
      },
    };
    const beneficiaryUpdate = await updateBeneficiaryApi(id, payload);
    if (beneficiaryUpdate) {
      const beneficiary = allbeneficiaryAccounts?.beneficiaryAccount.find(
        (beneficiary) => beneficiary.id === id,
      );
      if (beneficiary) {
        const data = JSON.parse(JSON.stringify(beneficiary));
        data[type] = status;
        // dispatch(onload());
        dispatch(updateBeneficiaryAccountSlice(data));
        if (beneficiaryUpdate?.error?.message) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message:`${beneficiaryUpdate?.error?.message}`,
            })
          );
          dispatch(setRefreshBeneficiaryAccounts(true));
        }
      }
    }
  };

  let beneficiaryAccountsData: any[] = [];

  beneficiaryAccountsData = allbeneficiaryAccounts?.beneficiaryAccount;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/10 min-h-screen">
      {/* Background gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_24%)]"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-2xl border-white/20 bg-white/10 shrink-0">
              <Lucide
                icon="Wallet"
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                Beneficiary Accounts
              </h1>
              <p className="text-white/60 text-sm hidden sm:block">
                Manage your beneficiary accounts
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2">
            <Modal
              handleModal={beneficiaryModal}
              forOpen={newUserModal}
              buttonTitle={`Add Beneficiary`}
              // className="px-5 py-3 rounded-xl bg-gradient-to-r from-theme-1 via-theme-2 to-emerald-500 text-white font-semibold shadow-lg shadow-theme-2/30 hover:shadow-theme-2/50 transition-all duration-200 flex items-center gap-2"
            >
              <DynamicForm
                sections={
                  role === Role.ADMIN
                    ? parentTab === 0
                      ? BeneficiaryAccountsFormFields(
                          userOptions,
                          role || '',
                          typeOptions,
                          !!beneficiaryToEdit,
                          handleUserChange,
                          selectedUserId,
                        ).MERCHANT_BENEF
                      : BeneficiaryAccountsFormFields(
                          userOptions,
                          role || '',
                          typeOptions,
                          !!beneficiaryToEdit,
                          handleUserChange,
                          selectedUserId,
                        ).VENDOR_BENEF
                    : role === Role.MERCHANT
                    ? BeneficiaryAccountsFormFields(
                        userOptions,
                        role || '',
                        typeOptions,
                        !!beneficiaryToEdit,
                        handleUserChange,
                        selectedUserId,
                      ).MERCHANT_BENEF
                    : BeneficiaryAccountsFormFields(
                        userOptions,
                        role || '',
                        typeOptions,
                        !!beneficiaryToEdit,
                        handleUserChange,
                        selectedUserId,
                      ).VENDOR_BENEF
                }
                onSubmit={handleSubmitData}
                defaultValues={beneficiaryToEdit || {}}
                isEditMode={!!beneficiaryToEdit}
                handleCancel={beneficiaryModal}
                isLoading={isLoading}
              />
            </Modal>
          </div>
        </div>

        {/* Modals */}
        <Modal handleModal={handleCancelDelete} forOpen={deleteModal}>
          <ModalContent
            handleCancelDelete={handleCancelDelete}
            handleConfirmDelete={handleConfirmDelete}
          >
            Are you sure you want to delete this beneficiary?
          </ModalContent>
        </Modal>
        <Modal
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
        </Modal>
        <Modal
          handleModal={() => setVerificationDelete(false)}
          forOpen={verificationDelete}
        >
          <DynamicForm
            sections={VerificationformFields(showPassword)}
            onSubmit={handleVerificationDelete}
            defaultValues={formData || {}}
            isEditMode={true}
            handleCancel={() => setVerificationDelete(false)}
            isLoading={isLoading}
          />
          {errorMessage && (
            <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
          )}
        </Modal>

        {/* Main Content Card */}
        <div className="rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Tab List - Only show for Admin */}
            {role === Role.ADMIN && (
              <Tab.List className="flex border-b border-white/10 bg-white/5">
                <Tab className="relative flex-1">
                  {({ selected }) => (
                    <Tab.Button
                      className={`w-full py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-medium transition-all duration-300 relative ${
                        selected
                          ? 'text-white bg-gradient-to-r from-theme-1/20 via-theme-2/20 to-emerald-500/20 border-b-2 border-theme-1'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      as="button"
                    >
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                        selected 
                          ? 'bg-gradient-to-r from-theme-1 to-theme-2 shadow-lg shadow-theme-1/30' 
                          : 'bg-white/10'
                      }`}>
                        <Lucide 
                          icon="Building2" 
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${selected ? 'text-white' : 'text-white/70'}`} 
                        />
                      </div>
                      <span>Merchant</span>
                      {selected && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-theme-1 via-theme-2 to-emerald-500"></div>
                      )}
                    </Tab.Button>
                  )}
                </Tab>
                <Tab className="relative flex-1">
                  {({ selected }) => (
                    <Tab.Button
                      className={`w-full py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-medium transition-all duration-300 relative ${
                        selected
                          ? 'text-white bg-gradient-to-r from-theme-1/20 via-theme-2/20 to-emerald-500/20 border-b-2 border-theme-1'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      as="button"
                    >
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                        selected 
                          ? 'bg-gradient-to-r from-theme-1 to-theme-2 shadow-lg shadow-theme-1/30' 
                          : 'bg-white/10'
                      }`}>
                        <Lucide 
                          icon="Users" 
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${selected ? 'text-white' : 'text-white/70'}`} 
                        />
                      </div>
                      <span>Vendor</span>
                      {selected && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-theme-1 via-theme-2 to-emerald-500"></div>
                      )}
                    </Tab.Button>
                  )}
                </Tab>
              </Tab.List>
            )}

            {/* Search and Actions Bar */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:items-center sm:flex-row gap-y-3 mb-6">
                <div>
                  <div className="relative">
                    <Lucide
                      icon="Search"
                      className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-white/50"
                    />
                    <FormInput
                      type="text"
                      placeholder="Search Beneficiary..."
                      className="pl-9 sm:w-64 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-theme-1/50 focus:ring-theme-1/30"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Lucide
                        icon="X"
                        className="absolute inset-y-0 right-0 z-10 w-4 h-4 my-auto mr-3 stroke-[1.3] text-white/50 cursor-pointer hover:text-white"
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
                      className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
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
                      className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
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

              {/* Table Section */}
              <div className="overflow-auto xl:overflow-visible">
                {allbeneficiaryAccounts.loading ? (
                  <div className="flex justify-center items-center w-full h-96">
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
                        Role.MERCHANT,
                        Role.MERCHANT_ADMIN,
                        Role.SUB_MERCHANT,
                        Role.MERCHANT_OPERATIONS,
                      ].includes(role)
                        ? Columns.BeneficiaryAccounts_Merchant
                        : role &&
                          [Role.VENDOR, Role.SUB_VENDOR, Role.VENDOR_OPERATIONS].includes(role)
                        ? Columns.BeneficiaryAccounts_Vendor
                        : parentTab === 0
                        ? Columns.BeneficiaryAccounts_Merchant_Admin
                        : Columns.BeneficiaryAccounts_Vendor_Admin
                    }
                    data={{
                      rows: beneficiaryAccountsData,
                      totalCount: allbeneficiaryAccounts.count,
                    }}
                    currentPage={Number(pagination?.page) || 1}
                    pageSize={Number(pagination?.limit) || 10}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    handleNumberChange={handleNumberChange}
                    handleToggleClick={handleToggleClick}
                    source="Beneficiaries"
                    actionMenuItems={(row: any) => {
                      const items: Array<{
                        label: string;
                        icon: 'Pencil' | 'Trash2' | 'Eye' | 'Plus';
                        onClick?: () => void;
                        onMouseEnter?: () => void;
                        hover?: boolean;
                      }> = [];

                      items.push({
                        label: 'Edit',
                        icon: 'Pencil',
                        onClick: () => {
                          setBeneficiaryToEdit(row);
                          setVerification(true);
                        },
                      });
                      if (designation !== Role.TRANSACTIONS) {
                        items.push({
                          label: 'Delete',
                          icon: 'Trash2',
                          onClick: async () => handleDeleteData(row.id),
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
};

export default BeneficiaryAccounts;
