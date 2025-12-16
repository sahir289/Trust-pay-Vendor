/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Lucide from '@/components/Base/Lucide';
import { FormInput } from '@/components/Base/Form';
import CustomTable from '@/components/TableComponent/CommonTable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import {
  deleteVendorSlice,
  getVendorCount,
  getVendorsSlice,
  onload,
  setRefreshvendor,
  updateVendorSlice,
} from '@/redux-toolkit/slices/vendor/vendorSlice';
import {
  getRefreshVendor,
  selectVendors,
} from '@/redux-toolkit/slices/vendor/vendorSelectors';
import {
  deleteVendor,
  getAllVendor,
  updateVendor,
  getAllVendorCodes,
  linkVendor,
  unLinkVendor,
  transferVendor,
} from '@/redux-toolkit/slices/vendor/vendorAPI';
import Modal from '@/components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
import {
  Columns,
  Role,
  Status,
  VendorformFields,
  VerificationformFields,
  LinkformFields,
  TransferformFields,
  UnlinkformFields,
} from '@/constants';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { NotificationElement } from '@/components/Base/Notification';
import { verifyPassword } from '@/redux-toolkit/slices/auth/authAPI';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
import { Menu } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';
import renderObjectData from '@/utils/other-details';

export interface Vendor {
  sno: number;
  code: string;
  vendor_commission: number;
  created_date: string;
  created_by: string;
  status: string;
  action: string;
  id: string;
  updated_at: string;
}

function Main() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState(null);
  const [newVendorModal, setNewVendorModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const refreshVendor = useAppSelector(getRefreshVendor);
  const basicNonStickyNotification = useRef<NotificationElement>();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [verification, setVerification] = useState(false);
  const [verificationDelete, setVerificationDelete] = useState(false);
  const allvendor = useAppSelector(selectVendors);
  const [vendorToEdit, setVendorToEdit] = useState<any>(null);
  const [isEditFromExpandedRow, setIsEditFromExpandedRow] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword] = useState(false);
  const [selectedVendorIdVerififed, setSelectedVendorIdVerififed] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Added search state
  const pagination = useAppSelector(getPaginationData);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showAllDataModal, setShowAllDataModal] = useState<boolean>(false);
  const [showAllData, setShowAllData] = useState<{ [key: string]: any }>({});
  const [linkModal, setLinkModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [unlinkModal, setUnlinkModal] = useState(false);
  const [selectedVendorForAction, setSelectedVendorForAction] =
    useState<any>(null);
  const [linkFormData, setLinkFormData] = useState<any>(null);
  const [transferFormData, setTransferFormData] = useState<any>(null);
  const [unlinkFormData, setUnlinkFormData] = useState<any>(null);
  const [availableParentVendors, setAvailableParentVendors] = useState<any[]>(
    [],
  );
  const [isLoadingParentVendors, setIsLoadingParentVendors] = useState(false);
  const [verificationLink, setVerificationLink] = useState(false);
  const [verificationTransfer, setVerificationTransfer] = useState(false);
  const [verificationUnlink, setVerificationUnlink] = useState(false);

  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  let designation: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
    designation = parsedData.designation;
  }

  const fetchVendors = useCallback(
    async (query?: string) => {
      const queryString = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        ...(query && { search: query }),
      }).toString();
      dispatch(onload());
      let response = await getAllVendor(queryString);
      dispatch(getVendorsSlice(response.data.Vendors));
      dispatch(getVendorCount(response.data.totalCount));
    },
    [pagination?.page, pagination?.limit, dispatch],
  );

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchVendors(debouncedSearchQuery);
    } else {
      fetchVendors();
    }
    dispatch(setRefreshvendor(false));
  }, [refreshVendor]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchVendors(debouncedSearchQuery);
    } else {
      fetchVendors();
    }
  }, [pagination?.page, pagination?.limit, debouncedSearchQuery, fetchVendors]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const vendorModal = () => {
    setNewVendorModal(false);
    setVerification(false);
  };

  const handleVerificationdelete = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      await verifyPassword(passwordData.password);
      if (selectedVendorIdVerififed) {
        const deleted = await deleteVendor(selectedVendorIdVerififed);
        if (deleted) {
          dispatch(deleteVendorSlice(deleted.id));
        } else {
          throw new Error('Failed to delete vendor');
        }
      } else {
        throw new Error('Vendor ID is null');
      }
      dispatch(setRefreshvendor(true));
      setVerificationDelete(false);
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: 'Vendor Deleted Successfully',
        }),
      );
      basicNonStickyNotification.current?.showToast();
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationLink = async (passwordData: { password: string }) => {
    setIsLoading(true);
    try {
      await verifyPassword(passwordData.password);
      if (linkFormData && selectedVendorForAction) {
        // Build the payload for linking
        const payload = {
          vendorUserId: linkFormData.target_vendor_id, // vendor to link to (from form)
          subVendorUserId: selectedVendorForAction.user_id, // vendor being linked (row)
          mediator_payin_commission: linkFormData.mediator_payin_commission || 0,
          mediator_payout_commission: linkFormData.mediator_payout_commission || 0,
        };
        const result = await linkVendor(payload);
        if (result.data) {
          dispatch(setRefreshvendor(true));
          setVerificationLink(false);
          setLinkFormData(null);
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'Vendor linked successfully',
            }),
          );
          setVerificationLink(false);
        } else if (result.error) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: result.error.message,
            }),
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'Failed to link vendor',
            }),
          );
        }
        basicNonStickyNotification.current?.showToast();
      }
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationTransfer = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      await verifyPassword(passwordData.password);
      // Use transferFormData for the actual API call
      if (transferFormData && selectedVendorForAction) {
        // Build the payload for transferring
        const payload = {
          subVendorUserId: transferFormData.subvendor_id, // vendor to transfer from (from form)
          newVendorUserId: transferFormData.new_parent_vendor_id, // vendor to transfer to (from form)
          currentVendorUserId: selectedVendorForAction.user_id, // vendor being transferred (row)
        };
        const result = await transferVendor(payload);
        if (result.data) {
          dispatch(setRefreshvendor(true));
          setVerificationLink(false);
          setLinkFormData(null);
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'Vendor transferred successfully',
            }),
          );
          setVerificationTransfer(false);
        } else if (result.error) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: result.error.message,
            }),
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'Failed to transfer vendor',
            }),
          );
        }
        basicNonStickyNotification.current?.showToast();
      }
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationUnlink = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      await verifyPassword(passwordData.password);
      // Use unlinkFormData for the actual API call
      if (unlinkFormData && selectedVendorForAction) {
        // Build the payload for unlinking
        const payload = {
          subVendorUserId: unlinkFormData.subvendor_id, // vendor to unlink from (from form)
          vendorUserId: selectedVendorForAction.user_id, // vendor being unlinked (row)
        };
        const result = await unLinkVendor(payload);
        if (result.data) {
          dispatch(setRefreshvendor(true));
          setVerificationLink(false);
          setLinkFormData(null);
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: 'Vendor unlinked successfully',
            }),
          );
          setVerificationUnlink(false);
        } else if (result.error) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: result.error.message,
            }),
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'Failed to unlink vendor',
            }),
          );
        }
        basicNonStickyNotification.current?.showToast();
      }
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedVendorId) {
      setSelectedVendorIdVerififed(selectedVendorId);
      setVerificationDelete(true);
      setDeleteModal(false);
    }
    setDeleteModal(false);
  };

  const handleSubmitLink = async (data: any) => {
    setLinkFormData(data);
    setVerificationLink(true);
    setLinkModal(false);
  };

  const handleSubmitTransfer = async (data: any) => {
    setTransferFormData(data);
    setVerificationTransfer(true);
    setTransferModal(false);
  };

  const handleSubmitUnlink = async (data: any) => {
    setUnlinkFormData(data);
    setVerificationUnlink(true);
    setUnlinkModal(false);
  };

  const handleVerification = async (passwordData: { password: string }) => {
    setIsLoading(true);
    try {
      await verifyPassword(passwordData.password);
      const newData = getUpdatedFields(vendorToEdit, formData);

      // Prepare the complete config object with updated values
      const updatedConfig = {
        // Preserve any existing config properties from the original vendor data
        ...vendorToEdit.config,
        // Update specific config values from form data
        bank_response_access:
          newData.bank_response_access !== undefined
            ? newData.bank_response_access
            : vendorToEdit.config?.bank_response_access || false,
        net_balance:
          newData.net_balance !== undefined
            ? newData.net_balance === '0' ||
              newData.net_balance === 0 ||
              !newData.net_balance ||
              newData.net_balance === 'null'
              ? null
              : newData.net_balance
            : vendorToEdit.config?.net_balance || null,
        is_owned:
          newData.is_owned !== undefined
            ? newData.is_owned
            : vendorToEdit.config?.is_owned || false,
        is_enabled:
          newData.is_enabled !== undefined
            ? newData.is_enabled
            : vendorToEdit.config?.is_enabled || false,
        mediator_payin_commission:
          newData.mediator_payin_commission !== undefined
            ? newData.mediator_payin_commission === '0' ||
              newData.mediator_payin_commission === 0 ||
              !newData.mediator_payin_commission ||
              newData.mediator_payin_commission === 'null'
              ? null
              : newData.mediator_payin_commission
            : vendorToEdit.config?.mediator_payin_commission || null,
        mediator_payout_commission:
          newData.mediator_payout_commission !== undefined
            ? newData.mediator_payout_commission === '0' ||
              newData.mediator_payout_commission === 0 ||
              !newData.mediator_payout_commission ||
              newData.mediator_payout_commission === 'null'
              ? null
              : newData.mediator_payout_commission
            : vendorToEdit.config?.mediator_payout_commission || null,
      };

      // Remove config-related fields from the main data object
      const apiData = { ...newData };
      delete apiData.bank_response_access;
      delete apiData.net_balance;
      delete apiData.config;
      delete apiData.is_owned;
      delete apiData.is_enabled;
      delete apiData.mediator_payin_commission;
      delete apiData.mediator_payout_commission;

      // Prepare final API payload with complete config
      const finalApiData = {
        ...apiData,
        config: updatedConfig,
      };

      const updatedVendorData = await updateVendor(
        vendorToEdit.id,
        finalApiData,
      );
      dispatch(updateVendorSlice(updatedVendorData));
      if (updatedVendorData.error.message) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: updatedVendorData.error.message
          
          }),
        );
      }
      else {
        dispatch(setRefreshvendor(true));
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Vendor Updated Successfully',
          }),
        );
      }
      basicNonStickyNotification.current?.showToast();
      setVerification(false);
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModal = (data: any, isFromExpandedRow: boolean = false) => {
    const { config, ...cleanedData } = data;
    setVendorToEdit({
      ...cleanedData,
      // Preserve the original config object
      config: config || {},
      // Also add these fields to the top level for form compatibility
      bank_response_access: config?.bank_response_access || false,
      enabled : config?.is_enabled || false,
      net_balance: config?.net_balance || '0',
      is_owned: config?.is_owned || false,
      mediator_payin_commission: config?.mediator_payin_commission || '0',
      mediator_payout_commission: config?.mediator_payout_commission || '0',
    });
    setIsEditFromExpandedRow(isFromExpandedRow);
    setNewVendorModal(true);
  };

  const handleEditModalFromExpanded = (data: any) => {
    handleEditModal(data, true);
  };

  const handleRowClick = (index: number): void => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const handleCancelRowData = () => {
    setShowAllDataModal(!showAllDataModal);
  };

  const handleShowAllData = (row: any) => {
    setShowAllDataModal(!showAllDataModal);
    setShowAllData(row);
  };
  // const fetchCount = async () => {
  //   const getCountData = await getCount('Vendor');
  //   dispatch(getVendorCount(getCountData.count));
  // };
  // useEffect(() => {
  //   fetchCount();
  // }, [dispatch]);

  const handleCancelDelete = () => {
    setSelectedVendorId(null);
    setVerificationDelete(false);
    setErrorMessage(null);
    setDeleteModal(false);
  };

  const handleLinkModal = (vendor: any) => {
    setSelectedVendorForAction(vendor);
    setLinkModal(true);
  };

  const handleTransferModal = (vendor: any) => {
    setSelectedVendorForAction(vendor);
    setTransferModal(true);
  };

  const handleUnlinkModal = (vendor: any) => {
    setSelectedVendorForAction(vendor);
    setUnlinkModal(true);
  };

  const handledeleteData = async (user_id: string) => {
    setSelectedVendorId(user_id);
    setDeleteModal(true);
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

  const fetchAvailableParentVendors = useCallback(async () => {
    setIsLoadingParentVendors(true);
    try {
      // Get all vendors and filter client-side to avoid API issues
      const vendors = await getAllVendorCodes(false,false,false,false,true);
      // Exclude the current vendor from parent options
      const filteredVendors = selectedVendorForAction
        ? vendors.filter(
            (vendor: any) => vendor.value !== selectedVendorForAction.user_id,
          )
        : vendors;
      // Filter for parent vendors (those without sub-vendors)
      const parentVendors = filteredVendors.map((vendor: any) => ({
        ...vendor,
        label:
          vendor && typeof vendor.label === 'string' && vendor.label.trim()
            ? vendor.label.trim()
            : '',
        value:
          vendor && typeof vendor.value === 'string' && vendor.value.trim()
            ? vendor.value.trim()
            : '',
      }));
      setAvailableParentVendors(parentVendors);
    } catch {
      setAvailableParentVendors([]);
    } finally {
      setIsLoadingParentVendors(false);
    }
  }, [selectedVendorForAction]);

  useEffect(() => {
    if (linkModal) {
      fetchAvailableParentVendors();
    }
  }, [linkModal, fetchAvailableParentVendors]);

  useEffect(() => {
    if (transferModal) {
      fetchAvailableParentVendors();
    }
  }, [transferModal, fetchAvailableParentVendors]);

  useEffect(() => {
    dispatch(resetPagination());
  }, [dispatch]);

  const handleSubmitData = async (data: any) => {
    setErrorMessage('');
    setFormData(data);
    setVerification(true);
    setNewVendorModal(false);
  };
  const handleRefresh = useCallback(() => {
    dispatch(onload());
    // remove page reset on refresh
    // dispatch(resetPagination()); // optional
    fetchVendors(searchQuery.trim());
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Vendors refreshed successfully',
      }),
    );
  }, [dispatch, fetchVendors, searchQuery]);

  const handleReset = useCallback(async () => {
    // dispatch(onload());
    dispatch(resetPagination());
    setSearchQuery('');
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'All filters reset successfully',
      }),
    );
    // fetchCount();
  }, [dispatch]);

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
                icon="Users"
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                Vendors
              </h1>
              <p className="text-white/60 text-sm hidden sm:block">
                Manage vendor accounts and settings
              </p>
            </div>
          </div>
        </div>

        {/* All Modals */}
        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
          <Modal
            handleModal={() => {
              setNewVendorModal(false);
              setIsEditFromExpandedRow(false);
            }}
            forOpen={newVendorModal}
          >
            <DynamicForm
              sections={VendorformFields(
                vendorToEdit ? true : false,
                isEditFromExpandedRow
                  ? Role.SUB_VENDOR
                  : vendorToEdit?.designation_name,
                isEditFromExpandedRow,
                role ? role : undefined,
              )}
              onSubmit={(data: Record<string, any>) => handleSubmitData(data)}
              defaultValues={vendorToEdit || {}}
              isEditMode={vendorToEdit ? true : false}
              handleCancel={() => {
                setNewVendorModal(false);
                setIsEditFromExpandedRow(false);
              }}
              isLoading={isLoading}
            />
          </Modal>

          <Modal handleModal={() => setDeleteModal(true)} forOpen={deleteModal}>
            <ModalContent
              handleCancelDelete={() => setDeleteModal(false)}
              handleConfirmDelete={handleConfirmDelete}
            >
              Are you sure you want to delete this vendor?
            </ModalContent>
          </Modal>

          <Modal handleModal={handleCancelRowData} forOpen={showAllDataModal}>
            <ModalContent handleCancelDelete={handleCancelRowData}>
              {showAllData && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Details
                  </h2>
                  {renderObjectData(showAllData)}
                </>
              )}
            </ModalContent>
          </Modal>

          <Modal handleModal={vendorModal} forOpen={verification}>
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handleVerification}
              defaultValues={formData || {}}
              isEditMode={formData ? true : false}
              handleCancel={vendorModal}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>

          <Modal handleModal={handleCancelDelete} forOpen={verificationDelete}>
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handleVerificationdelete}
              defaultValues={formData || {}}
              isEditMode={true}
              handleCancel={handleCancelDelete}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>

          {/* Link Verification Modal */}
          <Modal
            handleModal={() => setVerificationLink(false)}
            forOpen={verificationLink}
          >
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handleVerificationLink}
              defaultValues={{}}
              isEditMode={false}
              handleCancel={() => setVerificationLink(false)}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>

          {/* Transfer Verification Modal */}
          <Modal
            handleModal={() => setVerificationTransfer(false)}
            forOpen={verificationTransfer}
          >
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handleVerificationTransfer}
              defaultValues={{}}
              isEditMode={false}
              handleCancel={() => setVerificationTransfer(false)}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>

          {/* Unlink Verification Modal */}
          <Modal
            handleModal={() => setVerificationUnlink(false)}
            forOpen={verificationUnlink}
          >
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handleVerificationUnlink}
              defaultValues={{}}
              isEditMode={false}
              handleCancel={() => setVerificationUnlink(false)}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>

          {/* Link Modal */}
          <Modal handleModal={() => setLinkModal(false)} forOpen={linkModal}>
            <DynamicForm
              sections={LinkformFields(availableParentVendors)}
              onSubmit={(data: Record<string, any>) => handleSubmitLink(data)}
              defaultValues={{}}
              isEditMode={false}
              handleCancel={() => setLinkModal(false)}
              isLoading={isLoading || isLoadingParentVendors}
            />
          </Modal>

          {/* Transfer Modal */}
          <Modal
            handleModal={() => setTransferModal(false)}
            forOpen={transferModal}
          >
            <DynamicForm
              sections={TransferformFields(
                selectedVendorForAction?.subVendors || [],
                availableParentVendors,
              )}
              onSubmit={(data: Record<string, any>) =>
                handleSubmitTransfer(data)
              }
              defaultValues={{}}
              isEditMode={false}
              handleCancel={() => setTransferModal(false)}
              isLoading={isLoading || isLoadingParentVendors}
            />
          </Modal>

          {/* Unlink Modal */}
          <Modal
            handleModal={() => setUnlinkModal(false)}
            forOpen={unlinkModal}
          >
            <DynamicForm
              sections={UnlinkformFields(
                selectedVendorForAction?.subVendors || [],
              )}
              onSubmit={(data: Record<string, any>) => handleSubmitUnlink(data)}
              defaultValues={{}}
              isEditMode={false}
              handleCancel={() => setUnlinkModal(false)}
              isLoading={isLoading || isLoadingParentVendors}
            />
          </Modal>
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Search and Actions Bar */}
            <div className="flex flex-col sm:items-center sm:flex-row gap-y-3 mb-6">
              <div>
                <div className="relative">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-white/50"
                  />
                  <FormInput
                    type="text"
                    placeholder="Search vendors..."
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
              {allvendor.loading ? (
                <div className="flex justify-center items-center w-full h-96">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CustomTable
                  columns={
                    role &&
                    designation !== Role.ADMIN &&
                    [
                      Role.VENDOR,
                      Role.VENDOR_ADMIN,
                      Role.SUB_VENDOR,
                      Role.VENDOR_OPERATIONS,
                      Role.ADMIN,
                    ].includes(role)
                      ? Columns.VENDOR
                      : Columns.VENDOR_ALL
                  }
                  data={{
                    rows: allvendor.vendors,
                    totalCount: allvendor.count,
                  }}
                  expandedRow={expandedRow}
                  handleRowClick={handleRowClick}
                  handleShowAllData={handleShowAllData}
                  expandedRowKey="subVendors"
                  currentPage={Number(pagination?.page) || 1}
                  pageSize={Number(pagination?.limit) || 10}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  source="Vendors"
                  actionMenuItems={(row: any) => {
                    if (role !== Role.ADMIN) return [];
                    const isSingleVendor =
                      (!row.subVendors || row.subVendors.length === 0) &&
                      !row.parentVendorId;
                    const actions = [
                      {
                        label: 'Edit',
                        icon: 'Pencil' as const,
                        onClick: () => handleEditModal(row),
                      },
                      ...(isSingleVendor &&
                      row.designation_name !== Role.SUB_VENDOR &&
                      row.designation_name !== Role.VENDOR_ADMIN
                        ? [
                            {
                              label: 'Link',
                              icon: 'Link2' as const,
                              onClick: () => handleLinkModal(row),
                            },
                          ]
                        : []),
                      ...(!isSingleVendor
                        ? [
                            {
                              label: 'Transfer',
                              icon: 'Repeat' as const,
                              onClick: () => handleTransferModal(row),
                            },
                            {
                              label: 'Unlink',
                              icon: 'Unlink2' as const,
                              onClick: () => handleUnlinkModal(row),
                            },
                          ]
                        : []),
                      {
                        label: 'Delete',
                        icon: 'Trash2' as const,
                        onClick: async () => handledeleteData(row.user_id),
                      },
                    ];
                    return actions;
                  }}
                  expandedActionMenuItems={(row: any) => {
                    if (role !== Role.ADMIN) return [];
                    const actions = [
                      {
                        label: 'Edit',
                        icon: 'Pencil' as const,
                        onClick: () => handleEditModalFromExpanded(row),
                      },
                      {
                        label: 'Delete',
                        icon: 'Trash2' as const,
                        onClick: async () => handledeleteData(row.user_id),
                      },
                    ];
                    return actions;
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

export default Main;
