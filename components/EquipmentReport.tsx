
// components/EquipmentReport.tsx
import React, { useState } from 'react';
import { Equipment, MaintenanceTask } from '../types';
import { useMaintenanceMetrics } from '../hooks/useMaintenanceMetrics';
import { CloseIcon, DownloadIcon, InfoIcon } from './icons';
import { PrintableEquipmentReport } from './PrintableEquipmentReport';
import { ReliabilityInfoModal } from './ReliabilityInfoModal';

interface EquipmentReportProps {
  equipment: Equipment;
  onClose: () => void;
}

const TARGETS = {
    MTBF_MIN: 100,
    MTTR_MAX: 5,
    AVAILABILITY_MIN: 95
};

const MetricCard: React.FC<{ title: string; value: string | number; tooltip: string; status?: 'good' | 'bad' | 'neutral' }> = ({ title, value, tooltip, status = 'neutral' }) => {
    let colorClass = 'text-gray-900 dark:text-white';
    let bgClass = 'bg-gray-100 dark:bg-gray-900/50';

    if (status === 'good') {
        colorClass = 'text-green-600 dark:text-green-400';
        bgClass = 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
    } else if (status === 'bad') {
        colorClass = 'text-red-600 dark:text-red-400';
        bgClass = 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
    }

    return (
        <div className={`${bgClass} p-4 rounded-lg text-center`} title={tooltip}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
    );
};

export const EquipmentReport: React.FC<EquipmentReportProps> = ({ equipment, onClose }) => {
    const availableYears = React.useMemo(() => {
        const years = new Set(equipment.schedule.map(s => s.year));
        const currentYear = new Date().getFullYear();
        years.add(currentYear);
        years.add(2026);
        return Array.from(years).filter(y => typeof y === 'number').sort((a: number, b: number) => b - a);
    }, [equipment]);

    const [viewYear, setViewYear] = useState(2026);
    const { metrics, executedTasks } = useMaintenanceMetrics(equipment, viewYear);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // Helpers de status
    const getMtbfStatus = (val: number | null) => {
        if (val === null) return 'neutral';
        return val >= TARGETS.MTBF_MIN ? 'good' : 'bad';
    };
    const getMttrStatus = (val: number | null) => {
        if (val === null) return 'neutral';
        return val <= TARGETS.MTTR_MAX ? 'good' : 'bad';
    };
    const getAvailabilityStatus = (val: number | null) => {
        if (val === null) return 'neutral';
        return val >= TARGETS.AVAILABILITY_MIN ? 'good' : 'bad';
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 m-4 relative border border-gray-200 dark:border-gray-600 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Relatório do Equipamento</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{equipment.id} - {equipment.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setIsPrinting(true)} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors text-xs">
                                <DownloadIcon className="w-4 h-4" /> Imprimir Relatório
                            </button>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto mt-4 pr-2 -mr-2 space-y-6">
                        {/* General Info */}
                        <section>
                             <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Informações Gerais</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p><strong className="text-gray-500 dark:text-gray-400">Localização:</strong> {equipment.location || 'N/A'}</p>
                                <p><strong className="text-gray-500 dark:text-gray-400">Modelo:</strong> {equipment.model || 'N/A'}</p>
                                <p><strong className="text-gray-500 dark:text-gray-400">Fabricante:</strong> {equipment.manufacturer || 'N/A'}</p>
                                <p><strong className="text-gray-500 dark:text-gray-400">Ano:</strong> {equipment.yearOfManufacture || 'N/A'}</p>
                             </div>
                        </section>

                        {/* Reliability Metrics */}
                        <section>
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Indicadores de Confiabilidade</h3>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => setIsInfoModalOpen(true)} className="p-1 text-gray-500 hover:text-blue-500" title="O que são esses indicadores?">
                                        <InfoIcon className="w-5 h-5" />
                                    </button>
                                    <select value={viewYear} onChange={e => setViewYear(parseInt(e.target.value))} className="form-input py-1 text-sm">
                                        {availableYears.map(year => <option key={year} value={year}>Ano {year}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard 
                                    title="MTBF (h)" 
                                    value={metrics.mtbf?.toFixed(2) ?? 'N/A'} 
                                    tooltip={`Meta: > ${TARGETS.MTBF_MIN}h`}
                                    status={getMtbfStatus(metrics.mtbf)}
                                />
                                <MetricCard 
                                    title="MTTR (h)" 
                                    value={metrics.mttr?.toFixed(2) ?? 'N/A'} 
                                    tooltip={`Meta: < ${TARGETS.MTTR_MAX}h`}
                                    status={getMttrStatus(metrics.mttr)}
                                />
                                <MetricCard 
                                    title="Disponibilidade (%)" 
                                    value={metrics.availability?.toFixed(2) ?? 'N/A'} 
                                    tooltip={`Meta: > ${TARGETS.AVAILABILITY_MIN}%`}
                                    status={getAvailabilityStatus(metrics.availability)}
                                />
                                <MetricCard 
                                    title="Total de Falhas" 
                                    value={metrics.totalFailures} 
                                    tooltip="Nº de manutenções corretivas executadas" 
                                />
                             </div>
                        </section>
                        
                        {/* Maintenance History */}
                        <section>
                             <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Histórico de Manutenções Executadas ({viewYear})</h3>
                             <div className="overflow-x-auto max-h-60 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Data</th>
                                            <th className="px-4 py-2 text-left font-medium">Tipo</th>
                                            <th className="px-4 py-2 text-left font-medium">Descrição</th>
                                            <th className="px-4 py-2 text-left font-medium">Responsável</th>
                                            <th className="px-4 py-2 text-center font-medium">HH</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {executedTasks.length > 0 ? (
                                            executedTasks.map((task: MaintenanceTask, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 whitespace-nowrap">{task.endDate ? new Date(task.endDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                                    <td className="px-4 py-2">{task.type}</td>
                                                    <td className="px-4 py-2 truncate max-w-xs" title={task.description}>{task.description}</td>
                                                    <td className="px-4 py-2">{task.maintainer?.name || 'N/A'}</td>
                                                    <td className="px-4 py-2 text-center font-mono">{task.manHours?.toFixed(2) || '0.00'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-gray-500 italic">Nenhuma manutenção executada encontrada para {viewYear}.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            {isPrinting && <PrintableEquipmentReport isOpen={isPrinting} onClose={() => setIsPrinting(false)} equipment={equipment} viewYear={viewYear} />}
            {isInfoModalOpen && <ReliabilityInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />}
        </>
    );
};
