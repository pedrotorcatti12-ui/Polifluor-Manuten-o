import React from 'react';
import { CloseIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 relative border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <CloseIcon />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};