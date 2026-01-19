

import React from 'react';
// FIX: Corrected import path for types
import { Equipment, MaintenanceStatus, StatusConfig, MaintenanceTask } from '../types';
import { EquipmentRow } from './EquipmentRow';

interface MaintenanceScheduleProps {
  equipmentData: Equipment[];
  viewYear: number;
  onCellClick: (equipment: Equipment, monthIndex: number, task: MaintenanceTask) => void;
  statusMap: Map<string, StatusConfig>;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  onViewDetails: (equipment: Equipment) => void;
  onAddCorrective: (equipment: Equipment) => void;
}

export const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({ equipmentData, viewYear, onCellClick, statusMap, onEdit, onDelete, onViewDetails, onAddCorrective }) => {
  if (equipmentData.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <h3 className="text-lg font-semibold">Nenhum equipamento encontrado</h3>
        <p className="mt-1">Ajuste seus filtros ou verifique o termo de busca.</p>
      </div>
    );
  }
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-[calc(100vh-14rem)] overflow-y-auto printable-schedule-container">
      {/* Header da Lista */}
      <div className="sticky top-0 z-10 grid grid-cols-[1fr_120px] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">Equipamento</h3>
        <h3 className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 text-center">Ações</h3>
      </div>
      {/* Corpo da Lista */}
      <div className="bg-white dark:bg-gray-900">
        {equipmentData.map((equipment, index) => (
          <EquipmentRow
            key={equipment.id}
            equipment={equipment}
            viewYear={viewYear}
            statusMap={statusMap}
            onCellClick={onCellClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            onAddCorrective={onAddCorrective}
            isLast={index === equipmentData.length - 1}
          />
        ))}
      </div>
    </div>
  );
};