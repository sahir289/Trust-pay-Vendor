/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { FormInput } from '@/components/Base/Form';
import _ from 'lodash';
import { useState, useEffect, useCallback } from 'react';
import Modal from '../../../components/Modal/modals';
import CustomTable from '@/components/TableComponent/CommonTable';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import AssignCountryModal from '@/components/Modal/RestrictMerchant/restrictLocation';
import {
  getRefreshMerchant,
  selectAllMerchants,
} from '@/redux-toolkit/slices/merchants/merchantSelector';
import {
  getMerchantCount,
  getMerchants,
  setRefreshmerchant,
  onload,
} from '@/redux-toolkit/slices/merchants/merchantSlice';
import {
  getAllMerchants,
  updateMerchantData,
  deleteMerchant,
} from '@/redux-toolkit/slices/merchants/merchantAPI';
import { Columns, Role, Status, VerificationformFields } from '@/constants';
import {
  deleteMercHantData,
  updateMerchant,
} from '@/redux-toolkit/slices/merchants/merchantSlice';
import DynamicForm from '@/components/CommonForm';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
import { MerchantformFields } from '@/constants';
import renderObjectData from '@/utils/other-details';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import { verifyPassword } from '@/redux-toolkit/slices/auth/authAPI';
import { Menu } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

const Merchant = () => {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(getPaginationData);
  const refreshMerchant = useAppSelector(getRefreshMerchant);
  const allMerchants = useAppSelector(selectAllMerchants);
  const [merchantConfig, setMerchantConfig] = useState<any | null>();
  // const [region, setRegion] = useState('');
  const [newMerchantModal, setNewMerchantModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [formData, setFormData] = useState<{
    site?: string;
    return?: string;
    payin_notify?: string;
    payout_notify?: string;
  } | null>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(
    null,
  );
  const [data, setData] = useState<{
    site?: string;
    return?: string;
    payin_notify?: string;
    payout_notify?: string;
  } | null>(null);
  const [verificationDelete, setVerificationDelete] = useState(false);
  const [showPassword] = useState(false);
  const [selectedMerchantIdVerififed, setSelectedMerchantIdVerififed] =
    useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showAllDataModal, setShowAllDataModal] = useState<boolean>(false);
  const [showAllData, setShowAllData] = useState<{ [key: string]: any }>({});
  const [verificationModal, setVerificationModal] = useState(false);
  const [merchantToUpdate, setMerchantToUpdate] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // New state for Assign Restrict modal
  const [restrictModal, setRestrictModal] = useState(false);
  const [restrictMerchantId, setRestrictMerchantId] = useState<any>(
    null
  );

  const userData = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  let designation: RoleType | null = null;

  if (userData) {
    const parsedData = JSON.parse(userData);
    role = parsedData.role;
    designation = parsedData.designation;
  }

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchMerchants = useCallback(
    async (query?: string) => {
      const queryString = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        ...(query && { search: query }),
      }).toString();

      dispatch(onload());
      let response = await getAllMerchants(queryString);
      dispatch(getMerchants(response.merchants));
     dispatch(getMerchantCount(response.totalCount));
    },
    [pagination?.page, pagination?.limit, dispatch],
  );

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchMerchants(debouncedSearchQuery);
    } else {
      fetchMerchants();
    }
  }, [
    pagination?.page,
    pagination?.limit,
    debouncedSearchQuery,
    fetchMerchants,
  ]);

  useEffect(() => {
    if (refreshMerchant) {
      fetchMerchants();
      dispatch(setRefreshmerchant(false));
    }
  }, [refreshMerchant, fetchMerchants, dispatch]);

  const handleRowClick = (index: number): void => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const handleEditModal = (data: any) => {
    const { config, ...cleanedData } = data;
    setFormData({
      ...cleanedData,
      site: data?.config?.urls?.site || '',
      payout_notify: data?.config?.urls?.payout_notify || '',
      payin_notify: data?.config?.urls?.payin_notify || '',
      return: data?.config?.urls?.return || '',
      allow_intent: data?.config?.allow_intent || false,
      allow_clickrr: data?.config?.allow_clickrr || false,
      allow_payout: data?.config?.allow_payout || false,
      whitelist_ips: data?.config?.whitelist_ips || '',
      clickrr_auto_approval_limit: data?.config?.clickrr_auto_approval_limit || 0,
    });
    setMerchantToUpdate(data);
    setNewMerchantModal(true);
  };

  const handleSubmitData = async (data: any) => {
    setErrorMessage('');
    setData(data);
    setNewMerchantModal(false);
    setVerificationModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedMerchantId) {
      setSelectedMerchantIdVerififed(selectedMerchantId);
      setVerificationDelete(true);
      setDeleteModal(false);
    }
    setDeleteModal(false);
    setSelectedMerchantId(null);
  };

  const handleCancelDelete = () => {
    setDeleteModal(false);
    setSelectedMerchantId(null);
  };

  const handleCancelRowData = () => {
    setShowAllDataModal(!showAllDataModal);
  };

  const handleShowAllData = (row: any) => {
    setShowAllDataModal(!showAllDataModal);
    setShowAllData(row);
  };

  const handledeleteData = async (id: string) => {
    setSelectedMerchantId(id);
    setDeleteModal(true);
  };

  const handleVerifyAndUpdate = async (passwordData: { password: string }) => {
    setIsLoading(true);
    try {
      setErrorMessage('');
      await verifyPassword(passwordData?.password);
      const newData = getUpdatedFields(formData, data);
      const keysToCheckinConfig = ['allow_intent', 'allow_payout', 'allow_clickrr', 'clickrr_auto_approval_limit'];
      const keysToCheckinUrls = [
        'site',
        'return',
        'payin_notify',
        'payout_notify',
      ];
      type ConfigType = {
        urls: { [key: string]: string };
        [key: string]: any;
      };

      let config: ConfigType = { urls: {} };

      keysToCheckinUrls.forEach((key) => {
        if (newData[key] !== undefined) {
          config.urls[key] = newData[key];
        }
      });

      keysToCheckinConfig.forEach((key) => {
        if (newData[key] !== undefined) {
          config[key] = newData[key];
        }
      });

      const cleanedData = { ...newData };
      keysToCheckinUrls.forEach((key) => {
        if (key in cleanedData) {
          delete cleanedData[key];
        }
      });
      keysToCheckinConfig.forEach((key) => {
        if (key in cleanedData) {
          delete cleanedData[key];
        }
      });

      const updatedData = { ...cleanedData, config };
      const updatedMerchant = await updateMerchantData(
        merchantToUpdate.id,
        updatedData,
      );
      if (updatedMerchant && !(updatedMerchant.error && updatedMerchant.error.message)) {
        dispatch(updateMerchant(updatedMerchant));
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Merchant Updated Successfully',
          }),
        );
        setVerificationModal(false);
        setMerchantToUpdate(null);
        setFormData(null);
        dispatch(setRefreshmerchant(true));
        return;
      }
      else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: (updatedMerchant?.error && typeof updatedMerchant.error === 'object' && 'message' in updatedMerchant.error
              ? (updatedMerchant.error as { message?: string }).message
              : undefined) || 'An error occurred while updating the merchant.',
          }),
        );
        setVerificationModal(false);
        setMerchantToUpdate(null);
        setFormData(null);
        return;
      }
    } catch {
      setErrorMessage('Invalid password. Please try again.');
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

  const handleVerificationdelete = async (passwordData: {
    password: string;
  }) => {
    setIsLoading(true);
    try {
      await verifyPassword(passwordData.password);
      if (selectedMerchantIdVerififed) {
        const deleted = await deleteMerchant(selectedMerchantIdVerififed);
        if (deleted) {
          dispatch(deleteMercHantData(deleted.id));
        } else {
          throw new Error('Failed to delete merchant');
        }
      } else {
        throw new Error('Merchant ID is null');
      }
      dispatch(setRefreshmerchant(true));
      setVerificationDelete(false);
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    dispatch(onload());
    await fetchMerchants(searchQuery.trim());
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Merchants refreshed successfully',
      }),
    );
  }, [dispatch, fetchMerchants, searchQuery]);

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
  }, [dispatch]);
  // Handle Assign Restrict modal
  const handleRestrictModal = (data?: any) => {
    // console.log(data.unblocked_countries);
    setRestrictMerchantId(data.config.unblocked_countries);
    setMerchantConfig(data);
    setRestrictModal(true);
  };

  const handleCancelRestrict = () => {
    setRestrictModal(false);
    setRestrictMerchantId(null);
  };

const handleSubmitRestrict = async (data:any) => {
    setIsLoading(true);
  try {
    let config = merchantConfig?.config;
    config = {
      ...config,
      unblocked_countries: data,
    }
    await updateMerchantData(
      merchantConfig?.id,
      {config: config},
    );
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: `Successfully UnRestricted Location for Merchant`,
        }),
      );
      setRestrictModal(false);
      setRestrictMerchantId(null);
      dispatch(setRefreshmerchant(true));
    } catch {
      setErrorMessage('Failed to restrict location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
          <Modal
            handleModal={() => setNewMerchantModal(false)}
            forOpen={newMerchantModal}
          >
            <DynamicForm
              sections={MerchantformFields(formData ? true : false)}
              onSubmit={handleSubmitData}
              defaultValues={formData || {}}
              isEditMode={formData ? true : false}
              handleCancel={() => setNewMerchantModal(false)}
              isLoading={isLoading}
            />
          </Modal>
          <Modal handleModal={handleCancelDelete} forOpen={deleteModal}>
            <ModalContent
              handleCancelDelete={handleCancelDelete}
              handleConfirmDelete={handleConfirmDelete}
            >
              Are you sure you want to delete this merchant?
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
          <Modal
            handleModal={() => setVerificationModal(false)}
            forOpen={verificationModal}
          >
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handleVerifyAndUpdate}
              defaultValues={formData || {}}
              isEditMode={true}
              handleCancel={() => setVerificationModal(false)}
              isLoading={isLoading}
            />
            {errorMessage && (
              <div className="mt-2 text-red-500">{errorMessage}</div>
            )}
          </Modal>
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
          <AssignCountryModal
            forOpen={restrictModal}
            handleModal={handleCancelRestrict}
            defaultAssignments={restrictMerchantId}
            onSubmit={handleSubmitRestrict}
            onCancel={handleCancelRestrict}
            isLoading={isLoading} title={''}          />
        </div>
        <div className="flex flex-col gap-8 mt-3.5">
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
                    placeholder="Search Merchants..."
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
              {/* <div>
                <CountryDropdown
                  value={country}
                  onChange={(val) => setCountry(val)}
                  className="border rounded p-2"
                />
                <RegionDropdown
                  country={country}
                  value={region}
                  onChange={(val) => setRegion(val)}
                  className="border rounded p-2 mt-2"
                  disableWhenEmpty
                />
              </div> */}
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
              </div>
            </div>
            {allMerchants.loading ? (
              <div className="flex justify-center items-center w-full h-screen">
                <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
              </div>
            ) : (
              <CustomTable
                columns={
                  role &&
                  designation !== Role.ADMIN &&
                  [
                    Role.MERCHANT,
                    Role.ADMIN,
                    Role.MERCHANT_ADMIN,
                    Role.SUB_MERCHANT,
                    Role.MERCHANT_OPERATIONS,
                  ].includes(role)
                    ? Columns.MERCHANTS
                    : Columns.MERCHANTS_ALL
                }
                data={{
                  rows: allMerchants.merchants,
                  totalCount: allMerchants.count,
                }}
                expandedRow={expandedRow}
                handleRowClick={handleRowClick}
                handleEditModal={handleEditModal}
                handleDeleteData={handledeleteData}
                handleShowAllData={handleShowAllData}
                actionMenuItems={(row: any) =>
                  role === Role.ADMIN
                    ? [
                        {
                          label: 'Edit',
                          icon: 'Pencil',
                          onClick: () => handleEditModal(row),
                        },
                        {
                          label: 'Delete',
                          icon: 'Trash2',
                          onClick: async () => handledeleteData(row.id),
                        },
                        {
                          label: 'Unrestrict', 
                          icon: 'Unlock', 
                          onClick: () => handleRestrictModal(row),
                        },
                      ]
                    : []
                }
                expandedRowKey="subMerchants"
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
  );
};

export default Merchant;
