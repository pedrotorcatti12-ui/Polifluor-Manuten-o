
import React, { useMemo, useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { useAdvancedMetrics, AdvancedReportData } from '../hooks/useAdvancedMetrics';
import { MONTHS } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import { 
    TargetIcon, 
    ShieldCheckIcon, 
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    WrenchIcon,
    ChartIcon,
    ArrowRightIcon
} from '../components/icons';

type CriticidadeFilter = 'Todos' | 'Criticos' | 'Nao-Criticos';

export const DashboardPage: React.FC = () => {
    const { workOrders, equipmentData, logActivity } = useDataContext();
    const { setCurrentPage } = useAppContext();
    const calculate = useAdvancedMetrics();

    // ESTADOS DE FILTRO
    const [selectedMonth, setSelectedMonth] = useState<number | 'Ano'>(new Date().getMonth());
    const [filterCrit, setFilterCrit] = useState<CriticidadeFilter>('Todos');

    // MOTOR DE CÁLCULO
    const dashboardData = useMemo(() => {
        const start = selectedMonth === 'Ano' ? '2026-01-01' : `2026-${(Number(selectedMonth) + 1).toString().padStart(2, '0')}-01`;
        const end = selectedMonth === 'Ano' ? '2026-12-31' : `2026-${(Number(selectedMonth) + 1).toString().padStart(2, '0')}-31`;
        
        const ids = equipmentData.map(e => e.id);
        const results = calculate(equipmentData, workOrders, ids, start, end, filterCrit);
        
        return results;
    }, [equipmentData, workOrders, calculate, selectedMonth, filterCrit]);

    const totals = useMemo(() => {
        const count = dashboardData.length || 1;
        return dashboardData.reduce((acc, curr) => ({
            mttr: acc.mttr + curr.mttr,
            failures: acc.failures + curr.totalFailures,
            availability: acc.availability + curr.availability,
            downtime: acc.downtime + (curr.totalCorrectiveHours)
        }), { mttr: 0, failures: 0, availability: 0, downtime: 0 });
    }, [dashboardData]);

    const avgMttr = totals.mttr / (dashboardData.length || 1);
    const avgDisp = totals.availability / (dashboardData.length || 1);

    const handleInspectOS = (id: string) => {
        // Futura implementação: Setar um filtro global de busca antes de navegar
        setCurrentPage('work_orders');
    };

    useEffect(() => {
        logActivity({
            action_type: 'UPDATE_STATUS',
            description: `Dashboard filtrado: Mês ${selectedMonth}, Categoria: ${filterCrit}`
        });
    }, [selectedMonth, filterCrit, logActivity]);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <Header title="Termômetro de Confiabilidade" subtitle="Monitoramento tático de ativos. Janela produtiva Seg-Sex (10h/dia)." />

            {/* BARRA DE FILTROS RÁPIDOS */}
            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-slate-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-gray-900 p-1 rounded-xl">
                    {(['Todos', 'Criticos', 'Nao-Criticos'] as CriticidadeFilter[]).map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilterCrit(f)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filterCrit === f ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {f === 'Criticos' ? 'Classe A (Críticos)' : f === 'Nao-Criticos' ? 'Classe B/C' : 'Visão Geral'}
                        </button>
                    ))}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

                <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    <button 
                        onClick={() => setSelectedMonth('Ano')}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${selectedMonth === 'Ano' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-gray-900 text-slate-400'}`}
                    >
                        Ano 2026
                    </button>
                    {MONTHS.map((m, idx) => (
                        <button 
                            key={m}
                            onClick={() => setSelectedMonth(idx)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${selectedMonth === idx ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-gray-900 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {m.substring(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Disponibilidade Média</p>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-black ${avgDisp > 95 ? 'text-emerald-600' : 'text-amber-500'}`}>{avgDisp.toFixed(1)}%</span>
                        <ShieldCheckIcon className="w-5 h-5 text-emerald-500 mb-1" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Manutenibilidade (MTTR)</p>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-black ${avgMttr > 1 ? 'text-rose-600' : 'text-emerald-600'}`}>{avgMttr.toFixed(1)}h</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Falhas</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-800 dark:text-white">{totals.failures}</span>
                        <WrenchIcon className="w-5 h-5 text-blue-500 mb-1" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempo Parado (TD)</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-amber-600">{totals.downtime.toFixed(1)}h</span>
                        <ClockIcon className="w-5 h-5 text-amber-500 mb-1" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dashboardData.map(item => {
                    const isMttrBad = item.mttr > 1.0;
                    return (
                        <div 
                            key={item.equipmentId} 
                            onClick={() => handleInspectOS(item.equipmentId)}
                            className={`group relative overflow-hidden bg-white dark:bg-gray-800 p-5 rounded-[2rem] border-2 transition-all hover:shadow-xl cursor-pointer ${item.isCritical ? 'border-orange-100 bg-orange-50/5' : 'border-slate-50'}`}
                        >
                            {isMttrBad && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-[3rem] flex items-start justify-end p-3">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 animate-pulse" />
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-2xl ${item.isCritical ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-500'}`}>
                                    {item.isCritical ? <TargetIcon className="w-5 h-5" /> : <ChartIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">{item.equipmentId}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{item.equipmentName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">MTTR (Meta 1h)</p>
                                    <p className={`text-xl font-black ${isMttrBad ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {item.mttr.toFixed(1)}h
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Disponibilidade</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-white">{item.availability.toFixed(1)}%</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50 dark:border-gray-700 flex justify-between items-center">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${isMttrBad ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {isMttrBad ? 'Status: Crítico' : 'Status: Conforme'}
                                </span>
                                <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                    Ver O.S. <ArrowRightIcon className="w-2 h-2" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {dashboardData.length === 0 && (
                <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <ChartIcon className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-400 uppercase">Sem dados no filtro</h3>
                </div>
            )}
        </div>
    );
};
