/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import React from 'react';
import { Dialog } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';

interface ModalProps {
  handleModal: () => void;
  sendButtonRef?: React.RefObject<HTMLButtonElement>;
  title?: string;
  buttonTitle?: string;
  forOpen: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  handleModal,
  sendButtonRef,
  title,
  buttonTitle,
  forOpen,
  children,
}) => {
  return (
    <>
      {buttonTitle && (
        <Button
          variant="primary"
          className={`${
            buttonTitle === 'Claims Filter' || buttonTitle === 'Filter'
              ? 'group-[.mode--light]:!bg-slate-100 group-[.mode--light]:!text-slate-800'
              : 'group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200'
          } group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box`}
          as="a"
          href="#"
          onClick={() => {
            handleModal();
            handleModal();
          }}
        >
          <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
          {buttonTitle}
        </Button>
      )}
      <Dialog open={forOpen} onClose={() => {}}  initialFocus={sendButtonRef}>
        <Dialog.Panel
          className="w-[96%] sm:w-full max-w-lg transform overflow-y-auto max-h-[90vh] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left align-middle shadow-xl transition-all mx-auto"
          style={{ backgroundColor: '#0b1224' }}
        >
          <Dialog.Title className="flex text-base sm:text-lg justify-between items-center mb-3 sm:mb-4 sticky top-0 pb-3 border-b -mx-4 sm:-mx-6 px-4 sm:px-6 z-10">
            <h1 className="font-bold sm:font-semibold text-primary dark:text-slate-200">
              {/* {!isEditMode ? 'Add' : 'Edit'}{" "} */}
              {title}
            </h1>
            <Lucide
              icon="X"
              className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              onClick={handleModal}
            />
          </Dialog.Title>
          <div className="pt-3 sm:pt-4" style={{ backgroundColor: '#0b1224' }}>{children}</div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default Modal;