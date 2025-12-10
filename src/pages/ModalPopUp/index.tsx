/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { FC, useState } from "react";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";

interface Field {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  singleField: Field[];
  buttonText: string;
  onSubmit: (data: Record<string, string>) => void; // Send form data
  onReset: () => void;
  resetRef: React.RefObject<HTMLButtonElement>;
}

const ModalPopUp: FC<ModalDialogProps> = ({
  open,
  onClose,
  title,
  fields,
  singleField,
  buttonText,
  onSubmit,
  onReset,
  resetRef,
}) => {
  // Store form values
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Handle input change
  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Reset form values
  const handleReset = () => {
    setFormData({});
    onReset();
  };

  return (
    <Dialog open={open} onClose={onClose} initialFocus={resetRef}>
      <Dialog.Panel className="pt-2 pb-4">
        <Dialog.Title className="justify-between">
          <h2>{title}</h2>
          <Lucide
            icon="X"
            className="w-5 h-5 ml-px stroke-[3]"
            onClick={onClose}
          />
        </Dialog.Title>

        {fields.length > 0 && (
          <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
            {fields.map((field) => (
              <div key={field.id} className="col-span-1 sm:col-span-6 mx-2">
                <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                <FormInput
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
              </div>
            ))}
          </Dialog.Description>
        )}

        {singleField.length > 0 && (
          <Dialog.Description className="mx-1">
            {singleField.map((val) => (
              <div key={val.id} className="mx-2 mb-2">
                <FormLabel htmlFor={val.id}>{val.label}</FormLabel>
                <FormInput
                  id={val.id}
                  type={val.type}
                  placeholder={val.placeholder}
                  value={formData[val.id] || ""}
                  onChange={(e) => handleInputChange(val.id, e.target.value)}
                />
              </div>
            ))}
          </Dialog.Description>
        )}

        <Dialog.Description className="mt-1 flex justify-end">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleReset}
            className="w-20 mr-1"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            type="button"
            className="w-30 ml-3"
            onClick={() => onSubmit(formData)} // Pass form data on submit
          >
            {buttonText}
          </Button>
        </Dialog.Description>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ModalPopUp;
