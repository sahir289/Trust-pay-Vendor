/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import Lucide from '@/components/Base/Lucide';
import renderObjectData from '@/utils/other-details';

interface MoreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data: { [key: string]: any } | any[];
  check?: boolean;
}

const MoreDetailsModal: React.FC<MoreDetailsModalProps> = ({
  isOpen,
  onClose,
  title = 'Additional Details',
  data,
  check = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (modalRef.current && !modalRef.current.contains(e.target as Node)) { //using Node for pointing to DOM 
  //     onClose();
  //   }
  // };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 dark:bg-darkmode-900/70 p-2 sm:p-4"
      // onClick={handleBackgroundClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-white rounded-lg sm:rounded-2xl shadow-2xl dark:bg-darkmode-600 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-darkmode-500">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-200 truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex-shrink-0"
            aria-label="Close modal"
            type="button"
          >
            <Lucide icon="X" className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {data && Object.keys(data).length > 0 ? (
            renderObjectData(data as any)
          ) : (
            <div className="text-center text-gray-500 italic py-6 sm:py-10 text-sm sm:text-base">
              No additional details available
            </div>
          )}
        </div>

        {check && (
          <div className="flex justify-end px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-darkmode-500 bg-gray-50 dark:bg-darkmode-700 rounded-b-lg sm:rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-darkmode-500 dark:hover:bg-darkmode-400 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoreDetailsModal;
