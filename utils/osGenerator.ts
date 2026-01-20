
import { Equipment, WorkOrder } from '../types';

/**
 * Calcula o próximo número de Ordem de Serviço disponível.
 * Regra: Busca o PRIMEIRO número inteiro disponível a partir de 1.
 * Exemplo: Se 0001 existe, mas 0002 não, retorna 0002.
 * Se 0006 existe, pula para o próximo livre.
 * Formato: 0001, 0002...
 */
export const getNextOSNumber = (equipmentData: Equipment[], workOrders: WorkOrder[]): string => {
    const usedIds = new Set<string>();

    // Coleta todos os IDs em uso
    workOrders.forEach(order => usedIds.add(order.id));
    equipmentData.forEach(eq => {
        eq.schedule.forEach(task => {
            if (task.osNumber) usedIds.add(task.osNumber);
        });
    });

    let candidate = 1;
    while (true) {
        const candidateStr = String(candidate).padStart(4, '0');
        // Se este número não estiver em uso, ele é o próximo
        if (!usedIds.has(candidateStr)) {
            return candidateStr;
        }
        candidate++;
        // Safety break (embora improvável atingir 10k tão cedo)
        if (candidate > 99999) return 'ERROR';
    }
};
