import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext';
import { MaintenanceStatus, MaintenanceType, WorkOrder } from '../types';
import { PlusIcon, DeleteIcon, EditIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, WrenchIcon, ClipboardListIcon, TargetIcon, ScheduleIcon } from '../components/icons';
import { MAINTENANCE_TYPE_CONFIG } from '../constants';
import { ConfirmationModal } from '../components/ConfirmationModal';

const FilterPill: React.FC<{
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    colorClasses: string;
    icon: React.ReactNode;
}> = ({ label, count, active, onClick, colorClasses, icon }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all border-2 ${
            active ? `${colorClasses} shadow-md` : 'bg-transparent border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
        }`}
    >
        {icon}
        <span>{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/20' : 'bg-slate-200'}`}>{count}</span>
    </button>
);

export const WorkOrdersPage: React.FC = () => {
    const { workOrders, equipmentData, handleWorkOrderDelete, showToast } = useDataContext();
    const { setIsOSModalOpen, setEditingOrder, userRole, requestAdminPassword } = useAppContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('Últimas Criadas');
    const [deletingOrder, setDeletingOrder] = useState<WorkOrder | null>(null);

    const equipmentMap = useMemo(() => new Map(equipmentData.map(eq => [eq.id, eq])), [equipmentData]);
    
    const statusCounts = useMemo(() => {
        const counts = {
            ÚltimasCriadas: workOrders.length,
            Corretivas: 0,
            Pendentes: 0,
            Programadas: 0,
            EmCampo: 0,
            Executadas: 0,
            Atrasadas: 0,
            Todos: workOrders.length,
        };
        const pendingStatuses = [MaintenanceStatus.Scheduled, MaintenanceStatus.InField, MaintenanceStatus.Delayed, MaintenanceStatus.WaitingParts];
        for (const order of workOrders) {
            if (order.type === MaintenanceType.Corrective) counts.Corretivas++;
            if (pendingStatuses.includes(order.status)) counts.Pendentes++;
            if (order.status === MaintenanceStatus.Scheduled) counts.Programadas++;
            if (order.status === MaintenanceStatus.InField) counts.EmCampo++;
            if (order.status === MaintenanceStatus.Executed) counts.Executadas++;
            if (order.status === MaintenanceStatus.Delayed) counts.Atrasadas++;
        }
        return counts;
    }, [workOrders]);

    const filteredOrders = useMemo(() => {
        const term = searchTerm.toLowerCase();
        
        return workOrders
            .filter(order => {
                let statusMatch = false;
                switch (filterStatus) {
                    case 'Últimas Criadas':
                        statusMatch = true;
                        break;
                    case 'Corretivas':
                        statusMatch = order.type === MaintenanceType.Corrective;
                        break;
                    case 'Pendentes':
                        statusMatch = [MaintenanceStatus.Scheduled, MaintenanceStatus.InField, MaintenanceStatus.Delayed, MaintenanceStatus.WaitingParts].includes(order.status);
                        break;
                    case 'Programadas':
                        statusMatch = order.status === MaintenanceStatus.Scheduled;
                        break;
                    case 'EmCampo':
                        statusMatch = order.status === MaintenanceStatus.InField;
                        break;
                    case 'Executadas':
                        statusMatch = order.status === MaintenanceStatus.Executed;
                        break;
                    case 'Atrasadas':
                        statusMatch = order.status === MaintenanceStatus.Delayed;
                        break;
                    case 'Todos':
                    default:
                        statusMatch = true;
                }
                if (!statusMatch) return false;
                
                const eqName = equipmentMap.get(order.equipmentId)?.name.toLowerCase() || '';
                return String(order.id).toLowerCase().includes(term) ||
                       order.equipmentId.toLowerCase().includes(term) ||
                       eqName.includes(term);
            })
            .sort((a, b) => {
                if (filterStatus === 'Últimas Criadas') {
                    // Ordena pelo ID (string, ex: "0124" > "0123"), que representa a ordem de criação.
                    return b.id.localeCompare(a.id);
                }

                // Prioridade 1: Atrasadas
                if (a.status === MaintenanceStatus.Delayed && b.status !== MaintenanceStatus.Delayed) return -1;
                if (b.status === MaintenanceStatus.Delayed && a.status !== MaintenanceStatus.Delayed) return 1;

                // Prioridade 2: Equipamento Crítico
                const isACritical = equipmentMap.get(a.equipmentId)?.isCritical;
                const isBCritical = equipmentMap.get(b.equipmentId)?.isCritical;
                if (isACritical && !isBCritical) return -1;
                if (!isACritical && isBCritical) return 1;

                // Prioridade 3: Data mais recente
                return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
            });
    }, [workOrders, searchTerm, filterStatus, equipmentMap]);
    
    const handleOpenOrder = (order: WorkOrder | null) => {
        setEditingOrder(order);
        setIsOSModalOpen(true);
    };

    const handleDeleteClick = (order: WorkOrder) => {
        if (userRole === 'admin') {
            requestAdminPassword(() => setDeletingOrder(order));
        } else {
            if (order.status === MaintenanceStatus.Executed) {
                showToast("Operadores não podem excluir O.S. já finalizadas (Histórico Protegido).", "error");
                return;
            }
            setDeletingOrder(order);
        }
    };

    const confirmDelete = async () => {
        if (deletingOrder) {
            const success = await handleWorkOrderDelete(deletingOrder.id);
            if (success) setDeletingOrder(null);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in">
            <Header 
                title="Central de Ordens de Serviço" 
                subtitle="Controle operacional de todas as atividades de manutenção."
                actions={
                    <button onClick={() => handleOpenOrder(null)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-md">
                        <PlusIcon className="w-5 h-5"/> Nova O.S.
                    </button>
                }
            />

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <input 
                    type="text" 
                    placeholder="Buscar por OS, ativo ou descrição..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full form-input h-11" 
                />
                 <div className="flex flex-wrap items-center gap-2">
                    <FilterPill label="Últimas Criadas" icon={<ScheduleIcon className="w-4 h-4" />} count={statusCounts.ÚltimasCriadas} active={filterStatus === 'Últimas Criadas'} onClick={() => setFilterStatus('Últimas Criadas')} colorClasses="border-indigo-300 bg-indigo-600 text-white" />
                    <FilterPill label="Corretivas" icon={<WrenchIcon className="w-4 h-4" />} count={statusCounts.Corretivas} active={filterStatus === 'Corretivas'} onClick={() => setFilterStatus('Corretivas')} colorClasses="border-rose-300 bg-rose-600 text-white" />
                    <FilterPill label="Pendentes" icon={<WrenchIcon className="w-4 h-4" />} count={statusCounts.Pendentes} active={filterStatus === 'Pendentes'} onClick={() => setFilterStatus('Pendentes')} colorClasses="border-blue-300 bg-blue-600 text-white" />
                    <FilterPill label="Programadas" icon={<ClipboardListIcon className="w-4 h-4" />} count={statusCounts.Programadas} active={filterStatus === 'Programadas'} onClick={() => setFilterStatus('Programadas')} colorClasses="border-blue-300 bg-blue-600 text-white" />
                    <FilterPill label="Em Campo" icon={<ClockIcon className="w-4 h-4" />} count={statusCounts.EmCampo} active={filterStatus === 'EmCampo'} onClick={() => setFilterStatus('EmCampo')} colorClasses="border-orange-300 bg-orange-500 text-white" />
                    <FilterPill label="Executadas" icon={<CheckCircleIcon className="w-4 h-4" />} count={statusCounts.Executadas} active={filterStatus === 'Executadas'} onClick={() => setFilterStatus('Executadas')} colorClasses="border-emerald-300 bg-emerald-600 text-white" />
                    <FilterPill label="Atrasadas" icon={<ExclamationTriangleIcon className="w-4 h-4" />} count={statusCounts.Atrasadas} active={filterStatus === 'Atrasadas'} onClick={() => setFilterStatus('Atrasadas')} colorClasses="border-rose-300 bg-rose-600 text-white" />
                    <FilterPill label="Todos" icon={<WrenchIcon className="w-4 h-4" />} count={statusCounts.Todos} active={filterStatus === 'Todos'} onClick={() => setFilterStatus('Todos')} colorClasses="border-slate-400 bg-slate-500 text-white" />
                 </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto h-full">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">O.S.</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Equipamento</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Data Prog.</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map(order => {
                                const eq = equipmentMap.get(order.equipmentId);
                                const typeConfig = MAINTENANCE_TYPE_CONFIG[order.type];
                                const displayName = order.equipmentId === 'ATIVO_PREDIAL_GENERICO' ? 'Ativo/Passivo Predial' : (eq?.name || order.equipmentId);
                                const displayTypeLabel = typeConfig?.label || order.type;

                                return (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="font-black text-slate-800">#{order.id}</div>
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <div className={`text-[9px] font-bold ${typeConfig?.textColor || 'text-gray-500'} ${typeConfig?.color || 'bg-gray-200'} px-2 py-0.5 rounded-full inline-block uppercase`}>{displayTypeLabel}</div>
                                                {order.type === MaintenanceType.Corrective && order.correctiveCategory && (
                                                    <div className="text-[9px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full inline-block uppercase">
                                                        {order.correctiveCategory}
                                                    </div>
                                                )}
                                                {eq?.isCritical && <div className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><TargetIcon className="w-2.5 h-2.5"/> Crítico</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{displayName}</div>
                                            <div className="text-xs text-slate-400 font-mono">{order.equipmentId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={order.description}>{order.description}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(order.scheduledDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                                                order.status === MaintenanceStatus.Executed ? 'bg-emerald-100 text-emerald-700' : 
                                                order.status === MaintenanceStatus.Delayed ? 'bg-rose-100 text-rose-700' :
                                                order.status === MaintenanceStatus.InField ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-50 text-blue-700'}`
                                            }>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenOrder(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar / Detalhes">
                                                    <EditIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleDeleteClick(order)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir O.S.">
                                                    <DeleteIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <p className="font-bold">Nenhuma ordem de serviço encontrada.</p>
                            <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
                        </div>
                    )}
                </div>
            </div>

            {deletingOrder && (
                <ConfirmationModal 
                    isOpen={!!deletingOrder}
                    onClose={() => setDeletingOrder(null)}
                    onConfirm={confirmDelete}
                    title="Excluir Ordem de Serviço?"
                    message={`Tem certeza que deseja mover a O.S. #${deletingOrder.id} para a lixeira?`}
                />
            )}
        </div>
    );
};
