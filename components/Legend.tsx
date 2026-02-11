
import React from 'react';

const legendItems = [
    { label: 'Programado', color: 'bg-blue-500' },
    { label: 'Executado', color: 'bg-emerald-500' },
    { label: 'Atrasado', color: 'bg-rose-500' },
    { label: 'Em Campo', color: 'bg-amber-500' },
    { label: 'Terceiro / Alerta', color: 'bg-purple-600' },
];

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4">
        {legendItems.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
              <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
            </div>
        ))}
    </div>
  );
};
