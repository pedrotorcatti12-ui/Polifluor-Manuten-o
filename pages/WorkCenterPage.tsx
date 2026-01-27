import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext';
import { MaintenanceStatus, MaintenanceType, WorkOrder } from '../types';
// FIX: Add missing icon imports
import { WrenchIcon, CheckCircleIcon, SearchIcon, PlusIcon, EditIcon, DocumentTextIcon, DeleteIcon, TargetIcon, ExclamationTriangleIcon, ArrowPathIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { PreviewWorkOrderModal } from '../components/PreviewWorkOrderModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { MONTHS } from '../constants';
import { MAINTENANCE_TYPE_CONFIG } from '../constants';

const FilterPill: React.FC<{ label: string; count: number; active: boolean; onClick: () => void; colorClasses: string }> = ({ label, count, active, onClick, colorClasses }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all border-2 ${
            active ? `${colorClasses} shadow-md` : 'bg-transparent border-slate-200 text-slate-400 hover:bg-slate-50'
        }`}
    >
        <span>{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/20' : 'bg-slate-200'}`}>{count}</span>
    </button>
);


export const WorkCenterPage: React.FC = () => {
    // FIX: Destructure missing properties from context
    const { workOrders, handleWorkOrderDelete, showToast, handleBulkDeleteWorkOrders } = useDataContext();
    const { userRole, setIsOSModalOpen, setEditingOrder, requestAdminPassword } = useAppContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('Pendentes');
    const [filterType, setFilterType] = useState<string>('Todos');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewTask, setPreviewTask] = useState<any>(null);
    const [deletingOrder, setDeletingOrder] = useState<WorkOrder | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredOrders = useMemo(() => {
        const term = debouncedSearchTerm.toLowerCase();
        
        let statusFilter: MaintenanceStatus[] | null = null;
        // FIX: Add missing MaintenanceStatus members
        if(filterStatus === 'Pendentes') statusFilter = [MaintenanceStatus.Scheduled, MaintenanceStatus.Delayed, MaintenanceStatus.InField, MaintenanceStatus.WaitingParts];
        else if(filterStatus !== 'Todos') statusFilter = [filterStatus as MaintenanceStatus];

        return workOrders
            .filter(order => {
                if (statusFilter && !statusFilter.includes(order.status)) return false;
                if (filterType !== 'Todos' && order.type !== filterType) return false;
                if (filterStartDate && new Date(order.scheduledDate) < new Date(filterStartDate)) return false;
                if (filterEndDate && new Date(order.scheduledDate) > new Date(new Date(filterEndDate).setHours(23, 59, 59, 999))) return false;
                
                // FIX: Access joined equipment data from 'equipments' property
                const eqName = order.equipments?.name?.toLowerCase() || '';
                return String(order.id).toLowerCase().includes(term) ||
                       order.equipmentId.toLowerCase().includes(term) ||
                       eqName.includes(term) ||
                       (order.description && order.description.toLowerCase().includes(term));
            })
            .sort((a, b) => {
                if (a.status === MaintenanceStatus.Delayed && b.status !== MaintenanceStatus.Delayed) return -1;
                if (b.status === MaintenanceStatus.Delayed && a.status !== MaintenanceStatus.Delayed) return 1;
                // FIX: Access joined equipment data from 'equipments' property
                if(a.equipments?.isCritical && !b.equipments?.isCritical) return -1;
                if(!a.equipments?.isCritical && b.equipments?.isCritical) return 1;
                return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
            });
    }, [workOrders, debouncedSearchTerm, filterStatus, filterType, filterStartDate, filterEndDate]);
    
    const handleOpenOrder = (order: WorkOrder) => {
        setEditingOrder(order);
        setIsOSModalOpen(true);
    };

    const handlePrint = (order: WorkOrder) => {
        // FIX: Access joined equipment data from 'equipments' property
        const eq = order.equipments;
        if (!eq) { showToast("Dados do equipamento não sincronizados.", "error"); return; }
        const taskData = { equipment: eq, task: { id: order.id, year: new Date(order.scheduledDate).getFullYear(), month: MONTHS[new Date(order.scheduledDate).getMonth()], status: order.status, type: order.type, description: order.description, osNumber: order.id, details: order.checklist }, year: new Date(order.scheduledDate).getFullYear(), monthIndex: new Date(order.scheduledDate).getMonth(), key: `wo-${order.id}` };
        setPreviewTask(taskData);
        setIsPreviewOpen(true);
    };

    const handleDeleteRequest = (order: WorkOrder) => {
        if (userRole !== 'admin') { showToast('Ação não permitida.', 'warning'); return; }
        requestAdminPassword(() => setDeletingOrder(order));
    };

    const handleDeleteConfirm = async () => {
        if (!deletingOrder) return;
        const success = await handleWorkOrderDelete(deletingOrder.id);
        if (success) setDeletingOrder(null);
    };
    
    const handleToggleSelection = (id: string) => {
        setSelectedOrderIds(prev => {
            const newSet = new Set(prev);
            if(newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    const handleBulkDelete = () => {
        requestAdminPassword(async () => {
            const ids = Array.from(selectedOrderIds);
            showToast(`Iniciando exclusão de ${ids.length} O.S....`, 'warning');
            let successCount = 0;
            for(const id of ids) {
                const success = await handleWorkOrderDelete(id);
                if (success) successCount++;
            }
            showToast(`${successCount} de ${ids.length} O.S. foram excluídas.`, 'success');
            setSelectedOrderIds(new Set());
        });
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <Header 
                title="Central de Ordens de Serviço" 
                subtitle="Controle operacional de todas as atividades de manutenção."
                actions={<button onClick={() => { setEditingOrder(null); setIsOSModalOpen(true); }} className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"><PlusIcon className="w-5 h-5"/> Nova O.S.</button>}
            />

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-gray-700 flex flex-col gap-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input h-12 bg-slate-50 dark:bg-gray-900 border-none rounded-xl font-bold">
                        <option value="Pendentes">Pendentes</option>
                        <option value="Todos">Todos os Status</option>
                        {Object.values(MaintenanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-input h-12 bg-slate-50 dark:bg-gray-900 border-none rounded-xl font-bold">
                        <option value="Todos">Todas as Naturezas</option>
                        {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full form-input h-12 bg-slate-50 dark:bg-gray-900 border-none rounded-xl"/>
                    <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full form-input h-12 bg-slate-50 dark:bg-gray-900 border-none rounded-xl"/>
                </div>
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input type="text" placeholder="Buscar por OS, ativo ou descrição..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-12 pl-12 pr-4 form-input bg-slate-50 dark:bg-gray-900 border-none rounded-xl" />
                </div>
            </div>

            {selectedOrderIds.size > 0 && (
                <div className="bg-slate-800 p-4 rounded-2xl flex justify-between items-center animate-fade-in shadow-lg">
                    <p className="text-white font-bold text-sm">{selectedOrderIds.size} O.S. selecionadas</p>
                    <button onClick={handleBulkDelete} className="px-4 py-2 bg-rose-600 text-white font-black text-xs uppercase rounded-lg flex items-center gap-2">
                        <DeleteIcon/> Excluir Selecionadas
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3">
                {filteredOrders.map(order => {
                    // FIX: Access joined equipment data from 'equipments' property
                    const eq = order.equipments;
                    const isDelayed = order.status === MaintenanceStatus.Delayed;
                    const isExecuted = order.status === MaintenanceStatus.Executed;
                    const config = MAINTENANCE_TYPE_CONFIG[order.type] || { color: 'bg-slate-400', textColor: 'text-white' };
                    const isSelected = selectedOrderIds.has(order.id);

                    return (
                        <div key={order.id} className={`group bg-white dark:bg-gray-800 p-4 rounded-3xl border-l-8 transition-all flex items-center gap-4 ${isSelected ? 'border-blue-500 shadow-xl' : ( isDelayed ? 'border-rose-500' : 'border-slate-100' )}`}>
                            <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelection(order.id)} className="w-5 h-5 rounded ml-2"/>
                            <div className="flex-1 flex items-center gap-6 cursor-pointer" onClick={() => handleOpenOrder(order)}>
                                <div className="hidden sm:flex flex-shrink-0 flex-col items-center justify-center text-center">
                                    <span className="text-sm font-black text-slate-800 dark:text-white">#{order.id}</span>
                                    <span className={`${config.color} ${config.textColor} px-2 py-0.5 rounded-full text-[8px] font-black uppercase mt-1`}>{order.type}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase truncate">{eq ? eq.id : order.equipmentId}</h4>
                                        {isDelayed && <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 animate-pulse"/>}
                                        {eq?.isCritical && <TargetIcon className="w-4 h-4 text-orange-500"/>}
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold truncate">{eq?.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 truncate italic">"{order.description}"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400">Prog.: {new Date(order.scheduledDate).toLocaleDateString('pt-BR')}</p>
                                    {isExecuted && <p className="text-[10px] font-bold text-emerald-500">Exec.: {new Date(order.endDate!).toLocaleDateString('pt-BR')}</p>}
                                </div>
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${isExecuted ? 'bg-emerald-100 text-emerald-700' : isDelayed ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => {e.stopPropagation(); handlePrint(order)}} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg" title="Imprimir"><DocumentTextIcon className="w-4 h-4" /></button>
                                    {userRole === 'admin' && <button onClick={(e) => {e.stopPropagation(); handleDeleteRequest(order)}} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg" title="Excluir"><DeleteIcon className="w-4 h-4" /></button>}
                                </div>
                                <button onClick={() => handleOpenOrder(order)} className="px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Detalhes</button>
                            </div>
                        </div>
                    );
                })}
                {filteredOrders.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <p className="text-slate-300 font-black uppercase">Nenhuma ordem de serviço para esta visão</p>
                    </div>
                )}
            </div>

            {isPreviewOpen && previewTask && <PreviewWorkOrderModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} taskData={previewTask} />}
            {deletingOrder && <ConfirmationModal isOpen={!!deletingOrder} onClose={() => setDeletingOrder(null)} onConfirm={handleDeleteConfirm} title="Excluir Ordem de Serviço" message={`Deseja excluir permanentemente a O.S. #${deletingOrder.id}?`} />}
        </div>
    );
};