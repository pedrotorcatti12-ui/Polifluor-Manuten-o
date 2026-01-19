
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useAdvancedMetrics, AdvancedReportData } from '../hooks/useAdvancedMetrics';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, TargetIcon } from '../components/icons';
import { useDataContext } from '../contexts/DataContext';

export const AdvancedReportsPage: React.FC = () => {
    const { equipmentData, workOrders } = useDataContext(); 
    const [selectedIds] = useState<string[]>([]);
    const [criticidade, setCriticidade] = useState<'Todos' | 'Criticos' | 'Nao-Criticos'>('Todos');
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState('2026-12-31');
    const [reportData, setReportData] = useState<AdvancedReportData[] | null>(null);

    const calculateMetrics = useAdvancedMetrics();

    const handleGenerate = () => {
        const ids = selectedIds.length > 0 ? selectedIds : equipmentData.map(e => e.id);
        // O hook agora usa a propriedade unificada is_critical internamente
        const data = calculateMetrics(equipmentData, workOrders, ids, startDate, endDate, criticidade);
        setReportData(data);
    };

    return (
        <div className="space-y-6">
            <Header title="BI & Analytics Industrial" subtitle="Relatórios técnicos com base em janelas de 10h/dia." />

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Classe IATF</label>
                    <select 
                        value={criticidade} 
                        onChange={(e) => setCriticidade(e.target.value as any)}
                        className="w-full form-input font-black text-blue-600 bg-blue-50/50 border-none h-12 rounded-xl"
                    >
                        <option value="Todos">Todos os Ativos</option>
                        <option value="Criticos">Classe A (Críticos)</option>
                        <option value="Nao-Criticos">Classe B/C</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Data Início</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full form-input h-12 rounded-xl" />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Data Fim</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full form-input h-12 rounded-xl" />
                </div>
                <button onClick={handleGenerate} className="h-12 bg-slate-900 text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg">
                    Processar Indicadores
                </button>
            </div>

            {reportData && (
                <div className="grid grid-cols-1 gap-4">
                    {reportData.map(item => {
                        const isOverTarget = item.mttr > 1.0; 
                        return (
                            <div key={item.equipmentId} className={`bg-white p-6 rounded-[2.5rem] border-2 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-shadow ${item.isCritical ? 'border-orange-200 bg-orange-50/10' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-5 min-w-[300px]">
                                    <div className={`p-4 rounded-2xl ${isOverTarget ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {isOverTarget ? <ExclamationTriangleIcon className="w-8 h-8"/> : <CheckCircleIcon className="w-8 h-8"/>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-slate-800 uppercase text-lg">{item.equipmentId}</h4>
                                            {item.isCritical && (
                                                <span className="text-[8px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                                                    <TargetIcon className="w-2 h-2"/> Ativo Crítico
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.equipmentName}</p>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-3 gap-8 text-center border-x border-slate-50 px-8">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">MTTR (Meta 1h)</p>
                                        <p className={`text-3xl font-black ${isOverTarget ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {item.mttr.toFixed(1)}h
                                        </p>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase mt-1 inline-block ${isOverTarget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {isOverTarget ? 'CRÍTICO' : 'DENTRO DA META'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">MTBF (Confiabilidade)</p>
                                        <p className="text-3xl font-black text-slate-800">
                                            {item.mtbf ? item.mtbf.toFixed(0) + 'h' : '---'}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-300 uppercase">Tempo Médio entre Falhas</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Disponibilidade</p>
                                        <p className={`text-3xl font-black ${item.availability > 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {item.availability.toFixed(1)}%
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-300 uppercase">Janela de 10h/dia</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl min-w-[220px]">
                                     <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1"><ClockIcon className="w-3 h-3"/> Carga de Paradas</p>
                                     <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-rose-600 uppercase">Falhas:</span>
                                            <span className="text-slate-700">{item.totalFailures}x</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-blue-600 uppercase">Reparo:</span>
                                            <span className="text-slate-700">{item.totalCorrectiveHours.toFixed(1)}h</span>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
