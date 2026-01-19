
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceTask, MaintenanceType, FlatTask, Equipment, MaintenanceStatus } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { BulkPrintModal } from '../components/BulkPrintModal';
import { PreviewWorkOrderModal } from '../components/PreviewWorkOrderModal';
import { PreviewCorrectiveWorkOrderModal } from '../components/PreviewCorrectiveWorkOrderModal';
import { MONTHS } from '../constants';
import { 
    SearchIcon, 
    ClipboardListIcon, 
    CheckCircleIcon, 
    RefreshIcon, 
    DocumentTextIcon, 
    ClockIcon, 
    ArrowPathIcon,
    TargetIcon
} from '../components/icons';

type DocumentType = 'Preventive' | 'Predictive' | 'Corrective';
type FlowTab = 'to_print' | 'in_field' | 'received';

export const DocumentationPage: React.FC = () => {
    const { equipmentData, workOrders, revertTasksPreparation } = useDataContext();
    const [selectedType, setSelectedType] = useState<DocumentType>('Preventive');
    const [activeFlow, setActiveFlow] = useState<FlowTab>('to_print');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    
    const [selectedTaskKeys, setSelectedTaskKeys] = useState<Set<string>>(new Set());
    const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
    const [isReverting, setIsReverting] = useState(false);
    const [individualPrintTask, setIndividualPrintTask] = useState<FlatTask | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const allTasks = useMemo((): FlatTask[] => {
        const sch = equipmentData.flatMap(eq =>
            eq.schedule.map(t => ({ 
                equipment: eq, 
                task: t, 
                year: t.year, 
                monthIndex: MONTHS.indexOf(t.month), 
                key: `sch-${eq.id}-${t.id}` 
            }))
        );
        
        const std = workOrders.map(o => {
             const eq = equipmentData.find(e => e.id === o.equipmentId) || { 
                id: o.equipmentId, 
                name: 'Equipamento Externo', 
                location: 'N/A', 
                status: 'Ativo', 
                schedule: [], 
                model: 'Geral',
                is_critical: false
             } as Equipment;
             const date = o.scheduledDate ? new Date(o.scheduledDate) : new Date();
             const validDate = isNaN(date.getTime()) ? new Date() : date;
             
             const t: MaintenanceTask = { 
                id: o.id, 
                year: validDate.getFullYear(), 
                month: MONTHS[validDate.getMonth()], 
                status: o.status, 
                type: o.type, 
                description: o.description, 
                osNumber: o.id, 
                requester: o.requester, 
                startDate: o.scheduledDate, 
                isPrepared: o.isPrepared || o.status === MaintenanceStatus.Executed,
                details: o.checklist || []
             };
             return { equipment: eq, task: t, year: t.year, monthIndex: MONTHS.indexOf(t.month), key: `std-${o.id}` };
        });
        return [...sch, ...std];
    }, [equipmentData, workOrders]);

    const filteredTasks = useMemo(() => {
        const typeMap: Record<DocumentType, MaintenanceType[]> = {
            'Preventive': [MaintenanceType.Preventive, MaintenanceType.RevisaoPeriodica],
            'Predictive': [MaintenanceType.Predictive],
            'Corrective': [MaintenanceType.Corrective],
        };

        return allTasks.filter(item => {
            if (item.year !== selectedYear) return false;
            if (!typeMap[selectedType].includes(item.task.type as MaintenanceType)) return false;
            if (selectedMonth && item.task.month !== selectedMonth) return false;
            
            if (activeFlow === 'to_print' && (item.task.isPrepared || item.task.status === MaintenanceStatus.Executed || item.task.status === MaintenanceStatus.InField)) return false;
            if (activeFlow === 'in_field' && (!item.task.isPrepared || item.task.status === MaintenanceStatus.Executed)) return false;
            if (activeFlow === 'received' && item.task.status !== MaintenanceStatus.Executed) return false;

            const term = debouncedSearchTerm.toLowerCase();
            return term === '' || 
                   (item.task.osNumber && item.task.osNumber.includes(term)) ||
                   item.equipment.id.toLowerCase().includes(term) ||
                   item.equipment.name.toLowerCase().includes(term);
        }).sort((a, b) => {
            return (b.task.osNumber || '').localeCompare(a.task.osNumber || '', undefined, { numeric: true });
        });
    }, [allTasks, selectedType, selectedMonth, selectedYear, debouncedSearchTerm, activeFlow]);

    return (
        <div className="space-y-4 animate-fade-in">
            <Header title="Gestão de Documentação" subtitle="Controle de fluxo de Ordens de Serviço (Impressão -> Campo -> Retorno)." />

            <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 border border-slate-200 dark:border-gray-700 shadow-sm">
                {[
                    { id: 'to_print', label: '1. Para Impressão', icon: <DocumentTextIcon className="w-4 h-4"/>, color: 'text-blue-600' },
                    { id: 'in_field', label: '2. Em Campo', icon: <ClockIcon className="w-4 h-4"/>, color: 'text-orange-600' },
                    { id: 'received', label: '3. Recebidas (Executadas)', icon: <CheckCircleIcon className="w-4 h-4"/>, color: 'text-emerald-600' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveFlow(tab.id as FlowTab); setSelectedTaskKeys(new Set()); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase transition-all ${activeFlow === tab.id ? 'bg-slate-100 dark:bg-gray-700 shadow-inner ' + tab.color : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-black text-[10px] uppercase text-slate-400 mb-4 tracking-widest">Filtrar por Natureza</h3>
                        <div className="space-y-2">
                            {(['Preventive', 'Predictive', 'Corrective'] as DocumentType[]).map(t => (
                                <button key={t} onClick={() => { setSelectedType(t); setSelectedTaskKeys(new Set()); }} className={`w-full text-left p-4 rounded-xl border-2 font-black text-[11px] uppercase transition-all ${selectedType === t ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                                    {t === 'Preventive' ? 'Preventivas' : t === 'Predictive' ? 'Preditivas' : 'Corretivas'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center">
                        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="form-input flex-1 font-bold border-slate-50 bg-slate-50 h-12 rounded-xl">
                            <option value="">Todos os Meses</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="relative flex-1 min-w-[200px]">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Buscar por Protocolo ou Máquina..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 h-12 form-input border-slate-50 bg-slate-50 rounded-xl" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-8 py-4 bg-slate-800 flex justify-between items-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
                            <div className="flex items-center gap-4">
                                <span>Lista de Documentos ({filteredTasks.length})</span>
                            </div>
                        </div>
                        
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                            {filteredTasks.length > 0 ? filteredTasks.map(item => (
                                <div key={item.key} className="group px-8 py-4 transition-all flex items-center gap-6 hover:bg-blue-50/30">
                                    <div className="flex-1 grid grid-cols-12 items-center gap-4">
                                        <div className="col-span-2">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center border border-blue-100">
                                                <span className="text-[7px] font-black text-blue-400 uppercase">OS</span>
                                                <span className="text-sm font-black text-blue-700">#{item.task.osNumber}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase">{item.equipment.id}</p>
                                                {item.equipment.is_critical && <TargetIcon className="w-3 h-3 text-orange-500" />}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.equipment.name}</p>
                                        </div>
                                        <div className="col-span-4">
                                            <p className="text-[11px] font-medium text-slate-600 italic">"{item.task.description}"</p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            {activeFlow === 'received' ? (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase">Concluída</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.task.month}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">
                                    Nenhum registro para exibir neste estágio
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
