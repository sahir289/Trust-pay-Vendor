/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { getDataEntriesFormFields, Role, Status } from '@/constants';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import DynamicForm from '@/components/CommonForm';
import {
  onload,
  // setRefreshDataEntries,
} from '@/redux-toolkit/slices/dataEntries/dataEntrySlice';
import {
  createBankResponses,
} from '@/redux-toolkit/slices/dataEntries/dataEntryAPI';
import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { getBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
import { selectAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSelectors';
import {
  addAllNotification,
  removeNotificationById,
} from '@/redux-toolkit/slices/AllNoti/allNotifications';

type ResetHistoryProps = {
  setTabState: any;
};

function EntityForm({ setTabState }: ResetHistoryProps) {
  const dispatch = useAppDispatch();
  const [newTransactionModal, setNewTransactionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultbank, setdefaultBank] = useState('');
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | string = '';
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
  }

  // Auto-clear notifications after 5 seconds
  const autoClearNotification = (notificationId: string) => {
    setTimeout(() => {
      dispatch(removeNotificationById(notificationId));
    }, 5000);
  };

  // Fetch bank names on component mount
  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const bankNamesPayInList = await getAllBankNames('PayIn');
        if (bankNamesPayInList) {
          dispatch(getBankNames([...bankNamesPayInList.bankNames]));
        }
      } catch (error) {
        const notificationId = `${Date.now()}-${Math.random()}`;
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: (error as any)?.message || 'Failed to fetch bank names',
          }),
        );
        autoClearNotification(notificationId);
      }
    };

    fetchBankNames();
  }, []); // Empty dependency array to run only once

  const bankNames = useAppSelector(selectAllBankNames);
  const bankOptions = [...bankNames];

  const toggleTransactionModal = () =>
    setNewTransactionModal(!newTransactionModal);

  // Debounced handler for creating bank response
  const debouncedHandleCreateBankResponse = debounce(async (data: any) => {
    setIsLoading(true);
    setdefaultBank(data.bank_acc_id);
    dispatch(onload());
    try {
      const payload = `${data.amount} ${data.upi_short_code} ${data.utr} ${
        data.bank_acc_id
      } ${'true'}`;
      const res = await createBankResponses(payload);
      if (res.data) {
        const notificationId = `${Date.now()}-${Math.random()}`;
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: res.data.message || 'Bank response created successfully',
          }),
        );
        autoClearNotification(notificationId);
      } else if (res.error) {
        const notificationId = `${Date.now()}-${Math.random()}`;
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: res.error.message || 'An error occurred',
          }),
        );
        autoClearNotification(notificationId);
      }
      setTabState(0);
    } catch (error: any) {
      const notificationId = `${Date.now()}-${Math.random()}`;
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: error?.response?.data?.error?.message || 'An error occurred',
        }),
      );
      autoClearNotification(notificationId);
    } finally {
      setIsLoading(false);
      toggleTransactionModal();
    }
  }, 300);

  return (
    <>
      <div className="grid grid-cols-12 gap-y-10 gap-x-6">
        <div className="col-span-12">
          <div className="relative flex flex-col gap-y-7">
            {/* Form Card with glassmorphism effect */}
            <div className="rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="p-4 sm:p-6">
                
                {/* Form */}
                <div className="w-full md:w-full lg:w-3/4 xl:w-2/3 mx-auto">
                  <DynamicForm
                    sections={
                      getDataEntriesFormFields(bankOptions, true, role)
                        .BANK_RESPONSE
                    }
                    onSubmit={debouncedHandleCreateBankResponse}
                    defaultValues={{ bank_acc_id: defaultbank }}
                    isEditMode={true}
                    handleCancel={toggleTransactionModal}
                    isAddData={true}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EntityForm;
