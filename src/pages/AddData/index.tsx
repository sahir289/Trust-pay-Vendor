/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';
import EntityForm from '@/pages/AddData/EntityForm/index';
import EntityHistory from '@/pages/AddData/EntityHistory/EntityHistory';
import Lucide from '@/components/Base/Lucide';

function DataEntries() {
  const [tabState, setTabState] = useState<number>(0);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/10 min-h-screen">
      {/* Background gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_24%)]"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-2xl border-white/20 bg-white/10 shrink-0">
              <Lucide
                icon="Database"
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                Data Entries
              </h1>
              <p className="text-white/60 text-sm hidden sm:block">
                Add and manage bank response data
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
          <EntityForm setTabState={setTabState} />
          <EntityHistory tabState={tabState} />
        </div>
      </div>
    </div>
  );
}

export default DataEntries;
