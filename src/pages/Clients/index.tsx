import React from 'react';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { Role } from '@/constants';
import Vendor from '@/pages/Clients/Vendors/index';
import clsx from 'clsx';

const Clients: React.FC = () => {
  const darkMode = useAppSelector(selectDarkMode);
  const data = localStorage.getItem('userData');
  const parsedData = data ? JSON.parse(data) : null;
  const userRole = parsedData?.designation;

  return (
    <div className={clsx([
      'grid grid-cols-12 gap-y-10 gap-x-6 min-h-screen',
      darkMode ? 'text-white' : 'text-slate-800',
    ])}>
      <div className="col-span-12">
        {(userRole === Role.VENDOR ||
          userRole === Role.SUB_VENDOR ||
          userRole === Role.VENDOR_OPERATIONS ||
          userRole === Role.VENDOR_ADMIN) && (
              <Vendor />
        )}
      </div>
    </div>
  );
};

export default Clients;
