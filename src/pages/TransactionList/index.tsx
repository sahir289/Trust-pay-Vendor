/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Tab } from '@/components/Base/Headless';
import Modal from '@/components/Modal/modals';
import Lucide from '@/components/Base/Lucide';
import { useState, useEffect } from 'react';
import {
  createPayIn,
  generateHashCode,
} from '@/redux-toolkit/slices/payin/payinAPI';
import { getTransactionFormFields, Role, Status } from '@/constants';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { getParentTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import {
  setActiveTab,
  setParentTab,
} from '@/redux-toolkit/slices/common/tabs/tabSlice';
import DynamicForm from '@/components/CommonForm';
import {
  onload as payInLoader,
  setRefreshPayIn,
} from '@/redux-toolkit/slices/payin/payinSlice';
import {
  onload as payOutLoader,
  setRefreshPayOut,
} from '@/redux-toolkit/slices/payout/payoutSlice';
import { createPayOut } from '@/redux-toolkit/slices/payout/payoutAPI';
import { selectAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantSelector';
import { getAllMerchantByCode } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { getMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantSlice';
import ModalContent from '@/components/Modal/ModalContent/ModalContent';
// import { withLazyLoading } from '@/utils/lazyStrategies';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

// Normal imports instead of lazy loading
import PayInComponent from '@/pages/TransactionList/Payin/payin';
import PayOut from '@/pages/TransactionList/Payout/payout';

// Commented out lazy loading approach:
// const PayInComponent = withLazyLoading(
//   () => import('@/pages/TransactionList/Payin/payin'),
//   { chunkName: 'payin', retries: 3 }
// );
// const PayOut = withLazyLoading(
//   () => import('@/pages/TransactionList/Payout/payout'),
//   { chunkName: 'payout', retries: 3 }
// );

function Main() {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const parentTab = useAppSelector(getParentTabs);
  const [newTransactionModal, setNewTransactionModal] = useState(false);
  const [title, setTitle] = useState(parentTab === 0 ? 'PayIns' : 'PayOuts');
  const [payInModal, setPayInModal] = useState(false);
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oneTime, setOneTime] = useState(false);
  const [formValues, setFormValues] = useState<any>({});

  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
  }

  useEffect(() => {
    if (role !== Role.MERCHANT && role !== Role.ADMIN) {
      return;
    }
    const fetchMerchantCodes = async () => {
      const merchantCodesList = await getAllMerchantCodes();
      if (merchantCodesList) {
        dispatch(getMerchantCodes(merchantCodesList));
      }
    };

    fetchMerchantCodes();
  }, [dispatch]);

  const merchantCodes = useAppSelector(selectAllMerchantCodes);
  const merchantOptions = [
    // { value: '', label: 'Select Merchant' },
    ...merchantCodes.map((merchant) => ({
      value: merchant.label,
      label: merchant.label,
    })),
  ];

  const handleConfirm = async () => {
    setPayInModal(false);
  };

  const handleCancel = () => {
    setPayInModal(false);
  };

  const handleCreate = async (data: any) => {
    setIsLoading(true);
    try {
      let res;
      const merchantQueryString = new URLSearchParams({
        code: data.code,
      }).toString();

      const merchant = await getAllMerchantByCode(merchantQueryString);
      const merchantKey = merchant.public_key;
      if (!merchantKey) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Merchant key not found',
          }),
        );
        return;
      }

      if (
        merchant &&
        (data.amount <
          (merchant as unknown as { min_payin: number })?.min_payin ||
          data.amount >
            (merchant as unknown as { max_payin: number })?.max_payin) &&
        role !== Role.ADMIN
      ) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: `Amount must be between ${merchant?.min_payin} and ${merchant?.max_payin}`,
          }),
        );
        return;
      }

      if (title === 'PayIns') {
        const transformedValues = {
          ...data,
          user_id: data.user_id.replace(/\s+/g, '_'),
          ot: data.ot ? 'y' : 'n',
          key: merchant?.public_key,
          fromUi: true,
        };
        const queryString = new URLSearchParams(
          transformedValues as Record<string, string>,
        ).toString();

        dispatch(payInLoader());

        if (data.ot === true) {
          res = await createPayIn(queryString);
          dispatch(setRefreshPayIn(true)); //prevent continous rendering
        } else {
          res = await generateHashCode(queryString);
        }
      } else {
        data.fromUi = true;
        dispatch(payOutLoader());
        delete data?.ot
        res = await createPayOut(data, merchantKey);
      }

      if (res?.meta?.message || res?.data) {
        //seperate msg for payin payout
        if (title === 'PayIns') {
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: `${
                res?.meta?.message ? res?.meta?.message : res?.message
              } And Link copied to clipboard!`,
            }),
          );
        } else {
          dispatch(
            addAllNotification({
              status: Status.SUCCESS,
              message: res?.meta?.message ? res?.meta?.message : res?.message,
            }),
          );
        }
        transactionModal();
        // Reset form values on successful submission
        setFormValues({});
        setOneTime(false);

        if (title === 'PayIns') {
          dispatch(setRefreshPayIn(true));
          if (res.data?.payInUrl) {
            setLink(res.data.payInUrl);
            setPayInModal(true);
          }
        } else {
          dispatch(setRefreshPayOut(true));
        }
      } else if (res?.error) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: res.error.message,
          }),
        );
        title === 'PayIns'
          ? dispatch(setRefreshPayIn(true))
          : dispatch(setRefreshPayOut(true));
        transactionModal();
        // Reset form values on error
        setFormValues({});
        setOneTime(false);
      } else {
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: res.message,
          }),
        );
      }
    } catch (error: any) {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: error?.message || 'An unexpected error occurred',
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentTabChange = (index: number) => {
    dispatch(setParentTab(index));
    dispatch(setActiveTab(0)); // Reset child tab to 'All'
    setTitle(index === 0 ? 'PayIns' : 'PayOuts');
    if (index === 0) {
      dispatch(payInLoader());
    } else {
      dispatch(payOutLoader());
    }
  };

  const handleOneTimeChange = (value: boolean, currentFormValues?: any) => {
    setOneTime(value);
    if (currentFormValues) {
      setFormValues({ ...currentFormValues, ot: value });
    }
  };

  const transactionModal = () => {
    setNewTransactionModal(!newTransactionModal);
    if (newTransactionModal) {
      // Reset form values when closing modal
      setFormValues({});
      setOneTime(false);
    }
  };

  useEffect(() => {
    if (payInModal && link) {
      navigator.clipboard.writeText(link);
    }
  }, [payInModal, link]);

  useEffect(() => {
    if (newTransactionModal) {
      // Reset form values when opening modal
      setFormValues({});
      setOneTime(false);
    }
  }, [newTransactionModal]);
  useEffect(() => {
    setTitle(parentTab === 0 ? 'PayIns' : 'PayOuts');
  }, [parentTab]);
  return (
    <>
      <div className="flex flex-col min-h-10 w-full px-2 sm:px-4">
        <div className="flex justify-between items-center gap-2">
          <div className="text-lg sm:text-xl md:text-2xl font-medium group-[.mode--light]:text-white">
            {title}
          </div>
          {role !== Role.VENDOR && (
            <Modal
              handleModal={transactionModal}
              forOpen={newTransactionModal}
              buttonTitle={`Add ${title}`}
            >
              <DynamicForm
                sections={
                  title === 'PayIns'
                    ? getTransactionFormFields(merchantOptions, role ?? '', oneTime, handleOneTimeChange).PAYIN
                    : getTransactionFormFields(merchantOptions, role ?? '', oneTime, handleOneTimeChange).PAYOUT
                }
                onSubmit={handleCreate}
                defaultValues={{ ...formValues, ot: oneTime }}
                isEditMode={false}
                handleCancel={transactionModal}
                isLoading={isLoading}
              />
            </Modal>
          )}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3 sm:gap-6 mt-2">
        <div className="col-span-12">
          <div className="p-3 sm:p-4 md:p-5 box box--stacked">
            <Tab.Group
              selectedIndex={parentTab}
              onChange={handleParentTabChange}
            >
              <Tab.List className="flex border-b-0 bg-transparent relative">
                <Tab className="relative flex-1">
                  {({ selected }) => (
                    <Tab.Button
                      className={`w-full py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base transition-all duration-200 relative ${
                        selected
                          ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                          : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                      }`}
                      as="button"
                      style={selected ? {
                        position: 'relative',
                        zIndex: 10
                      } : {}}
                    >
                      <Lucide icon="BadgeIndianRupee" className="w-4 h-4 sm:w-5 sm:h-5" />
                      Payins
                    </Tab.Button>
                  )}
                </Tab>
                <Tab className="relative flex-1">
                  {({ selected }) => (
                    <Tab.Button
                      className={`w-full py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base transition-all duration-200 relative ${
                        selected
                          ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                          : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                      }`}
                      as="button"
                      style={selected ? {
                        position: 'relative',
                        zIndex: 10
                      } : {}}
                    >
                      <Lucide icon="ArrowRightCircle" className="w-4 h-4 sm:w-5 sm:h-5" />
                      Payouts
                    </Tab.Button>
                  )}
                </Tab>
              </Tab.List>
              <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
                <Tab.Panel className="p-2 sm:p-4 md:p-5">
                  <PayInComponent />
                </Tab.Panel>
                <Tab.Panel className="p-2 sm:p-4 md:p-5">
                  <PayOut />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>

      {link && (
        <Modal handleModal={handleCancel} forOpen={payInModal}>
          <ModalContent
            handleCancelDelete={handleCancel}
            handleConfirmDelete={handleConfirm}
          >
            <span
              style={{
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              }}
              onClick={() => {
                navigator.clipboard.writeText(link);
                dispatch(
                  addAllNotification({
                    status: Status.SUCCESS,
                    message: 'Copied to clipboard!',
                  }),
                );
              }}
            >
              {link}
            </span>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default Main;
