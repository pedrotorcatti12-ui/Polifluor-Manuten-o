
import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { PurchaseRequest, WorkOrder } from '../types';
import { ShoppingCartIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, SearchIcon } from '../components/icons';

export const PurchasingPage: React.FC = () => {
    const { workOrders, handleUnifiedSave } = useDataContext();
    const [filterStatus, setFilterStatus] = useState<string>('Pendente');
    const [searchTerm, setSearchTerm] = useState('');

    // Consolida todas as requisições de peças espalhadas pelo sistema
    const allRequests = useMemo(() => {
        const reqs: (PurchaseRequest & { sourceId: string; sourceType: 'OS'; equipmentId: string })[] = [];

        // 1. Das Ordens Avulsas
        workOrders.forEach(wo => {
            if (wo.purchaseRequests) {
                wo.purchaseRequests.forEach(pr => {
                    reqs.push({ ...pr, sourceId: wo.id, sourceType: 'OS', equipmentId: wo.equipmentId });
                });
            }
        });

        return reqs;
    }, [workOrders]);

    const filtered = allRequests.filter(r => {
        const matchesStatus = filterStatus === 'Todos' || r.status === filterStatus;
        const matchesSearch = r.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             r.sourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             r.equipmentId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.requisitionDate).getTime() - new Date(a.requisitionDate).getTime());

    const updateRequestStatus = (req: any, newStatus: PurchaseRequest['status']) => {
        if (req.sourceType === 'OS') {
            const orderToUpdate = workOrders.find(wo => wo.id === req.sourceId);
            if (orderToUpdate) {
                const updatedOrder: WorkOrder = {
                    ...orderToUpdate,
                    purchaseRequests: orderToUpdate.purchaseRequests?.map(p => p.id === req.id ? { ...p, status: newStatus, arrivalDate: newStatus === 'Entregue' ? new Date().toISOString() : undefined } : p)
                };
                handleUnifiedSave(updatedOrder);
            }
        }
    };

    return (
        <div className="space-y-6">
            <Header title="Suprimentos e Compras" subtitle="Gestão centralizada de peças solicitadas via Ordens de Serviço." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><ClockIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Aguardando Cotação</p>
                        <p className="text-2xl font-black">{allRequests.filter(r => r.status === 'Pendente').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ShoppingCartIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Em Pedido (ERP)</p>
                        <p className="text-2xl font-black">{allRequests.filter(r => r.status === 'Comprado').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircleIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Entregues (Mês)</p>
                        <p className="text-2xl font-black">{allRequests.filter(r => r.status === 'Entregue').length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-md">
                <div className="flex flex-wrap gap-4 items-center mb-6">
                    <div className="flex-1 relative min-w-[300px]">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Buscar por peça, O.S. ou máquina..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 form-input" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input w-48 font-bold">
                        <option value="Todos">Todos os Status</option>
                        <option value="Pendente">Pendente / Cotação</option>
                        <option value="Comprado">Comprado / Aguardando</option>
                        <option value="Entregue">Entregue / Concluído</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-500 tracking-widest">
                            <tr>
                                <th className="px-6 py-3 text-left">Data Solicit.</th>
                                <th className="px-6 py-3 text-left">Peça / Descrição</th>
                                <th className="px-6 py-3 text-left">Origem (O.S.)</th>
                                <th className="px-6 py-3 text-left">Máquina</th>
                                <th className="px-6 py-3 text-center">Pedido ERP</th>
                                <th className="px-6 py-3 text-center">Ações de Compra</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((req, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{new Date(req.requisitionDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-gray-800 uppercase">{req.itemDescription || 'Sem Descrição'}</p>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${req.status === 'Pendente' ? 'bg-orange-100 text-orange-700' : req.status === 'Comprado' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{req.status.toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">#{req.sourceId}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold uppercase text-gray-600">{req.equipmentId}</td>
                                    <td className="px-6 py-4 text-center text-xs font-mono font-bold text-gray-400">{req.purchaseOrderNumber || '---'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {req.status === 'Pendente' && (
                                                <button onClick={() => updateRequestStatus(req, 'Comprado')} className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded hover:bg-blue-700 uppercase">Marcar como Comprado</button>
                                            )}
                                            {req.status === 'Comprado' && (
                                                <button onClick={() => updateRequestStatus(req, 'Entregue')} className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black rounded hover:bg-emerald-700 uppercase">Confirmar Recebimento</button>
                                            )}
                                            {req.status === 'Entregue' && (
                                                <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> No Almoxarifado</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-gray-400 italic text-sm">Nenhuma solicitação de compra pendente com estes filtros.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
