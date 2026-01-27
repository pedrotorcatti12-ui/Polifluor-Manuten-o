
import { Equipment, WorkOrder } from '../types';

/**
 * Calcula o próximo número de Ordem de Serviço disponível de forma eficiente.
 * Regra: Encontra o maior número de OS existente e retorna o próximo número na sequência.
 * Exemplo: Se a OS mais alta for #0350, a próxima será #0351.
 * Formato: 0001, 0002...
 */
export const getNextOSNumber = (equipmentData: Equipment[], workOrders: WorkOrder[]): string => {
    const usedIdsAsNumbers = new Set<number>();

    // Coleta todos os IDs numéricos em uso a partir da fonte única da verdade (workOrders)
    workOrders.forEach(order => {
        const num = parseInt(order.id, 10);
        if (!isNaN(num)) usedIdsAsNumbers.add(num);
    });

    const maxId = usedIdsAsNumbers.size > 0 ? Math.max(...Array.from(usedIdsAsNumbers)) : 0;
    
    return String(maxId + 1).padStart(4, '0');
};

/**
 * Gera um bloco de números de OS sequenciais e únicos.
 * Encontra o maior número de OS existente e gera os próximos 'count' números.
 * @param count O número de novos IDs a serem gerados.
 * @param existingWorkOrders A lista atual de ordens de serviço.
 * @returns Um array de strings com os novos IDs de OS.
 */
export const generateSequentialOSNumbers = (count: number, existingWorkOrders: WorkOrder[]): string[] => {
    const usedIdsAsNumbers = existingWorkOrders
        .map(order => parseInt(order.id, 10))
        .filter(num => !isNaN(num));

    const maxId = usedIdsAsNumbers.length > 0 ? Math.max(...usedIdsAsNumbers) : 0;
    
    const newIds: string[] = [];
    for (let i = 1; i <= count; i++) {
        newIds.push(String(maxId + i).padStart(4, '0'));
    }
    
    return newIds;
};