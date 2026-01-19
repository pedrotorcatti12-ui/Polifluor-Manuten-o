
import React, { useMemo } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceStatus, MaintenanceType } from '../types';
import { WrenchIcon, PackageIcon, SearchIcon, ClockIcon } from '../components/icons';

export const WorkCenterPage: React.FC = () => {
    const { equipmentData, workOrders, isInitialLoading } = useDataContext();

    const pendingOrders = useMemo(() => {
        return workOrders
            .filter(o => o.status !== MaintenanceStatus.Executed)
            .sort((a, b) => {
                if (a.status === MaintenanceStatus.Delayed) return -1;
                return 0;
            });
    }, [workOrders]);

    if (isInitialLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-20 bg-slate-200 rounded-3xl w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
                </div>
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            <Header 
                title="Centro de Trabalho" 
                subtitle="Fila de execução prioritária baseada na nuvem." 
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">O.S. Pendentes</span>
                        <p className="text-3xl font-black">{pendingOrders.length}</p>
                    </div>
                    <WrenchIcon className="w-10 h-10 opacity-30" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {pendingOrders.map(order => {
                    const eq = equipmentData.find(e => e.id === order.equipmentId);
                    const isDelayed = order.status === MaintenanceStatus.Delayed;

                    return (
                        <div 
                            key={order.id} 
                            className={`group bg-white p-5 rounded-3xl border-2 transition-all flex items-center gap-6 ${isDelayed ? 'border-rose-500 bg-rose-50/10' : 'border-slate-50'}`}
                        >
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400">#{order.id}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-slate-800 uppercase truncate">
                                    {eq ? `${eq.id} - ${eq.name}` : `ATIVO: ${order.equipmentId} (Carregando...)`}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                    <PackageIcon className="w-3 h-3" /> {eq?.location || 'Setor N/D'} • {order.type}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${isDelayed ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {order.status}
                                </span>
                                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                                    Abrir O.S.
                                </button>
                            </div>
                        </div>
                    );
                })}

                {pendingOrders.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <p className="text-slate-300 font-black uppercase">Nenhuma atividade pendente</p>
                    </div>
                )}
            </div>
        </div>
    );
};
