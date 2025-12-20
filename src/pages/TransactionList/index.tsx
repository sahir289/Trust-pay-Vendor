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
import clsx from 'clsx';

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
  const darkMode = useAppSelector(selectDarkMode);
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
      <div className={clsx([
        'relative overflow-hidden rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl min-h-screen',
        darkMode 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10'
          : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200',
      ])}>
        {/* Background gradient overlay */}
        <div className={clsx([
          'pointer-events-none absolute inset-0',
          darkMode 
            ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_24%)]'
            : 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.06),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.06),transparent_24%)]',
        ])}></div>
        
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={clsx([
                'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-2xl shrink-0',
                darkMode 
                  ? 'border-white/20 bg-white/10'
                  : 'border-slate-200 bg-slate-100',
              ])}>
                <Lucide
                  icon={title === 'PayIns' ? 'BadgeIndianRupee' : 'ArrowRightCircle'}
                  className={clsx([
                    'w-5 h-5 sm:w-6 sm:h-6',
                    darkMode ? 'text-white' : 'text-slate-700',
                  ])}
                />
              </div>
              <div>
                <h1 className={clsx([
                  'text-xl sm:text-2xl md:text-3xl font-semibold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  {title}
                </h1>
                <p className={clsx([
                  'text-sm hidden sm:block',
                  darkMode ? 'text-white/60' : 'text-slate-500',
                ])}>
                  Manage your {title.toLowerCase()} transactions
                </p>
              </div>
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

          {/* Tab Container */}
          <div className={clsx([
            'rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden',
            darkMode 
              ? 'bg-white/10 border border-white/15'
              : 'bg-white border border-slate-200',
          ])}>
            <Tab.Group
              selectedIndex={parentTab}
              onChange={handleParentTabChange}
            >
              <Tab.List className={clsx([
                'flex border-b',
                darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50',
              ])}>
                <Tab className="relative flex-1">
                  {({ selected }) => (
                    <Tab.Button
                      className={clsx([
                        'w-full py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-medium transition-all duration-300 relative',
                        selected
                          ? darkMode
                            ? 'text-white bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border-b-2 border-indigo-500'
                            : 'text-slate-800 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-b-2 border-indigo-500'
                          : darkMode
                            ? 'text-white/60 hover:text-white hover:bg-white/5'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
                      ])}
                      as="button"
                    >
                      <div className={clsx([
                        'flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl',
                        selected 
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 shadow-lg shadow-indigo-500/30' 
                          : darkMode ? 'bg-white/10' : 'bg-slate-200',
                      ])}>
                        <Lucide 
                          icon="BadgeIndianRupee" 
                          className={clsx([
                            'w-4 h-4 sm:w-5 sm:h-5',
                            selected ? 'text-white' : darkMode ? 'text-white/70' : 'text-slate-500',
                          ])} 
                        />
                      </div>
                      <span>Payins</span>
                      {selected && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
                      )}
                    </Tab.Button>
                  )}
                </Tab>
                <Tab className="relative flex-1">
                  {({ selected }) => (
                    <Tab.Button
                      className={clsx([
                        'w-full py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-medium transition-all duration-300 relative',
                        selected
                          ? darkMode
                            ? 'text-white bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border-b-2 border-indigo-500'
                            : 'text-slate-800 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-b-2 border-indigo-500'
                          : darkMode
                            ? 'text-white/60 hover:text-white hover:bg-white/5'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
                      ])}
                      as="button"
                    >
                      <div className={clsx([
                        'flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl',
                        selected 
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 shadow-lg shadow-indigo-500/30' 
                          : darkMode ? 'bg-white/10' : 'bg-slate-200',
                      ])}>
                        <Lucide 
                          icon="ArrowRightCircle" 
                          className={clsx([
                            'w-4 h-4 sm:w-5 sm:h-5',
                            selected ? 'text-white' : darkMode ? 'text-white/70' : 'text-slate-500',
                          ])} 
                        />
                      </div>
                      <span>Payouts</span>
                      {selected && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
                      )}
                    </Tab.Button>
                  )}
                </Tab>
              </Tab.List>

              <Tab.Panels className="p-4 sm:p-6">
                <Tab.Panel>
                  <PayInComponent />
                </Tab.Panel>
                <Tab.Panel>
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
