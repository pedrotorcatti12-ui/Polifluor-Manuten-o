import { MaintenanceType } from '../types';

interface PeriodicityRule {
    description: string;
    type: MaintenanceType.Preventive | MaintenanceType.Predictive;
    frequency: number;
    frequencyUnit: 'days' | 'weeks' | 'months';
}

// Mapeia o ID do Tipo de Equipamento (Equipment.model) para um array de regras
export const periodicityRules = new Map<string, PeriodicityRule[]>([
    [
        'TORNO_CNC',
        [
            { description: 'Verificar nível do óleo de refrigeração', type: MaintenanceType.Preventive, frequency: 7, frequencyUnit: 'days' },
            { description: 'Limpeza geral e lubrificação das guias', type: MaintenanceType.Preventive, frequency: 15, frequencyUnit: 'days' },
            { description: 'Inspecionar e limpar filtros de ar', type: MaintenanceType.Preventive, frequency: 1, frequencyUnit: 'months' },
            { description: 'Análise de vibração do motor principal', type: MaintenanceType.Predictive, frequency: 6, frequencyUnit: 'months' },
        ]
    ],
    [
        'FRESADORAS',
        [
            { description: 'Limpeza e lubrificação geral', type: MaintenanceType.Preventive, frequency: 15, frequencyUnit: 'days' },
            { description: 'Verificar e ajustar folgas', type: MaintenanceType.Preventive, frequency: 3, frequencyUnit: 'months' },
        ]
    ],
    [
        'COMPRESSORES',
        [
            { description: 'Drenar condensado do reservatório', type: MaintenanceType.Preventive, frequency: 1, frequencyUnit: 'days' },
            { description: 'Verificar nível do óleo', type: MaintenanceType.Preventive, frequency: 7, frequencyUnit: 'days' },
            { description: 'Limpar/trocar filtro de admissão', type: MaintenanceType.Preventive, frequency: 1, frequencyUnit: 'months' },
            { description: 'Trocar óleo e filtro de óleo', type: MaintenanceType.Preventive, frequency: 6, frequencyUnit: 'months' },
        ]
    ]
]);
