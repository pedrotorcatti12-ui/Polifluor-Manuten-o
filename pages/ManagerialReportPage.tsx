
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { WorkOrder, MaintenanceType, MaintenanceTask, MaintenanceStatus } from '../types';
import { MONTHS } from '../constants';
import { useDataContext } from '../contexts/DataContext';
import { ChartIcon, ClipboardListIcon, CheckCircleIcon, ClockIcon } from '../components/icons';

const TYPE_COLORS: { [key in MaintenanceType]?: string } = {
    [MaintenanceType.RevisaoPeriodica]: '#84cc16', 
    [MaintenanceType.Preventive]: '#22c55e',
    [MaintenanceType.PrestacaoServicos]: '#a855f7',
    [MaintenanceType.Predictive]: '#eab308',
    [MaintenanceType.Predial]: '#78716c',
    [MaintenanceType.Melhoria]: '#38bdf8',
    [MaintenanceType.Corrective]: '#ef4444',
    [MaintenanceType.Overhaul]: '#d946ef',
};

const MetricCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export const ManagerialReportPage: React.FC = () => {
    const { workOrders, equipmentData } = useDataContext();

    const allMaintenanceItems = useMemo(() => {
        const items: { year: number, monthIndex: number, type: MaintenanceType, status: MaintenanceStatus }[] = [];
        equipmentData.forEach(eq => {
            eq.schedule.forEach(task => {
                if (task.status !== MaintenanceStatus.None && task.status !== MaintenanceStatus.Deactivated && task.type) {
                    let monthIndex = task.month ? MONTHS.indexOf(task.month) : (task.startDate ? new Date(task.startDate).getMonth() : -1);
                    if (monthIndex >= 0) items.push({ year: task.year, monthIndex, type: task.type, status: task.status });
                }
            });
        });
        workOrders.forEach(order => {
            if (order.scheduledDate && order.type) {
                const date = new Date(order.scheduledDate);
                items.push({ year: date.getFullYear(), monthIndex: date.getMonth(), type: order.type, status: order.status });
            }
        });
        return items;
    }, [equipmentData, workOrders]);

    const availableYears = useMemo(() => {
        const years = new Set<number>(allMaintenanceItems.map(i => i.year));
        [2026].forEach(y => years.add(y));
        return Array.from(years).filter((y: number) => y >= 2026).sort((a: number, b: number) => b - a);
    }, [allMaintenanceItems]);

    const [selectedYear, setSelectedYear] = useState<number>(2026);
    
    const processedData = useMemo(() => {
        const dataByMonth: { [key: string]: number[] } = {};
        Object.values(MaintenanceType).forEach(type => dataByMonth[type] = Array(12).fill(0));
        
        const itemsThisYear = allMaintenanceItems.filter(item => item.year === selectedYear);
        itemsThisYear.forEach(item => {
            if (dataByMonth[item.type]) dataByMonth[item.type][item.monthIndex]++;
        });
        
        const monthlyTotals = Array(12).fill(0);
        Object.values(dataByMonth).forEach(monthData => {
            monthData.forEach((count, i) => monthlyTotals[i] += count);
        });

        const yearTotal = monthlyTotals.reduce((a, b) => a + b, 0);
        const executedTotal = itemsThisYear.filter(i => i.status === MaintenanceStatus.Executed).length;
        const compliance = yearTotal > 0 ? (executedTotal / yearTotal) * 100 : 0;

        return { dataByMonth, monthlyTotals, yearTotal, executedTotal, compliance, maxMonthly: Math.max(...monthlyTotals, 1) };
    }, [selectedYear, allMaintenanceItems]);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <Header
                title="BIM - Business Intelligence Maintenance"
                subtitle="Visão consolidada anual e sazonalidade mensal de carga técnica."
                actions={
                    <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="form-input font-black text-blue-600 bg-white border-2 border-blue-50">
                        {availableYears.map(y => <option key={y} value={y}>Exercício {y}</option>)}
                    </select>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard label="Volume Total Anual" value={processedData.yearTotal} icon={<ClipboardListIcon className="w-6 h-6"/>} color="bg-blue-500 text-blue-500" />
                <MetricCard label="O.S. Executadas" value={processedData.executedTotal} icon={<CheckCircleIcon className="w-6 h-6"/>} color="bg-emerald-500 text-emerald-500" />
                <MetricCard label="Aderência ao Plano" value={`${processedData.compliance.toFixed(1)}%`} icon={<ChartIcon className="w-6 h-6"/>} color="bg-indigo-500 text-indigo-500" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Carga de Trabalho Mensal</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Distribuição de ordens por natureza de serviço</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-blue-600">{processedData.yearTotal}</span>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Total Acumulado</p>
                    </div>
                </div>

                <div className="flex items-end gap-2 h-72 border-b border-gray-100 pb-4">
                    {MONTHS.map((month, i) => {
                        const total = processedData.monthlyTotals[i];
                        return (
                            <div key={month} className="flex-1 flex flex-col items-center group h-full">
                                <div className="flex-1 w-full flex flex-col-reverse gap-0.5 relative">
                                    {Object.values(MaintenanceType).map(type => {
                                        const count = processedData.dataByMonth[type][i];
                                        if (count === 0) return null;
                                        return (
                                            <div 
                                                key={type}
                                                style={{ height: `${(count / processedData.maxMonthly) * 100}%`, backgroundColor: TYPE_COLORS[type] }}
                                                className="w-full rounded-sm transition-all hover:brightness-110"
                                                title={`${type}: ${count}`}
                                            />
                                        );
                                    })}
                                    {total > 0 && (
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400">{total}</span>
                                    )}
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase mt-3">{month.substring(0,3)}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                    {Object.values(MaintenanceType).map(type => {
                        const totalType = processedData.dataByMonth[type].reduce((a,b) => a+b, 0);
                        if (totalType === 0) return null;
                        return (
                            <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
                                <span className="text-[10px] font-black text-gray-600 uppercase">{type}</span>
                                <span className="text-[10px] font-black text-blue-600 ml-1">{totalType}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center">
                <div className="max-w-md">
                    <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Análise de Tendência {selectedYear}</h3>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed opacity-80">
                        O gráfico acima demonstra a carga instalada de manutenção. Picos representam meses de paradas gerais ou revisões Overhaul. Use esta informação para balancear a equipe ou contratar serviços externos antecipadamente.
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex gap-4">
                    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                        <p className="text-[10px] font-black uppercase text-blue-200">Média Mensal</p>
                        <p className="text-3xl font-black">{(processedData.yearTotal / 12).toFixed(1)}</p>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                        <p className="text-[10px] font-black uppercase text-blue-200">Meta Execução</p>
                        <p className="text-3xl font-black">100%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
