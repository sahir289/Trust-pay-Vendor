/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Lucide from '@/components/Base/Lucide';
import { FormInput } from '@/components/Base/Form';
import Modal from '../../components/Modal/modals';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CustomTable from '@/components/TableComponent/CommonTable';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import {
  createUser,
  getAllUsers,
  updateUser,
} from '@/redux-toolkit/slices/user/userAPI';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
import {
  addUser,
  getUserCount,
  getUsers,
  onload,
  setRefreshUser,
  updateUser as updateUserDispatch,
} from '@/redux-toolkit/slices/user/userSlice';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import {
  getRefreshUser,
  selectAllUsers,
} from '@/redux-toolkit/slices/user/userSelectors';
import LoadingIcon from '@/components/Base/LoadingIcon';
import DynamicForm from '../../components/CommonForm';
import {
  Columns,
  getUserFormFields,
  Role,
  Status,
  VerificationformFields,
  emailFormFields,
} from '@/constants';
import { getAllRoles } from '@/redux-toolkit/slices/roles/roleAPI';
import { Role as roleType } from '@/redux-toolkit/slices/roles/roleTypes';
import { getAllDesignations } from '@/redux-toolkit/slices/designations/designationAPI';
import { Designation } from '@/redux-toolkit/slices/designations/designationTypes';
// import { getCount } from '@/redux-toolkit/slices/common/apis/commonAPI';
import {
  setPagination,
  resetPagination,
} from '@/redux-toolkit/slices/common/params/paramsSlice';
import Notification, {
  NotificationElement,
} from '@/components/Base/Notification';
import { Menu } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import {
  getAllMerchantByCode,
  getAllMerchantCodes,
} from '@/redux-toolkit/slices/merchants/merchantAPI';
import {
  getAllVendorByCode,
  getAllVendorCodes,
} from '@/redux-toolkit/slices/vendor/vendorAPI';
import { verifyPassword } from '@/redux-toolkit/slices/auth/authAPI';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const refreshUser = useAppSelector(getRefreshUser);
  const pagination = useAppSelector(getPaginationData);
  const allUsers = useAppSelector(selectAllUsers);
  const [newUserModal, setNewUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [roles, setRoles] = useState<roleType[]>([]);
  const [designation, setDesignation] = useState<Designation[]>([]);
  const basicNonStickyNotification = useRef<NotificationElement>();
  const [filteredDesignations, setFilteredDesignations] = useState<any>([]);
  const [selectedRoleLabel, setSelectedRoleLabel] = useState<string>('');
  const [selectedDesignationLabel, setSelectedDesignationLabel] =
    useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(
    null,
  );
  const [showPassword] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [editVerification, setEditVerification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [merchantCodes, setMerchantCodes] = useState<any[]>([]);
  const [vendorCodes, setVendorCodes] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [maxPayInCommission, setMaxPayInCommission] = useState<number>(0);
  const [maxPayOutCommission, setMaxPayOutCommission] = useState<number>(0);
  const [toggleData, setToggleData] = useState<{
    id: string;
    status: boolean;
    type: string;
  } | null>(null);
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  interface UserData {
    role: RoleType | null;
    [key: string]: any;
  }

  let parsedData: UserData | undefined;
  if (data) {
    parsedData = JSON.parse(data) as UserData;
    role = parsedData.role;
  }

  const handleRoleChange = (event: any) => {
    const selectedRoleId = event.target.value;
    const selectedRole = roles.find((role) => role.id === selectedRoleId);

    setSelectedRoleLabel(selectedRole?.role ?? '');
    setSelectedDesignationLabel('');
    if (!selectedRoleId) {
      setFilteredDesignations([]);
      return;
    }

    const relatedDesignations = designation.filter(
      (d) => d.role_id === selectedRoleId,
    );

    const filteredDesignations = relatedDesignations.reduce<
      { label: string | null; value: string | null }[]
    >((acc, d) => {
      if (
        d.designation !== parsedData?.designation &&
        !(
          (d.designation === Role.MERCHANT &&
            parsedData?.designation === Role.SUB_MERCHANT) ||
          (d.designation === Role.VENDOR &&
            parsedData?.designation === Role.SUB_VENDOR) ||
          (d.designation === Role.SUB_VENDOR &&
            parsedData?.designation === Role.VENDOR)
        ) &&
        !(d.designation === Role.SUPER_ADMIN) &&
        !(
          d.designation === Role.VENDOR_ADMIN &&
          parsedData?.designation === Role.SUB_VENDOR
        ) &&
        ((parsedData?.designation !== Role.VENDOR &&
          parsedData?.designation !== Role.VENDOR_ADMIN) ||
          (parsedData?.designation === Role.VENDOR &&
            d.designation === Role.VENDOR_OPERATIONS) ||
          (parsedData?.designation === Role.VENDOR_ADMIN &&
            (d.designation === Role.SUB_VENDOR ||
              d.designation === Role.VENDOR_OPERATIONS))) &&
        (parsedData?.designation !== Role.SUB_VENDOR ||
          d.designation === Role.VENDOR_OPERATIONS)
      ) {
        acc.push({ label: d.designation, value: d.id });
      }
      return acc;
    }, []);

    setFilteredDesignations(filteredDesignations);
  };

  const handleDesignationChange = async (event: any) => {
    const selectedDesignationId = event.target.value;
    const selectedDesignation = designation.find(
      (d) => d.id === selectedDesignationId,
    );
    setSelectedDesignationLabel(selectedDesignation?.designation ?? '');
    setMaxPayInCommission(0);
    setMaxPayOutCommission(0);
    if (selectedDesignation?.designation === Role.SUB_VENDOR) {
      const res = await getAllVendorCodes(false, false, false, false, true);
      setVendorCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
    } else if (role !== Role.MERCHANT) {
      const res = await getAllVendorCodes(false, false);
      setVendorCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
    }

    if (
      (selectedDesignation?.designation === Role.SUB_MERCHANT &&
        role === Role.MERCHANT) ||
      (selectedDesignation?.designation === Role.SUB_VENDOR &&
        role === Role.VENDOR &&
        parsedData)
    ) {
      handleParentChange(parsedData?.userId, selectedDesignation?.designation);
    }
  };

  const handleParentChange = async (
    parentIdOrEvent: string | React.ChangeEvent<HTMLSelectElement>,
    designationLabel?: string,
  ) => {
    const parentId =
      typeof parentIdOrEvent === 'string'
        ? parentIdOrEvent
        : parentIdOrEvent.target.value;

    const effectiveDesignationLabel =
      designationLabel ?? selectedDesignationLabel;

    if (effectiveDesignationLabel === Role.SUB_MERCHANT) {
      const selectedParent = merchantCodes.find(
        (merchant) => merchant.value === parentId,
      );
      if (selectedParent) {
        const merchantQueryString = new URLSearchParams({
          code: selectedParent.label,
        }).toString();
        const merchant = await getAllMerchantByCode(merchantQueryString);
        setMaxPayInCommission((merchant as any).payin_commission || 0);
        setMaxPayOutCommission((merchant as any).payout_commission || 0);
      }
    } else if (effectiveDesignationLabel === Role.SUB_VENDOR) {
      const selectedParent = vendorCodes.find(
        (vendor) => vendor.value === parentId,
      );
      if (selectedParent) {
        const vendorQueryString = new URLSearchParams({
          code: selectedParent.label,
        }).toString();
        const vendor = await getAllVendorByCode(vendorQueryString);
        setMaxPayInCommission((vendor as any).payin_commission || 0);
        setMaxPayOutCommission((vendor as any).payout_commission || 0);
      }
    }
  };

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(
        setPagination({
          page,
          limit: pagination.limit || 10,
        }),
      );
    },
    [dispatch, pagination.limit],
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
    dispatch(resetPagination());
  }, [dispatch]);

  const fetchUsersData = useCallback(
    async (query?: string) => {
      const queryString = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        ...(query && { search: query }),
      });

      dispatch(onload());

      // if (!query) {
      let response = await getAllUsers(queryString.toString());
      if (response) {
        dispatch(getUsers(response.Users));
        dispatch(getUserCount(response.totalCount));
      }

      // } else if (query) {
      //   response = await getAllUsersBySearchApi(queryString.toString());
      //   dispatch(getUsers(response.Users));
      //   dispatch(getUserCount(response.totalCount));
      else {
        setNotificationStatus(Status.ERROR);
        setNotificationMessage('No Records Found!');
      }
    },
    [pagination?.page, pagination?.limit, dispatch],
  );

  useEffect(() => {
    fetchUsersData(debouncedSearchQuery || '');
  }, [debouncedSearchQuery, pagination.page, pagination.limit]);

  useEffect(() => {
    if (refreshUser) {
      fetchUsersData();
      dispatch(setRefreshUser(false));
    }
  }, [refreshUser]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchRoles = async () => {
      const rolesResponse = await getAllRoles('');
      let mappedRoles =
        rolesResponse?.data?.map((role: any) => ({
          label: role.role,
          value: role.id,
        })) || [];

      if (mappedRoles.length > 0) {
        mappedRoles.unshift({ label: 'Select Role', value: '' });
      }

      const roleToRemove = 'SUPER_ADMIN';
      const updatedData = rolesResponse?.data.filter(
        (item: roleType) => item.role !== roleToRemove,
      );

      setRoles(updatedData);
    };
    const fetchDesignations = async () => {
      const designations = await getAllDesignations('');
      let mappedDesignation = designations?.data?.map((designation: any) => ({
        label: designation.designation?.toString() || '',
        value: designation.id?.toString() || '',
      }));
      if (mappedDesignation.length > 0) {
        mappedDesignation.unshift({ label: 'Select Designation', value: '' });
      }
      setDesignation(designations.data);
    };
    fetchDesignations();
    fetchRoles();
  }, []);

  const userModal = () => {
    setNewUserModal(!newUserModal);
    setSelectedRoleLabel('');
    setSelectedDesignationLabel('');
    setFilteredDesignations([]);
  };
  const handleSubmit = async (data: {
    email: string;
    first_name?: string;
    last_name?: string;
    contact_no?: string;
    is_enabled?: boolean;
    role_id?: string;
    designation_id?: string;
    user_name?: string;
    net_balance?: string;
    code?: string;
  }) => {
    setIsLoading(true);
    const newUser = await createUser(data);
    if (!newUser.error.message) {
      dispatch(setRefreshUser(true));
      dispatch(
        addAllNotification({
          status: Status.SUCCESS,
          message: `Create ${selectedRoleLabel}'s User Successfully`,
        }),
      );
      dispatch(addUser(newUser));
      setSelectedDesignationLabel('');
      userModal();
    } else {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: newUser.error.message,
        }),
      );
    }
    setIsLoading(false);
  };

  const handleEditModal = (user_name: string) => {
    setSelectedDesignationLabel('');
    const user = allUsers.users.find((u) => u.user_name === user_name);
    setUserToEdit(user);
    setFormData({ email: user?.email, constact: user?.contact_no || '' });
    setEditUserModal(true);
  };

  const handleEditSubmit = async (data: { email: string }) => {
    setErrorMessage('');
    setFormData(data);
    setEditUserModal(false);
    setEditVerification(true);
  };

  const handleEditVerification = async (passwordData: { password: string }) => {
    setIsLoading(true);
    try {
      const isValid = await verifyPassword(passwordData.password);
      if (isValid && userToEdit && formData) {
        const updatedUserData = await updateUser(userToEdit.id, formData);
        if (updatedUserData) {
          dispatch(
            updateUserDispatch({
              ...userToEdit,
              email: formData.email,
              contact_no: formData.contact_no,
            }),
          );
          if (updatedUserData.data) {
            dispatch(setRefreshUser(true));
            dispatch(
              addAllNotification({
                status: Status.SUCCESS,
                message: 'User email updated successfully',
              }),
            );
            setEditVerification(false);
          } else {
            dispatch(setRefreshUser(true));
            setEditVerification(false);
            dispatch(
              addAllNotification({
                status: Status.SUCCESS,
                message: updatedUserData.error.message,
              }),
            );
          }
          setUserToEdit(null);
          setFormData(null);
        }
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Invalid password',
          }),
        );
        setErrorMessage('Invalid details. Please try again.');
      }
    } catch (error: any) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            error?.response?.data?.error?.message ||
            'Failed to update user email',
        }),
      );
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditUserModal(false);
    setUserToEdit(null);
    setFormData(null);
    setErrorMessage(null);
  };

  const handleRefresh = useCallback(() => {
    dispatch(onload());
    fetchUsersData(searchQuery.trim());
    dispatch(
      addAllNotification({
        status: Status.SUCCESS,
        message: 'Users refreshed successfully',
      }),
    );
  }, [dispatch, fetchUsersData, searchQuery]);

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

  // const fetchCount = async () => {
  //   const getCountData = await getCount('User');
  //   dispatch(getUserCount(getCountData.count));
  // };

  // useEffect(() => {
  //   fetchCount();
  // }, [dispatch]);

  const handleGetAllMerchantCodes = useCallback(async () => {
    if (role !== Role.VENDOR) {
      const res = await getAllMerchantCodes();
      setMerchantCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
    }
  }, []);

  useEffect(() => {
    if (role !== Role.VENDOR) {
      handleGetAllMerchantCodes();
    }
  }, [handleGetAllMerchantCodes]);

  // const handleGetAllVendorCodes = useCallback(async () => {
  //   if (role !== Role.MERCHANT) {
  //     const res = await getAllVendorCodes(false , true);
  //     setVendorCodes(
  //       res.map((el: any) => ({
  //         label: el.label,
  //         value: el.value,
  //       })),
  //     );
  //   }
  // }, []);

  // useEffect(() => {
  //   if (role !== Role.MERCHANT) {
  //     handleGetAllVendorCodes();
  //   }
  // }, [handleGetAllVendorCodes]);

  const handleToggleClick = (id: string, status: boolean, type: string) => {
    setToggleData({ id, status, type });
    setPasswordModal(true);
  };

  const handlePasswordSubmit = async (data: { password: string }) => {
    try {
      setIsLoading(true);
      const isValid = await verifyPassword(data.password);
      if (isValid && toggleData) {
        const userUpdate = await updateUser(toggleData.id, {
          [toggleData.type]: toggleData.status,
        });
        if (userUpdate) {
          const user = allUsers.users.find((user) => user.id === toggleData.id);
          if (user) {
            const data = JSON.parse(JSON.stringify(user));
            data[toggleData.type] = toggleData.status;
            dispatch(updateUserDispatch(data));
            dispatch(setRefreshUser(true));
            dispatch(
              addAllNotification({
                status: Status.SUCCESS,
                message: 'User status updated successfully',
              }),
            );
          }
        }
        setPasswordModal(false);
        setToggleData(null);
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Invalid password',
          }),
        );
        setErrorMessage('');
      }
    } catch (error: any) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:
            error?.response?.data?.error?.message ||
            'Failed to update user status',
        }),
      );
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordModal = () => {
    setPasswordModal(!passwordModal);
    if (passwordModal) {
      setToggleData(null);
      setErrorMessage('');
    }
  };
  return (
    <div className="grid grid-cols-12 gap-y-4 sm:gap-y-6 md:gap-y-10 gap-x-3 sm:gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col md:min-h-10 gap-y-3 md:items-center md:flex-row px-2 sm:px-0">
          <div className="text-lg sm:text-xl md:text-2xl font-medium group-[.mode--light]:text-white">
            Users
          </div>
          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
            <Modal
              handleModal={userModal}
              forOpen={newUserModal}
              buttonTitle="Add User"
            >
              <DynamicForm
                sections={{
                  ...getUserFormFields(
                    filteredDesignations,
                    role !== Role.ADMIN
                      ? roles
                          .filter((r) => r.role === role)
                          .map((role) => ({
                            label: role.role ?? '',
                            value: role.id?.toString() || '',
                          }))
                      : roles.map((role) => ({
                          label: role.role ?? '',
                          value: role.id?.toString() || '',
                        })),
                    vendorCodes,
                    merchantCodes,
                    handleRoleChange,
                    handleDesignationChange,
                    handleParentChange,
                  ),
                  User_Info: getUserFormFields(
                    filteredDesignations,
                    role !== Role.ADMIN
                      ? roles
                          .filter((r) => r.role === role)
                          .map((role) => ({
                            label: role.role ?? '',
                            value: role.id?.toString() || '',
                          }))
                      : roles.map((role) => ({
                          label: role.role ?? '',
                          value: role.id?.toString() || '',
                        })),
                    vendorCodes,
                    merchantCodes,
                    handleRoleChange,
                    handleDesignationChange,
                    handleParentChange,
                  ).User_Info(selectedDesignationLabel),
                  More_Details: getUserFormFields(
                    filteredDesignations,
                    role !== Role.ADMIN
                      ? roles
                          .filter((r) => r.role === role)
                          .map((role) => ({
                            label: role.role ?? '',
                            value: role.id?.toString() || '',
                          }))
                      : roles.map((role) => ({
                          label: role.role ?? '',
                          value: role.id?.toString() || '',
                        })),
                    vendorCodes,
                    merchantCodes,
                    handleRoleChange,
                    handleDesignationChange,
                    handleParentChange,
                  ).More_Details(
                    selectedDesignationLabel,
                    role || '',
                    maxPayInCommission,
                    maxPayOutCommission,
                  ),
                }}
                onSubmit={handleSubmit}
                defaultValues={{}}
                isEditMode={false}
                handleCancel={userModal}
                isLoading={isLoading}
              />
            </Modal>
          </div>
          <Modal
            handleModal={handlePasswordModal}
            forOpen={passwordModal}
            title="Verify Password"
          >
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handlePasswordSubmit}
              defaultValues={{ password: '' }}
              isEditMode={false}
              handleCancel={handlePasswordModal}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>
          <Modal
            handleModal={handleEditCancel}
            forOpen={editUserModal}
            title="Edit User's Details"
          >
            <DynamicForm
              sections={emailFormFields}
              onSubmit={handleEditSubmit}
              defaultValues={{
                email: userToEdit?.email,
                contact_no: userToEdit?.contact_no || '',
              }}
              isEditMode={true}
              handleCancel={handleEditCancel}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>
          <Modal
            handleModal={() => setEditVerification(false)}
            forOpen={editVerification}
            title="Verify Password"
          >
            <DynamicForm
              sections={VerificationformFields(showPassword)}
              onSubmit={handleEditVerification}
              defaultValues={{ password: '' }}
              isEditMode={false}
              handleCancel={() => {
                setEditVerification(false);
                setErrorMessage(null);
                setUserToEdit(null);
                setFormData(null);
              }}
              isLoading={isLoading}
            />
            {errorMessage && (
              <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
            )}
          </Modal>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 mt-3.5">
          <div className="flex flex-col box box--stacked">
            <div className="flex flex-col p-3 sm:p-4 md:p-5 sm:items-center sm:flex-row gap-y-2">
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="Search users..."
                    className="pl-9 w-full sm:w-64 rounded-[0.5rem] text-sm sm:text-base"
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
              <div className="flex flex-col sm:flex-row gap-x-2 sm:gap-x-3 gap-y-2 sm:ml-auto">
                <Menu>
                  <Menu.Button
                    as={Button}
                    variant="outline-secondary"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                    onClick={handleRefresh}
                  >
                    <Lucide
                      icon="RefreshCw"
                      className="stroke-[1.3] w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                    />
                    Refresh
                  </Menu.Button>
                </Menu>
                <Menu>
                  <Menu.Button
                    as={Button}
                    variant="outline-secondary"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                    onClick={() => {
                      if (
                        searchQuery ||
                        pagination.limit !== 10 ||
                        pagination.page !== 1
                      ) {
                        handleReset();
                      }
                    }}
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
            <div className="overflow-auto xl:overflow-visible">
              {allUsers.loading ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <LoadingIcon icon="ball-triangle" className="w-[5%] h-auto" />
                </div>
              ) : (
                <CustomTable
                  columns={
                    role && [Role.MERCHANT, Role.SUB_MERCHANT].includes(role)
                      ? Columns.USERS_MERCHANT
                      : role && [Role.VENDOR].includes(role)
                      ? Columns.USERS_VENDOR
                      : Columns.USERS
                  }
                  data={{ rows: allUsers.users, totalCount: allUsers.count }}
                  handleToggleClick={handleToggleClick}
                  currentPage={pagination.page}
                  pageSize={pagination.limit}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  actionMenuItems={(row: any) => [
                    {
                      label: 'Edit',
                      icon: 'Pencil',
                      onClick: () => handleEditModal(row.user_name),
                    },
                  ]}
                />
              )}
            </div>
            {notificationMessage && (
              <div className="text-center">
                <Notification
                  getRef={(el) => {
                    basicNonStickyNotification.current = el;
                  }}
                  options={{
                    duration: 3000,
                  }}
                  className="flex flex-col sm:flex-row"
                >
                  {notificationStatus === Status.SUCCESS ? (
                    <Lucide icon="BadgeCheck" className="text-primary" />
                  ) : (
                    <Lucide icon="X" className="text-danger" />
                  )}
                  <div className="font-medium ml-4 mr-4">
                    <div className="font-medium">{notificationMessage}</div>
                  </div>
                </Notification>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
