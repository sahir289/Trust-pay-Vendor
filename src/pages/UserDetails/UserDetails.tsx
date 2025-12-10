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
export interface Roles {
    name: string;
    position: string;
    photo: string;
    email: string;
    phone: string;
    department: string;
    location: string;
    joinedDate: string;
    manager: string;
    addressLine1: string;
    addressLine2: string;
    isActive: boolean;
}

interface ModalProps {
    handleModal: () => void;
    title: string;
    transaction: Roles; // Type for transaction
}

const ModalMerchantEdit: React.FC<ModalProps> = ({ handleModal, transaction }) => {

    return (
        <Dialog open={true} onClose={handleModal}>
            <Dialog.Panel>
              <Dialog.Title>
                <h2 className="mr-auto text-base font-medium">
                 Roles Details
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
              <div className="col-span-12 sm:col-span-6 mx-5 mt-2">
                <FormLabel htmlFor="modal-form-1">
                name
                </FormLabel>
                <FormInput
                  id="modal-form-1"
                  type="text"
                  placeholder={transaction.name}
                />
              </div>
              <div></div>
              
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                  
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-2">
                    position
                    </FormLabel>
                    <FormInput
                      id="modal-form-2"
                      type="text"
                      placeholder={transaction.position}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-3">
                    manager
                    </FormLabel>
                    <FormInput
                      id="modal-form-3"
                      type="text"
                      placeholder={transaction.manager}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-4">
                    joinedDate
                    </FormLabel>
                    <FormInput
                      id="modal-form-4"
                      type="text"
                      placeholder={transaction.joinedDate}
                    />
                  </div>
                </Dialog.Description>
             
             
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">

                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-3">
                    phone
                    </FormLabel>
                    <FormInput
                      id="modal-form-3"
                      type="text"
                      placeholder={transaction.phone}
                    />
                  </div>
                 
                </Dialog.Description>
                <div className="col-span-12 sm:col-span-6 mx-5">
                  <FormLabel htmlFor="modal-form-3">
                  department
                  </FormLabel>
                  <FormInput
                    id="modal-form-3"
                    type="text"
                    placeholder={transaction.department}
                  />
                </div>
             

              <Dialog.Footer className="mt-4">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleModal
                    // setNewMerchantModal(false);
                  }
                  className="w-20 mr-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  className="w-20 ml-3"
                // ref={sendButtonRef}
                >
                  Save
                </Button>
              </Dialog.Footer>

            </Dialog.Panel>
          </Dialog>
    );
};

export default ModalMerchantEdit;