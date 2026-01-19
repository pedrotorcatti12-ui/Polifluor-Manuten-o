
import React from 'react';
import { MaintenanceTask, MaintenanceStatus, MaintenanceType } from '../types';
import { MAINTENANCE_TYPE_CONFIG } from '../constants';
import { CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface ScheduleCellProps {
  tasks: MaintenanceTask[];
  onClick: () => void;
}

const PredictiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
  </svg>
);

const TaskIndicator: React.FC<{ task: MaintenanceTask }> = ({ task }) => {
    const typeConfig = task.type ? MAINTENANCE_TYPE_CONFIG[task.type] : null;
    let typeColorClass = typeConfig?.color || 'bg-gray-400';
    
    const isExecuted = task.status === MaintenanceStatus.Executed;
    const isDelayed = task.status === MaintenanceStatus.Delayed;
    const isPredictive = task.type === MaintenanceType.Predictive;

    if (isExecuted) typeColorClass = 'bg-green-500';
    if (isDelayed) typeColorClass = 'bg-red-500';
    if (isPredictive && !isExecuted && !isDelayed) typeColorClass = 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]';

    const title = `${task.type}: ${task.description} (${task.status})`;

    if (isExecuted) {
        return (
            <div className="relative flex-shrink-0 group z-10" title={title}>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg border-2 border-white transition-transform transform group-hover:scale-125">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
            </div>
        );
    }

    if (isDelayed) {
         return (
            <div className="relative flex-shrink-0 group z-10" title={title}>
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl border-2 border-white animate-pulse transition-transform transform group-hover:scale-125">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                </div>
            </div>
        );
    }

    if (isPredictive) {
        return (
            <div className="relative flex-shrink-0 group z-10" title={title}>
                <div className={`w-9 h-9 rotate-45 ${typeColorClass} flex items-center justify-center shadow-lg border-2 border-white transition-transform transform group-hover:scale-125 group-hover:rotate-0`}>
                    <div className="-rotate-45 text-amber-950">
                        <PredictiveIcon />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex-shrink-0 group z-10" title={title}>
            <div className={`w-9 h-9 rounded-full ${typeColorClass} shadow-lg border-2 border-white transition-transform transform group-hover:scale-125`}></div>
        </div>
    );
};

export const ScheduleCell: React.FC<ScheduleCellProps> = ({ tasks, onClick }) => {
  const visibleTasks = tasks.slice(0, 3);
  const hiddenCount = tasks.length - visibleTasks.length;

  return (
    <div
      onClick={onClick}
      className="h-24 flex items-center justify-center p-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer hover:bg-blue-50 transition-colors relative group"
    >
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {visibleTasks.map((task, idx) => (
            <div key={task.id} className={idx > 0 ? "-ml-5" : ""}>
                <TaskIndicator task={task} />
            </div>
        ))}
        {hiddenCount > 0 && (
          <div className="-ml-5 w-10 h-10 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-xl z-20">
            +{hiddenCount}
          </div>
        )}
      </div>
    </div>
  );
};
