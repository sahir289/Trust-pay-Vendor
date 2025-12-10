import React from 'react';

interface DeleteModalContentProps {
  handleCancelDelete: () => void;
  handleConfirmDelete?: () => void;
  buttonTitle?: string;
  children?: React.ReactNode;
  check?: boolean;
}

const ModalContent: React.FC<DeleteModalContentProps> = ({
  handleCancelDelete,
  handleConfirmDelete,
  buttonTitle,
  children,
  check = true,
}) => {
  return (
    <div>
      {' '}
      <div className="text-sm font-medium text-slate-500 p-8 break-words whitespace-normal">
        {children}
      </div>
      {buttonTitle ? (
        <div className=""></div>
      ) : (
        <div className="flex justify-end mt-4">
          {check && <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={handleCancelDelete}
          >
            Cancel
          </button>}
          {handleConfirmDelete && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleConfirmDelete}
            >
              Confirm
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModalContent;
