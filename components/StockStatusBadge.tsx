import React from 'react';

interface StockStatusBadgeProps {
  currentStock: number;
  minStock: number;
}

export const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({ currentStock, minStock }) => {
  let status: 'OK' | 'Alerta' | 'Crítico';
  let colorClass: string;

  if (currentStock < minStock) {
    status = 'Crítico';
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  } else if (currentStock === minStock) {
    status = 'Alerta';
    colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
  } else {
    status = 'OK';
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
  }

  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};