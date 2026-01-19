
import React, { useState, useMemo } from 'react';
import { Equipment, MaintenanceStatus } from '../types';
import { MONTHS } from '../constants';
import { CloseIcon, RefreshIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface LoadBalancerModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipmentData: Equipment[];
    onApply: (newData: Equipment[]) => void;
}

export const LoadBalancerModal: React.FC<LoadBalancerModalProps> = ({ isOpen, onClose, equipmentData, onApply }) => {
    const [previewData, setPreviewData] = useState<Equipment[] | null>(null);
    const CAPACITY_LIMIT = 52; 

    const getLoadByMonth = (data: Equipment[]) => {
        const counts = Array(12).fill(0);
        data.forEach(eq => {
            eq.schedule.forEach(t => {
                if (t.year === 2026 && t.status === MaintenanceStatus.Scheduled) {
                    const idx = MONTHS.indexOf(t.month);
                    if (idx >= 0) counts[idx]++;
                }
            });
        });
        return counts;
    };

    const currentLoad = useMemo(() => getLoadByMonth(equipmentData), [equipmentData]);
    const previewLoad = useMemo(() => previewData ? getLoadByMonth(previewData) : null, [previewData]);

    const handleGenerateSuggestion = () => {
        const newData: Equipment[] = JSON.parse(JSON.stringify(equipmentData));
        const nonCriticalAssets = newData.filter(eq => !eq.is_critical);

        let shiftedCount = 0;
        nonCriticalAssets.forEach((eq) => {
            // Lógica simples de balanceamento: Se houver sobrecarga, move ativos não-críticos para meses adjacentes
            const hasTaskInJan = eq.schedule.some(t => t.year === 2026 && t.month === 'Janeiro' && t.status === MaintenanceStatus.Scheduled);
            
            if (hasTaskInJan && currentLoad[0] > CAPACITY_LIMIT) {
                const monthOffset = (shiftedCount % 4) + 1;
                eq.schedule = eq.schedule.map(task => {
                    if (task.year === 2026 && task.status === MaintenanceStatus.Scheduled) {
                        const currentIdx = MONTHS.indexOf(task.month);
                        const newIdx = (currentIdx + monthOffset) % 12;
                        return { ...task, month: MONTHS[newIdx] };
                    }
                    return task;
                });
                shiftedCount++;
            }
        });
        setPreviewData(newData);
    };

    if (!isOpen) return null;
    const maxVal = Math.max(...currentLoad, CAPACITY_LIMIT, 1);

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Otimizador de Carga 2026</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Análise de gargalos e redistribuição de preventivas.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <CloseIcon className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* CENÁRIO ATUAL */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase text-rose-600 flex items-center gap-2 tracking-widest">
                                <ExclamationTriangleIcon className="w-4 h-4"/> Diagnóstico Atual
                            </h3>
                            <div className="h-56 flex items-end gap-2 border-b-2 border-slate-100 pb-4 relative">
                                <div className="absolute w-full border-t-2 border-dashed border-rose-200" style={{ bottom: `${(CAPACITY_LIMIT / maxVal) * 100}%` }}>
                                    <span className="absolute -top-5 right-0 text-[8px] font-black text-rose-400 uppercase">Limite da Equipe</span>
                                </div>
                                {currentLoad.map((val, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                                        <div 
                                            className={`w-full rounded-t-lg transition-all duration-500 ${val > CAPACITY_LIMIT ? 'bg-rose-500 shadow-lg shadow-rose-100' : 'bg-slate-200'}`} 
                                            style={{ height: `${(val / maxVal) * 100}%` }}
                                            title={`${MONTHS[i]}: ${val} O.S.`}
                                        ></div>
                                        <span className="text-[9px] font-black text-slate-400 mt-3 uppercase">{MONTHS[i].substring(0,3)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PROJEÇÃO OTIMIZADA */}
                        <div className="space-y-6">
                             <h3 className="text-xs font-black uppercase text-emerald-600 flex items-center gap-2 tracking-widest">
                                <CheckCircleIcon className="w-4 h-4"/> Cenário Sugerido
                            </h3>
                            {previewLoad ? (
                                <div className="h-56 flex items-end gap-2 border-b-2 border-slate-100 pb-4 relative animate-fade-in">
                                    {previewLoad.map((val, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                                            <div 
                                                className="w-full rounded-t-lg bg-blue-600 shadow-lg shadow-blue-50 transition-all duration-700" 
                                                style={{ height: `${(val / maxVal) * 100}%` }}
                                            ></div>
                                            <span className="text-[9px] font-black text-slate-400 mt-3 uppercase">{MONTHS[i].substring(0,3)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-56 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 group">
                                    <button 
                                        type="button"
                                        onClick={handleGenerateSuggestion} 
                                        className="flex flex-col items-center gap-4 transition-all hover:scale-105"
                                    >
                                        <div className="p-4 bg-white rounded-2xl shadow-md text-blue-600 group-hover:rotate-180 transition-transform duration-700">
                                            <RefreshIcon className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Simular Nivelamento</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs font-medium text-blue-800 leading-relaxed italic">
                            O algoritmo de balanceamento prioriza a manutenção da criticidade dos ativos. Máquinas Classe A não são movidas. A redistribuição ocorre em ativos Classe B e C para nivelar o Homem-Hora disponível da equipe técnica.
                        </p>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600">Cancelar</button>
                    <button 
                        onClick={() => previewData && onApply(previewData)} 
                        disabled={!previewData} 
                        className="px-10 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-xl transition-all hover:bg-blue-700 disabled:bg-slate-300"
                    >
                        Confirmar Novo Cronograma
                    </button>
                </div>
            </div>
        </div>
    );
};
