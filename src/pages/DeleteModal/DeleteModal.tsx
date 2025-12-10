import Button from '@/components/Base/Button';
import {  FormLabel } from '@/components/Base/Form';
import { Dialog } from '@/components/Base/Headless';
import Lucide from '@/components/Base/Lucide';
import React, {  MutableRefObject } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  resetRef: MutableRefObject<HTMLElement | null>;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, resetRef }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={true} onClose={onClose} initialFocus={resetRef}>
        <Dialog.Panel className="pt-2 pb-4">
          <Dialog.Title className="justify-between">
            <h2>Delete</h2>
            <Lucide
              icon="X"
              className="w-5 h-5 ml-px stroke-[3]"
              onClick={onClose}
            />
          </Dialog.Title>
         
            <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
              
                <div  className="col-span-1 sm:col-span-6 mx-2">
                  <FormLabel >Are you sure you want to delete?</FormLabel>
                
                </div>
             
            </Dialog.Description>

         
        
          <Dialog.Description className="mt-1  flex justify-end">
            <Button
              type="button"
              variant="outline-secondary"
           
              className="w-20 mr-1"
            >
              Reset
            </Button>
            <Button
              variant='danger'
              type="button"
              className="w-30 ml-3"
         
            >
              Delete
            </Button>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
  );
};

export default DeleteModal;
