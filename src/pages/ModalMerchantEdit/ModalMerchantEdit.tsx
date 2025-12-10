 import {
    FormLabel,
    FormSwitch,
} from "@/components/Base/Form";
import { Dialog, Menu } from '@/components/Base/Headless';

import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import React from "react";
import { FormInput } from "@/components/Base/Form";

// SubMerchant interface definition
export interface SubMerchant {
    name: string;
    code: string;
    site: string;
    apikey: string;
    public_api_key: string;
    balance: string;
    payin_range: string;
    payin_commission: string;
    payout_range: string;
    payout_commission: string;
    test_mode: string;
    allow_intent: string;
    created_at: string;
    actions: string;
}

// Merchant interface definition
export interface Merchant {
    name: string;
    code: string;
    site: string;
    apikey: string;
    public_api_key: string;
    balance: string;
    payin_range: string;
    payin_commission: string;
    payout_range: string;
    payout_commission: string;
    test_mode: string;
    allow_intent: string;
    created_at: string;
    actions: string;
    submerchant: SubMerchant[];
}

interface ModalProps {
    handleModal: () => void;
    title: string;
    transaction: Merchant; // Type for transaction
}

const ModalMerchantEdit: React.FC<ModalProps> = ({ handleModal, transaction }) => {

    return (
        <Dialog open={true} onClose={handleModal}>
            <Dialog.Panel>
              <Dialog.Title>
                <h2 className="mr-auto text-base font-medium">
                 Merchant Details
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
                  Code
                </FormLabel>
                <FormInput
                  id="modal-form-1"
                  type="text"
                  placeholder={transaction.code}
                />
              </div>
              <div></div>
              <fieldset className="border-2 rounded-lg border-gray-200 mx-5 my-2">
                <legend className="ml-4 pt-1 px-2">URLs</legend>
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-1">
                      Site
                    </FormLabel>
                    <FormInput
                      id="modal-form-1"
                      type="text"
                      placeholder={transaction.site}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-2">
                      Return Site
                    </FormLabel>
                    <FormInput
                      id="modal-form-2"
                      type="text"
                      placeholder={transaction.site}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-3">
                      Callback
                    </FormLabel>
                    <FormInput
                      id="modal-form-3"
                      type="text"
                      placeholder={transaction.site}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-4">
                      PayOut Callback
                    </FormLabel>
                    <FormInput
                      id="modal-form-4"
                      type="text"
                      placeholder={transaction.site}
                    />
                  </div>
                </Dialog.Description>
              </fieldset>
              <fieldset className="border-2 rounded-lg border-gray-200 mx-5 my-2 pb-4">
                <legend className="ml-5 pt-1 px-2">Pay In</legend>
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">

                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-3">
                      Min PayIn
                    </FormLabel>
                    <FormInput
                      id="modal-form-3"
                      type="text"
                      placeholder={transaction.payin_range}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-3">
                      Max PayIn
                    </FormLabel>
                    <FormInput
                      id="modal-form-3"
                      type="text"
                      placeholder={transaction.payin_range}
                    />
                  </div>
                </Dialog.Description>
                <div className="col-span-12 sm:col-span-6 mx-5">
                  <FormLabel htmlFor="modal-form-3">
                    PayIn Commission
                  </FormLabel>
                  <FormInput
                    id="modal-form-3"
                    type="text"
                    placeholder={transaction.payin_commission}
                  />
                </div>
              </fieldset>
              <fieldset className="border-2 rounded-lg border-gray-200 mx-5 my-2 pb-4">
                <legend className="ml-5 pt-1 px-2">Pay Out</legend>
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-4">
                      Min PayOut
                    </FormLabel>
                    <FormInput
                      id="modal-form-4"
                      type="text"
                      placeholder={transaction.payout_range}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-4">
                      Max PayOut
                    </FormLabel>
                    <FormInput
                      id="modal-form-4"
                      type="text"
                      placeholder={transaction.payout_range}
                    />
                  </div></Dialog.Description>

                <div className="col-span-12 sm:col-span-6 mx-5">
                  <FormLabel htmlFor="modal-form-4">
                    PayOut Commission
                  </FormLabel>
                  <FormInput
                    id="modal-form-4"
                    type="text"
                    placeholder={transaction.payout_commission}
                  />
                </div>
              </fieldset>
              <div className="flex flex-row justify-between mx-10">
                <div className="col-span-12 flex flex-row sm:col-span-6 px-4 pt-2 justify-center">
                  <FormLabel htmlFor="modal-form-4 " className="px-3 pt-2">
                    Test Mode :
                  </FormLabel>
                  <FormSwitch className=" dark:border-red-500 rounded-lg">
                    <FormSwitch.Label
                      htmlFor="show-example-1 "
                      className="ml-0 "
                    >
                      <FormSwitch.Input
                        id="show-example-1"
                        //   onClick={}
                        className="ml-0 mr-0 border-2 border-slate-300  "
                        type="checkbox"
                      />
                    </FormSwitch.Label>
                  </FormSwitch>
                </div>
                <div className="col-span-12 flex flex-row sm:col-span-6 px-4 pt-2 justify-center">
                  <FormLabel htmlFor="modal-form-4" className="px-3 pt-2">
                    Allow Intent :
                  </FormLabel>
                  <FormSwitch className=" dark:border-red-500 rounded-lg">
                    <FormSwitch.Label
                      htmlFor="show-example-1 "
                      className="ml-0 "
                    >

                      <FormSwitch.Input
                        id="show-example-1"
                        //   onClick={}
                        className="ml-0 mr-0 border-2 border-slate-300  "
                        type="checkbox"
                      />
                    </FormSwitch.Label>
                  </FormSwitch>
                </div>
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