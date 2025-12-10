import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '@/constants';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { getVendorBankResponseAccess } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';
import { Status } from '@/constants';
import LoadingIcon from '@/components/Base/LoadingIcon';

interface VendorDataEntriesProtectedRouteProps {
  children: React.ReactNode;
}

const VendorBankResponseProtectedRoute: React.FC<
  VendorDataEntriesProtectedRouteProps
> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userData = localStorage.getItem('userData');
  const parsedData = userData ? JSON.parse(userData) : null;
  const vendorId = parsedData?.user_id || parsedData?.userId; 
  const userRole = parsedData?.role; 

  useEffect(() => {
    const checkAccess = async (): Promise<void> => {
      // Wait for userRole to be loaded (skip if still null/undefined)
      if (userRole === null || userRole === undefined) {
        return; // Don't proceed until userRole is loaded
      }

      // Non-vendors have access by default
      if (userRole !== Role.VENDOR) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        if (!vendorId || !userData) {
          setHasAccess(false);
          setIsLoading(false);
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'User ID not found. Please login again.',
            }),
          );
          window.setTimeout(() => {
            navigate(-1);
          }, 100);
          return;
        }

        // Perform the API check
        await performApiCheck(vendorId);
      } catch {
        setHasAccess(false);
        setIsLoading(false);
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message:
              'Failed to verify access permissions. Please contact your administrator.',
          }),
        );

        window.setTimeout(() => {
          navigate(-1);
        }, 100);
      }
    };

    const performApiCheck = async (vendorId: string): Promise<void> => {
      try {
        // Call the API to check access
        const accessData = await getVendorBankResponseAccess(vendorId);

        // Handle string format: "bank_response_access": "true"/"false"
        const bankResponseAccess = accessData?.bank_response_access;
        const vendorHasAccess = 
          bankResponseAccess === "true" || 
          bankResponseAccess === true ||
          accessData?.hasAccess === true ||
          accessData?.access === true;

        setHasAccess(vendorHasAccess);
        setIsLoading(false);

        // Show notification and redirect if access is denied
        if (!vendorHasAccess) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message:
                'Access denied to Data Entries. Please contact your administrator for access.',
            }),
          );

          window.setTimeout(() => {
            navigate(-1);
          }, 100);
        }
      } catch {
        setHasAccess(false);
        setIsLoading(false);
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message:
              'Failed to verify access permissions. Please contact your administrator.',
          }),
        );

        window.setTimeout(() => {
          navigate(-1);
        }, 100);
      }
    };

    checkAccess();
  }, [userRole, dispatch, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingIcon icon="oval" className="w-8 h-8" />
          <p className="text-sm text-slate-500">
            Verifying access permissions...
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything if access is denied (already navigated back)
  if (userRole === Role.VENDOR && !hasAccess) {
    return null;
  }

  // Render children if access is granted or user is not a vendor
  return <>{children}</>;
};

export default VendorBankResponseProtectedRoute;
