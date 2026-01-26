import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext';
import { MaintenanceStatus, MaintenanceType, WorkOrder } from '../types';
import { PlusIcon, DeleteIcon, EditIcon } from '../components/icons';
import { MAINTENANCE_TYPE_CONFIG } from '../constants';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const WorkOrdersPage: React.FC = () => {
    const { workOrders, equipmentData, handleWorkOrderDelete, showToast } = useDataContext();
    const { setIsOSModalOpen, setEditingOrder, userRole, requestAdminPassword } = useAppContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('Todos');
    const [deletingOrder, setDeletingOrder] = useState<WorkOrder | null>(null);

    const equipmentMap = useMemo(() => new Map(equipmentData.map(eq => [eq.id, eq])), [equipmentData]);

    const filteredOrders = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return workOrders
            .filter(order => {
                if (filterStatus !== 'Todos' && order.status !== filterStatus) return false;
                
                const eqName = equipmentMap.get(order.equipmentId)?.name.toLowerCase() || '';
                return String(order.id).toLowerCase().includes(term) ||
                       order.equipmentId.toLowerCase().includes(term) ||
                       eqName.includes(term);
            })
            .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    }, [workOrders, searchTerm, filterStatus, equipmentMap]);
    
    const handleOpenOrder = (order: WorkOrder | null) => {
        setEditingOrder(order);
        setIsOSModalOpen(true);
    };

    const handleDeleteClick = (order: WorkOrder) => {
        // Regra de Negócio:
        // Admin pode excluir qualquer coisa (com senha).
        // Operador pode excluir apenas O.S. não executadas (correção de erro).
        if (userRole === 'admin') {
            requestAdminPassword(() => setDeletingOrder(order));
        } else {
            if (order.status === MaintenanceStatus.Executed) {
                showToast("Operadores não podem excluir O.S. já finalizadas (Histórico Protegido).", "error");
                return;
            }
            // Operador excluindo pendente: confirmação simples
            setDeletingOrder(order);
        }
    };

    const confirmDelete = async () => {
        if (deletingOrder) {
            const success = await handleWorkOrderDelete(deletingOrder.id);
            if (success) {
                setDeletingOrder(null);
            }
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

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <input 
                    type="text" 
                    placeholder="Buscar por OS, ativo ou descrição..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full form-input h-11" 
                />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input h-11 w-full md:w-64 font-bold">
                    <option value="Todos">Todos os Status</option>
                    {Object.values(MaintenanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-800">#{order.id}</div>
                                            <div className={`text-[9px] font-bold ${typeConfig?.textColor || 'text-gray-500'} ${typeConfig?.color || 'bg-gray-200'} px-2 py-0.5 rounded-full inline-block mt-1 uppercase`}>{order.type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{eq?.name || order.equipmentId}</div>
                                            <div className="text-xs text-slate-400 font-mono">{order.equipmentId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={order.description}>{order.description}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(order.scheduledDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${order.status === MaintenanceStatus.Executed ? 'bg-emerald-100 text-emerald-700' : order.status === MaintenanceStatus.Delayed ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
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