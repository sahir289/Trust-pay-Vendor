/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import React from 'react';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import clsx from 'clsx';

interface ModalContentProps {
  handleCancelDelete: () => void;
  handleConfirmDelete?: () => void;
  children?: React.ReactNode;
  check?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
}

const ModalContent: React.FC<ModalContentProps> = ({
  handleCancelDelete,
  handleConfirmDelete,
  children,
  check = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  const darkMode = useAppSelector(selectDarkMode);

  const getConfirmButtonStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/25 hover:shadow-red-500/35';
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/35';
      default:
        return 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 shadow-indigo-500/25 hover:shadow-indigo-500/35';
    }
  };

  return (
    <div className="relative">
      {/* Content Area */}
      <div className={clsx([
        'mb-5',
        darkMode ? 'text-white/90' : 'text-slate-700',
      ])}>
        {children}
      </div>

      {/* Action Buttons */}
      {check && (
        <div className={clsx([
          'flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4',
          darkMode ? 'border-t border-white/10' : 'border-t border-slate-200',
        ])}>
          <Button
            type="button"
            onClick={handleCancelDelete}
            className={clsx([
              'w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              darkMode
                ? 'bg-transparent border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white'
                : 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800',
            ])}
          >
            <Lucide icon="X" className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>
          
          {handleConfirmDelete && (
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className={clsx([
                'w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                getConfirmButtonStyles(),
                'shadow-lg hover:shadow-xl',
                'text-white border-0',
                'hover:scale-[1.02] active:scale-[0.98]',
              ])}
            >
              <Lucide icon="Check" className="w-4 h-4 mr-2" />
              {confirmText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModalContent;
