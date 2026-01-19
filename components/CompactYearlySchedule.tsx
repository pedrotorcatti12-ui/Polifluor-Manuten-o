
import React from 'react';
import { Equipment, MaintenanceStatus, MaintenanceType } from '../types';
import { MONTHS, MAINTENANCE_TYPE_CONFIG } from '../constants';
import { CloseIcon, DownloadIcon } from './icons';

interface CompactYearlyScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    equipmentData: Equipment[];
    year: number;
}

export const CompactYearlySchedule: React.FC<CompactYearlyScheduleProps> = ({ isOpen, onClose, equipmentData, year }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 no-print">
            <div className="bg-white dark:bg-gray-900 w-full max-w-[95vw] h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cronograma Mestre Compacto {year}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visão executiva anual de ativos</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all">
                            <DownloadIcon className="w-4 h-4"/> Imprimir PDF (Paisagem)
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-950 custom-scrollbar printable-content">
                    <table className="min-w-full border-collapse">
                        <thead className="sticky top-0 z-20 bg-slate-900 text-white">
                            <tr>
                                <th className="p-2 text-left text-[9px] font-black uppercase border border-slate-700 min-w-[150px]">Ativo</th>
                                {MONTHS.map(m => (
                                    <th key={m} className="p-2 text-center text-[9px] font-black uppercase border border-slate-700 w-12">
                                        {m.substring(0, 3)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {equipmentData.map(eq => (
                                <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
                                    <td className="p-2 border border-slate-100 dark:border-gray-800">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">{eq.id}</span>
                                            <span className="text-[8px] font-bold text-slate-400 truncate max-w-[140px] uppercase">{eq.name}</span>
                                        </div>
                                    </td>
                                    {MONTHS.map((m, idx) => {
                                        const tasks = eq.schedule.filter(t => t.year === year && t.month === m);
                                        return (
                                            <td key={idx} className="p-1 border border-slate-100 dark:border-gray-800 text-center align-middle h-10">
                                                <div className="flex flex-wrap gap-0.5 justify-center">
                                                    {tasks.map(t => {
                                                        const isExecuted = t.status === MaintenanceStatus.Executed;
                                                        const isDelayed = t.status === MaintenanceStatus.Delayed;
                                                        const typeCfg = MAINTENANCE_TYPE_CONFIG[t.type as MaintenanceType] || { color: 'bg-slate-300' };
                                                        
                                                        return (
                                                            <div 
                                                                key={t.id}
                                                                title={`${t.type}: ${t.description} (${t.status})`}
                                                                className={`w-3 h-3 rounded-full shadow-sm border border-white dark:border-gray-700 ${
                                                                    isExecuted ? 'bg-emerald-500' : 
                                                                    isDelayed ? 'bg-rose-500 animate-pulse' : 
                                                                    typeCfg.color
                                                                }`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-gray-800 border-t border-slate-100 flex gap-6 justify-center no-print">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-black uppercase text-slate-500">Executado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-[9px] font-black uppercase text-slate-500">Atrasado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span className="text-[9px] font-black uppercase text-slate-500">Preventiva</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <span className="text-[9px] font-black uppercase text-slate-500">Preditiva</span>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .printable-content, .printable-content * { visibility: visible !important; }
                    .printable-content { 
                        position: fixed !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 100vw !important;
                        height: auto !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #ddd !important; }
                    @page { size: A4 landscape; margin: 5mm; }
                }
            `}</style>
        </div>
    );
};
