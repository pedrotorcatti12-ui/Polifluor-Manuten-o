import { useMemo } from 'react';
// FIX: Import MaintenanceTask
import { Equipment, WorkOrder, MaintenanceStatus, MaintenanceTask } from '../types';
import { useAdvancedMetrics } from './useAdvancedMetrics';
import { useDataContext } from '../contexts/DataContext';
import { MONTHS } from '../constants';

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
        
        if (metrics.length > 0) {
            const executedTasksInYear = workOrders
                .filter(wo => wo.equipmentId === equipment.id && wo.status === MaintenanceStatus.Executed && new Date(wo.scheduledDate).getFullYear() === year)
                .map(wo => ({
                    id: wo.id,
                    year: year,
                    month: MONTHS[new Date(wo.scheduledDate).getMonth()],
                    status: wo.status,
                    type: wo.type,
                    description: wo.description,
                    osNumber: wo.id,
                    startDate: wo.scheduledDate,
                    endDate: wo.endDate,
                    // FIX: Access manHours correctly using optional chaining and default empty array
                    maintainer: { name: (wo.manHours || []).map(m => m.maintainer).join(', '), isExternal: false },
                    manHours: (wo.manHours || []).reduce((sum, h) => sum + h.hours, 0)
                } as MaintenanceTask))
                // FIX: Use optional chaining for endDate to prevent errors if it's undefined
                .sort((a, b) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());
            
            return { metrics: metrics[0], executedTasks: executedTasksInYear };
        }

        return {
            metrics: { mtbf: null, mttr: 0, availability: 100, totalFailures: 0, totalCorrectiveHours: 0 },
            executedTasks: []
        };
    }, [equipment, year, workOrders, calculate]);

    return result;
};