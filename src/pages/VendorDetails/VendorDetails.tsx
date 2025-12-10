import {
    FormLabel,
} from "@/components/Base/Form";
import { Dialog, Menu } from '@/components/Base/Headless';
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import React from "react";
import { FormInput } from "@/components/Base/Form";

export interface VendorAccount {
    sno: number;
    code: string;
    vendor_commission: number;
    created_date: string;
    created_by: string;
    status: string;
    action: string;
    updated_at: string;
    name: string;
    method: string;
}

export interface ModalProps {
    handleModal: () => void;
    vendor: VendorAccount;
}

const ModalVendor: React.FC<ModalProps> = ({ handleModal, vendor }) => {
    return (
        <Dialog open={true} onClose={handleModal}>
            <Dialog.Panel>
                <Dialog.Title>
                    <h2 className="mr-auto text-base font-medium">
                        Vendor Details
                    </h2>
                    <Lucide
                        icon="X"
                        className="w-5 h-5 ml-px stroke-[3]"
                        onClick={handleModal}
                    />
                    <Menu className="sm:hidden">
                        <Menu.Button as="a" className="block w-5 h-5" href="#">
                            <Lucide icon="MoreHorizontal" className="w-5 h-5 text-slate-500" />
                        </Menu.Button>
                    </Menu>
                </Dialog.Title>
                
                <div className="p-5">
                    <div className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="vendor-name">Name</FormLabel>
                            <FormInput id="vendor-name" type="text" placeholder={vendor.name} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="vendor-code">Code</FormLabel>
                            <FormInput id="vendor-code" type="text" placeholder={vendor.code} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="vendor-status">Status</FormLabel>
                            <FormInput id="vendor-status" type="text" placeholder={vendor.status} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormLabel htmlFor="vendor-method">Payment Method</FormLabel>
                            <FormInput id="vendor-method" type="text" placeholder={vendor.method} />
                        </div>
                    </div>
                </div>
                
                <Dialog.Footer className="mt-4">
                    <Button type="button" variant="outline-secondary" onClick={handleModal} className="w-20 mr-1">
                        Cancel
                    </Button>
                    <Button variant="primary" type="button" className="w-20 ml-3">
                        Save
                    </Button>
                </Dialog.Footer>
            </Dialog.Panel>
        </Dialog>
    );
};

export default ModalVendor;
