
import React, { useState, useMemo } from 'react';
import { Equipment, MaintenanceStatus, StatusConfig, MaintenanceTask, MaintenanceType } from '../types';
import { MONTHS } from '../constants';
import { ScheduleCell } from './ScheduleCell';
import { MonthTasksModal } from './MonthTasksModal';
import { EditIcon, DeleteIcon, InfoIcon, PlusIcon, ChevronDownIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';

interface EquipmentRowProps {
  equipment: Equipment;
  viewYear: number;
  statusMap: Map<string, StatusConfig>;
  onCellClick: (equipment: Equipment, monthIndex: number, task: MaintenanceTask) => void;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  onViewDetails: (equipment: Equipment) => void;
  onAddCorrective: (equipment: Equipment) => void;
  isLast: boolean;
}

export const EquipmentRow: React.FC<EquipmentRowProps> = ({
  equipment,
  viewYear,
  statusMap,
  onCellClick,
  onEdit,
  onDelete,
  onViewDetails,
  onAddCorrective,
  isLast,
}) => {
  const { workOrders } = useDataContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalOpenForMonth, setModalOpenForMonth] = useState<number | null>(null);
  
  const tasksByMonth = useMemo(() => {
    // 1. Converter O.S. do banco para formato de tarefa de calendário
    const standaloneTasksAsMaintenanceTasks: MaintenanceTask[] = workOrders
        .filter(wo => wo.equipmentId === equipment.id)
        .map(wo => {
            const date = wo.scheduledDate ? new Date(wo.scheduledDate) : new Date();
            const validDate = isNaN(date.getTime()) ? new Date() : date;
            
            // Normalização robusta para Preditiva
            let normalizedType = wo.type as MaintenanceType;
            const typeStr = String(wo.type).toLowerCase();
            if (typeStr.includes('pred')) normalizedType = MaintenanceType.Predictive;

            return {
                id: wo.id,
                year: validDate.getFullYear(),
                month: MONTHS[validDate.getMonth()],
                status: wo.status,
                type: normalizedType,
                description: wo.description,
                osNumber: wo.id,
                priority: 'Média',
                requester: wo.requester,
                startDate: wo.scheduledDate,
                details: wo.checklist || []
            };
        });

    const allTasks = [...(equipment.schedule || []), ...standaloneTasksAsMaintenanceTasks];

    return MONTHS.map((_, monthIndex) =>
        allTasks.filter(task => 
            task.year === viewYear && 
            (task.month === MONTHS[monthIndex] || (task.startDate && new Date(task.startDate).getMonth() === monthIndex))
        )
    );
  }, [equipment, workOrders, viewYear]);

  const handleCellClick = (monthIndex: number) => {
    const tasks = tasksByMonth[monthIndex];
    if (tasks.length === 1) {
      onCellClick(equipment, monthIndex, tasks[0]);
    } else if (tasks.length > 1) {
      setModalOpenForMonth(monthIndex);
    }
  };

  const borderClass = isLast ? '' : 'border-b border-gray-200 dark:border-gray-700';

  return (
    <>
      <div className={`grid grid-cols-[1fr_120px] gap-4 px-6 py-2 transition-colors duration-200 ${borderClass} hover:bg-gray-50 dark:hover:bg-gray-800/50`}>
        <div className="flex items-center gap-3 py-2" onClick={() => setIsExpanded(!isExpanded)} style={{cursor: 'pointer'}}>
           <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
             <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
           </button>
           <div>
               <p className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">{equipment.id} - {equipment.name}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{equipment.location}</p>
           </div>
        </div>
        
        <div className="flex items-center justify-center gap-1">
            <button onClick={() => onAddCorrective(equipment)} className="p-2 text-gray-400 hover:text-rose-500" title="Corretiva"><PlusIcon/></button>
            <button onClick={() => onViewDetails(equipment)} className="p-2 text-gray-400 hover:text-emerald-500" title="Ficha"><InfoIcon/></button>
            <button onClick={() => onEdit(equipment)} className="p-2 text-gray-400 hover:text-blue-500" title="Editar Ativo"><EditIcon/></button>
            <button onClick={() => onDelete(equipment)} className="p-2 text-gray-400 hover:text-rose-600" title="Remover"><DeleteIcon/></button>
        </div>
      </div>
      
      {isExpanded && (
        <div className={`bg-slate-50/50 dark:bg-gray-800/50 ${borderClass} animate-fade-in overflow-x-auto custom-scrollbar`}>
            <div style={{ minWidth: '960px' }}>
                <div className="grid grid-cols-12 bg-white/40 dark:bg-black/10">
                    {MONTHS.map(month => (
                        <div key={month} className="h-6 text-center text-[9px] font-black uppercase text-gray-400 border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 flex items-center justify-center tracking-tighter">
                            {month.substring(0, 3)}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-12">
                    {tasksByMonth.map((tasks, monthIndex) => (
                        <ScheduleCell
                            key={monthIndex}
                            tasks={tasks}
                            onClick={() => handleCellClick(monthIndex)}
                        />
                    ))}
                </div>
            </div>
        </div>
      )}

      {modalOpenForMonth !== null && (
        <MonthTasksModal
          isOpen={true}
          onClose={() => setModalOpenForMonth(null)}
          tasks={tasksByMonth[modalOpenForMonth]}
          equipment={equipment}
          month={MONTHS[modalOpenForMonth]}
          year={viewYear}
          onTaskSelect={(task) => {
            onCellClick(equipment, modalOpenForMonth, task);
            setModalOpenForMonth(null);
          }}
        />
      )}
    </>
  );
};
