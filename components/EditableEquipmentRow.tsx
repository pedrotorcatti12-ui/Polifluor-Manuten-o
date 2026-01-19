
import React, { useState } from 'react';
import { Equipment, MaintenanceTask, MaintenanceStatus, MaintenanceType as MType } from '../types';
import { PlusIcon, EditIcon, InfoIcon, ChevronDownIcon, DeleteIcon, TargetIcon, ClockIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';
import { WorkOrderModal } from './WorkOrderModal';
import { ConfirmationModal } from './ConfirmationModal';
import { MAINTENANCE_TYPE_CONFIG } from '../constants';

export const EditableEquipmentRow: React.FC<{
    equipment: Equipment;
    onView: (eq: Equipment) => void;
    onEdit: (eq: Equipment) => void;
    onDelete: (eq: Equipment) => void;
}> = ({ equipment, onView, onEdit, onDelete }) => {
    const { handleEquipmentSave, statusConfig, maintainers, requesters, standardTasks, standardMaterials } = useDataContext();
    const [isOpen, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
    const [deletingTask, setDeletingTask] = useState<MaintenanceTask | null>(null);

    const handleTaskUpdate = async (updatedTask: MaintenanceTask) => {
        const newSchedule = [...equipment.schedule];
        const taskIndex = newSchedule.findIndex(t => t.id === updatedTask.id);
        
        if (taskIndex > -1) {
            newSchedule[taskIndex] = updatedTask;
        } else {
            newSchedule.push(updatedTask);
        }
        
        await handleEquipmentSave({ ...equipment, schedule: newSchedule });
        setEditingTask(null);
    };
  
    const handleTaskDelete = async () => {
        if (!deletingTask) return;
        const newSchedule = equipment.schedule.filter(t => t.id !== deletingTask.id);
        await handleEquipmentSave({ ...equipment, schedule: newSchedule });
        setDeletingTask(null);
    };

    const handleAddNewTask = () => {
        const newTask: MaintenanceTask = {
            id: crypto.randomUUID(),
            year: new Date().getFullYear(),
            month: 'Janeiro',
            status: MaintenanceStatus.Scheduled,
            type: MType.Preventive,
            description: 'Manutenção Preventiva',
            details: []
        };
        setEditingTask(newTask);
    };

    const tasksSorted = [...(equipment.schedule || [])].sort((a,b) => b.year - a.year || a.month.localeCompare(b.month));

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border transition-all hover:shadow-md ${equipment.is_critical ? 'border-l-8 border-orange-500' : 'border-slate-100'}`}>
            <div className="flex justify-between items-center p-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
                        <span className="text-xs font-black text-slate-500">{equipment.id}</span>
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                             <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">{equipment.name}</h3>
                             {equipment.is_critical && (
                                 <span className="px-2 py-0.5 bg-orange-600 text-white text-[7px] font-black rounded uppercase flex items-center gap-1 shadow-sm">
                                     <TargetIcon className="w-2 h-2" /> Ativo Crítico
                                 </span>
                             )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Localização: <span className="text-slate-600 font-black">{equipment.location || 'N/A'}</span> • 
                            Fabricante: <span className="text-blue-600 font-black">{equipment.manufacturer || 'N/D'}</span> • 
                            Modelo: <span className="text-emerald-600 font-black">{equipment.model || 'N/D'}</span>
                        </p>
                     </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-4">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${equipment.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {equipment.status.toUpperCase()}
                        </span>
                        <span className="text-[8px] font-bold text-slate-300 mt-1 uppercase">{equipment.schedule.length} Ordens no Histórico</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onView(equipment); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><InfoIcon className="w-5 h-5"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(equipment); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(equipment); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><DeleteIcon className="w-5 h-5"/></button>
                    <div className="w-[1px] h-8 bg-slate-100 mx-1"></div>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-slate-50 p-8 bg-slate-50/30 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                             <ClockIcon className="w-4 h-4 text-slate-400" />
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linha do Tempo de Intervenções</h4>
                        </div>
                        <button onClick={handleAddNewTask} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase shadow-lg hover:bg-blue-600 transition-all">
                            <PlusIcon className="w-4 h-4" /> Incluir Evento Manual
                        </button>
                    </div>
                    
                    {tasksSorted.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasksSorted.map(task => {
                                const typeCfg = MAINTENANCE_TYPE_CONFIG[task.type as any] || { color: 'bg-slate-400' };
                                return (
                                    <div key={task.id} className="bg-white dark:bg-gray-700 p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${typeCfg.color}`} />
                                                <p className="text-[10px] font-black text-slate-800 uppercase truncate">{task.description}</p>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                {task.month} {task.year} • <span className="text-blue-500 font-black">{task.status}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingTask(task)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><EditIcon className="w-4 h-4" /></button>
                                            <button onClick={() => setDeletingTask(task)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><DeleteIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sem ordens registradas para este ativo</p>
                        </div>
                    )}
                </div>
            )}
             {editingTask && (
                <WorkOrderModal 
                    isOpen={!!editingTask} 
                    onClose={() => setEditingTask(null)} 
                    task={{ equipment, task: editingTask, year: editingTask.year, monthIndex: 0 }} 
                    onTaskUpdate={handleTaskUpdate} 
                    statusConfig={statusConfig} 
                    maintainers={maintainers}
                    requesters={requesters}
                    standardTasks={standardTasks}
                    standardMaterials={standardMaterials}
                />
            )}
            {deletingTask && (
                <ConfirmationModal
                    isOpen={!!deletingTask}
                    onClose={() => setDeletingTask(null)}
                    onConfirm={handleTaskDelete}
                    title="Remover Registro"
                    message="Tem certeza que deseja apagar permanentemente esta ordem do cronograma?"
                />
            )}
        </div>
    );
};
