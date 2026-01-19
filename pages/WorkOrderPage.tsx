
import React, { useState, useMemo } from 'react';
import { WorkOrder, MaintenanceStatus, MaintenanceType } from '../types';
import { Header } from '../components/Header';
import { PlusIcon, EditIcon, TargetIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import { MAINTENANCE_TYPE_CONFIG, MONTHS } from '../constants';

const StatusQuickFilter: React.FC<{ label: string; count: number; active: boolean; color: string; onClick: () => void }> = ({ label, count, active, color, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${active ? color + ' border-current shadow-sm scale-105 z-10' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black">{count}</span>
    </button>
);

export const WorkOrderPage: React.FC = () => {
    const { setIsOSModalOpen, setEditingOrder } = useAppContext();
    const { workOrders, equipmentData, excludedIds } = useDataContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('Todos');
    const [filterNature, setFilterNature] = useState<'TODAS' | 'PREVENTIVAS' | 'PREDITIVAS' | 'CORRETIVAS'>('TODAS');

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const equipmentMap = useMemo(() => new Map(equipmentData.map(e => [e.id, e])), [equipmentData]);

    // Combine issued Work Orders with Scheduled Tasks from the Master Plan
    const unifiedList = useMemo(() => {
        // 1. Issued Orders
        const issued = workOrders.map(wo => ({...wo, isVirtual: false}));
        const issuedIds = new Set(issued.map(wo => wo.id));

        // 2. Scheduled Tasks (Virtual Work Orders)
        const scheduled: (WorkOrder & { isVirtual: boolean })[] = [];
        
        equipmentData.forEach(eq => {
            eq.schedule.forEach(task => {
                // Skip if this task ID or OS number matches an existing issued order
                if (issuedIds.has(task.id) || (task.osNumber && issuedIds.has(task.osNumber))) return;

                // Create a virtual work order for display
                const virtualOrder: WorkOrder & { isVirtual: boolean } = {
                    id: task.osNumber || 'PLAN',
                    equipmentId: eq.id,
                    type: task.type || MaintenanceType.Preventive,
                    status: task.status,
                    scheduledDate: task.startDate || new Date(task.year, MONTHS.indexOf(task.month), 1).toISOString(),
                    description: task.description,
                    checklist: task.details,
                    requester: 'Cronograma Mestre',
                    machineStopped: false,
                    materialsUsed: [],
                    manHours: [],
                    isVirtual: true
                };
                scheduled.push(virtualOrder);
            });
        });

        return [...issued, ...scheduled];
    }, [workOrders, equipmentData]);

    const filteredList = useMemo(() => {
        const term = debouncedSearchTerm.toLowerCase();
        
        return unifiedList
            .filter(order => !excludedIds.includes(order.id))
            .filter(item => {
                if (filterNature === 'PREVENTIVAS' && item.type !== MaintenanceType.Preventive) return false;
                if (filterNature === 'CORRETIVAS' && item.type !== MaintenanceType.Corrective) return false;
                if (filterNature === 'PREDITIVAS' && item.type !== MaintenanceType.Predictive) return false;

                const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus;
                
                const eq = equipmentMap.get(item.equipmentId);
                const eqName = eq?.name || '';
                const matchesSearch = String(item.id).toLowerCase().includes(term) ||
                                     item.equipmentId.toLowerCase().includes(term) ||
                                     eqName.toLowerCase().includes(term) ||
                                     (item.description && item.description.toLowerCase().includes(term));

                return matchesStatus && matchesSearch;
            })
            .sort((a, b) => {
                // Sort by ID (descending) but handle 'PLAN' IDs
                if (a.id === 'PLAN' && b.id !== 'PLAN') return 1;
                if (a.id !== 'PLAN' && b.id === 'PLAN') return -1;
                return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
            });
    }, [unifiedList, debouncedSearchTerm, filterStatus, filterNature, equipmentMap, excludedIds]);

    return (
        <div className="space-y-6 animate-fade-in">
            <Header title="Protocolos de Manutenção" subtitle="Visão unificada: Ordens Emitidas + Cronograma Mestre." 
                actions={
                    <button onClick={() => { setEditingOrder(null); setIsOSModalOpen(true); }} className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                        <PlusIcon className="w-5 h-5"/> Nova O.S.
                    </button>
                }
            />

            <div className="flex flex-wrap gap-3">
                <StatusQuickFilter label="Total Geral" count={filteredList.length} active={filterStatus === 'Todos'} color="bg-slate-100 text-slate-800" onClick={() => setFilterStatus('Todos')} />
                <StatusQuickFilter label="Atrasados" count={unifiedList.filter(o => o.status === MaintenanceStatus.Delayed).length} active={filterStatus === MaintenanceStatus.Delayed} color="bg-rose-50 text-rose-700" onClick={() => setFilterStatus(MaintenanceStatus.Delayed)} />
                <StatusQuickFilter label="Executados" count={unifiedList.filter(o => o.status === MaintenanceStatus.Executed).length} active={filterStatus === MaintenanceStatus.Executed} color="bg-emerald-50 text-emerald-700" onClick={() => setFilterStatus(MaintenanceStatus.Executed)} />
                <StatusQuickFilter label="Programados" count={unifiedList.filter(o => o.status === MaintenanceStatus.Scheduled).length} active={filterStatus === MaintenanceStatus.Scheduled} color="bg-blue-50 text-blue-700" onClick={() => setFilterStatus(MaintenanceStatus.Scheduled)} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-800 text-[10px] font-black uppercase text-slate-300 tracking-widest">
                        <tr>
                            <th className="px-6 py-4 text-left">Protocolo</th>
                            <th className="px-6 py-4 text-left">Equipamento</th>
                            <th className="px-6 py-4 text-left">Resumo</th>
                            <th className="px-6 py-4 text-center">Data</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredList.map(item => {
                            const config = MAINTENANCE_TYPE_CONFIG[item.type as MaintenanceType] || { color: 'bg-gray-500', textColor: 'text-white' };
                            const eq = equipmentMap.get(item.equipmentId);
                            const isVirtual = (item as any).isVirtual;
                            const isCritical = eq?.is_critical;

                            return (
                                <tr key={`${item.id}-${item.equipmentId}`} className={`group hover:bg-slate-50 transition-colors ${isCritical ? 'bg-orange-50/10 border-l-4 border-l-orange-500' : ''}`}>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-black ${isVirtual ? 'text-gray-400' : 'text-blue-600'}`}>#{item.id}</span>
                                        {isVirtual && <span className="block text-[8px] font-bold text-gray-300 uppercase">Mestre</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-800 dark:text-white uppercase">{item.equipmentId}</span>
                                            {isCritical && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 border border-orange-200 shadow-sm" title="Equipamento Crítico">
                                                    <TargetIcon className="w-3 h-3 text-orange-600" />
                                                    <span className="text-[7px] font-black text-orange-700 uppercase">Crítico</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{eq?.name || '---'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-medium text-slate-600 italic line-clamp-1">"{item.description}"</p>
                                        <span className={`text-[8px] font-black px-1 rounded ${config.color} ${config.textColor}`}>{item.type?.toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[10px] font-mono font-bold text-slate-500">
                                        {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('pt-BR') : '---'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${item.status === MaintenanceStatus.Executed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : isVirtual ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {isVirtual ? (
                                                <button onClick={() => { setEditingOrder(item); setIsOSModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Emitir O.S. a partir do Plano">
                                                    <EditIcon />
                                                </button>
                                            ) : (
                                                <button onClick={() => { setEditingOrder(item); setIsOSModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar O.S.">
                                                    <EditIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
