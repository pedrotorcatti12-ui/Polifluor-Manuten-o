
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceStatus } from '../types';
import { ClipboardListIcon, ScheduleIcon, ChartIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '../components/icons';

const PolifluorLogo = () => (
    <div className="bg-[#D32F2F] text-white px-4 py-2 skew-x-[-10deg] rounded-sm shadow-md inline-block">
        <span className="font-black italic text-2xl tracking-tighter skew-x-[10deg] block">POLIFLUOR</span>
    </div>
);

export const HomePage: React.FC = () => {
    const { setCurrentPage } = useAppContext();
    const { workOrders } = useDataContext();

    const stats = useMemo(() => {
        const delayed = workOrders.filter(o => o.status === MaintenanceStatus.Delayed).length;
        const pending = workOrders.filter(o => o.status === MaintenanceStatus.Scheduled).length;
        return { delayed, pending };
    }, [workOrders]);

    return (
        <div className="max-w-7xl mx-auto p-8 animate-fade-in">
            <header className="mb-12 border-b border-slate-200 pb-8">
                <PolifluorLogo />
                <h1 className="text-4xl font-black text-slate-800 mt-6 uppercase tracking-tighter">Gestão de Manutenção Inteligente</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Conformidade IATF 16949 • Planta Industrial</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setCurrentPage('work_orders')} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#D32F2F] hover:shadow-xl transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                        <ClipboardListIcon className="w-10 h-10 text-slate-300" />
                        <span className="text-3xl font-black text-slate-800">{stats.pending}</span>
                    </div>
                    <h3 className="font-black uppercase text-sm mt-4">Ordens Ativas</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Fila de Execução</p>
                </div>

                <div onClick={() => setCurrentPage('work_orders')} className="bg-rose-50 p-6 rounded-2xl shadow-sm border-t-4 border-rose-600 hover:shadow-xl transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                        <ExclamationTriangleIcon className="w-10 h-10 text-rose-300" />
                        <span className="text-3xl font-black text-rose-600">{stats.delayed}</span>
                    </div>
                    <h3 className="font-black uppercase text-sm mt-4 text-rose-800">Atrasos Críticos</h3>
                    <p className="text-[10px] text-rose-400 font-bold uppercase">Risco de Parada</p>
                </div>

                <div onClick={() => setCurrentPage('schedule')} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-600 hover:shadow-xl transition-all cursor-pointer">
                    <ScheduleIcon className="w-10 h-10 text-slate-300" />
                    <h3 className="font-black uppercase text-sm mt-4">Plano 2026</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Cronograma Mestre</p>
                </div>

                <div onClick={() => setCurrentPage('quality')} className="bg-slate-900 p-6 rounded-2xl shadow-sm border-t-4 border-emerald-500 hover:shadow-xl transition-all cursor-pointer text-white">
                    <ShieldCheckIcon className="w-10 h-10 text-emerald-500" />
                    <h3 className="font-black uppercase text-sm mt-4">Auditoria IATF</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Requisitos 8.5.1.5</p>
                </div>
            </div>
        </div>
    );
};
