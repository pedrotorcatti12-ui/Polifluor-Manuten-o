
import React from 'react';
import { MaintenanceTask, Equipment } from '../types';
import { CloseIcon } from './icons';

interface MonthTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: MaintenanceTask[];
  equipment: Equipment;
  month: string;
  year: number;
  onTaskSelect: (task: MaintenanceTask) => void;
}

export const MonthTasksModal: React.FC<MonthTasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  equipment,
  month,
  year,
  onTaskSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 relative border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <CloseIcon />
        </button>
        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Tarefas para {month}, {year}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{equipment.id} - {equipment.name}</p>
        </div>
        <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskSelect(task)}
              className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{task.description || 'Tarefa sem descrição'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tipo: {task.type} | Status: {task.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};