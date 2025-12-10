import { useState, useEffect } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { Role } from '@/constants';
import { getVendorBankResponseAccess } from '@/redux-toolkit/slices/vendor/vendorAPI';

interface VendorAccessResponse {
  hasAccess: boolean;
  isLoading: boolean;
}

const useVendorBankResponseAccess = (): VendorAccessResponse => {
  const { userRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAccess = async (): Promise<void> => {
      // Only check access for vendor, sub-vendor, and vendor-admin roles
      if (
        userRole !== Role.VENDOR &&
        userRole !== Role.SUB_VENDOR &&
        userRole !== Role.VENDOR_ADMIN
      ) {
        setHasAccess(true); // Non-vendors have access by default
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get vendor/sub-vendor ID from localStorage
        const userData = localStorage.getItem('userData');
        const parsedData = userData ? JSON.parse(userData) : null;
        const vendorId = parsedData?.user_id;

        if (!vendorId) {
          setHasAccess(false);
          return;
        }

        // Call the API to check access (same API can handle both vendor and sub-vendor)
        const accessData = await getVendorBankResponseAccess(vendorId);
        // Handle string format: "bank_response_access": "true"/"false"
        const bankResponseAccess = accessData?.bank_response_access;
        const vendorHasAccess = 
          bankResponseAccess === "true" || 
          bankResponseAccess === true ||
          accessData?.hasAccess === true ||
          accessData?.access === true;
        setHasAccess(vendorHasAccess);
      } catch {
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [userRole]);

  return {
    hasAccess,
    isLoading,
  };
};

export default useVendorBankResponseAccess;
