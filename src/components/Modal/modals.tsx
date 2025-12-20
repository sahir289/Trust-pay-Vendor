/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import React from 'react';
import { Dialog } from '@/components/Base/Headless';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import clsx from 'clsx';

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
  const darkMode = useAppSelector(selectDarkMode);

  return (
    <>
      {buttonTitle && (
        <Button
          variant="primary"
          className={clsx([
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200',
            'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500',
            'hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600',
            'shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35',
            'text-white border-0',
            'hover:scale-[1.02] active:scale-[0.98]',
          ])}
          as="a"
          href="#"
          onClick={() => {
            handleModal();
            handleModal();
          }}
        >
          <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4" />
          {buttonTitle}
        </Button>
      )}
      
      <Dialog open={forOpen} onClose={handleModal} initialFocus={sendButtonRef}>
        {/* Backdrop */}
        <div 
          className={clsx([
            'fixed inset-0 z-40',
            darkMode ? 'bg-black/60' : 'bg-black/40',
            'backdrop-blur-sm',
          ])} 
          aria-hidden="true"
        />
        
        {/* Modal Container - centers the panel */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Panel
            className={clsx([
              'relative w-full max-w-lg',
              'transform overflow-y-auto max-h-[90vh]',
              'rounded-2xl sm:rounded-3xl',
              'p-0',
              'text-left',
              'transition-all duration-300',
              // Background
              darkMode 
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                : 'bg-gradient-to-br from-white via-slate-50 to-white',
              // Border
              darkMode ? 'border border-white/10' : 'border border-slate-200',
              // Shadow
              darkMode 
                ? 'shadow-2xl shadow-black/50'
                : 'shadow-2xl shadow-slate-400/30',
            ])}
          >
            {/* Decorative gradient overlay */}
            <div className={clsx([
              'absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none overflow-hidden',
              darkMode 
                ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.1),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.08),transparent_40%)]'
                : 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.05),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.04),transparent_40%)]',
            ])} />

            {/* Header */}
            {title && (
              <Dialog.Title className={clsx([
                'relative flex justify-between items-center',
                'px-5 sm:px-6 py-4 sm:py-5',
                'border-b',
                darkMode ? 'border-white/10' : 'border-slate-200',
                darkMode 
                  ? 'bg-white/5'
                  : 'bg-slate-50/80',
                'rounded-t-2xl sm:rounded-t-3xl',
              ])}>
                {/* Decorative accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-t-2xl sm:rounded-t-3xl" />
                
                <div className="flex items-center gap-3">
                  <div className={clsx([
                    'flex items-center justify-center w-9 h-9 rounded-xl',
                    'bg-gradient-to-br from-indigo-500/20 to-cyan-500/20',
                    darkMode ? 'border border-white/10' : 'border border-slate-200',
                  ])}>
                    <Lucide 
                      icon="FileText" 
                      className={clsx([
                        'w-4 h-4',
                        darkMode ? 'text-indigo-400' : 'text-indigo-600',
                      ])} 
                    />
                  </div>
                  <h1 className={clsx([
                    'text-base sm:text-lg font-bold',
                    darkMode ? 'text-white' : 'text-slate-800',
                  ])}>
                    {title}
                  </h1>
                </div>
                
                <button
                  onClick={handleModal}
                  type="button"
                  className={clsx([
                    'group flex items-center justify-center w-9 h-9 rounded-xl',
                    'transition-all duration-200',
                    darkMode 
                      ? 'bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30'
                      : 'bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200',
                    darkMode 
                      ? 'text-white/60 hover:text-red-400'
                      : 'text-slate-400 hover:text-red-500',
                  ])}
                >
                  <Lucide
                    icon="X"
                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
                  />
                </button>
              </Dialog.Title>
            )}

            {/* Close button when no title */}
            {!title && (
              <button
                onClick={handleModal}
                type="button"
                className={clsx([
                  'absolute top-4 right-4 z-10',
                  'group flex items-center justify-center w-9 h-9 rounded-xl',
                  'transition-all duration-200',
                  darkMode 
                    ? 'bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30'
                    : 'bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200',
                  darkMode 
                    ? 'text-white/60 hover:text-red-400'
                    : 'text-slate-400 hover:text-red-500',
                ])}
              >
                <Lucide
                  icon="X"
                  className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
                />
              </button>
            )}

            {/* Content */}
            <div className={clsx([
              'relative px-5 sm:px-6 py-4 sm:py-5',
              darkMode ? 'text-white' : 'text-slate-800',
            ])}>
              {children}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default Modal;