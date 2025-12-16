/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react';
// import { withLazyLoading } from '@/utils/lazyStrategies';
import Modal from '../../components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
import { createSettlement } from '@/redux-toolkit/slices/settlement/settlementAPI';
import {
  addSettlement,
  setRefreshSettlement,
} from '@/redux-toolkit/slices/settlement/settlementSlice';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { getParentTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { getMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantSlice';
import { selectAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantSelector';
import { selectAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSelectors';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { getVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSlice';
import {
  getSettlementsFormFields,
  Role,
  SettlementOptions,
  Status,
} from '@/constants';
import { getRefreshSettlement } from '@/redux-toolkit/slices/settlement/settlementSelectors';
import { getAllBeneficiary } from '@/redux-toolkit/slices/beneficiaryAccounts/beneficiaryAccountsAPI';
import { getBeneficiaryAccountSlice } from '@/redux-toolkit/slices/beneficiaryAccounts/beneficiaryAccountsSlice';
import { selectAllBeneficiaryAccounts } from '@/redux-toolkit/slices/beneficiaryAccounts/beneficiaryAccountsSelectors';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';

import VendorSettlement from '@/pages/Settlement/VendorSettlement/index';

interface Beneficiary {
  id?: string;
  bank_name?: string;
  acc_holder_name?: string;
  acc_no?: string;
  ifsc?: string;
}

interface Option {
  value: string;
  label: string;
}

function Main() {
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  let parsedData: any;
  if (data) {
    parsedData = JSON.parse(data);
    role = parsedData.role;
  }

  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const parentTab = useAppSelector(getParentTabs);
  const [newSettlementModal, setNewSettlementModal] = useState(false);
  const refreshSettlement = useAppSelector(getRefreshSettlement);
  const getInitialTitle = () => {
    return '';
  };
  useEffect(() => {
    if (role === Role.ADMIN) {
      setTitle(parentTab === 0 ? 'Merchant Settlement' : 'Vendor Settlement');
    }
  }, [parentTab]);
  const [title, setTitle] = useState(getInitialTitle());
  const [selectedMethodLabel, setSelectedMethodLabel] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);
  const [updated, setUpdated] = useState(false);
  const [beneficiaryOptions, setBeneficiaryOptions] = useState<Option[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary>(
    {},
  );
  const [debitCredit, setDebitCredit] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState<string>('');
  const [accountNumberOptions, setAccountNumberOptions] = useState<Option[]>(
    [],
  );
  const [defaultValues, setDefaultValues] = useState<any>({
    code: '',
    amount: '',
    method: '',
    bank_name: '',
    acc_holder_name: '',
    acc_no: '',
    ifsc: '',
    debit_credit: '',
    wallet_balance: '',
    description: '',
    utr: '',
  });

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const method = e.target.value;
    setSelectedMethodLabel(method);

    if (method === 'INTERNAL_BANK_TRANSFER' || method === 'INTERNAL_QR_TRANSFER') {
      setUpdated(true);
      return;
    }

    if (method === 'BANK') {
      setUpdated(false);
      const userId = code || parsedData?.user_id || '';
      fetchBeneficiary(userId);
      return;
    }

    setUpdated(false);
  };

  const settlementModal = () => {
    setSelectedMethodLabel('');
    setSelectedBeneficiary({});
    setBeneficiaryOptions([]);
    setDefaultValues({
      code: '',
      amount: '',
      method: '',
      bank_name: '',
      acc_holder_name: '',
      acc_no: '',
      ifsc: '',
      debit_credit: '',
      wallet_balance: '',
      description: '',
      utr: '',
    });
    setNewSettlementModal(!newSettlementModal);
  };

  const fetchBeneficiary = async (user_id: string) => {
    try {
      // const pagination = { page: 1, limit: 10 };
      const queryParams: Record<string, string> = {
        // page: pagination.page.toString(),
        // limit: pagination.limit.toString(),
        forSettlementFlag: 'true',
        beneficiary_role:
          title === 'Merchant Settlement' && parentTab === 0
        ? Role.MERCHANT
        : Role.VENDOR,
        beneficiary_user_id: user_id,
      };

      if (title !== 'Merchant Settlement') {
        queryParams.is_enabled = 'true';
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const BeneficiaryList = await getAllBeneficiary(queryString);
      if (BeneficiaryList && Array.isArray(BeneficiaryList)) {
        dispatch(getBeneficiaryAccountSlice(BeneficiaryList));

        const uniqueBankNames = Array.from(
          new Set(BeneficiaryList.map((b: Beneficiary) => b.bank_name)),
        );
        const bankOptions = uniqueBankNames.map((bank) => ({
          value: bank || '',
          label: bank || '',
        }));
        setBeneficiaryOptions(bankOptions);

        if (bankOptions.length > 0) {
          const defaultBank = bankOptions[0]?.value;
          setSelectedBankName(defaultBank || '');
          updateAccountNumbers(BeneficiaryList, defaultBank || '');
          setSelectedBeneficiary(BeneficiaryList[0] || {});
        } else {
          setBeneficiaryOptions([]);
          setAccountNumberOptions([]);
          setSelectedBeneficiary({});
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message:'No beneficiaries found for this user'
            })
          );
        }
      } else {
        setBeneficiaryOptions([]);
        setAccountNumberOptions([]);
        setSelectedBeneficiary({});
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message:'Invalid beneficiary data received'
          })
        );
      }
    } catch {
      setBeneficiaryOptions([]);
      setAccountNumberOptions([]);
      setSelectedBeneficiary({});
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:'Failed to fetch beneficiaries'
        })
      );
    }
  };

  const updateAccountNumbers = (
    beneficiaries: Beneficiary[],
    bankName: string,
  ) => {
    const filteredAccounts = beneficiaries
      .filter((b: Beneficiary) => b.bank_name === bankName)
      .map((b: Beneficiary) => ({
        value: b.acc_no || '',
        label: b.acc_no || '',
      }));
    setAccountNumberOptions(filteredAccounts);
  };

  const handleBankNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankName = e.target.value;
    setSelectedBankName(bankName);
    updateAccountNumbers(beneficiaries.beneficiaryAccount, bankName);

    setDefaultValues(() => ({
      code: code,
      amount: amount,
      method: selectedMethodLabel,
      debit_credit: debitCredit,
      bank_name: bankName,
      acc_no: '',
      acc_holder_name: '',
      ifsc: '',
    }));
    setSelectedBeneficiary({});
  };

  const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accNo = e.target.value;
    if (!accNo || !selectedBankName) return;

    const beneficiary = beneficiaries.beneficiaryAccount.find(
      (b: Beneficiary) =>
        b.acc_no === accNo && b.bank_name === selectedBankName,
    );

    if (beneficiary) {
      setSelectedBeneficiary(beneficiary);
      setDefaultValues((prev: any) => ({
        ...prev,
        // debit_credit: debitCredit,
        bank_name: selectedBankName,
        acc_no: beneficiary.acc_no || '',
        acc_holder_name: beneficiary.acc_holder_name || '',
        ifsc: beneficiary.ifsc || '',
      }));
      setSelectedBeneficiary(beneficiary || {});
    } else {
      setSelectedBeneficiary({});
    }
  };

  useEffect(() => {
    const fetchMerchantCodes = async () => {
      let merchantCodesList;
      merchantCodesList = await getAllMerchantCodes(false, true);
      if (merchantCodesList) {
        dispatch(getMerchantCodes(merchantCodesList));
      }
    };
    const fetchVendorCodes = async () => {
      const vendorCodesList = await getAllVendorCodes(true,true,false,true,true);
      if (vendorCodesList) {
        dispatch(getVendorCodes(vendorCodesList));
      }
    };

    const fetchData = async () => {
      if (role === Role.ADMIN) {
        await Promise.all([fetchMerchantCodes(), fetchVendorCodes()]);
      } else if (role === Role.MERCHANT) {
        await fetchMerchantCodes();
      } else {
        await fetchVendorCodes();
      }
    };

    fetchData();
  }, [role, dispatch]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCode(e.target.value);
    // fetchBeneficiary(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleDebitCredit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDebitCredit(e.target.value);
  };

  const merchantCodes = useAppSelector(selectAllMerchantCodes);
  const vendorCodes = useAppSelector(selectAllVendorCodes);
  const options = (() => {
    if (role === Role.ADMIN) {
      return parentTab === 0
        ? merchantCodes.map((merchant) => ({
            value: merchant.value,
            label: merchant.label,
          }))
        : vendorCodes.map((vendor) => ({
            value: vendor.value,
            label: vendor.label,
          }));
    } else if (role === Role.MERCHANT) {
      return merchantCodes.map((merchant) => ({
        value: merchant.value,
        label: merchant.label,
      }));
    } else {
      return vendorCodes.map((vendor) => ({
        value: vendor.value,
        label: vendor.label,
      }));
    }
  })();

  const beneficiaries = useAppSelector(selectAllBeneficiaryAccounts);

  const handleSubmitData = async (data: any) => {
    setIsLoading(true);
    const selectedVendor = vendorCodes.find(
      (vendor) => vendor.value === data.code,
    );
    const selectedMerchant = merchantCodes.find(
      (merchant) => merchant.value === data.code,
    );
    const userId =
      selectedVendor?.value?.toString() ||
      selectedMerchant?.value?.toString() ||
      null;
    // if (title === 'Merchant Settlement') {
    //   data.bank_id = data.bank_name;
    // delete data.bank_name;
    // delete data.acc_holder_name;
    // delete data.acc_no;
    // delete data.ifsc;
    // }
    const payload: {
      user_id: string | null;
      amount?: number;
      [key: string]: any;
    } = {
      ...Object.fromEntries(
        Object.entries(data).filter(
          ([, value]) => value !== undefined && value !== null && value !== '',
        ),
      ),
      user_id: userId,
    };

    if (
      data.debit_credit == '' ||
      data.method === 'INTERNAL_BANK_TRANSFER' ||
      data.method === 'INTERNAL_QR_TRANSFER'
    ) {
      delete data.debit_credit;
    }
    const adjustedValue =
      data.debit_credit === 'RECEIVED'
        ? Number(amount) > 0
          ? -Number(amount)
          : Number(amount)
        : Math.abs(Number(amount));
    if (
      data.method !== 'INTERNAL_BANK_TRANSFER' &&
      data.method !== 'INTERNAL_QR_TRANSFER'
    ) {
      //only send utr in internal case
      delete payload.utr;
      payload.amount = adjustedValue;
      payload.config = {
        debit_credit: data.debit_credit,
      };
    }

    delete (payload as any)?.code; // Remove the 'code' key as per original logic
    delete (payload as any)?.debit_credit; // Remove the 'method' key as per original logic
    try {
      const addedSettlement = await createSettlement(payload);
      if (addedSettlement.meta) {
        dispatch(setRefreshSettlement(true));
        dispatch(addSettlement(addedSettlement));
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message:'Settlement added successfully'
          })
        );
        setNewSettlementModal(false);
        setDefaultValues({
          code: '',
          amount: '',
          method: '',
          debit_credit: '',
          bank_name: '',
          acc_holder_name: '',
          acc_no: '',
          ifsc: '',
          wallet_balance: '',
          description: '',
          utr: '',
        });
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message:addedSettlement?.error?.message || 'Failed to add settlement'
          })
        );
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message:'Error creating settlement'
        })
      );
      setNewSettlementModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-y-4 sm:gap-y-6 md:gap-y-10 gap-x-3 sm:gap-x-6">
      <div className="col-span-12">
        <div className="flex items-center min-h-10 mx-2 sm:mx-3 my-2 justify-between gap-2">
          <div className="text-lg sm:text-xl md:text-2xl font-medium group-[.mode--light]:text-white">
            {title}
          </div>
          <Modal
            handleModal={settlementModal}
            forOpen={newSettlementModal}
            buttonTitle={`Add Settlement`}
          >
            <DynamicForm
              sections={{
                Add_Settlement: getSettlementsFormFields(
                  options,
                  title === 'Merchant Settlement'
                    ? SettlementOptions.merchantSettlement
                    : SettlementOptions.vendorSettlement,
                  updated,
                  handleMethodChange,
                  handleBeneficiaryChange,
                  handleCodeChange,
                  handleAmountChange,
                  handleDebitCredit,
                  handleBankNameChange,
                  accountNumberOptions,
                ).Add_Settlement.filter(Boolean) as any[],
                Bank_Details: getSettlementsFormFields(
                  options,
                  title === 'Merchant Settlement'
                    ? SettlementOptions.merchantSettlement
                    : SettlementOptions.vendorSettlement,
                  updated,
                  handleMethodChange,
                  handleBeneficiaryChange,
                  handleCodeChange,
                  handleAmountChange,
                  handleDebitCredit,
                  handleBankNameChange,
                  accountNumberOptions,
                ).Bank_Details(
                  selectedMethodLabel,
                  beneficiaryOptions,
                  selectedBeneficiary,
                  // title,
                ),
                Crypto_Details: getSettlementsFormFields(
                  options,
                  title === 'Merchant Settlement'
                    ? SettlementOptions.merchantSettlement
                    : SettlementOptions.vendorSettlement,
                  updated,
                  handleMethodChange,
                  handleBeneficiaryChange,
                  handleCodeChange,
                  handleAmountChange,
                  handleDebitCredit,
                  handleBankNameChange,
                  accountNumberOptions,
                ).Crypto_Details(selectedMethodLabel),
                Description: getSettlementsFormFields(
                  options,
                  title === 'Merchant Settlement'
                    ? SettlementOptions.merchantSettlement
                    : SettlementOptions.vendorSettlement,
                  updated,
                  handleMethodChange,
                  handleBeneficiaryChange,
                  handleCodeChange,
                  handleAmountChange,
                  handleDebitCredit,
                  handleBankNameChange,
                  accountNumberOptions,
                ).Description(selectedMethodLabel),
                Internal_transfer: getSettlementsFormFields(
                  options,
                  title === 'Merchant Settlement'
                    ? SettlementOptions.merchantSettlement
                    : SettlementOptions.vendorSettlement,
                  updated,
                  handleMethodChange,
                  handleBeneficiaryChange,
                  handleCodeChange,
                  handleAmountChange,
                  handleDebitCredit,
                  handleBankNameChange,
                  accountNumberOptions,
                ).Internal_transfer(selectedMethodLabel),
              }}
              onSubmit={handleSubmitData}
              defaultValues={defaultValues}
              isEditMode={false}
              handleCancel={settlementModal}
              isLoading={isLoading}
            />
          </Modal>
        </div>
        {role === Role.VENDOR && (
          <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
            <div className="flex flex-col p-5 box box--stacked">
              <VendorSettlement refreshSettlement={refreshSettlement} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
