
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Equipment, MaintenanceStatus, MaintenanceType, MaintenanceTask } from '../types';
import { DownloadIcon, ArrowPathIcon } from '../components/icons';
import { useDataContext } from '../contexts/DataContext';
import { ParetoChart } from '../components/ParetoChart';
import { MONTHS } from '../constants';

declare const window: any;

interface ReportRecord {
    task: MaintenanceTask;
    equipment: Equipment;
}

const generateDetailedPDF = (records: ReportRecord[], startDate: string, endDate: string) => {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined' || typeof (new window.jspdf.jsPDF()).autoTable !== 'function') {
        throw new Error('A biblioteca de geração de PDF não pôde ser carregada. Verifique sua conexão com a internet e tente novamente.');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const margin = 15;
    const pageW = doc.internal.pageSize.getWidth();

    // Header
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
            `${equipment.id} - ${equipment.name}`,
            task.type,
            task.description,
            detailsText,
            task.maintainer?.name || 'N/A',
            (task.manHours || 0).toFixed(2) + 'h'
        ];
    });

    (doc as any).autoTable({
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
    const { equipmentData, workOrders } = useDataContext();
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [generatedRecords, setGeneratedRecords] = useState<ReportRecord[] | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Lógica do Gráfico de Pareto
    const paretoData = useMemo(() => {
        const failureCounts: { [key: string]: number } = {};
        
        // Função auxiliar para verificar se uma tarefa deve entrar no Gráfico
        const isValidForPareto = (task: MaintenanceTask, eqId: string) => {
            // 1. Status deve ser Executado
            if (task.status !== MaintenanceStatus.Executed) return false;

            // 2. Tipo deve ser Corretiva (Pareto é SEMPRE sobre falhas, ignorando o filtro da UI de tipos)
            if (task.type !== MaintenanceType.Corrective) return false;

            // 3. Deve ter uma categoria definida
            if (!task.correctiveCategory) return false;

            // 4. Filtro de Equipamento (Respeita a seleção da UI)
            if (selectedEquipmentIds.length > 0 && !selectedEquipmentIds.includes(eqId)) return false;

            // 5. Filtro de Data (Respeita a seleção da UI)
            if (startDate || endDate) {
                // Normalização de datas para comparação
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
                
                if (startDate) {
                    const startFilter = new Date(startDate);
                    // Resetar horas para garantir comparação justa de data
                    if (taskDate < startFilter) return false;
                }
                
                if (endDate) {
                    const endFilter = new Date(endDate);
                    endFilter.setHours(23, 59, 59, 999); // Final do dia
                    if (taskDate > endFilter) return false;
                }
            }

            return true;
        };

        // Processar Equipamentos (Cronograma Interno)
        equipmentData.forEach(eq => {
            eq.schedule.forEach(task => {
                if (isValidForPareto(task, eq.id)) {
                    failureCounts[task.correctiveCategory!] = (failureCounts[task.correctiveCategory!] || 0) + 1;
                }
            });
        });

        // Processar Ordens Avulsas (WorkOrders)
        workOrders.forEach(wo => {
            // Converter WO para formato similar a Task para validação
            const woAsTask: MaintenanceTask = {
                id: wo.id,
                year: wo.scheduledDate ? new Date(wo.scheduledDate).getFullYear() : 0,
                month: '',
                status: wo.status,
                type: wo.type,
                description: wo.description,
                correctiveCategory: wo.correctiveCategory, // Campo agora disponível na interface
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
    }, [equipmentData, workOrders, selectedEquipmentIds, startDate, endDate]); // Note: removed selectedTypes

    const handleGenerateReport = () => {
        if (!startDate || !endDate) {
            alert("Por favor, selecione um período de datas.");
            return;
        }
        
        const records: ReportRecord[] = [];
        const equipmentToFilter = selectedEquipmentIds.length > 0
            ? equipmentData.filter(e => selectedEquipmentIds.includes(e.id))
            : equipmentData;

        // 1. Tarefas do Cronograma
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

        // 2. Ordens de Serviço Avulsas
        workOrders.forEach(wo => {
            // Check Filter Equipment
            if (selectedEquipmentIds.length > 0 && !selectedEquipmentIds.includes(wo.equipmentId)) return;

            const isExecuted = wo.status === MaintenanceStatus.Executed;
            const taskDate = wo.scheduledDate ? new Date(wo.scheduledDate) : null;
            const isInPeriod = taskDate && taskDate >= new Date(startDate) && taskDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
            const typeMatch = selectedTypes.length === 0 || (wo.type && selectedTypes.includes(wo.type));

            if (isExecuted && isInPeriod && typeMatch) {
                const equipment = equipmentData.find(e => e.id === wo.equipmentId) || {
                    id: wo.equipmentId,
                    name: 'Desconhecido',
                    location: 'N/A',
                    status: 'Ativo',
                    schedule: []
                } as Equipment;

                const task: MaintenanceTask = {
                    id: wo.id,
                    year: taskDate!.getFullYear(),
                    month: '',
                    status: wo.status,
                    type: wo.type,
                    description: wo.description,
                    osNumber: wo.id,
                    maintainer: wo.manHours && wo.manHours.length > 0 ? { name: wo.manHours[0].maintainer, isExternal: false } : undefined,
                    manHours: wo.manHours ? wo.manHours.reduce((acc, curr) => acc + curr.hours, 0) : 0,
                    endDate: wo.scheduledDate,
                    details: []
                };

                records.push({ task, equipment });
            }
        });
        
        setGeneratedRecords(records.sort((a,b) => new Date(b.task.endDate!).getTime() - new Date(a.task.endDate!).getTime()));
    };

    const handleExport = () => {
        if (!generatedRecords) return;
        setIsPrinting(true);
        setTimeout(() => {
            try {
                generateDetailedPDF(generatedRecords, startDate, endDate);
            } catch (error) {
                console.error("Falha ao gerar PDF detalhado:", error);
                alert(error instanceof Error ? error.message : "Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
            } finally {
                setIsPrinting(false);
            }
        }, 50);
    };

    return (
        <div className="space-y-8">
            <Header title="Gerador de Relatórios e Análises" subtitle="Exporte relatórios detalhados ou analise os dados de falhas." />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ParetoChart title="Análise de Falhas por Categoria (Pareto)" data={paretoData} />
                
                {/* PDF Generator section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-4">Exportar Relatório Detalhado</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Data de Início</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Data de Fim</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tipos de Manutenção</label>
                            <select multiple value={selectedTypes} onChange={e => setSelectedTypes(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="mt-1 w-full form-input h-24">
                                {Object.values(MaintenanceType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Obs: Este filtro afeta apenas a geração do PDF, não o gráfico.</p>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Equipamentos</label>
                             <select multiple value={selectedEquipmentIds} onChange={e => setSelectedEquipmentIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="mt-1 w-full form-input h-32">
                                {equipmentData.map(eq => <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>)}
                             </select>
                             <p className="text-xs text-gray-500 mt-1">Deixe em branco para todos. Segure Ctrl (ou Cmd) para selecionar múltiplos.</p>
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
                                        <td className="px-4 py-4 text-sm whitespace-nowrap">{new Date(rec.task.endDate!).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-4 text-sm">{rec.equipment.name}</td>
                                        <td className="px-4 py-4 text-sm">{rec.task.type}</td>
                                        <td className="px-4 py-4 text-sm truncate max-w-sm" title={rec.task.description}>{rec.task.description}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhum registro encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};