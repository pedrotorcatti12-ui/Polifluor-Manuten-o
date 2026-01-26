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
type FlowTab = 'to_print' | 'in_field' | 'to_verify' | 'received';

// Converte um WorkOrder em uma FlatTask para compatibilidade de visualização
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
    const { equipmentData, workOrders, revertTasksPreparation, handleUnifiedSave, showToast, markTasksAsPrepared } = useDataContext();
    const [selectedType, setSelectedType] = useState<DocumentType>('Preventive');
    const [activeFlow, setActiveFlow] = useState<FlowTab>('to_print');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    
    const [selectedTaskKeys, setSelectedTaskKeys] = useState<Set<string>>(new Set());
    const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
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
            if (item.year !== selectedYear) return false;
            if (!typeMap[selectedType].includes(item.task.type as MaintenanceType)) return false;
            if (selectedMonth && item.task.month !== selectedMonth) return false;
            
            const { status, isPrepared } = item.task;
            
            switch (activeFlow) {
                case 'to_print':
                    if (isPrepared || status === MaintenanceStatus.Executed || status === MaintenanceStatus.InField) return false;
                    break;
                case 'in_field':
                    if (!isPrepared || status !== MaintenanceStatus.InField) return false;
                    break;
                case 'to_verify':
                    if (status !== MaintenanceStatus.InField) return false;
                    break;
                case 'received':
                    if (status !== MaintenanceStatus.Executed) return false;
                    break;
            }

            const term = debouncedSearchTerm.toLowerCase();
            return term === '' || 
                   (item.task.osNumber && item.task.osNumber.toLowerCase().includes(term)) ||
                   item.equipment.id.toLowerCase().includes(term) ||
                   item.equipment.name.toLowerCase().includes(term);
        }).sort((a, b) => {
            return (b.task.osNumber || '').localeCompare(a.task.osNumber || '', undefined, { numeric: true });
        });
    }, [allTasks, selectedType, selectedMonth, selectedYear, debouncedSearchTerm, activeFlow]);

    useEffect(() => {
        setSelectedTaskKeys(new Set());
    }, [activeFlow, selectedType, selectedMonth, selectedYear]);
    
    const handleConfirmReturn = async (item: FlatTask) => {
        const wo = workOrders.find(w => w.id === item.task.osNumber);
        if(!wo) {
            showToast("Ordem de Serviço não localizada para baixa.", "error");
            return;
        }

        const updatedOrder: WorkOrder = {
            ...wo,
            status: MaintenanceStatus.Executed,
            endDate: new Date().toISOString()
        };
        
        const success = await handleUnifiedSave(updatedOrder);
        if (success) {
            showToast(`O.S. #${wo.id} finalizada com sucesso.`, "success");
        }
    };
    
    const toggleSelection = (key: string) => {
        const newSelection = new Set(selectedTaskKeys);
        if (newSelection.has(key)) {
            newSelection.delete(key);
        } else {
            newSelection.add(key);
        }
        setSelectedTaskKeys(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedTaskKeys.size === filteredTasks.length) {
            setSelectedTaskKeys(new Set());
        } else {
            setSelectedTaskKeys(new Set(filteredTasks.map(t => t.key)));
        }
    };

    const handleBulkAction = (action: 'prepare' | 'revert') => {
        setIsProcessing(true);
        setTimeout(() => {
            const keys = Array.from(selectedTaskKeys);
            if (action === 'prepare') {
                markTasksAsPrepared(keys);
            } else {
                revertTasksPreparation(keys);
            }
            setSelectedTaskKeys(new Set());
            setIsProcessing(false);
        }, 500);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <Header title="Gestão de Documentação" subtitle="Controle de fluxo de Ordens de Serviço (Impressão -> Campo -> Retorno)." />

            <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 border border-slate-200 dark:border-gray-700 shadow-sm">
                {[
                    { id: 'to_print', label: '1. Para Impressão', icon: <DocumentTextIcon className="w-4 h-4"/>, color: 'text-blue-600' },
                    { id: 'in_field', label: '2. Em Campo', icon: <ClockIcon className="w-4 h-4"/>, color: 'text-orange-600' },
                    { id: 'to_verify', label: '3. Para Conferência', icon: <SearchIcon className="w-4 h-4"/>, color: 'text-indigo-600' },
                    { id: 'received', label: '4. Recebidas (Arquivar)', icon: <CheckCircleIcon className="w-4 h-4"/>, color: 'text-emerald-600' }
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
                                <button key={t} onClick={() => { setSelectedType(t); }} className={`w-full text-left p-4 rounded-xl border-2 font-black text-[11px] uppercase transition-all ${selectedType === t ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
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
                                <input type="checkbox" onChange={handleSelectAll} checked={filteredTasks.length > 0 && selectedTaskKeys.size === filteredTasks.length} className="w-4 h-4 rounded" />
                                <span>Lista de Documentos ({filteredTasks.length}) - Selecionados: {selectedTaskKeys.size}</span>
                            </div>
                             {activeFlow === 'to_print' && (
                                <button onClick={() => handleBulkAction('prepare')} disabled={selectedTaskKeys.size === 0 || isProcessing} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-[9px] hover:bg-orange-600 disabled:bg-slate-500">
                                    {isProcessing ? <ArrowPathIcon className="w-3 h-3 animate-spin"/> : <ClockIcon className="w-3 h-3" />} Mover para "Em Campo"
                                </button>
                            )}
                             {activeFlow === 'in_field' && (
                                <button onClick={() => handleBulkAction('revert')} disabled={selectedTaskKeys.size === 0 || isProcessing} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-[9px] hover:bg-rose-600 disabled:bg-slate-500">
                                    {isProcessing ? <ArrowPathIcon className="w-3 h-3 animate-spin"/> : <RefreshIcon className="w-3 h-3" />} Reverter para Impressão
                                </button>
                            )}
                        </div>
                        
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                            {filteredTasks.length > 0 ? filteredTasks.map(item => (
                                <div key={item.key} className={`group px-8 py-4 transition-all flex items-center gap-6 hover:bg-blue-50/30 ${selectedTaskKeys.has(item.key) ? 'bg-blue-50' : ''}`}>
                                    <input type="checkbox" checked={selectedTaskKeys.has(item.key)} onChange={() => toggleSelection(item.key)} className="w-5 h-5 rounded" />
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
                                                {item.equipment.isCritical && <TargetIcon className="w-3 h-3 text-orange-500" />}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.equipment.name}</p>
                                        </div>
                                        <div className="col-span-4">
                                            <p className="text-[11px] font-medium text-slate-600 italic">"{item.task.description}"</p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            {activeFlow === 'to_verify' ? (
                                                <button onClick={() => handleConfirmReturn(item)} className="px-3 py-2 bg-emerald-600 text-white font-bold text-[9px] uppercase rounded-lg hover:bg-emerald-700">
                                                    Confirmar Retorno
                                                </button>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                                    item.task.status === MaintenanceStatus.Executed ? 'bg-emerald-100 text-emerald-700' :
                                                    item.task.status === MaintenanceStatus.InField ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                                                }`}>
                                                    {item.task.status === MaintenanceStatus.InField ? 'Em Campo' : item.task.status}
                                                </span>
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