import React from 'react';
import clsx from 'clsx';

interface DrawerProps {
  open: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({
  open,
  position = 'bottom',
  children,
}) => {
  return (
    <div
      className={clsx(
        'fixed z-40 bg-white dark:bg-darkmode-800/90 shadow-lg text-gray-800 dark:text-slate-200 border-transparent',
        'col-span-12 px-5',
        {
          'translate-y-full': position === 'bottom' && !open,
          'translate-y-0': position === 'bottom' && open,
          'translate-x-full': position === 'right' && !open,
          'translate-x-0': position === 'right' && open,
          '-translate-y-full': position === 'top' && !open,
          '-translate-y-0': position === 'top' && open,
          '-translate-x-full': position === 'left' && !open,
          '-translate-x-0': position === 'left' && open,
        },
      )}
      style={{
        transitionDuration: '300ms',
        ...(position === 'bottom'
          ? { height: '10%', width: '100%', position: 'fixed', top: 'auto', bottom: '0' }
          : { width: '35%', height: '100%', bottom: 0 }),
        ...(position === 'bottom' ? { bottom: 0 } : {}),
        ...(position === 'top' ? { top: 0 } : {}),
        ...(position === 'left' ? { left: 0 } : {}),
        ...(position === 'right' ? { right: 0 } : {}),
      }}
    >
      <div className="relative h-full w-full">
        <div className="p-4 ml-4">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
