import { FormLabel } from '@/components/Base/Form';
import { Dialog, Menu } from '@/components/Base/Headless';

import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import React from 'react';
import { FormInput } from '@/components/Base/Form';

// SubMerchant interface definition

// Roles interface definition
export interface BankDetails {
  accountName: string;
  bankDetails: string;
  accountNumber: string;
  upiId: string;
  limits: string;
  balance: string;
  allowIntent: boolean;
  allowQR: boolean;
  showBank: boolean;
  status: 'Active' | 'Inactive';
  action: string;
  bankUsedFor: 'PayOuts' | 'Settlements' | 'PayIns';
  vendors: string;
  createdAt: string;
  lastScheduledAt: string;
}

interface ModalProps {
  handleModal: () => void;
  title: string;
  transaction: BankDetails; // Type for transaction
}

const BankDetailsModal: React.FC<ModalProps> = ({
  handleModal,
  transaction,
}) => {
  return (
    <Dialog open={true} onClose={handleModal}>
      <Dialog.Panel>
        <Dialog.Title>
          <h2 className="mr-auto text-base font-medium">
            Bank Account Details
          </h2>
          <Lucide
            icon="X"
            className="w-5 h-5 ml-px stroke-[3]"
            onClick={handleModal}
          />
          <Menu className="sm:hidden">
            <Menu.Button as="a" className="block w-5 h-5" href="#">
              <Lucide
                icon="MoreHorizontal"
                className="w-5 h-5 text-slate-500"
              />
            </Menu.Button>
          </Menu>
        </Dialog.Title>

        {/* Account Name */}
        <div className="px-3 sm:px-5 mt-2">
          <FormLabel htmlFor="account-name">Account Name</FormLabel>
          <FormInput
            id="account-name"
            type="text"
            placeholder={transaction.accountName}
          />
        </div>

        <Dialog.Description className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-3 sm:px-5 mt-3">
          {/* Bank Details */}
          <div className="col-span-1">
            <FormLabel htmlFor="bank-details">Bank Details</FormLabel>
            <FormInput
              id="bank-details"
              type="text"
              placeholder={transaction.bankDetails}
            />
          </div>

          {/* Account Number */}
          <div className="col-span-1">
            <FormLabel htmlFor="account-number">Account Number</FormLabel>
            <FormInput
              id="account-number"
              type="text"
              placeholder={transaction.accountNumber}
            />
          </div>

          {/* UPI ID */}
          <div className="col-span-1">
            <FormLabel htmlFor="upi-id">UPI ID</FormLabel>
            <FormInput
              id="upi-id"
              type="text"
              placeholder={transaction.upiId}
            />
          </div>

          {/* Balance */}
          <div className="col-span-1">
            <FormLabel htmlFor="balance">Balance</FormLabel>
            <FormInput
              id="balance"
              type="text"
              placeholder={transaction.balance}
            />
          </div>

          {/* Status */}
          <div className="col-span-1">
            <FormLabel htmlFor="status">Status</FormLabel>
            <FormInput
              id="status"
              type="text"
              placeholder={transaction.status}
            />
          </div>

          {/* Bank Used For */}
          <div className="col-span-1">
            <FormLabel htmlFor="bank-used-for">Bank Used For</FormLabel>
            <FormInput
              id="bank-used-for"
              type="text"
              placeholder={transaction.bankUsedFor}
            />
          </div>

          {/* Vendors */}
          <div className="col-span-1">
            <FormLabel htmlFor="vendors">Vendors</FormLabel>
            <FormInput
              id="vendors"
              type="text"
              placeholder={transaction.vendors}
            />
          </div>

          {/* Created At */}
          <div className="col-span-1">
            <FormLabel htmlFor="created-at">Created At</FormLabel>
            <FormInput
              id="created-at"
              type="text"
              placeholder={transaction.createdAt}
            />
          </div>

          {/* Last Scheduled At */}
          <div className="col-span-1">
            <FormLabel htmlFor="last-scheduled-at">Last Scheduled At</FormLabel>
            <FormInput
              id="last-scheduled-at"
              type="text"
              placeholder={transaction.lastScheduledAt}
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
          <Button variant="primary" type="button" className="w-full sm:w-20 sm:ml-3">
            Save
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default BankDetailsModal;
