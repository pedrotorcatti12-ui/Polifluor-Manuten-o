
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceType, FlatTask, Equipment, MaintenanceStatus, WorkOrder, AssetCategory } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { BulkPrintModal } from '../components/BulkPrintModal';
import { PreviewWorkOrderModal } from '../components/PreviewWorkOrderModal';
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
type FlowTab = 'to_print' | 'in_field' | 'archived';

const workOrderToFlatTask = (order: WorkOrder, equipment: Equipment): FlatTask => {
    const date = new Date(order.scheduledDate);
    return {
        equipment,
        task: {
            id: order.id,
            year: date.getFullYear(),
            month: MONTHS[date.getMonth()],
            status: order.status,
            type: order.type,
            description: order.description,
            osNumber: order.id,
            details: order.checklist,
            isPrepared: order.isPrepared,
            requester: order.requester,
            startDate: order.scheduledDate,
        },
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        key: `wo-${order.id}`
    };
};

export const DocumentationPage: React.FC = () => {
    const { equipmentData, workOrders, markTasksAsPrepared, revertTasksPreparation } = useDataContext();
    const [selectedType, setSelectedType] = useState<DocumentType>('Preventive');
    const [activeFlow, setActiveFlow] = useState<FlowTab>('to_print');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Seleção Múltipla
    const [selectedTaskKeys, setSelectedTaskKeys] = useState<Set<string>>(new Set());
    const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
    const [individualPrintTask, setIndividualPrintTask] = useState<FlatTask | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const equipmentMap = useMemo(() => new Map(equipmentData.map(e => [e.id, e])), [equipmentData]);

    const allTasks = useMemo((): FlatTask[] => {
        return workOrders.map(order => {
            const equipment = equipmentMap.get(order.equipmentId);
            const fallbackEq = { 
                id: order.equipmentId, name: 'Ativo Não Cadastrado', location: 'N/A', 
                status: 'Ativo', isCritical: false, category: AssetCategory.Industrial 
            } as Equipment;
            return workOrderToFlatTask(order, equipment || fallbackEq);
        });
    }, [workOrders, equipmentMap]);

    const filteredTasks = useMemo(() => {
        const typeMap: Record<DocumentType, MaintenanceType[]> = {
            'Preventive': [MaintenanceType.Preventive, MaintenanceType.RevisaoPeriodica],
            'Predictive': [MaintenanceType.Predictive],
            'Corrective': [MaintenanceType.Corrective, MaintenanceType.Predial, MaintenanceType.Melhoria],
        };

        return allTasks.filter(item => {
            if (!typeMap[selectedType].includes(item.task.type as MaintenanceType)) return false;
            
            const { status, isPrepared } = item.task;
            
            if (activeFlow === 'to_print') {
                if (status !== MaintenanceStatus.Scheduled && status !== MaintenanceStatus.Delayed) return false;
                if (isPrepared) return false; 
            } else if (activeFlow === 'in_field') {
                if (!isPrepared && status !== MaintenanceStatus.InField) return false;
                if (status === MaintenanceStatus.Executed) return false;
            } else if (activeFlow === 'archived') {
                if (status !== MaintenanceStatus.Executed) return false;
            }

            const term = debouncedSearchTerm.toLowerCase();
            return term === '' || 
                   (item.task.osNumber && item.task.osNumber.toLowerCase().includes(term)) ||
                   item.equipment.id.toLowerCase().includes(term) ||
                   item.equipment.name.toLowerCase().includes(term);
        }).sort((a, b) => {
            // Ordena por data (urgência)
            return new Date(a.task.startDate || '').getTime() - new Date(b.task.startDate || '').getTime();
        });
    }, [allTasks, selectedType, debouncedSearchTerm, activeFlow]);

    // Limpa seleção ao mudar de aba
    useEffect(() => {
        setSelectedTaskKeys(new Set());
    }, [activeFlow, selectedType]);

    const toggleSelection = (key: string) => {
        const newSelection = new Set(selectedTaskKeys);
        if (newSelection.has(key)) newSelection.delete(key);
        else newSelection.add(key);
        setSelectedTaskKeys(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedTaskKeys.size === filteredTasks.length) setSelectedTaskKeys(new Set());
        else setSelectedTaskKeys(new Set(filteredTasks.map(t => t.key)));
    };

    const handleManualMove = async () => {
        const keys = Array.from(selectedTaskKeys);
        if (activeFlow === 'to_print') {
            if (confirm(`Confirmar que ${keys.length} ordens foram impressas? Elas serão movidas para "Em Campo".`)) {
                await markTasksAsPrepared(keys);
                setSelectedTaskKeys(new Set());
            }
        } else {
            if (confirm(`Reverter ${keys.length} ordens para "A Imprimir"?`)) {
                await revertTasksPreparation(keys);
                setSelectedTaskKeys(new Set());
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <Header title="Central de Impressão e Documentação" subtitle="Controle o fluxo de papel: O que precisa ser impresso, o que está em campo e o que foi arquivado." />

            {/* SELETOR DE FLUXO (ABAS GRANDES) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setActiveFlow('to_print')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        activeFlow === 'to_print' 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg transform scale-[1.02]' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300'
                    }`}
                >
                    <DocumentTextIcon className="w-8 h-8"/>
                    <span className="font-black uppercase text-sm">1. Para Imprimir (Pendente)</span>
                </button>
                <button
                    onClick={() => setActiveFlow('in_field')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        activeFlow === 'in_field' 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg transform scale-[1.02]' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-orange-300'
                    }`}
                >
                    <ClockIcon className="w-8 h-8"/>
                    <span className="font-black uppercase text-sm">2. Em Campo (Impresso)</span>
                </button>
                 <button
                    onClick={() => setActiveFlow('archived')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        activeFlow === 'archived' 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg transform scale-[1.02]' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300'
                    }`}
                >
                    <CheckCircleIcon className="w-8 h-8"/>
                    <span className="font-black uppercase text-sm">3. Arquivadas (Executadas)</span>
                </button>
            </div>

            {/* BARRA DE FERRAMENTAS */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    {(['Preventive', 'Corrective', 'Predictive'] as DocumentType[]).map(t => (
                        <button 
                            key={t} 
                            onClick={() => setSelectedType(t)} 
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${selectedType === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >
                            {t === 'Preventive' ? 'Preventivas' : t === 'Corrective' ? 'Corretivas' : 'Preditivas'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="relative w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Filtrar lista..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 h-10 form-input text-xs font-bold" />
                    </div>
                    {activeFlow !== 'archived' && selectedTaskKeys.size > 0 && (
                        <>
                            {activeFlow === 'to_print' && (
                                <button onClick={() => setIsBulkPrintOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-black text-xs uppercase rounded-lg shadow-md hover:bg-blue-700 flex items-center gap-2">
                                    <ClipboardListIcon className="w-4 h-4"/> Imprimir ({selectedTaskKeys.size})
                                </button>
                            )}
                            <button onClick={handleManualMove} className="px-4 py-2 bg-slate-200 text-slate-600 font-black text-xs uppercase rounded-lg hover:bg-slate-300">
                                {activeFlow === 'to_print' ? 'Marcar como Impresso (Manual)' : 'Voltar para Impressão'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* LISTAGEM */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <input type="checkbox" onChange={handleSelectAll} checked={filteredTasks.length > 0 && selectedTaskKeys.size === filteredTasks.length} className="w-5 h-5 rounded border-slate-300" disabled={activeFlow === 'archived'} />
                    <span className="text-xs font-bold text-slate-500 uppercase">Selecionar Todos ({filteredTasks.length})</span>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto">
                    {filteredTasks.length > 0 ? filteredTasks.map(item => (
                        <div key={item.key} className={`group p-4 border-b border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors ${selectedTaskKeys.has(item.key) ? 'bg-blue-50/50' : ''}`}>
                            {activeFlow !== 'archived' && <input type="checkbox" checked={selectedTaskKeys.has(item.key)} onChange={() => toggleSelection(item.key)} className="w-5 h-5 rounded border-slate-300" />}
                            
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex flex-col items-center justify-center border border-slate-200">
                                <span className="text-[8px] font-black uppercase text-slate-400">ID</span>
                                <span className="text-sm font-black text-slate-700">{item.task.osNumber}</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-black text-slate-800 uppercase">{item.equipment.name}</h4>
                                    {item.equipment.isCritical && <TargetIcon className="w-4 h-4 text-orange-500" />}
                                </div>
                                <p className="text-xs text-slate-500 font-medium italic truncate max-w-lg">"{item.task.description}"</p>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">{item.task.type}</span>
                                    <span className="text-[10px] font-bold text-slate-400">Prog: {new Date(item.task.startDate!).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setIndividualPrintTask(item)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-[10px] font-bold uppercase rounded-lg hover:bg-slate-100 shadow-sm">
                                    Visualizar / Imprimir
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                            Nenhum documento nesta caixa.
                        </div>
                    )}
                </div>
            </div>

            {isBulkPrintOpen && <BulkPrintModal isOpen={isBulkPrintOpen} onClose={() => setIsBulkPrintOpen(false)} tasks={filteredTasks.filter(t => selectedTaskKeys.has(t.key))} documentType={selectedType} />}
            {individualPrintTask && <PreviewWorkOrderModal isOpen={!!individualPrintTask} onClose={() => setIndividualPrintTask(null)} taskData={individualPrintTask} />}
        </div>
    );
};