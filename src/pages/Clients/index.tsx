import React from 'react';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { Role } from '@/constants';
import Vendor from '@/pages/Clients/Vendors/index';

const Clients: React.FC = () => {
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const data = localStorage.getItem('userData');
  const parsedData = data ? JSON.parse(data) : null;
  const userRole = parsedData?.designation;

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
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
