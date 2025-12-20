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

interface EntityFormProps {
  setTabState: React.Dispatch<React.SetStateAction<number>>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function EntityForm({ setTabState, onSuccess, onCancel }: EntityFormProps) {
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
        if (onSuccess) {
          onSuccess();
        }
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
      setTabState((prev) => prev + 1);
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    toggleTransactionModal();
  };

  return (
    <>                
                  <DynamicForm
                    sections={
                      getDataEntriesFormFields(bankOptions, true, role)
                        .BANK_RESPONSE
                    }
                    onSubmit={debouncedHandleCreateBankResponse}
                    defaultValues={{ bank_acc_id: defaultbank }}
                    isEditMode={true}
                    handleCancel={handleCancel}
                    isAddData={true}
                    isLoading={isLoading}
                  />
    </>
  );
}

export default EntityForm;
