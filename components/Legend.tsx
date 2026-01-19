

import React from 'react';
// FIX: Corrected import path for types
import { MaintenanceStatus, StatusConfig, MaintenanceType } from '../types';
import { MAINTENANCE_TYPE_CONFIG } from '../constants';

interface LegendProps {
  statusMap: Map<string, StatusConfig>;
}

export const Legend: React.FC<LegendProps> = ({ statusMap }) => {
  const statusesToShow = [
    MaintenanceStatus.Scheduled,
    MaintenanceStatus.Executed,
    MaintenanceStatus.Delayed,
  ];

  const typesToShow = Object.values(MaintenanceType);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">LEGENDA DE STATUS:</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {statusesToShow.map(status => {
            const config = statusMap.get(status);
            if (!config) return null;
            return (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm flex items-center justify-center text-xs font-black text-white"
                  style={{ backgroundColor: config.color }}
                >
                  {config.symbol}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">LEGENDA DE TIPOS DE MANUTENÇÃO:</h3>
         <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {typesToShow.map(type => {
                const config = MAINTENANCE_TYPE_CONFIG[type];
                if (!config) return null;
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{config.label}</span>
                  </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};