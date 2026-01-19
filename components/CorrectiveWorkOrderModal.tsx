import React, { useState, useEffect } from 'react';
import { SelectedTask, MaintenanceTask, StatusConfig, CorrectiveCategory, MaintenanceStatus } from '../types';
import { CloseIcon } from './icons';

interface CorrectiveWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: SelectedTask;
  onTaskUpdate: (updatedTask: MaintenanceTask) => void;
  statusConfig: StatusConfig[];
  maintainers: string[];
  requesters: string[];
}

export const CorrectiveWorkOrderModal: React.FC<CorrectiveWorkOrderModalProps> = ({ 
    isOpen, onClose, task, onTaskUpdate, statusConfig, maintainers, requesters 
}) => {
  const [currentTask, setCurrentTask] = useState<MaintenanceTask>(task.task);

  useEffect(() => {
    setCurrentTask(task.task);
  }, [task]);

  if (!isOpen) return null;

  const handleSave = () => {
    onTaskUpdate(currentTask);
  };
  
  const handleStatusChange = (newStatus: MaintenanceStatus) => {
    const updatedTask: MaintenanceTask = { ...currentTask, status: newStatus };
    if (newStatus === MaintenanceStatus.Executed && !currentTask.endDate) {
        updatedTask.endDate = new Date().toISOString().split('T')[0];
    }
    setCurrentTask(updatedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-8 m-4 relative border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <CloseIcon />
        </button>
        <div className="pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{task.equipment.id} - {task.equipment.name}</h2>
            <span className="text-xs font-medium text-red-400 bg-red-900/50 px-3 py-1 rounded-full uppercase tracking-wider">Manutenção Corretiva</span>
        </div>

        <div className="flex-1 overflow-y-auto mt-6 pr-2 -mr-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">STATUS</label>
              <select value={currentTask.status} onChange={(e) => handleStatusChange(e.target.value as MaintenanceStatus)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm">
                {statusConfig.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">PRIORIDADE</label>
              <select value={currentTask.priority || 'Média'} onChange={e => setCurrentTask({ ...currentTask, priority: e.target.value as any })} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm">
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">CATEGORIA</label>
              <select value={currentTask.correctiveCategory || ''} onChange={e => setCurrentTask({ ...currentTask, correctiveCategory: e.target.value as CorrectiveCategory })} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm">
                 <option value="">Selecione...</option>
                {Object.values(CorrectiveCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">DATA DA SOLICITAÇÃO</label>
                <input type="date" value={currentTask.requestDate || ''} onChange={e => setCurrentTask({...currentTask, requestDate: e.target.value})} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">SOLICITANTE</label>
              <select value={currentTask.requester || ''} onChange={e => setCurrentTask({ ...currentTask, requester: e.target.value })} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm">
                <option value="">Nenhum</option>
                {requesters.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
             <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">RESPONSÁVEL</label>
              <select value={currentTask.maintainer?.name || ''} onChange={e => setCurrentTask({ ...currentTask, maintainer: {name: e.target.value, isExternal: false }})} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm">
                <option value="">Nenhum</option>
                {maintainers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">DESCRIÇÃO DO PROBLEMA</label>
            <textarea value={currentTask.description} onChange={e => setCurrentTask({ ...currentTask, description: e.target.value })} rows={3} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ANÁLISE DE CAUSA RAIZ</label>
            <textarea value={currentTask.rootCause || ''} onChange={e => setCurrentTask({ ...currentTask, rootCause: e.target.value })} rows={3} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm" />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-6 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors">Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
};
