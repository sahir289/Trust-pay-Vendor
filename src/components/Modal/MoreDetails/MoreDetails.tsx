/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Lucide from '@/components/Base/Lucide';
import renderObjectData, { OtherDetailsProvider } from '@/utils/other-details';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import clsx from 'clsx';

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
  const darkMode = useAppSelector(selectDarkMode);

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

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw' }}>
      {/* Backdrop */}
      <div 
        className={clsx([
          'absolute inset-0 backdrop-blur-sm transition-opacity duration-300',
          darkMode ? 'bg-black/50' : 'bg-black/30',
        ])}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
      />
      
      {/* Right Side Panel */}
      <div
        ref={modalRef}
        className={clsx([
          'relative w-[60vw] shadow-2xl flex flex-col animate-slideInRight',
          darkMode 
            ? 'bg-slate-900 border-l border-white/10'
            : 'bg-white border-l border-slate-200',
        ])}
        style={{ height: '100vh', minHeight: '100vh', maxHeight: '100vh' }}
      >
        {/* Decorative side gradient line */}
        <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-theme-1 via-theme-2 to-theme-1" />
        
        {/* Header */}
        <div className={clsx([
          'relative flex-none px-6 py-5 border-b',
          darkMode 
            ? 'bg-white/5 border-white/10'
            : 'bg-slate-50 border-slate-200',
        ])}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-theme-1 to-theme-2 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-theme-2 to-theme-1 rounded-full blur-2xl" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-theme-1 to-theme-2 flex items-center justify-center shadow-lg shadow-theme-1/25">
                <Lucide icon="FileText" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={clsx([
                  'text-xl font-bold',
                  darkMode ? 'text-white' : 'text-slate-800',
                ])}>
                  {title}
                </h2>
                <p className={clsx([
                  'text-sm mt-0.5',
                  darkMode ? 'text-white/50' : 'text-slate-500',
                ])}>
                  View complete information
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={clsx([
                'group w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
                darkMode 
                  ? 'bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-red-500/80 hover:border-red-500/50 focus:ring-white/30'
                  : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-white hover:bg-red-500 hover:border-red-500 focus:ring-slate-300',
              ])}
              aria-label="Close panel"
              type="button"
            >
              <Lucide icon="X" className="w-5 h-5 pointer-events-none transition-transform group-hover:rotate-90 duration-300" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable area */}
        <div className={clsx([
          'flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 custom-scrollbar',
          darkMode ? 'bg-slate-900/50' : 'bg-slate-50/50',
        ])}>
          {data && Object.keys(data).length > 0 ? (
            <OtherDetailsProvider darkMode={darkMode}>
              <div className="space-y-5">
                {renderObjectData(data as any)}
              </div>
            </OtherDetailsProvider>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 h-full">
              <div className={clsx([
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-4',
                darkMode 
                  ? 'bg-white/5 border border-white/10'
                  : 'bg-slate-100 border border-slate-200',
              ])}>
                <Lucide icon="Inbox" className={clsx([
                  'w-10 h-10',
                  darkMode ? 'text-white/30' : 'text-slate-300',
                ])} />
              </div>
              <p className={clsx([
                'font-medium text-base',
                darkMode ? 'text-white/60' : 'text-slate-500',
              ])}>
                No additional details available
              </p>
              <p className={clsx([
                'text-sm mt-1',
                darkMode ? 'text-white/40' : 'text-slate-400',
              ])}>
                Check back later for updates
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {check && (
          <div className={clsx([
            'relative flex-none px-6 py-4 border-t',
            darkMode 
              ? 'border-white/10 bg-white/5'
              : 'border-slate-200 bg-slate-50',
          ])}>
            <div className="flex justify-between items-center gap-3">
              <p className={clsx([
                'text-xs',
                darkMode ? 'text-white/40' : 'text-slate-400',
              ])}>
                Press <kbd className={clsx([
                  'px-1.5 py-0.5 rounded text-[10px]',
                  darkMode 
                    ? 'bg-white/10 text-white/60'
                    : 'bg-slate-200 text-slate-600',
                ])}>ESC</kbd> to close
              </p>
              <button
                onClick={onClose}
                className="group px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-theme-1 to-theme-2 hover:from-theme-1/90 hover:to-theme-2/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-1/50 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-theme-1/25"
              >
                <Lucide icon="Check" className="w-4 h-4" />
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom styles */}
      <style>{`
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(100%);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        /* Custom scrollbar styles for dark mode */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)'};
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.15) rgba(0, 0, 0, 0.05)'};
        }
      `}</style>
    </div>
  );

  // Use createPortal to render modal at document.body level
  return createPortal(modalContent, document.body);
};

export default MoreDetailsModal;
