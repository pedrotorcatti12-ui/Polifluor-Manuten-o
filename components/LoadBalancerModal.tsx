
import React, { useState, useMemo } from 'react';
import { Equipment, MaintenanceStatus } from '../types';
import { MONTHS } from '../constants';
import { CloseIcon, RefreshIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowRightIcon } from './icons';

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

    const handleSimulate = (strategy: 'gentle' | 'aggressive') => {
        const newData: Equipment[] = JSON.parse(JSON.stringify(equipmentData));
        const nonCriticalAssets = newData.filter(eq => !eq.is_critical);

        let shiftedCount = 0;
        const shiftFactor = strategy === 'aggressive' ? 2 : 1;

        nonCriticalAssets.forEach((eq) => {
            const janTasks = eq.schedule.filter(t => t.year === 2026 && t.month === 'Janeiro' && t.status === MaintenanceStatus.Scheduled);
            
            if (janTasks.length > 0 && currentLoad[0] > CAPACITY_LIMIT) {
                const monthOffset = (shiftedCount % (3 * shiftFactor)) + 1; // Move 1, 2 ou 3 meses pra frente
                
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
            <div className="bg-white dark:bg-gray-900 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Otimizador de Carga 2026</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ferramenta de Decisão Gerencial</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <CloseIcon className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-white grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* COLUNA ESQUERDA: CONTROLES */}
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <h3 className="text-sm font-black text-blue-800 uppercase mb-2">Critérios de Nivelamento</h3>
                            <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                                O sistema identificou <strong>{currentLoad[0]} ordens</strong> em Janeiro (Capacidade: {CAPACITY_LIMIT}).
                                Selecione uma estratégia para redistribuir ativos não-críticos (Classe C).
                            </p>
                            
                            <div className="space-y-3">
                                <button onClick={() => handleSimulate('gentle')} className="w-full py-3 bg-white border-2 border-blue-200 rounded-xl text-xs font-black uppercase text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                                    Nivelamento Suave (+1 mês)
                                </button>
                                <button onClick={() => handleSimulate('aggressive')} className="w-full py-3 bg-white border-2 border-blue-200 rounded-xl text-xs font-black uppercase text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                                    Nivelamento Agressivo (+3 meses)
                                </button>
                            </div>
                        </div>

                        {previewData && (
                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 animate-fade-in">
                                <h3 className="text-sm font-black text-emerald-800 uppercase mb-2 flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4"/> Resultado Simulado
                                </h3>
                                <p className="text-xs text-emerald-700">
                                    A carga de Janeiro foi reduzida para <strong>{previewLoad ? previewLoad[0] : 0} ordens</strong>.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* COLUNA DIREITA: GRÁFICOS */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase text-slate-500">Cenário Atual</h3>
                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">Sobrecarga Detectada</span>
                            </div>
                            <div className="h-40 flex items-end gap-1 border-b border-slate-200 pb-1 relative">
                                <div className="absolute w-full border-t border-dashed border-rose-300 top-[20%] pointer-events-none opacity-50"></div>
                                {currentLoad.map((val, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                                        <div 
                                            className={`w-full rounded-t transition-all ${val > CAPACITY_LIMIT ? 'bg-rose-500' : 'bg-slate-300'}`} 
                                            style={{ height: `${(val / maxVal) * 100}%` }}
                                        ></div>
                                        <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{MONTHS[i].substring(0,3)}</span>
                                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded">{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {previewData && (
                            <div className="space-y-2 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase text-slate-500">Cenário Proposto</h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Carga Nivelada</span>
                                </div>
                                <div className="h-40 flex items-end gap-1 border-b border-slate-200 pb-1">
                                    {previewLoad?.map((val, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                                            <div 
                                                className="w-full rounded-t bg-blue-500 transition-all duration-500" 
                                                style={{ height: `${(val / maxVal) * 100}%` }}
                                            ></div>
                                            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{MONTHS[i].substring(0,3)}</span>
                                            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded">{val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600">Cancelar</button>
                    <button 
                        onClick={() => previewData && onApply(previewData)} 
                        disabled={!previewData} 
                        className="px-10 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-xl transition-all hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none flex items-center gap-2"
                    >
                        Aprovar Novo Cronograma <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
