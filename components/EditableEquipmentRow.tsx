
import React, { useMemo } from 'react';
import { Equipment, MaintenanceTask, MaintenanceStatus, MaintenanceType as MType, MaintenanceType } from '../types';
import { PlusIcon, EditIcon, InfoIcon, ChevronDownIcon, DeleteIcon, TargetIcon, ClockIcon, ExclamationTriangleIcon } from './icons';
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
    const { workOrders, handleEquipmentSave, statusConfig, maintainers, requesters, standardTasks, standardMaterials } = useDataContext();
    const [isOpen, setIsOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<MaintenanceTask | null>(null);
    const [deletingTask, setDeletingTask] = React.useState<MaintenanceTask | null>(null);

    // Calcula se tem muitas corretivas no mês atual
    const hasHighFailureRate = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const correctiveCount = workOrders.filter(wo => 
            wo.equipmentId === equipment.id && 
            wo.type === MaintenanceType.Corrective &&
            new Date(wo.scheduledDate).getMonth() === currentMonth &&
            new Date(wo.scheduledDate).getFullYear() === currentYear
        ).length;

        return correctiveCount >= 3;
    }, [workOrders, equipment.id]);

    const handleTaskUpdate = async (updatedTask: MaintenanceTask) => {
        // Lógica simplificada: A edição deve ser feita via O.S. Modal, 
        // mas mantemos compatibilidade com schedule local se necessário.
        setEditingTask(null);
    };
  
    const handleTaskDelete = async () => {}; // Deletion via OS manager

    const handleAddNewTask = () => {
        // Abre modal de nova tarefa
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border transition-all hover:shadow-md ${hasHighFailureRate ? 'border-l-8 border-rose-500' : (equipment.is_critical ? 'border-l-8 border-orange-500' : 'border-slate-100')}`}>
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
                             {hasHighFailureRate && (
                                 <span className="px-2 py-0.5 bg-rose-600 text-white text-[7px] font-black rounded uppercase flex items-center gap-1 shadow-sm animate-pulse">
                                     <ExclamationTriangleIcon className="w-2 h-2" /> Atenção: Falhas Recorrentes
                                 </span>
                             )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Localização: <span className="text-slate-600 font-black">{equipment.location || 'N/A'}</span> • 
                            Fabricante: <span className="text-blue-600 font-black">{equipment.manufacturer || 'N/D'}</span>
                        </p>
                     </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); onView(equipment); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><InfoIcon className="w-5 h-5"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(equipment); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(equipment); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><DeleteIcon className="w-5 h-5"/></button>
                    <div className="w-[1px] h-8 bg-slate-100 mx-1"></div>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-slate-50 p-8 bg-slate-50/30 animate-fade-in">
                    <p className="text-center text-slate-400 text-sm">Visualize o histórico completo na aba "Histórico"</p>
                </div>
            )}
        </div>
    );
};
