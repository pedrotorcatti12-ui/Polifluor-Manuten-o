import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types
import { StatusConfig, MaintenanceStatus } from '../types';
import { CloseIcon } from './icons';

interface StatusConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: StatusConfig) => void;
  existingStatus: StatusConfig | null;
}

export const StatusConfigModal: React.FC<StatusConfigModalProps> = ({ isOpen, onClose, onSave, existingStatus }) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#6b7280'); // Default gray

  useEffect(() => {
    if (existingStatus) {
      setLabel(existingStatus.label);
      setColor(existingStatus.color);
    } else {
      setLabel('');
      setColor('#6b7280');
    }
  }, [existingStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Cast string to MaintenanceStatus
    const id = existingStatus?.id || (label.toLowerCase().replace(/\s+/g, '-') as MaintenanceStatus);
    onSave({ id, label: label as MaintenanceStatus, color, symbol: 'X' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 relative border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <CloseIcon />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {existingStatus ? 'Editar Status' : 'Adicionar Novo Status'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Personalize o nome e a cor do status de manutenção.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="status-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome do Status
            </label>
            <input
              type="text"
              id="status-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cor
            </label>
            <div className="mt-1 flex items-center space-x-3">
                 <input
                    type="color"
                    id="status-color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                    className="p-1 h-10 w-14 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                />
                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: color }}></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};