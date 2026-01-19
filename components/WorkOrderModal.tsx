
// components/WorkOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { SelectedTask, MaintenanceTask, StatusConfig, MaintenanceStatus, MaintenanceType, CorrectiveCategory } from '../types';
import { CloseIcon, CheckCircleIcon, ShoppingCartIcon, ClockIcon } from './icons';
import { TaskDetailsSection, DetailWithId } from './TaskDetailsSection';

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

    const handleStatusChange = (newStatus: MaintenanceStatus) => {
        const updatedTask: MaintenanceTask = { ...currentTask, status: newStatus };
        // Ao concluir, define a data de término como AGORA se não houver
        if (newStatus === MaintenanceStatus.Executed && !currentTask.endDate) {
            updatedTask.endDate = toLocalISOString(new Date());
        }
        // Ao iniciar (sair de Programado), define data de início como AGORA se não houver
        if (newStatus !== MaintenanceStatus.Scheduled && newStatus !== MaintenanceStatus.None && !currentTask.startDate) {
            updatedTask.startDate = toLocalISOString(new Date());
        }
        setCurrentTask(updatedTask);
    };

    const handleComplete = () => {
         const updatedTask = { 
             ...currentTask, 
             status: MaintenanceStatus.Executed,
             endDate: currentTask.endDate || toLocalISOString(new Date()), // Mantém o que foi editado ou usa atual
             details: details.map(({ id, ...rest }) => rest) 
         };
         onTaskUpdate(updatedTask);
    };

    // Helper para formatar data para o input datetime-local (YYYY-MM-DDTHH:mm)
    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000; // offset em milissegundos
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
        return localISOTime;
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Status</label>
                            <select value={currentTask.status} onChange={(e) => handleStatusChange(e.target.value as MaintenanceStatus)} className="w-full mt-1 form-input">
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

                    {isCorrective && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Prioridade</label>
                                <select value={currentTask.priority || 'Média'} onChange={e => setCurrentTask({ ...currentTask, priority: e.target.value as any })} className="w-full mt-1 form-input">
                                    <option>Baixa</option>
                                    <option>Média</option>
                                    <option>Alta</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Categoria da Falha</label>
                                <select value={currentTask.correctiveCategory || ''} onChange={e => setCurrentTask({ ...currentTask, correctiveCategory: e.target.value as CorrectiveCategory })} className="w-full mt-1 form-input">
                                    <option value="">Selecione...</option>
                                    {Object.values(CorrectiveCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{isCorrective ? 'Descrição do Problema' : 'Descrição do Serviço'}</label>
                        <textarea value={currentTask.description} onChange={e => setCurrentTask({ ...currentTask, description: e.target.value })} rows={2} className="w-full mt-1 form-input" />
                    </div>

                    {isCorrective && (
                         <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Análise de Causa Raiz</label>
                            <textarea value={currentTask.rootCause || ''} onChange={e => setCurrentTask({ ...currentTask, rootCause: e.target.value })} rows={3} className="w-full mt-1 form-input" />
                        </div>
                    )}
                    
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

                    {/* SEÇÃO DE TEMPOS E COMPRAS */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <ClockIcon className="w-4 h-4 text-blue-500"/>
                            <span className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">Apontamento de Horas</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Início (Data/Hora)</label>
                                <input 
                                    type="datetime-local" 
                                    value={currentTask.startDate || ''} 
                                    onChange={e => setCurrentTask({...currentTask, startDate: e.target.value})} 
                                    className="w-full mt-1 form-input text-sm" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Conclusão (Data/Hora)</label>
                                <input 
                                    type="datetime-local" 
                                    value={currentTask.endDate || ''} 
                                    onChange={e => setCurrentTask({...currentTask, endDate: e.target.value})} 
                                    className="w-full mt-1 form-input text-sm" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Homem-Hora (Calc.)</label>
                                <input 
                                    type="number" 
                                    value={currentTask.manHours || ''} 
                                    onChange={e => setCurrentTask({...currentTask, manHours: parseFloat(e.target.value)})} 
                                    className="w-full mt-1 form-input font-mono font-bold bg-gray-100 dark:bg-gray-800" 
                                    min="0" step="0.1" 
                                />
                            </div>
                        </div>
                        
                        {/* Interação com Compras */}
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="waiting-parts"
                                    checked={currentTask.waitingForParts || false} 
                                    onChange={e => setCurrentTask({...currentTask, waitingForParts: e.target.checked})}
                                    className="h-4 w-4 text-orange-500 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="waiting-parts" className="ml-2 flex items-center gap-2 text-sm text-gray-900 dark:text-gray-200 font-medium">
                                    <ShoppingCartIcon className="w-4 h-4 text-orange-500" />
                                    Interação com Compras / Aguardando Peças
                                </label>
                            </div>
                            {currentTask.waitingForParts && (
                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                    Este status sinaliza que a manutenção está parada aguardando suprimentos.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                     {currentTask.status !== MaintenanceStatus.Executed && (
                        <button type="button" onClick={handleComplete} className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors">
                            <CheckCircleIcon className="w-4 h-4"/>
                            Concluir Manutenção
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
