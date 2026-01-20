import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Equipment, MaintenanceStatus, MaintenanceType, MaintenanceTask } from '../types';
import { DownloadIcon, ArrowPathIcon, WrenchIcon, DocumentTextIcon } from '../components/icons';
import { useDataContext } from '../contexts/DataContext';
import { ParetoChart } from '../components/ParetoChart';
import { MONTHS } from '../constants';
import { DatabaseScriptsModal } from '../components/DatabaseScriptsModal';

declare const window: any;

interface ReportRecord {
    task: MaintenanceTask;
    equipment: Equipment;
}

const generateDetailedPDF = (records: ReportRecord[], startDate: string, endDate: string) => {
    if (typeof window.jspdf === 'undefined') {
        throw new Error('As bibliotecas de PDF não foram carregadas. Verifique sua conexão.');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const margin = 15;
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Detalhado de Manutenções Executadas', pageW / 2, margin, { align: 'center' });
    let y = margin + 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(new Date(endDate).setHours(23, 59, 59, 999)).toLocaleDateString('pt-BR')}`, pageW / 2, y, { align: 'center' });
    y += 10;

    const tableBody = records.map(record => {
        const { task, equipment } = record;
        const detailsText = (task.details || [])
            .map(d => `- ${d.action}${d.materials ? ` (${d.materials})` : ''}`)
            .join('\n');
        
        return [
            task.osNumber || 'N/A',
            task.endDate ? new Date(task.endDate).toLocaleDateString('pt-BR') : 'N/A',
            `${equipment?.id || 'N/A'} - ${equipment?.name || 'Não identificado'}`,
            task.type,
            task.description,
            detailsText,
            task.maintainer?.name || 'N/A',
            (task.manHours || 0).toFixed(2) + 'h'
        ];
    });

    // Final safety check for autoTable
    const autoTable = (doc as any).autoTable;
    if (typeof autoTable !== 'function') {
        throw new Error("O plugin de tabelas do PDF ainda não está pronto. Tente novamente em 2 segundos.");
    }

    autoTable.call(doc, {
        startY: y,
        head: [['OS', 'Data', 'Equipamento', 'Tipo', 'Descrição', 'Ações Executadas', 'Resp.', 'HH']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [22, 101, 192], fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle' },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 15 },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 30 },
            5: { cellWidth: 41 },
            6: { cellWidth: 15 },
            7: { cellWidth: 10, halign: 'right' },
        }
    });
    
    doc.save(`relatorio_detalhado_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const ReportsPage: React.FC = () => {
    const { equipmentData, workOrders, showToast } = useDataContext();
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [generatedRecords, setGeneratedRecords] = useState<ReportRecord[] | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

    const paretoData = useMemo(() => {
        const failureCounts: { [key: string]: number } = {};
        
        const isValidForPareto = (task: MaintenanceTask, eqId: string) => {
            if (task.status !== MaintenanceStatus.Executed) return false;
            if (task.type !== MaintenanceType.Corrective) return false;
            if (!task.correctiveCategory) return false;
            if (selectedEquipmentIds.length > 0 && !selectedEquipmentIds.includes(eqId)) return false;

            if (startDate || endDate) {
                const taskDateStr = task.endDate || task.startDate;
                let taskDate: Date;
                if (taskDateStr) {
                    taskDate = new Date(taskDateStr);
                } else if (task.month) {
                    const monthIndex = MONTHS.indexOf(task.month);
                    if (monthIndex === -1) return false;
                    taskDate = new Date(task.year, monthIndex, 1);
                } else {
                    return false;
                }
                if (startDate && taskDate < new Date(startDate)) return false;
                if (endDate && taskDate > new Date(new Date(endDate).setHours(23, 59, 59, 999))) return false;
            }
            return true;
        };

        equipmentData.forEach(eq => {
            eq.schedule.forEach(task => {
                if (isValidForPareto(task, eq.id)) {
                    failureCounts[task.correctiveCategory!] = (failureCounts[task.correctiveCategory!] || 0) + 1;
                }
            });
        });

        workOrders.forEach(wo => {
            const woAsTask: MaintenanceTask = {
                id: wo.id,
                year: wo.scheduledDate ? new Date(wo.scheduledDate).getFullYear() : 0,
                month: '',
                status: wo.status,
                type: wo.type,
                description: wo.description,
                correctiveCategory: wo.correctiveCategory,
                startDate: wo.scheduledDate,
                endDate: wo.status === MaintenanceStatus.Executed ? wo.scheduledDate : undefined,
            };
            if (wo.correctiveCategory && isValidForPareto(woAsTask, wo.equipmentId)) {
                 failureCounts[wo.correctiveCategory] = (failureCounts[wo.correctiveCategory] || 0) + 1;
            }
        });

        return Object.entries(failureCounts).map(([category, count]) => ({
            category,
            count
        }));
    }, [equipmentData, workOrders, selectedEquipmentIds, startDate, endDate]);

    const handleGenerateReport = () => {
        if (!startDate || !endDate) {
            showToast("Selecione o período de datas", "warning");
            return;
        }
        
        const records: ReportRecord[] = [];
        const equipmentToFilter = selectedEquipmentIds.length > 0
            ? equipmentData.filter(e => selectedEquipmentIds.includes(e.id))
            : equipmentData;

        equipmentToFilter.forEach(equipment => {
            equipment.schedule.forEach(task => {
                const isExecuted = task.status === MaintenanceStatus.Executed;
                const taskDate = task.endDate ? new Date(task.endDate) : null;
                const isInPeriod = taskDate && taskDate >= new Date(startDate) && taskDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
                const typeMatch = selectedTypes.length === 0 || (task.type && selectedTypes.includes(task.type));
                if (isExecuted && isInPeriod && typeMatch) {
                    records.push({ task, equipment });
                }
            });
        });

        workOrders.forEach(wo => {
            if (selectedEquipmentIds.length > 0 && !selectedEquipmentIds.includes(wo.equipmentId)) return;
            const isExecuted = wo.status === MaintenanceStatus.Executed;
            const taskDate = wo.scheduledDate ? new Date(wo.scheduledDate) : null;
            const isInPeriod = taskDate && taskDate >= new Date(startDate) && taskDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
            const typeMatch = selectedTypes.length === 0 || (wo.type && selectedTypes.includes(wo.type));
            if (isExecuted && isInPeriod && typeMatch) {
                const equipment = equipmentData.find(e => e.id === wo.equipmentId) || {
                    id: wo.equipmentId,
                    name: 'Equipamento não localizado',
                    location: 'N/A',
                    status: 'Ativo',
                    schedule: [],
                    is_critical: false
                } as Equipment;
                const task: MaintenanceTask = {
                    id: wo.id,
                    year: taskDate!.getFullYear(),
                    month: '',
                    status: wo.status,
                    type: wo.type,
                    description: wo.description,
                    osNumber: wo.id,
                    manHours: wo.manHours ? wo.manHours.reduce((acc, curr) => acc + curr.hours, 0) : 0,
                    endDate: wo.scheduledDate,
                    details: wo.checklist || []
                };
                records.push({ task, equipment });
            }
        });
        
        if (records.length === 0) {
            showToast("Nenhum dado executado no período", "info");
        }
        setGeneratedRecords(records.sort((a,b) => new Date(b.task.endDate!).getTime() - new Date(a.task.endDate!).getTime()));
    };

    const handleExport = () => {
        if (!generatedRecords) return;
        setIsPrinting(true);
        setTimeout(() => {
            try {
                generateDetailedPDF(generatedRecords, startDate, endDate);
                showToast("PDF gerado com sucesso!", "success");
            } catch (error) {
                console.error("Falha ao gerar PDF detalhado:", error);
                showToast(error instanceof Error ? error.message : "Erro ao gerar o PDF.", "error");
            } finally {
                setIsPrinting(false);
            }
        }, 100);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <Header 
                title="Gerador de Relatórios e Análises" 
                subtitle="Exporte relatórios detalhados ou analise os dados de falhas."
                actions={
                    <button 
                        onClick={() => setIsSqlModalOpen(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-700 transition-all"
                    >
                        <WrenchIcon className="w-4 h-4"/> Ver Scripts de Instalação (SQL)
                    </button>
                }
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ParetoChart title="Análise de Falhas por Categoria (Pareto)" data={paretoData} />
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-4">Exportar Relatório Detalhado</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400">Início</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full form-input" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400">Fim</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full form-input" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400">Tipos de Manutenção</label>
                            <select multiple value={selectedTypes} onChange={e => setSelectedTypes(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="mt-1 w-full form-input h-24">
                                {Object.values(MaintenanceType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-xs font-bold uppercase text-slate-400">Equipamentos</label>
                             <select multiple value={selectedEquipmentIds} onChange={e => setSelectedEquipmentIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="mt-1 w-full form-input h-32">
                                {equipmentData.map(eq => <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>)}
                             </select>
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button onClick={handleGenerateReport} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm">Visualizar Dados</button>
                    </div>
                </div>
            </div>
            
            {generatedRecords && (
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Resultados Encontrados: {generatedRecords.length}</h3>
                        <button onClick={handleExport} disabled={isPrinting} className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-md transition-colors text-sm disabled:bg-red-400 disabled:cursor-not-allowed">
                             {isPrinting ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <DownloadIcon />}
                             {isPrinting ? 'Gerando...' : 'Exportar PDF'}
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Equipamento</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {generatedRecords.length > 0 ? generatedRecords.map((rec, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-4 text-sm whitespace-nowrap">{rec.task.endDate ? new Date(rec.task.endDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                        <td className="px-4 py-4 text-sm">{rec.equipment?.name || 'N/A'}</td>
                                        <td className="px-4 py-4 text-sm">{rec.task.type}</td>
                                        <td className="px-4 py-4 text-sm truncate max-w-sm" title={rec.task.description}>{rec.task.description}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhum registro encontrado no período selecionado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isSqlModalOpen && <DatabaseScriptsModal isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />}
        </div>
    );
};