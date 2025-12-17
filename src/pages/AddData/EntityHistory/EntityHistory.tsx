/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import AddDataHistory from './AddDataHistory';

interface EntityHistoryProps {
  tabState: number;
}

function DataEntries({ tabState }: EntityHistoryProps) {
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const activeTab = useAppSelector(getTabs);


  return (
    <div className="mt-6">
      {/* Main Content Card with glassmorphism */}
      <div className="rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <AddDataHistory selectedIndex={activeTab} tabState={tabState} />
        </div>
      </div>
    </div>
  );
}

export default DataEntries;
