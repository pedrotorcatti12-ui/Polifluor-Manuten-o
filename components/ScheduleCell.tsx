
import React, { useMemo } from 'react';
import { WorkOrder, MaintenanceStatus } from '../types';
import { BellAlertIcon } from './icons';

interface ScheduleCellProps {
    orders: WorkOrder[];
    onClick: () => void;
}

type CellStatus = 'empty' | 'scheduled' | 'executed' | 'in_field' | 'delayed' | 'alert_third_party';

const statusConfig: Record<CellStatus, { className: string, title: string }> = {
    empty: { className: 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700', title: 'Nenhuma manutenção' },
    scheduled: { className: 'bg-blue-500 text-white border-blue-600', title: 'Programado' },
    executed: { className: 'bg-emerald-500 text-white border-emerald-600', title: 'Executado' },
    in_field: { className: 'bg-amber-500 text-white border-amber-600', title: 'Em Campo' },
    delayed: { className: 'bg-rose-500 text-white border-rose-600', title: 'Atrasado' },
    alert_third_party: { className: 'bg-purple-600 text-white border-purple-700', title: 'Alerta / Terceiro' },
};


export const ScheduleCell: React.FC<ScheduleCellProps> = ({ orders, onClick }) => {
    
    const cellStatus: CellStatus = useMemo(() => {
        if (orders.length === 0) return 'empty';
        
        // Regra de Prioridade: Se já foi executado, mostra verde.
        if (orders.every(o => o.status === MaintenanceStatus.Executed)) return 'executed';
        
        // Se estiver atrasado, mostra vermelho.
        if (orders.some(o => o.status === MaintenanceStatus.Delayed)) return 'delayed';
        
        // Se estiver em campo, mostra amarelo.
        if (orders.some(o => o.status === MaintenanceStatus.InField)) return 'in_field';

        // NOVO: Verificação de Alerta / Terceiro
        const isThirdPartyAlert = orders.some(o => {
            const desc = (o.description || '').toUpperCase();
            const checklistStr = JSON.stringify(o.checklist || '').toUpperCase();
            return desc.includes('TERCEIRO') || desc.includes('ALERTA') || checklistStr.includes('TERCEIRO');
        });

        if (isThirdPartyAlert) return 'alert_third_party';

        return 'scheduled';
    }, [orders]);
    
    const config = statusConfig[cellStatus];
    const isAlert = cellStatus === 'alert_third_party';

    return (
        <button
            onClick={onClick}
            disabled={orders.length === 0}
            title={config.title}
            className={`w-full h-full border flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out transform disabled:cursor-default 
                ${config.className} 
                ${orders.length > 0 ? 'hover:scale-110 hover:shadow-lg hover:z-10' : ''}`}
        >
            {orders.length > 0 && (
                <div className="flex flex-col items-center justify-center">
                    {isAlert && <BellAlertIcon className="w-4 h-4 mb-0.5 animate-pulse" />}
                    <span className={`font-black ${isAlert ? 'text-xs' : 'text-lg'}`}>
                        {orders.length}
                    </span>
                </div>
            )}
        </button>
    );
};
