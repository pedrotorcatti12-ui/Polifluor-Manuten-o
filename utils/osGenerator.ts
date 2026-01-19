
import { Equipment, WorkOrder } from '../types';

/**
 * Calcula o próximo número de Ordem de Serviço disponível.
 * Varre tanto as O.S. avulsas (workOrders) quanto as tarefas agendadas (schedule).
 */
export const getNextOSNumber = (equipmentData: Equipment[], workOrders: WorkOrder[]): string => {
    let maxId = 0;

    const processId = (id: string | undefined) => {
        if (!id) return;
        const numericPart = id.replace(/\D/g, '');
        if (numericPart) {
            const num = parseInt(numericPart, 10);
            if (!isNaN(num) && num > maxId) {
                maxId = num;
            }
        }
    };

    equipmentData.forEach(eq => {
        eq.schedule.forEach(task => processId(task.osNumber));
    });

    workOrders.forEach(order => processId(order.id));

    return String(maxId + 1).padStart(4, '0');
};
