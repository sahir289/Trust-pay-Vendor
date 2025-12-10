import {
  FormLabel,

} from "@/components/Base/Form";
import { Dialog, Menu } from '@/components/Base/Headless';

import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import React from "react";
import { FormInput } from "@/components/Base/Form";

// SubMerchant interface definition

// Roles interface definition
export interface Designation {
  sno: number; // Serial number or index
  position: string; // Position of the person
  name: string; // Person's name
  manager: string; // Manager's name
  joinedDate: string; // Date they joined
  status: string; // Status, perhaps active or inactive
  department?: string; // Optional department field
}

interface ModalProps {
  handleModal: () => void;
  title: string;
  transaction: Designation; // Type for transaction
}

const DesignationDetails: React.FC<ModalProps> = ({ handleModal, transaction }) => {

  return (
    <Dialog open={true} onClose={handleModal}>
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="mr-auto text-base font-medium">
            Designation Details
          </h2>
          <Lucide
            icon="X"
            className="w-5 h-5 ml-px stroke-[3]"
            // onClick={() => setNewMerchantModal(false)}
            onClick={handleModal}
          />
          <Menu className="sm:hidden">
            <Menu.Button
              as="a"
              className="block w-5 h-5"
              href="#"
            >
              <Lucide
                icon="MoreHorizontal"
                className="w-5 h-5 text-slate-500"
              />
            </Menu.Button>

          </Menu>
        </Dialog.Title>
        <div className="px-3 sm:px-5 mt-2">
          <FormLabel htmlFor="modal-form-name">
            Name
          </FormLabel>
          <FormInput
            id="modal-form-name"
            type="text"
            placeholder={transaction.name}
          />
        </div>

        <Dialog.Description className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-3 sm:px-5 mt-3">
          <div className="col-span-1">
            <FormLabel htmlFor="modal-form-sno">
              Sno
            </FormLabel>
            <FormInput
              id="modal-form-sno"
              type="text"
              placeholder={transaction.sno.toString()}
            />
          </div>
          <div className="col-span-1">
            <FormLabel htmlFor="modal-form-position">
              Position
            </FormLabel>
            <FormInput
              id="modal-form-position"
              type="text"
              placeholder={transaction.position}
            />
          </div>
          <div className="col-span-1">
            <FormLabel htmlFor="modal-form-manager">
              Manager
            </FormLabel>
            <FormInput
              id="modal-form-manager"
              type="text"
              placeholder={transaction.manager}
            />
          </div>
          <div className="col-span-1">
            <FormLabel htmlFor="modal-form-joineddate">
              Joined Date
            </FormLabel>
            <FormInput
              id="modal-form-joineddate"
              type="text"
              placeholder={transaction.joinedDate}
            />
          </div>
          <div className="col-span-1">
            <FormLabel htmlFor="modal-form-status">
              Status
            </FormLabel>
            <FormInput
              id="modal-form-status"
              type="text"
              placeholder={transaction.status}
            />
          </div>
          <div className="col-span-1">
            <FormLabel htmlFor="modal-form-department">
              Department
            </FormLabel>
            <FormInput
              id="modal-form-department"
              type="text"
              placeholder={transaction.department}
            />
          </div>
        </Dialog.Description>


        <Dialog.Footer className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleModal}
            className="w-full sm:w-20 sm:mr-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            className="w-full sm:w-20 sm:ml-3"
          >
            Save
          </Button>
        </Dialog.Footer>

      </Dialog.Panel>
    </Dialog>
  );
};

export default DesignationDetails;