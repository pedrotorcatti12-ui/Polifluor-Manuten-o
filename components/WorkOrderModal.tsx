
// components/WorkOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { SelectedTask, MaintenanceTask, StatusConfig, MaintenanceStatus, MaintenanceType, CorrectiveCategory } from '../types';
import { CloseIcon, CheckCircleIcon, ShoppingCartIcon, ClockIcon, RefreshIcon, DeleteIcon } from './icons';
import { TaskDetailsSection, DetailWithId } from './TaskDetailsSection';
import { useDataContext } from '../contexts/DataContext';
import { MONTHS } from '../constants';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: SelectedTask;
  onTaskUpdate: (updatedTask: MaintenanceTask) => void;
  statusConfig: StatusConfig[];
  maintainers: string[];
  requesters: string[];
  standardTasks: string[];
  standardMaterials: string[];
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
    isOpen,
    onClose,
    task,
    onTaskUpdate,
    statusConfig,
    maintainers,
    requesters,
    standardTasks,
    standardMaterials
}) => {
    const { reprogramTask } = useDataContext();
    const [currentTask, setCurrentTask] = useState<MaintenanceTask>(task.task);
    const [details, setDetails] = useState<DetailWithId[]>([]);
    
    useEffect(() => {
        const initialTask = task.task.status === MaintenanceStatus.None 
            ? { ...task.task, status: MaintenanceStatus.Scheduled, type: task.task.type || MaintenanceType.Preventive }
            : task.task;

        setCurrentTask(initialTask);
        setDetails(initialTask.details?.map(d => ({ ...d, id: crypto.randomUUID() })) || []);
    }, [task]);

    // Cálculo automático de HH quando as datas mudam
    useEffect(() => {
        if (currentTask.startDate && currentTask.endDate) {
            const start = new Date(currentTask.startDate);
            const end = new Date(currentTask.endDate);
            
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                const diffMs = end.getTime() - start.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                setCurrentTask(prev => ({ ...prev, manHours: parseFloat(diffHours.toFixed(2)) }));
            }
        }
    }, [currentTask.startDate, currentTask.endDate]);

    if (!isOpen) return null;

    const handleSave = () => {
        const updatedTask = { ...currentTask, details: details.map(({ id, ...rest }) => rest) };
        onTaskUpdate(updatedTask);
    };

    const handleQuickAction = (action: 'reschedule' | 'cancel') => {
        if (action === 'cancel') {
            if(confirm("Tem certeza que deseja cancelar esta manutenção? Ela ficará como 'Desativado' no histórico.")) {
                const updated = { ...currentTask, status: MaintenanceStatus.Deactivated };
                onTaskUpdate(updated);
                onClose();
            }
        } else if (action === 'reschedule') {
            const currentIdx = MONTHS.indexOf(currentTask.month);
            let nextIdx = currentIdx + 1;
            let nextYear = currentTask.year;
            
            if (nextIdx > 11) { nextIdx = 0; nextYear++; }
            
            const nextMonth = MONTHS[nextIdx];
            
            if(confirm(`Mover esta O.S. para ${nextMonth}/${nextYear}?`)) {
                // Remove do mês atual (virtualmente) e cria no próximo
                reprogramTask(task.equipment.id, currentTask.id, nextMonth, nextYear);
                onClose();
            }
        }
    };

    const isCorrective = currentTask.type === MaintenanceType.Corrective;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6 m-4 relative border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon />
                </button>
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{task.equipment.id} - {task.equipment.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currentTask.month} / {currentTask.year}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentTask.type && 
                          <span className={`text-xs font-medium px-3 py-1 rounded-full ${isCorrective ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                            {currentTask.type}
                          </span>
                        }
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto mt-6 pr-2 -mr-2 space-y-4">
                    {/* Botões Rápidos */}
                    <div className="flex gap-4 mb-4">
                        <button onClick={() => handleQuickAction('reschedule')} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-blue-100">
                            <RefreshIcon className="w-4 h-4"/> Adiar para Próx. Mês
                        </button>
                        <button onClick={() => handleQuickAction('cancel')} className="flex-1 py-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-rose-100">
                            <DeleteIcon className="w-4 h-4"/> Cancelar Ocorrência
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Status</label>
                            <select value={currentTask.status} onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value as MaintenanceStatus })} className="w-full mt-1 form-input">
                                {statusConfig.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Nº O.S.</label>
                            <input type="text" value={currentTask.osNumber || ''} onChange={e => setCurrentTask({ ...currentTask, osNumber: e.target.value })} className="w-full mt-1 form-input" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tipo</label>
                            <select value={currentTask.type || ''} onChange={e => setCurrentTask({ ...currentTask, type: e.target.value as MaintenanceType })} className="w-full mt-1 form-input">
                                {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{isCorrective ? 'Descrição do Problema' : 'Descrição do Serviço'}</label>
                        <textarea value={currentTask.description} onChange={e => setCurrentTask({ ...currentTask, description: e.target.value })} rows={2} className="w-full mt-1 form-input" />
                    </div>
                    
                    {!isCorrective && (
                        <TaskDetailsSection details={details} onDetailsChange={setDetails} predefinedActions={standardTasks} predefinedMaterials={standardMaterials} />
                    )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Responsável</label>
                            <select value={currentTask.maintainer?.name || ''} onChange={e => setCurrentTask({ ...currentTask, maintainer: {name: e.target.value, isExternal: false }})} className="w-full mt-1 form-input">
                                <option value="">Nenhum</option>
                                {maintainers.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Solicitante</label>
                            <select value={currentTask.requester || ''} onChange={e => setCurrentTask({ ...currentTask, requester: e.target.value })} className="w-full mt-1 form-input">
                                <option value="">Nenhum</option>
                                {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors">Salvar</button>
                </div>
            </div>
        </div>
    );
};
