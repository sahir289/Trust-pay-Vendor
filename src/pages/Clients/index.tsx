import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { getParentTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { Role } from '@/constants';
import Vendor from '@/pages/Clients/Vendors/index';

const Clients: React.FC = () => {
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const parentTab = useAppSelector(getParentTabs);
  const data = localStorage.getItem('userData');
  const parsedData = data ? JSON.parse(data) : null;
  const userRole = parsedData?.designation;

  // Initialize title based on user role
  const [title, setTitle] = useState(() => {
    if (!userRole) return 'Merchant';

    if (
      [
        Role.MERCHANT,
        Role.MERCHANT_ADMIN,
        Role.SUB_MERCHANT,
        Role.MERCHANT_OPERATIONS,
      ].includes(userRole)
    ) {
      return 'Merchant';
    }

    if (
      [
        Role.VENDOR,
        Role.SUB_VENDOR,
        Role.VENDOR_OPERATIONS,
        Role.VENDOR_ADMIN,
      ].includes(userRole)
    ) {
      return 'Vendor';
    }

    if ([Role.ADMIN, Role.TRANSACTIONS].includes(userRole)) {
      return parentTab === 0 ? 'Merchant' : 'Vendor';
    }
    return 'Merchant';
  });
  useEffect(() => {
    if ([Role.ADMIN, Role.TRANSACTIONS].includes(userRole)) {
      setTitle(parentTab === 0 ? 'Merchant' : 'Vendor');
    }
  }, [parentTab, userRole]);

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex items-center h-10 mx-3 my-2 justify-between">
          <div className="text-lg font-medium group-[.mode--light]:text-white">
            {title}
          </div>
        </div>
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
