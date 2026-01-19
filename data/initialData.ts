
import { Equipment, MaintenanceStatus, MaintenanceType, MaintenanceTask, AssetCategory, TaskDetail, WorkOrder } from '../types';
import { MONTHS } from '../constants';

// --- 1. ESTRATÉGIAS TÉCNICAS ---
const STRATEGIES: { [key: string]: { freq: number, desc: string, type: MaintenanceType, tasks: TaskDetail[] } } = {
    'PH': { 
        freq: 3, 
        desc: 'Revisão Trimestral - Hidráulica', 
        type: MaintenanceType.Preventive,
        tasks: [
            { action: 'Verificar nível de óleo (ISO VG 68)', checked: false },
            { action: 'Inspecionar vazamentos no pistão/mangueiras', checked: false },
            { action: 'Reaperto de estrutura e colunas', checked: false },
            { action: 'Verificar sensores de segurança/cortina', checked: false },
            { action: 'Limpeza do trocador de calor', checked: false },
            { action: 'Monitorar pressão de trabalho', checked: false }
        ]
    },
    'EX': { 
        freq: 3, 
        desc: 'Revisão Trimestral - Extrusão', 
        type: MaintenanceType.Preventive,
        tasks: [
            { action: 'Verificar Resistências e Termopares', checked: false },
            { action: 'Medição de corrente do motor principal', checked: false },
            { action: 'Verificar vazamentos no redutor', checked: false },
            { action: 'Limpeza de ventoinhas do painel', checked: false }
        ]
    },
    'AEX': { 
        freq: 3, 
        desc: 'Revisão Trimestral - Extrusora PA', 
        type: MaintenanceType.Preventive,
        tasks: [
            { action: 'Verificar Resistências e Estrutura Física', checked: false },
            { action: 'Verificar nível de óleo redutor', checked: false },
            { action: 'Verificar cilindro hidráulico', checked: false }
        ]
    },
    'FO': { 
        freq: 3, 
        desc: 'Revisão Trimestral - Forno Elétrico', 
        type: MaintenanceType.Preventive,
        tasks: [
            { action: 'Reaperto de contatos elétricos', checked: false },
            { action: 'Medição de corrente das resistências', checked: false },
            { action: 'Verificar vedação da porta', checked: false },
            { action: 'Verificar estrutura física e tubulação', checked: false } 
        ]
    },
    'ES': { 
        freq: 1, 
        desc: 'Revisão Mensal - Segurança e Abrasivos', 
        type: MaintenanceType.Preventive,
        tasks: [
            { action: 'Verificar estado dos rebolos (trincas)', checked: false },
            { action: 'Ajustar apoio de peça (máx 3mm)', checked: false },
            { action: 'Verificar proteção visual (METÁLICA)', checked: false }, 
            { action: 'Teste de isolamento elétrico', checked: false }
        ]
    },
    'GE': {
        freq: 12,
        desc: 'Revisão Anual - Grupo Gerador',
        type: MaintenanceType.Preventive,
        tasks: [
            { action: 'Substituição de Óleo e Filtro (Filtro: 1518512)', checked: false },
            { action: 'Verificar Filtro de Combustível e Separador', checked: false },
            { action: 'Verificar nível de combustível (Diesel)', checked: false },
            { action: 'Teste de carga e bateria', checked: false }
        ]
    },
    'CF': {
        freq: 1, 
        desc: 'Revisão Mensal - Refrigeração',
        type: MaintenanceType.Preventive,
        tasks: [
            { action: 'Limpeza da grade do ar condicionado', checked: false }, 
            { action: 'Verificação de temperatura', checked: false }
        ]
    },
    'MS': { 
        freq: 2, 
        desc: 'Revisão Bimestral - Solda', 
        type: MaintenanceType.Preventive, 
        tasks: [
            { action: 'VERIFICAR ASPECTO VISUAL', checked: false },
            { action: 'VERIFICAR INSTALAÇÃO ELÉTRICA', checked: false },
            { action: 'EXECUTAR LIMPEZA INTERNA COM SOPRADOR DE AR', checked: false }
        ] 
    },
};

// --- 2. LISTA MESTRA ---
const MASTER_PLAN_2026 = [
    { id: 'PH-20', name: 'PRENSA HIDRAULICA', startMonth: 0 },
    { id: 'PH-19', name: 'PRENSA HIDRAULICA', startMonth: 0 },
    { id: 'PH-09', name: 'PRENSA DE MOLDAGEM', startMonth: 0 },
    { id: 'AEX-02', name: 'EXTRUSORA DE PA', startMonth: 0 },
    { id: 'CF-01', name: 'CÂMARA FRIA', startMonth: 0 },
    { id: 'PH-15', name: 'PRENSA HIDRÁULICA', startMonth: 0 },
    { id: 'EX-03', name: 'EXTRUSORA', startMonth: 2 },
    { id: 'PH-13', name: 'PRENSA HIDRAULICA', startMonth: 0 },
    { id: 'FO-10', name: 'FORNO', startMonth: 2 },
    { id: 'PH-14', name: 'PRENSA', startMonth: 0 },
    { id: 'FO-11', name: 'FORNO', startMonth: 2 },
    { id: 'EX-04', name: 'EXTRUSORA', startMonth: 0 },
    { id: 'FO-07', name: 'FORNO', startMonth: 2 },
    { id: 'MS-03', name: 'MAQUINA DE SOLDA', startMonth: 0 },
    { id: 'TD-04', name: 'TRANÇADEIRA', startMonth: 0 },
    { id: 'TD-02', name: 'TRANÇADEIRA', startMonth: 0 },
    { id: 'ES-01', name: 'ESMERIL', startMonth: 0 },
    { id: 'ES-04', name: 'ESMERIL', startMonth: 0 },
    { id: 'GE-01', name: 'GERADOR', startMonth: 7 },
    { id: 'AF-01', name: 'AUTOFRETAGEM', startMonth: 10, type: MaintenanceType.Predictive },
];

const getChecklistFor = (id: string) => {
    const prefix = id.match(/^([A-Z]+)/)?.[1] || 'GENERIC';
    return STRATEGIES[prefix]?.tasks || [];
};

// --- 3. DADOS REAIS EXECUTADOS JANEIRO (FIXADO PARA BI) ---
const REAL_EXECUTED_JANUARY: WorkOrder[] = [
    { id: '0179', equipmentId: 'PH-20', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-09T11:10:00', endDate: '2026-01-09T11:45:00', requester: 'PCM', description: 'Revisão Trimestral', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 0.58}], materialsUsed: [] },
    { id: '0183', equipmentId: 'PH-19', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-09T10:10:00', endDate: '2026-01-09T11:00:00', requester: 'PCM', description: 'Revisão Trimestral', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 0.83}], materialsUsed: [] },
    { id: '0187', equipmentId: 'PH-09', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-09T08:30:00', endDate: '2026-01-09T09:10:00', requester: 'PCM', description: 'Revisão Trimestral', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 0.67}], materialsUsed: [] },
    { id: '0030', equipmentId: 'AEX-02', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-08T11:30:00', endDate: '2026-01-08T12:30:00', requester: 'PCM', description: 'Revisão Trimestral', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 1.0}], materialsUsed: [] },
    { id: '0006', equipmentId: 'CF-01', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-08T07:30:00', endDate: '2026-01-08T08:10:00', requester: 'PCM', description: 'Revisão Mensal', machineStopped: false, manHours: [{maintainer: 'Darci', hours: 0.67}], materialsUsed: [] },
    { id: '0127', equipmentId: 'PH-15', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-07T16:00:00', endDate: '2026-01-07T16:40:00', requester: 'PCM', description: 'Revisão Trimestral', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 0.67}], materialsUsed: [] },
    { id: 'C-0103', equipmentId: 'PH-13', type: MaintenanceType.Corrective, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-09T12:10:00', endDate: '2026-01-09T13:40:00', requester: 'Produção', description: 'Vazamento Pistão Central', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 1.5}], materialsUsed: [] },
    { id: '0067', equipmentId: 'FO-10', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-08T08:15:00', endDate: '2026-01-08T08:50:00', requester: 'PCM', description: 'Revisão Trimestral', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 0.58}], materialsUsed: [] },
    { id: '0025', equipmentId: 'PH-14', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-08T15:00:00', endDate: '2026-01-08T15:40:00', requester: 'PCM', description: 'Revisão Trimestral', machineStopped: true, manHours: [{maintainer: 'Darci', hours: 0.67}], materialsUsed: [] },
    { id: '0019', equipmentId: 'MS-03', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-08T16:30:00', endDate: '2026-01-08T17:00:00', requester: 'PCM', description: 'Revisão Bimestral', machineStopped: false, manHours: [{maintainer: 'Darci', hours: 0.5}], materialsUsed: [] },
    { id: '0007', equipmentId: 'ES-01', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-08T11:00:00', endDate: '2026-01-08T11:15:00', requester: 'PCM', description: 'Revisão Mensal', machineStopped: false, manHours: [{maintainer: 'Darci', hours: 0.25}], materialsUsed: [] },
    { id: '0009', equipmentId: 'ES-04', type: MaintenanceType.Preventive, status: MaintenanceStatus.Executed, scheduledDate: '2026-01-08T15:00:00', endDate: '2026-01-08T15:20:00', requester: 'PCM', description: 'Revisão Mensal', machineStopped: false, manHours: [{maintainer: 'Darci', hours: 0.33}], materialsUsed: [] },
].map(wo => ({
    ...wo,
    checklist: getChecklistFor(wo.equipmentId)
}));

export const getInitialEquipmentData = (): Equipment[] => {
    return MASTER_PLAN_2026.map(raw => {
        const prefix = raw.id.match(/^([A-Z]+)/)?.[1] || 'GENERIC';
        const strategy = STRATEGIES[prefix] || { freq: 12, desc: 'Padrão', type: MaintenanceType.Preventive, tasks: [] };
        
        const schedule: MaintenanceTask[] = [];
        // Gerar cronograma futuro mantendo espaço para as OS já executadas
        for (let i = 0; i < 12; i += strategy.freq) {
            const hasExecuted = REAL_EXECUTED_JANUARY.find(o => o.equipmentId === raw.id && new Date(o.scheduledDate).getMonth() === i);
            if (!hasExecuted) {
                schedule.push({
                    id: crypto.randomUUID(),
                    year: 2026,
                    month: MONTHS[i],
                    status: MaintenanceStatus.Scheduled,
                    type: strategy.type,
                    description: strategy.desc,
                    details: strategy.tasks
                });
            }
        }

        return {
            id: raw.id,
            name: raw.name,
            location: 'Planta Principal',
            category: AssetCategory.Industrial,
            status: 'Ativo',
            is_critical: ['PH', 'EX', 'AEX', 'FO', 'GE'].includes(prefix), 
            manufacturer: 'Global Tech',
            model: prefix,
            schedule: schedule
        };
    });
};

export const getInitialCorrectiveBacklog = (): WorkOrder[] => {
    return [...REAL_EXECUTED_JANUARY];
};
