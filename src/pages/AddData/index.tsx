/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';
import EntityForm from '@/pages/AddData/EntityForm/index';
import EntityHistory from '@/pages/AddData/EntityHistory/EntityHistory';
import Lucide from '@/components/Base/Lucide';
import Modal from '@/components/Modal/modals';
import Button from '@/components/Base/Button';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import clsx from 'clsx';

function DataEntries() {
  const darkMode = useAppSelector(selectDarkMode);
  const [tabState, setTabState] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmitSuccess = () => {
    setIsModalOpen(false);
    setTabState((prev) => prev + 1);
  };

  return (
    <div className={clsx([
      'relative overflow-hidden rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl min-h-screen',
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10'
        : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200',
    ])}>
      {/* Background gradient overlay */}
      <div className={clsx([
        'pointer-events-none absolute inset-0',
        darkMode 
          ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_24%)]'
          : 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.06),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.06),transparent_24%)]',
      ])}></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={clsx([
              'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border rounded-2xl shrink-0',
              darkMode 
                ? 'border-white/20 bg-white/10'
                : 'border-slate-200 bg-slate-100',
            ])}>
              <Lucide
                icon="Database"
                className={clsx([
                  'w-5 h-5 sm:w-6 sm:h-6',
                  darkMode ? 'text-white' : 'text-slate-700',
                ])}
              />
            </div>
            <div>
              <h1 className={clsx([
                'text-xl sm:text-2xl md:text-3xl font-semibold',
                darkMode ? 'text-white' : 'text-slate-800',
              ])}>
                Data Entries
              </h1>
              <p className={clsx([
                'text-sm hidden sm:block',
                darkMode ? 'text-white/60' : 'text-slate-500',
              ])}>
                Add and manage bank response data
              </p>
            </div>
          </div>

          {/* Add Data Button */}
          <Button
            variant="primary"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 text-white border-0 hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleOpenModal}
          >
            <Lucide icon="Plus" className="w-4 h-4" />
            Add Data Entry
          </Button>
        </div>

        {/* Modal for EntityForm */}
        <Modal
          handleModal={handleCloseModal}
          forOpen={isModalOpen}
          title="Add Bank Response Data"
        >
          <EntityForm 
            setTabState={setTabState} 
            onSuccess={handleFormSubmitSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Main Content - Only EntityHistory */}
        <div className={clsx([
          'rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden',
          darkMode 
            ? 'bg-white/10 border border-white/15'
            : 'bg-white border border-slate-200',
        ])}>
          <div className="p-4 sm:p-6">
            <EntityHistory tabState={tabState} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEntries;
