
import React, { DragEvent, useState } from 'react';
import { MaintenanceType, FlatTask, MaintenanceStatus } from '../types';
import { ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, DeleteIcon, RefreshIcon, DocumentTextIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';
import { MONTHS } from '../constants';

interface TaskCardProps {
    task: FlatTask;
    onTaskClick: (task: FlatTask) => void;
    onDragStart: (e: DragEvent<HTMLDivElement>) => void;
    onDelete: (task: FlatTask) => void;
}

const typeColorClasses: { [key in MaintenanceType]?: string } = {
    [MaintenanceType.Preventive]: 'border-l-blue-500',
    [MaintenanceType.Corrective]: 'border-l-red-500',
    [MaintenanceType.Predictive]: 'border-l-yellow-500',
    [MaintenanceType.Overhaul]: 'border-l-purple-500',
    [MaintenanceType.RevisaoPeriodica]: 'border-l-lime-500',
    [MaintenanceType.PrestacaoServicos]: 'border-l-indigo-500',
    [MaintenanceType.Predial]: 'border-l-stone-500',
    [MaintenanceType.Melhoria]: 'border-l-sky-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick, onDragStart, onDelete }) => {
    const { reprogramTask } = useDataContext();
    const { equipment, task: taskDetails } = task;
    const [showReprogram, setShowReprogram] = useState(false);

    const isPrepared = taskDetails.isPrepared;
    const borderColorClass = taskDetails.type ? typeColorClasses[taskDetails.type] || 'border-l-gray-400' : 'border-l-gray-400';
    const osNumber = taskDetails.osNumber ? `OS: ${taskDetails.osNumber}` : '';

    const handleQuickMove = (e: React.MouseEvent, offset: number) => {
        e.stopPropagation();
        const currentMonthIdx = MONTHS.indexOf(taskDetails.month);
        let newIdx = currentMonthIdx + offset;
        let newYear = taskDetails.year;

        if (newIdx > 11) { newIdx = 0; newYear++; }
        if (newIdx < 0) { newIdx = 11; newYear--; }

        reprogramTask(equipment.id, taskDetails.id, MONTHS[newIdx], newYear);
        setShowReprogram(false);
    };

    return (
        <div 
            onClick={() => onTaskClick(task)}
            draggable="true"
            onDragStart={onDragStart}
            className={`group relative bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-4 ${borderColorClass} ${isPrepared ? 'opacity-80 bg-slate-50' : ''}`}
        >
            <div className="flex justify-between items-start pr-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        {osNumber && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1 rounded">{osNumber}</span>}
                        {isPrepared && (
                            <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 rounded flex items-center gap-0.5">
                                <DocumentTextIcon className="w-2.5 h-2.5"/> IMPRESSA
                            </span>
                        )}
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate pr-2 mt-1">
                        {equipment.id} - {equipment.name}
                    </h4>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowReprogram(!showReprogram); }}
                        className="p-1 text-gray-400 hover:text-blue-500 bg-white shadow-sm border rounded"
                        title="Reprogramar"
                    >
                        <RefreshIcon className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                        className="p-1 text-gray-400 hover:text-red-500 bg-white shadow-sm border rounded"
                    >
                        <DeleteIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {showReprogram ? (
                <div className="mt-3 p-2 bg-blue-600 rounded-lg animate-fade-in flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                    <p className="text-[9px] font-black text-white uppercase text-center">Mover O.S. para:</p>
                    <div className="flex justify-between">
                        <button onClick={(e) => handleQuickMove(e, -1)} className="px-2 py-1 bg-white/20 text-white rounded text-[10px] font-bold">Mês Anterior</button>
                        <button onClick={(e) => handleQuickMove(e, 1)} className="px-2 py-1 bg-white text-blue-600 rounded text-[10px] font-bold shadow-sm">Próx. Mês</button>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-gray-500 mt-2 truncate">{taskDetails.description || "Preventiva Periódica"}</p>
            )}
            
            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                <span>{taskDetails.type}</span>
                <span>{taskDetails.month.substring(0,3)}/{taskDetails.year}</span>
            </div>
        </div>
    );
};
