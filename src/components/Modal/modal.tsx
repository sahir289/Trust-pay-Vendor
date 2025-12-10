/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import { PreviewComponent, Preview } from "@/components/Base/PreviewComponent";
import {
  FormLabel,
  FormSwitch,
  FormInput,
  FormSelect,
} from "@/components/Base/Form";
import { Dialog, Menu } from "@/components/Base/Headless";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Litepicker from "@/components/Base/Litepicker";
// import Select from 'react-select'
import React, { useState } from "react";
import MultiSelect from "../MultiSelect/MultiSelect";
import { Role } from "@/constants";
interface ModalProps {
  handleModal: () => void;
  sendButtonRef: React.RefObject<HTMLButtonElement>;
  title: string;
  forOpen: boolean;
  codes?: string[] | any;
  selectedFilter?: any,
  setSelectedFilter?: any,
  selectedFilterDates?: any,
  setSelectedFilterDates?: any,
  handleFilterData?: any,
  userRole?: string; // Add this new prop
}
interface OptionChangeEvent {
  target: {
    value: string;
  };
}
const Modal: React.FC<ModalProps> = ({
  handleModal,
  sendButtonRef,
  title,
  forOpen,
  codes,
  selectedFilter,
  setSelectedFilter,
  selectedFilterDates,
  setSelectedFilterDates,
  handleFilterData,
  userRole, // Add this new prop
}) => {
  const [selectedOption, setSelectedOption] = useState("PayIn");
  const [showPassword, setShowPassword] = useState(false);
  
  const handleOptionChange = (event: OptionChangeEvent) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
        <PreviewComponent>
          {() => (
            <>
              <Preview>
                <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
                  <Button
                    variant="primary"
                    className="group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                    as="a"
                    href="#"
                    onClick={() => {
                      // event.preventDefault();
                      handleModal();
                    }}
                  >
                    <Lucide
                      icon="PenLine"
                      className="stroke-[1.3] w-4 h-4 mr-2"
                    />{" "}
                    {title}
                  </Button>
                </div>
                {title === "PayIns" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>New Payment Link</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                        <FormLabel htmlFor="modal-form-1">Merchant</FormLabel>
                        <FormInput
                          id="modal-form-1"
                          type="text"
                          placeholder="example@gmail.com"
                        />
                      </div>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-2">User ID</FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">Amount</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <div className="flex flex-row col-span-12 sm:col-span-6 mx-6">
                        <div className="items-center mt-2">
                          {" "}
                          <FormLabel htmlFor="modal-form-3 ">
                            One time payment link ?
                          </FormLabel>
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel
                            htmlFor="modal-form-4"
                            className="px-3 pt-2"
                          >
                            <FormSwitch className=" dark:border-red-500 rounded-lg">
                              <FormSwitch.Label
                                htmlFor="show-example-1 "
                                className="ml-4"
                              >
                                <FormSwitch.Input
                                  id="show-example-1"
                                  //   onClick={}
                                  className="ml-0 mr-0 border-2 border-slate-300  "
                                  type="checkbox"
                                />
                              </FormSwitch.Label>
                            </FormSwitch>
                          </FormLabel>
                        </div>
                      </div>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
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
                        >
                          Save
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}

                {title === "password verification" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel>
                      <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                          Password Verification
                        </h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
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
                      <fieldset className="col-span-12 sm:col-span-12 border-2 rounded-lg border-gray-200 mx-5 my-2">
                        <legend className="ml-4 pt-1 px-2">Password</legend>
                        <Dialog.Description>
                          <div className="relative col-span-12 sm:col-span-12">
                            <FormInput
                              id="modal-form-1"
                              placeholder="Type here..."
                              type={showPassword ? "text" : "password"} // Toggle password visibility
                              className="w-full pr-10" // Space for icon
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showPassword ? (
                                <Lucide icon="EyeOff" />
                              ) : (
                                <Lucide icon="Eye" />
                              )}
                            </button>
                          </div>
                        </Dialog.Description>
                      </fieldset>
                      <Dialog.Footer>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-20"
                        >
                          Verify
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Add Bank Account" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel>
                      <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                          Add Bank Account
                        </h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
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
                      <Dialog.Description className="grid grid-cols-12 gap-2 gap-y-7">
                        <fieldset className="col-span-12 sm:col-span-12 border-2 rounded-lg border-gray-200 mx-5 my-2">
                          <legend className="ml-4 pt-1 px-2">Details</legend>
                          <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-7">
                            <div className="col-span-12 sm:col-span-12">
                              <FormLabel htmlFor="modal-form-1">
                                Bank Account Nick Name
                              </FormLabel>
                              <FormInput
                                id="modal-form-1"
                                placeholder="..."
                                type="text"
                              />
                            </div>
                            <div className="col-span-12 sm:col-span-6">
                              <FormLabel htmlFor="modal-form-1">
                                Bank Name
                              </FormLabel>
                              <FormInput
                                id="modal-form-1"
                                placeholder="..."
                                type="text"
                              />
                            </div>

                            <div className="col-span-12 sm:col-span-6">
                              <FormLabel htmlFor="modal-form-6">
                                PayIn/PayOut
                              </FormLabel>

                              <FormSelect
                                id="modal-form-6"
                                onChange={handleOptionChange}
                                value={selectedOption}
                              >
                                <option value="PayIn">PayIn</option>
                                <option value="PayOut">PayOut</option>
                              </FormSelect>
                            </div>
                            <div className="col-span-12 sm:col-span-12">
                              <FormLabel htmlFor="modal-form-1">
                                Bank Account Holder Name
                              </FormLabel>
                              <FormInput
                                id="modal-form-1"
                                placeholder="..."
                                type="text"
                              />
                            </div>
                            <div className="col-span-12 sm:col-span-12">
                              <FormLabel htmlFor="modal-form-1">
                                Account Number
                              </FormLabel>
                              <FormInput id="modal-form-1" type="Number" />
                            </div>
                            <div className="col-span-12 sm:col-span-6">
                              <FormLabel htmlFor="modal-form-1">
                                IFSC Code
                              </FormLabel>
                              <FormInput id="modal-form-1" type="text" />
                            </div>
                            <div className="col-span-12 sm:col-span-6">
                              <FormLabel htmlFor="modal-form-1">
                                UPI ID
                              </FormLabel>
                              <FormInput
                                id="modal-form-1"
                                placeholder="..."
                                type="text"
                              />
                            </div>
                          </Dialog.Description>
                        </fieldset>
                        {selectedOption === "PayIn" && (
                          <fieldset className="col-span-12 sm:col-span-12 border-2 rounded-lg border-gray-200 mx-5 my-2">
                            <legend className="ml-4 pt-1 px-2">Pay IN</legend>
                            <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-7">
                              <div className="col-span-12 sm:col-span-6">
                                <FormLabel htmlFor="modal-form-1">
                                  Min
                                </FormLabel>
                                <FormInput id="modal-form-1" type="Number" />
                              </div>
                              <div className="col-span-12 sm:col-span-6">
                                <FormLabel htmlFor="modal-form-1">
                                  Max
                                </FormLabel>
                                <FormInput id="modal-form-1" type="Number" />
                              </div>
                            </Dialog.Description>
                          </fieldset>
                        )}

                        {/* Conditional Rendering for PayOut Field */}
                        {selectedOption === "PayOut" && (
                          <fieldset className="col-span-12 sm:col-span-12 border-2 rounded-lg border-gray-200 mx-5 my-2">
                            <legend className="ml-4 pt-1 px-2">Pay Out</legend>
                            <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-7">
                              <div className="col-span-12 sm:col-span-6">
                                <FormLabel htmlFor="modal-form-1">
                                  Min
                                </FormLabel>
                                <FormInput id="modal-form-1" type="Number" />
                              </div>
                              <div className="col-span-12 sm:col-span-6">
                                <FormLabel htmlFor="modal-form-1">
                                  Max
                                </FormLabel>
                                <FormInput id="modal-form-1" type="Number" />
                              </div>
                            </Dialog.Description>
                          </fieldset>
                        )}
                        <div className="col-span-12 sm:col-span-12 flex flex-col justify-between items-center">
                          <div className="flex flex-row justify-between">
                            <div className="col-span-12  flex items-center justify-between">
                              <FormLabel
                                htmlFor="modal-form-1"
                                className="mr-2 pt-2"
                              >
                                Enabled
                              </FormLabel>
                              <FormSwitch className="dark:border-red-500 rounded-lg">
                                <FormSwitch.Label
                                  htmlFor="show-example-1"
                                  className="ml-0"
                                >
                                  <FormSwitch.Input
                                    id="show-example-1"
                                    className="ml-0 mr-0 border-2 border-slate-300"
                                    type="checkbox"
                                  />
                                </FormSwitch.Label>
                              </FormSwitch>
                            </div>
                            <div className="col-span-12 sm:col-span-4 flex items-center justify-between">
                              <FormLabel
                                htmlFor="modal-form-1"
                                className="mr-2 pt-2"
                              >
                                QR?
                              </FormLabel>
                              <FormSwitch className="dark:border-red-500 rounded-lg">
                                <FormSwitch.Label
                                  htmlFor="show-example-1"
                                  className="ml-0"
                                >
                                  <FormSwitch.Input
                                    id="show-example-1"
                                    className="ml-0 mr-0 border-2 border-slate-300"
                                    type="checkbox"
                                  />
                                </FormSwitch.Label>
                              </FormSwitch>
                            </div></div>
                          <div className="flex flex-row justify-between">
                            <div className="col-span-12 sm:col-span-4 flex items-center justify-between">
                              <FormLabel
                                htmlFor="modal-form-1"
                                className="mr-2 pt-2"
                              >
                                Bank?
                              </FormLabel>
                              <FormSwitch className="dark:border-red-500 rounded-lg">
                                <FormSwitch.Label
                                  htmlFor="show-example-1"
                                  className="ml-0"
                                >
                                  <FormSwitch.Input
                                    id="show-example-1"
                                    className="ml-0 mr-0 border-2 border-slate-300"
                                    type="checkbox"
                                  />
                                </FormSwitch.Label>
                              </FormSwitch>
                            </div>
                            <div className="col-span-12 sm:col-span-4 flex items-center justify-between">
                              <FormLabel
                                htmlFor="modal-form-1"
                                className="mr-2 pt-2"
                              >
                                PhonePay?
                              </FormLabel>
                              <FormSwitch className="dark:border-red-500 rounded-lg">
                                <FormSwitch.Label
                                  htmlFor="show-example-1"
                                  className="ml-0"
                                >
                                  <FormSwitch.Input
                                    id="show-example-1"
                                    className="ml-0 mr-0 border-2 border-slate-300"
                                    type="checkbox"
                                  />
                                </FormSwitch.Label>
                              </FormSwitch>
                            </div></div>
                        </div>
                      </Dialog.Description>
                      <Dialog.Footer>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={handleModal}
                          className="w-20 mr-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-20"

                        >
                          ok
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Designation" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel>
                      <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                          New Designation
                        </h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
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
                      <fieldset className="col-span-12 sm:col-span-12 border-2 rounded-lg border-gray-200 mx-5 my-2">
                        <legend className="ml-4 pt-1 px-2"></legend>
                        <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                          <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1">Name</FormLabel>
                            <FormInput
                              id="modal-form-1"
                              placeholder="designation.."
                              type="text"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1">Role</FormLabel>
                            <FormInput
                              id="modal-form-1"
                              placeholder="role.."
                              type="text"
                            />
                          </div>
                        </Dialog.Description>
                      </fieldset>

                      <Dialog.Footer>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={handleModal}
                          className="w-20 mr-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-20"
                        >
                          ok
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Add Roles" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel>
                      <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                          New Role
                        </h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
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
                      <fieldset className="col-span-12 sm:col-span-12 border-2 rounded-lg border-gray-200 mx-5 my-2">
                        <legend className="ml-4 pt-1 px-2">Role</legend>
                        <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                          <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1"></FormLabel>
                            <FormInput
                              id="modal-form-1"
                              placeholder=""
                              type="text"
                            />
                          </div>
                        </Dialog.Description>
                      </fieldset>
                      <Dialog.Footer>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={handleModal}
                          className="w-20 mr-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-20"
                        >
                          ok
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Add Vendors" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel>
                      <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                          New Vendor
                        </h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
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
                      <fieldset className="col-span-12 sm:col-span-12 rounded-lg mx-5 my-2">
                        <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                          <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1">First Name</FormLabel>
                            <FormInput id="modal-form-1" type="text" />
                          </div>
                          <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1">
                              Last Name
                            </FormLabel>
                            <FormInput id="modal-form-1" type="text" />
                          </div>
                        </Dialog.Description>
                        <Dialog.Description className="flex flex-row gap-4 gap-y-3">
                          <div className="col-span-2 sm:col-span-2">
                            <FormLabel htmlFor="modal-form-1">Code</FormLabel>
                            <FormInput id="modal-form-1" type="text" />
                          </div>
                          <div className="col-span-2 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1">
                              Balance
                            </FormLabel>
                            <FormInput id="modal-form-1" type="text" />
                          </div>
                        </Dialog.Description>
                        <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                          <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1">Pay in Commission</FormLabel>
                            <FormInput id="modal-form-1" type="text" />
                          </div>
                          <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-1">
                              Pay out Commission
                            </FormLabel>
                            <FormInput id="modal-form-1" type="text" />
                          </div>
                        </Dialog.Description>
                      </fieldset>
                      <Dialog.Footer>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={handleModal}
                          className="w-20 mr-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-20"
                        >
                          ok
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}

                {title === "PayOuts" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>PayOut</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6 mx-4 ">
                          <FormLabel htmlFor="modal-form-1">Merchant</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-2">User ID</FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <fieldset className="border-2 rounded-lg border-gray-200 mx-5 my-2">
                        <legend className="ml-4 pt-1 px-2">
                          Account Details
                        </legend>

                        <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                          <FormLabel htmlFor="modal-form-1">
                            Account Number
                          </FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="flex flex-row">
                          <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                            <FormLabel htmlFor="modal-form-1">
                              Account Holder Name
                            </FormLabel>
                            <FormInput
                              id="modal-form-1"
                              type="text"
                              placeholder="example@gmail.com"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                            <FormLabel htmlFor="modal-form-1">
                              IFSC code
                            </FormLabel>
                            <FormInput
                              id="modal-form-1"
                              type="text"
                              placeholder="example@gmail.com"
                            />
                          </div>
                        </div>
                        <div className="flex flex-row">
                          <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                            <FormLabel htmlFor="modal-form-1">
                              Bank Name
                            </FormLabel>
                            <FormInput
                              id="modal-form-1"
                              type="text"
                              placeholder="example@gmail.com"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-6 mx-4 my-4">
                            <FormLabel htmlFor="modal-form-1">Amount</FormLabel>
                            <FormInput
                              id="modal-form-1"
                              type="text"
                              placeholder="example@gmail.com"
                            />
                          </div>
                        </div>
                      </fieldset>
                      <div className="flex flex-row col-span-12 sm:col-span-6 mx-6">
                        <div className="items-center mt-2">
                          {" "}
                          <FormLabel htmlFor="modal-form-3 ">
                            One time payment link ?
                          </FormLabel>
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel
                            htmlFor="modal-form-4"
                            className="px-3 pt-2"
                          >
                            <FormSwitch className=" dark:border-red-500 rounded-lg">
                              <FormSwitch.Label
                                htmlFor="show-example-1 "
                                className="ml-4"
                              >
                                <FormSwitch.Input
                                  id="show-example-1"
                                  //   onClick={}
                                  className="ml-0 mr-0 border-2 border-slate-300  "
                                  type="checkbox"
                                />
                              </FormSwitch.Label>
                            </FormSwitch>
                          </FormLabel>
                        </div>
                      </div>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
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
                        >
                          Save
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Add Merchant" &&
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      // setNewMerchantModal(false);
                      handleModal()
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel>
                      <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                          {title}
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
                          placeholder="Merchant Code"
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
                              placeholder="example@gmail.com"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="modal-form-2">
                              Return Site
                            </FormLabel>
                            <FormInput
                              id="modal-form-2"
                              type="text"
                              placeholder="example@gmail.com"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="modal-form-3">
                              Callback
                            </FormLabel>
                            <FormInput
                              id="modal-form-3"
                              type="text"
                              placeholder="example@gmail.com"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="modal-form-4">
                              PayOut Callback
                            </FormLabel>
                            <FormInput
                              id="modal-form-4"
                              type="text"
                              placeholder="example@gmail.com"
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
                              placeholder="example@gmail.com"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="modal-form-3">
                              Max PayIn
                            </FormLabel>
                            <FormInput
                              id="modal-form-3"
                              type="text"
                              placeholder="example@gmail.com"
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
                            placeholder="example@gmail.com"
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
                              placeholder="example@gmail.com"
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="modal-form-4">
                              Max PayOut
                            </FormLabel>
                            <FormInput
                              id="modal-form-4"
                              type="text"
                              placeholder="example@gmail.com"
                            />
                          </div></Dialog.Description>

                        <div className="col-span-12 sm:col-span-6 mx-5">
                          <FormLabel htmlFor="modal-form-4">
                            PayOut Commission
                          </FormLabel>
                          <FormInput
                            id="modal-form-4"
                            type="text"
                            placeholder="example@gmail.com"
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
                  </Dialog>}

                {title === "Merchant Settlement" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>Merchant Settlement</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                        <FormLabel htmlFor="modal-form-1">Merchant</FormLabel>
                        <FormInput
                          id="modal-form-1"
                          type="text"
                          placeholder="example@gmail.com"
                        />
                      </div>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">Amount</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-2">Method</FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
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
                        >
                          Save
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Vendor Settlement" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                        <FormLabel htmlFor="modal-form-1">Vendor</FormLabel>
                        <FormInput
                          id="modal-form-1"
                          type="text"
                          placeholder="example@gmail.com"
                        />
                      </div>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">Amount</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-2">Method</FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
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
                        >
                          Save
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Add Chargeback" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <div className="col-span-12 sm:col-span-6 mx-4 mt-4">
                        <FormLabel htmlFor="modal-form-1">Merchant</FormLabel>
                        <FormInput
                          id="modal-form-1"
                          type="text"
                          placeholder="example@gmail.com"
                        />
                      </div>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">
                            Merchant Order ID
                          </FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-2">User ID</FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">Amount</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-2">
                            Reference Date
                          </FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="date"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>

                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          className="w-20 mr-1"
                        >
                          Reset
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-30 ml-3"
                          onClick={
                            handleModal
                            // setNewMerchantModal(false);
                          }
                        >
                          Add Chargeback
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Add User" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6 mx-2">
                          <FormLabel htmlFor="modal-form-1">
                            Full Name
                          </FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">
                            User Name
                          </FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6 mx-2">
                          <FormLabel htmlFor="modal-form-2">Password</FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6  ">
                          <FormLabel htmlFor="modal-form-1">Role</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6  ">
                          <FormLabel htmlFor="modal-form-1">First Name</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div><div className="col-span-12 sm:col-span-6  ">
                          <FormLabel htmlFor="modal-form-1">Last Name</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>

                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
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
                        >
                          Save
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Add Data" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6 mx-2">
                          <FormLabel htmlFor="modal-form-1">Bank</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">Amount</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6 mx-2">
                          <FormLabel htmlFor="modal-form-2">
                            Amount Code
                          </FormLabel>
                          <FormInput
                            id="modal-form-2"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6  ">
                          <FormLabel htmlFor="modal-form-1">UTR</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
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
                        >
                          Save
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Check UTR" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6 mx-2">
                          <FormLabel htmlFor="modal-form-1">
                            Merchant Order ID
                          </FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel htmlFor="modal-form-1">UTR</FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
                            // setNewMerchantModal(false);
                          }
                          className="w-20 mr-1"
                        >
                          Reset
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-30 ml-3"
                        >
                          Check UTR
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Reset Entry" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <Dialog.Description>
                        <div className="col-span-12 sm:col-span-6 mx-2">
                          <FormLabel htmlFor="modal-form-1">
                            Merchant Order ID
                          </FormLabel>
                          <FormInput
                            id="modal-form-1"
                            type="text"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={
                            handleModal
                            // setNewMerchantModal(false);
                          }
                          className="w-20 mr-1"
                        >
                          Reset
                        </Button>
                        <Button
                          variant="primary"
                          type="button"
                          className="w-30 ml-3"
                        >
                          Reset Deposit
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Merchant Board" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <Dialog.Description>
                        <div className="col-span-12 sm:col-span-6 mx-2 mt-4">
                          <div className="relative">
                            <Lucide
                              icon="Calendar"
                              className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
                            />
                            <Litepicker
                              value={selectedFilterDates}
                              onChange={(e) => {
                                setSelectedFilterDates(e.target.value);
                              }}
                              enforceRange={false}
                              options={{
                                autoApply: false,
                                singleMode: false,
                                numberOfColumns: 2,
                                numberOfMonths: 2,
                                showWeekNumbers: true,
                                selectForward: false,
                                selectBackward: false,
                                splitView: false,
                                dropdowns: {
                                  minYear: 1990,
                                  maxYear: null,
                                  months: true,
                                  years: true,
                                },
                              }}
                              className="w-full pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                            />
                          </div>
                        </div>
                        {/* Only show merchant selection if not MERCHANT role */}
                        {userRole !== Role.MERCHANT && (
                          <div className="col-span-12 sm:col-span-6 mx-2 mt-2">
                            <FormLabel htmlFor="modal-form-1">Merchant</FormLabel>
                            <MultiSelect 
                              codes={codes} 
                              selectedFilter={selectedFilter} 
                              setSelectedFilter={setSelectedFilter} 
                            />
                          </div>
                        )}
                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          variant="primary"
                          type="button"
                          className="w-30 ml-3"
                          onClick={handleFilterData}
                        >
                          Search
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
                {title === "Vendor Board" && (
                  <Dialog
                    open={forOpen}
                    onClose={() => {
                      handleModal();
                    }}
                    initialFocus={sendButtonRef}
                  >
                    <Dialog.Panel className="pt-2 pb-4">
                      <Dialog.Title className="justify-between">
                        <h2>{title}</h2>
                        <Lucide
                          icon="X"
                          className="w-5 h-5 ml-px stroke-[3]"
                          // onClick={() => setNewMerchantModal(false)}
                          onClick={handleModal}
                        />
                      </Dialog.Title>
                      <Dialog.Description>
                        <div className="col-span-12 sm:col-span-6 mx-2 mt-4">
                          <div className="relative">
                            <Lucide
                              icon="Calendar"
                              className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
                            />
                            <Litepicker
                              value={selectedFilterDates}
                              onChange={(e) => {
                                setSelectedFilterDates(e.target.value);
                              }}
                              enforceRange={false}
                              options={{
                                autoApply: false,
                                singleMode: false,
                                numberOfColumns: 2,
                                numberOfMonths: 2,
                                showWeekNumbers: true,
                                selectForward: false,
                                selectBackward: false,
                                splitView: false,
                                dropdowns: {
                                  minYear: 1990,
                                  maxYear: null,
                                  months: true,
                                  years: true,
                                },
                              }}
                              className="w-ful pl-9 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
                            />
                          </div>
                        </div>
                        {userRole !== Role.VENDOR && (
                        <div className="col-span-12 sm:col-span-6 mx-2 mt-2">
                          <FormLabel htmlFor="modal-form-1">Vendor</FormLabel>
                          <MultiSelect codes={codes} selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
                        </div> 
                        )}
                      </Dialog.Description>
                      <Dialog.Footer className="mt-4">
                        <Button
                          variant="primary"
                          type="button"
                          className="w-30 ml-3"
                          onClick={handleFilterData}
                        >
                          Search
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Panel>
                  </Dialog>
                )}
              </Preview>
            </>
          )}
        </PreviewComponent>
      </div>
    </div>
  );
};

export default Modal;
