/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Role } from '@/constants';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import VendorAccountReports from '@/pages/Reports/VendorAccountReports/index';

function Main() {
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render

  const data = localStorage.getItem('userData');
  let role;
  let name;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
    name = parsedData.name;
  }
  return (
    <>
      <div className="grid grid-cols-12 gap-y-4 sm:gap-y-6 md:gap-y-10 gap-x-3 sm:gap-x-6 mt-2">
        <div className="col-span-12">
          {role === Role.VENDOR && (
                <VendorAccountReports role={role} name={name} />
          )}
        </div>
      </div>
    </>
  );
}

export default Main;
