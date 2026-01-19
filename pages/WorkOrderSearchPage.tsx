
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from '../components/Header';
import { WorkOrder, Equipment, MaintenanceType, MaintenanceStatus } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { INITIAL_REQUESTERS } from '../constants';
import { useDataContext } from '../contexts/DataContext';
import { RefreshIcon, SearchIcon, DownloadIcon } from '../components/icons';

interface Filters {
    id: string;
    equipment: string;
    location: string;
    type: string;
    requester: string;
    description: string;
    observations: string;
    status: string;
    startDate: string;
    endDate: string;
}

const FilterInput: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ name, label, value, onChange, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-[10px] font-black uppercase text-gray-400 mb-1">{label}</label>
        <input type="text" id={name} name={name} value={value} onChange={onChange} className="w-full form-input h-11 font-bold" />
    </div>
);

const FilterSelect: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; className?: string }> = ({ name, label, value, onChange, children, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-[10px] font-black uppercase text-gray-400 mb-1">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-full form-input h-11 font-black text-blue-600">
            {children}
        </select>
    </div>
);

const FilterDate: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ name, label, value, onChange, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-[10px] font-black uppercase text-gray-400 mb-1">{label}</label>
        <input type="date" id={name} name={name} value={value} onChange={onChange} className="w-full form-input h-11 font-bold" />
    </div>
);

export const WorkOrderSearchPage: React.FC = () => {
    const { workOrders, equipmentData, forceFullDatabaseRefresh, isSyncing } = useDataContext();
    const [filters, setFilters] = useState<Partial<Filters>>({});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const debouncedFilters = useDebounce(filters, 300);
    
    // MAPEAMENTO DINÂMICO: Garante que o NOME venha do cadastro ATUAL e não da O.S. antiga
    const equipmentMap = useMemo(() => new Map(equipmentData.map(e => [e.id, e])), [equipmentData]);
    const uniqueLocations = useMemo(() => [...new Set(equipmentData.map(eq => eq.location).filter(Boolean).sort())], [equipmentData]);

    const filteredWorkOrders = useMemo(() => {
        return workOrders.filter(order => {
            // Busca o cadastro real do equipamento pelo ID vinculado à OS
            const equipment = equipmentMap.get(order.equipmentId);
            const equipmentName = equipment?.name || 'Não Identificado';

            // BUSCA PELO ID REAL (Protocolo)
            if (debouncedFilters.id) {
                const searchId = debouncedFilters.id.padStart(4, '0');
                if (!String(order.id).includes(debouncedFilters.id) && !String(order.id).includes(searchId)) return false;
            }
            
            if (debouncedFilters.description && !order.description.toLowerCase().includes(debouncedFilters.description.toLowerCase())) return false;
            
            // BUSCA PELO NOME DO EQUIPAMENTO ATUALIZADO
            if (debouncedFilters.equipment && order.equipmentId !== debouncedFilters.equipment) return false;
            
            if (debouncedFilters.location && (!equipment || equipment.location !== debouncedFilters.location)) return false;
            if (debouncedFilters.type && order.type !== debouncedFilters.type) return false;
            if (debouncedFilters.requester && order.requester !== debouncedFilters.requester) return false;
            if (debouncedFilters.status && order.status !== debouncedFilters.status) return false;

            return true;
        }).sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
    }, [workOrders, debouncedFilters, equipmentMap]);

    useEffect(() => {
        const numSelected = selectedIds.size;
        const numFiltered = filteredWorkOrders.length;
        if (selectAllCheckboxRef.current) {
            if (numSelected === 0 || numFiltered === 0) {
                selectAllCheckboxRef.current.checked = false;
                selectAllCheckboxRef.current.indeterminate = false;
            } else if (numSelected === numFiltered) {
                selectAllCheckboxRef.current.checked = true;
                selectAllCheckboxRef.current.indeterminate = false;
            } else {
                selectAllCheckboxRef.current.checked = false;
                selectAllCheckboxRef.current.indeterminate = true;
            }
        }
    }, [selectedIds, filteredWorkOrders]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(new Set(filteredWorkOrders.map(o => o.id)));
        else setSelectedIds(new Set());
    };
    
    return (
        <div className="space-y-6 animate-fade-in">
            <Header 
                title="Busca Mestra de Protocolos" 
                subtitle="Localização de registros corrigidos. Use 'Sincronização Forçada' para limpar conflitos de ID." 
                actions={
                    <button 
                        onClick={forceFullDatabaseRefresh}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-black rounded-xl shadow-lg hover:bg-rose-700 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50"
                    >
                        <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sincronização Forçada (Fix IDs)
                    </button>
                }
            />
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700">
                 <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
                    <FilterInput name="id" label="Nº O.S. (ID Real)" value={filters.id || ''} onChange={handleFilterChange} className="md:col-span-1" />
                    
                    <FilterSelect name="equipment" label="Ativo" value={filters.equipment || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todos os Ativos</option>
                        {equipmentData.map(eq => <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>)}
                    </FilterSelect>
                    
                    <FilterSelect name="location" label="Setor" value={filters.location || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todos os Setores</option>
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </FilterSelect>
                    
                    <FilterSelect name="type" label="Natureza" value={filters.type || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todas</option>
                        {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </FilterSelect>
                    
                    <FilterSelect name="requester" label="Setor Solicitante" value={filters.requester || ''} onChange={handleFilterChange} className="md:col-span-3">
                        <option value="">Todos</option>
                        {INITIAL_REQUESTERS.map(r => <option key={r} value={r}>{r}</option>)}
                    </FilterSelect>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-slate-900 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <tr>
                                <th className="px-6 py-5 w-12"><input type="checkbox" ref={selectAllCheckboxRef} onChange={handleSelectAll} className="rounded bg-slate-800 border-slate-700" /></th>
                                <th className="px-6 py-5 text-left">Protocolo</th>
                                <th className="px-6 py-5 text-left">Equipamento (Vínculo Real)</th>
                                <th className="px-6 py-5 text-left">Natureza</th>
                                <th className="px-6 py-5 text-left">Programado</th>
                                <th className="px-6 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-50 dark:divide-gray-700">
                            {filteredWorkOrders.length > 0 ? (
                                filteredWorkOrders.map(order => {
                                    // AQUI ESTÁ A CHAVE: Pegamos os dados do cadastro atualizado
                                    const equipment = equipmentMap.get(order.equipmentId);
                                    return (
                                        <tr key={order.id} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => {
                                                const next = new Set(selectedIds);
                                                if(next.has(order.id)) next.delete(order.id); else next.add(order.id);
                                                setSelectedIds(next);
                                            }} className="rounded border-slate-200" /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-blue-600">#{order.id}</span>
                                                    <span className="text-[7px] font-bold text-gray-400 uppercase">SYNC ATIVO</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-800 dark:text-white uppercase">{equipment?.id || order.equipmentId}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">{equipment?.name || 'Ativo não localizado'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-black uppercase text-gray-500">{order.type}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-500">{order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.status === MaintenanceStatus.Executed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>{order.status}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-24 text-slate-300 font-black uppercase">Nenhum registro localizado</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
