/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Lucide from '@/components/Base/Lucide';
import Modal from "../modals";
import ModalContent from "@/components/Modal/ModalContent/ModalContent";
import Select from 'react-select';

interface Merchant {
  id: string;
  code: string;
}

interface Option {
  label: string;
  value: string;
}

interface Codes {
  label: string;
  value: string;
  merchant_id: string;
  submerchants: [];
}

const schema = yup.object().shape({
  merchant_user_id: yup.array().of(yup.string()).nullable(),
});

interface AssignMerchantModalProps {
  title: string;
  forOpen: boolean;
  handleModal: () => void;
  userOptions: Option[];
  merchants: Merchant[];
  merchantsCodes: Codes[];
  onSubmit: (merchantIds: any) => void;
}

const AssignMerchantModal: React.FC<AssignMerchantModalProps> = ({
  title,
  forOpen,
  handleModal,
  userOptions = [],
  merchants = [],
  merchantsCodes = [],
  onSubmit,
}) => {
  const [selectedMerchants, setSelectedMerchants] = useState<Merchant[]>([]);
  const [unassignedMerchants, setUnassignedMerchants] = useState<Option[]>([]);
  const [removedMerchants, setRemovedMerchants] = useState<Merchant[]>([]);
  const [addedMerchants, setAddedMerchants] = useState<Merchant[]>([]);
  const [updateFlag, setUpdateFlag] = useState<boolean>(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  useEffect(() => {
    setSelectedMerchants(merchants || []);
    const assignedMerchantIds = new Set(merchants.map((m) => m.id));
    const unassigned = userOptions.filter((option) => !assignedMerchantIds.has(option.value));
    setUnassignedMerchants(unassigned);
    setUpdateFlag(false);
    setRemovedMerchants([]);
    setAddedMerchants([]);
    setTempSelectedIds([]);
  }, [JSON.stringify(merchants), userOptions]);

  const {
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { merchant_user_id: [] },
  });

  const addMerchant = () => {
    const newMerchants = tempSelectedIds
      .filter((id) => !selectedMerchants.some((m) => m.id === id) && !addedMerchants.some((m) => m.id === id))
      .map((id) => unassignedMerchants.find((option) => option.value === id))
      .filter(Boolean)
      .map((option) => ({ id: option!.value, code: option!.label }));

    if (newMerchants.length > 0) {
      setAddedMerchants((prev) => [...prev, ...newMerchants]);
      setUnassignedMerchants((prev) => prev.filter((m) => !tempSelectedIds.includes(m.value)));
      setTempSelectedIds([]);
      setValue("merchant_user_id", []);
      setUpdateFlag(true);
    }
  };

  const removeMerchant = (merchantId: string) => {
    const merchantToRemove = selectedMerchants.find((m) => m.id === merchantId);
    if (merchantToRemove) {
      setSelectedMerchants((prev) => prev.filter((m) => m.id !== merchantId));
      setRemovedMerchants((prev) => {
        const isAlreadyRemoved = prev.some((m) => m.id === merchantToRemove.id);
        if (isAlreadyRemoved) return prev;
        return [...prev, merchantToRemove];
      });
      setUnassignedMerchants((prev) => [
        ...prev,
        { label: merchantToRemove.code, value: merchantToRemove.id },
      ]);
      setUpdateFlag(true);
    }
  };

  const restoreMerchant = (merchantId: string) => {
    const merchantToRestore = removedMerchants.find((m) => m.id === merchantId);
    if (merchantToRestore) {
      setRemovedMerchants((prev) => prev.filter((m) => m.id !== merchantId));
      setSelectedMerchants((prev) => [...prev, merchantToRestore]);
      setUnassignedMerchants((prev) => prev.filter((m) => m.value !== merchantId));
      setUpdateFlag(true);
    }
  };

  const removeAddedMerchant = (merchantId: string) => {
    const merchantToRemove = addedMerchants.find((m) => m.id === merchantId);
    if (merchantToRemove) {
      setAddedMerchants((prev) => prev.filter((m) => m.id !== merchantId));
      setUnassignedMerchants((prev) => [
        ...prev,
        { label: merchantToRemove.code, value: merchantToRemove.id },
      ]);
      setUpdateFlag(addedMerchants.length > 1 || removedMerchants.length > 0 || selectedMerchants.length > 0);
    }
  };

  const handleSelectChange = (selectedIds: string[]) => {
    setTempSelectedIds(selectedIds);
  };

 const handleFormSubmit = () => {

  // Step 1: Remove merchants and their submerchants from selectedMerchants
  const removedMerchantIds = new Set(removedMerchants.map((m) => m.id));
  let subMerchantIdsToRemove = new Set<string>();

  // Collect submerchant IDs for removed parent merchants
  for (const removedMerchant of removedMerchants) {
    const merchantCode = merchantsCodes.find((code) => code.merchant_id === removedMerchant.id);
    if (merchantCode && merchantCode.submerchants?.length > 0) {
      const subMerchantIds = merchantCode?.submerchants?.map((sub:any) => sub.merchant_id);
      subMerchantIds.forEach((id:any) => subMerchantIdsToRemove.add(id));
    }
  }

  // Filter out both removed merchants and their submerchants
  let updatedSelectedMerchants = selectedMerchants.filter(
    (m) => !removedMerchantIds.has(m.id) && !subMerchantIdsToRemove.has(m.id)
  );

  // Step 2: Process addedMerchants, include submerchants if they exist
  let processedAddedMerchants: Merchant[] = [];
  for (const merchant of addedMerchants) {
    processedAddedMerchants.push(merchant);
    // Check if the merchant has submerchants in merchantsCodes
    const merchantCode = merchantsCodes.find((code) => code.merchant_id === merchant.id);
    if (merchantCode && merchantCode.submerchants.length > 0) {
      // Include submerchants as Merchant objects
      const submerchants = merchantCode.submerchants
        .map((sub: { merchant_id: string }) => {
          const subMerchantOption = userOptions.find((option) => option.value === sub.merchant_id);
          if (subMerchantOption) {
            return { id: sub.merchant_id, code: subMerchantOption.label };
          }
          return null;
        })
        .filter((sub): sub is Merchant => sub !== null);
      processedAddedMerchants.push(...submerchants);
    }
  }

  // Step 3: Combine updatedSelectedMerchants with processedAddedMerchants
  const finalMerchants = [...updatedSelectedMerchants, ...processedAddedMerchants];

  // Step 4: Ensure uniqueness and convert to merchant IDs
  const merchantIds = [...new Set(finalMerchants.map((merchant) => merchant.id))];

  onSubmit(merchantIds);
  setRemovedMerchants([]);
  setAddedMerchants([]);
  setUpdateFlag(false);
  setTempSelectedIds([]);
};

  if (!forOpen) return null;

  return (
    <Modal handleModal={handleModal} forOpen={forOpen}>
      <ModalContent
        handleCancelDelete={handleModal}
        handleConfirmDelete={handleModal}
        buttonTitle="Update"
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {/* List of Assigned Merchants */}
        <div className="space-y-3 mb-4">
          {selectedMerchants.length > 0 ? (
            selectedMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-200"
              >
                <span className="text-gray-800 font-medium">{merchant.code}</span>
                <button
                  onClick={() => removeMerchant(merchant.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Lucide icon="Trash" className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">{`No ${title} assigned yet.`}</p>
          )}
        </div>

        {/* List of Added Merchants */}
        {addedMerchants.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="flex justify-between items-center text-md font-medium text-gray-700">
              <span>{`Added ${title}`}</span>
              <Lucide
                onClick={() => setAddedMerchants([])}
                icon="X"
                className="w-5 h-5 cursor-pointer"
              />
            </h3>
            {addedMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex justify-between items-center bg-green-50 p-3 rounded-lg shadow-sm border border-green-200"
              >
                <span className="text-gray-800 font-medium">{merchant.code}</span>
                <button
                  onClick={() => removeAddedMerchant(merchant.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Lucide icon="Trash" className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* List of Removed Merchants */}
        {removedMerchants.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="flex justify-between items-center text-md font-medium text-gray-700">
              <span>{`Removed ${title}`}</span>
              <Lucide
                onClick={() => setRemovedMerchants([])}
                icon="X"
                className="w-5 h-5 cursor-pointer"
              />
            </h3>
            {removedMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex justify-between items-center bg-red-50 p-3 rounded-lg shadow-sm border border-red-200"
              >
                <span className="text-gray-800 font-medium line-through">{merchant.code}</span>
                <button
                  onClick={() => restoreMerchant(merchant.id)}
                  className="text-green-500 hover:text-green-700"
                >
                  <Lucide icon="RotateCcw" className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Multi-Select Dropdown with Add Button */}
        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
          <div className="mb-4">
            <Controller
              name = {`merchant_user_id${title === "Merchants" ? "" : ".0"}`}
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    className="w-full mt-1"
                    options={unassignedMerchants}
                    value={unassignedMerchants.filter((option) =>
                      tempSelectedIds.includes(option.value)
                    )}
                    onChange={(selectedOptions) => {
                      const newValues = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
                      field.onChange(newValues);
                      handleSelectChange(newValues);
                    }}
                    menuPortalTarget={document.body} //rendered dropdown in dom
                    placeholder={`Select ${title}`}
                    //dark mode and dropdown changes
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: isDarkMode
                          ? 'rgb(255 255 255 / 0)'
                          : 'white',
                        color: isDarkMode ? '#cbd5e1' : '#111827',
                        borderColor: 'transparent',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: isDarkMode ? 'rgb(255 255 255 / 0)' : 'white',
                        zIndex: 9999,  //for dropdown getting cropped fixed
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999, //for dropdown getting cropped fixed
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? isDarkMode
                            ? '#374151'
                            : '#e5e7eb'
                          : isDarkMode
                          ? 'black'
                          : 'white',
                        color: state.isSelected
                          ? 'white'
                          : isDarkMode
                          ? '#cbd5e1'
                          : '#111827',
                      }),
                    }}
                  />
                  <button
                    type="button"
                    onClick={addMerchant}
                    disabled={tempSelectedIds.length === 0}
                    className={`px-4 py-2 rounded-md ${
                      tempSelectedIds.length === 0
                      //dark  mode changes
                        ? isDarkMode
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-400 text-white cursor-not-allowed"
                        : isDarkMode
                        ? "bg-green-700 text-gray-100 hover:bg-green-800"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    Add
                  </button>
                </div>
              )}
            />
            {errors.merchant_user_id && (
              <p className="text-red-500 text-sm mt-1">{errors.merchant_user_id.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`px-4 py-2 rounded-md w-full ${
              !updateFlag
                ? isDarkMode
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-gray-400 cursor-not-allowed text-white"
                : isDarkMode
                ? "bg-blue-700 text-gray-100 hover:bg-blue-800"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={!updateFlag}
          >
            Update
          </button>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AssignMerchantModal;