import React from 'react';
import { PlusIcon, DeleteIcon } from './icons';
import { TaskDetail } from '../types';

export interface DetailWithId extends TaskDetail {
  id: string;
}

interface TaskDetailsSectionProps {
  details: DetailWithId[];
  onDetailsChange: (details: DetailWithId[]) => void;
  predefinedActions: string[];
  predefinedMaterials: string[];
}

export const TaskDetailsSection: React.FC<TaskDetailsSectionProps> = ({
  details,
  onDetailsChange,
  predefinedActions,
  predefinedMaterials,
}) => {
  const handleDetailChange = (id: string, field: keyof TaskDetail, value: string) => {
    onDetailsChange(
      details.map(d => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const addDetail = () => {
    onDetailsChange([...details, { id: crypto.randomUUID(), action: '', materials: '' }]);
  };

  const removeDetail = (id: string) => {
    onDetailsChange(details.filter(d => d.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tarefas do Plano (Checklist)
      </label>
      <div className="mt-2 space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
        <datalist id="actions-list">
          {predefinedActions.map(action => <option key={action} value={action} />)}
        </datalist>
        <datalist id="materials-list">
          {predefinedMaterials.map(material => <option key={material} value={material} />)}
        </datalist>

        {/* Headers */}
        {details.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span>Ação a ser executada</span>
            <span>Materiais necessários</span>
            <span className="w-8"></span> {/* Spacer for delete button */}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {details.map((detail) => (
            <div key={detail.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <input
                type="text"
                list="actions-list"
                placeholder="Ação a ser executada"
                value={detail.action}
                onChange={(e) => handleDetailChange(detail.id, 'action', e.target.value)}
                className="form-input text-sm"
              />
              <input
                type="text"
                list="materials-list"
                placeholder="Materiais necessários"
                value={detail.materials || ''}
                onChange={(e) => handleDetailChange(detail.id, 'materials', e.target.value)}
                className="form-input text-sm"
              />
              <button
                type="button"
                onClick={() => removeDetail(detail.id)}
                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                title="Remover tarefa"
              >
                <DeleteIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {details.length === 0 && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-3">Nenhuma tarefa adicionada ao checklist.</p>
        )}

        <button
          type="button"
          onClick={addDetail}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <PlusIcon className="w-4 h-4" /> Adicionar Tarefa
        </button>
      </div>
    </div>
  );
};