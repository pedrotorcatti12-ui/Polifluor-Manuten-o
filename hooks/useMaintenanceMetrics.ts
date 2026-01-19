
import { useMemo } from 'react';
import { Equipment, WorkOrder } from '../types';
import { useAdvancedMetrics } from './useAdvancedMetrics';
import { useDataContext } from '../contexts/DataContext';

/**
 * Hook Adaptador: Mantém compatibilidade com componentes que usam métricas individuais,
 * mas utiliza internamente o motor de cálculo unificado AdvancedMetrics.
 */
export const useMaintenanceMetrics = (equipment: Equipment, year: number) => {
    const { workOrders } = useDataContext();
    const calculate = useAdvancedMetrics();

    const result = useMemo(() => {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        const metrics = calculate([equipment], workOrders, [equipment.id], startDate, endDate);
        
        // Retorna o primeiro e único equipamento processado
        if (metrics.length > 0) {
            const executedTasks = equipment.schedule
                .filter(task => task.year === year && task.status === 'Executado' && task.startDate)
                .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());

            return { metrics: metrics[0], executedTasks };
        }

        return {
            metrics: { mtbf: null, mttr: 0, availability: 100, totalFailures: 0, totalCorrectiveHours: 0 },
            executedTasks: []
        };
    }, [equipment, year, workOrders, calculate]);

    return result;
};
