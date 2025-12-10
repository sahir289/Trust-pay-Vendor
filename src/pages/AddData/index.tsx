/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';
// import { withLazyLoading } from '@/utils/lazyStrategies';

// Normal imports instead of lazy loading
import EntityForm from '@/pages/AddData/EntityForm/index';
import EntityHistory from '@/pages/AddData/EntityHistory/EntityHistory';

// Commented out lazy loading approach:
// const EntityForm = withLazyLoading(
//   () => import('@/pages/AddData/EntityForm/index'),
//   { chunkName: 'entity-form', retries: 3 }
// );
// const EntityHistory = withLazyLoading(
//   () => import('@/pages/AddData/EntityHistory/EntityHistory'),
//   { chunkName: 'entity-history', retries: 3 }
// );

function DataEntries() {
  const [tabState, setTabState] = useState<number>(0);
  return (
    <>
      <div className="flex items-center h-10 justify-between mb-3 mx-1">
      </div>
      <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
        <EntityForm setTabState={setTabState} />
        <EntityHistory tabState={tabState} />
      </div>
    </>
  );
}

export default DataEntries;
