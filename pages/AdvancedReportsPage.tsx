
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useAdvancedMetrics, AdvancedReportData } from '../hooks/useAdvancedMetrics';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, TargetIcon, DownloadIcon, SearchIcon, WrenchIcon, ChartIcon, ShieldCheckIcon } from '../components/icons';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceType, MaintenanceStatus, CorrectiveCategory } from '../types';

declare const window: any;

export const AdvancedReportsPage: React.FC = () => {
    const { equipmentData, workOrders, logActivity } = useDataContext(); 
    const [selectedIds] = useState<string[]>([]);
    const [criticidade, setCriticidade] = useState<'Todos' | 'Criticos' | 'Nao-Criticos'>('Todos');
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState('2026-12-31');
    const [filterCategory, setFilterCategory] = useState<string>('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [reportData, setReportData] = useState<AdvancedReportData[] | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const calculateMetrics = useAdvancedMetrics();

    // 1. GERAÇÃO DOS DADOS MACRO (KPIS)
    const handleGenerate = () => {
        const ids = selectedIds.length > 0 ? selectedIds : equipmentData.map(e => e.id);
        const data = calculateMetrics(equipmentData, workOrders, ids, startDate, endDate, criticidade);
        setReportData(data);
        logActivity({
            action_type: 'GENERATE_REPORT',
            description: `Relatório Avançado gerado: ${startDate} a ${endDate}`
        });
    };

    // 2. GERAÇÃO DOS DADOS MICRO (TABELA DE FALHAS / RECORRÊNCIA)
    const detailedFailures = useMemo(() => {
        if (!reportData) return [];

        // Filtra apenas as O.S. que compõem os indicadores gerados (Regra de Ouro: Apenas Corretivas Executadas)
        return workOrders.filter(wo => {
            const isCorrective = wo.type === MaintenanceType.Corrective;
            const isExecuted = wo.status === MaintenanceStatus.Executed;
            const inDateRange = wo.scheduledDate >= startDate && wo.scheduledDate <= endDate + 'T23:59:59';
            
            // Filtros de UI
            const matchCategory = filterCategory === 'Todas' || wo.correctiveCategory === filterCategory;
            const matchSearch = searchTerm === '' || 
                                wo.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (wo.description || '').toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro de Criticidade (via reportData que já filtrou os equipamentos)
            const belongsToFilteredEquipment = reportData.some(rd => rd.equipmentId === wo.equipmentId);

            return isCorrective && isExecuted && inDateRange && matchCategory && matchSearch && belongsToFilteredEquipment;
        }).map(wo => {
            const eq = equipmentData.find(e => e.id === wo.equipmentId);
            // Cálculo de Tempo de Reparo (Downtime)
            const durationHours = wo.endDate 
                ? (new Date(wo.endDate).getTime() - new Date(wo.scheduledDate).getTime()) / 3600000 
                : 0;

            return {
                ...wo,
                equipmentName: eq?.name || 'Desconhecido',
                isCritical: eq?.is_critical || false,
                durationHours
            };
        }).sort((a, b) => a.equipmentId.localeCompare(b.equipmentId) || new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
        // Ordenação por Equipamento agrupa as falhas para facilitar visualização de recorrência
    }, [workOrders, reportData, filterCategory, searchTerm, startDate, endDate, equipmentData]);

    const totals = useMemo(() => {
        if (!reportData) return { mttr: 0, failures: 0, availability: 0, downtime: 0 };
        const count = reportData.length || 1;
        const sums = reportData.reduce((acc, curr) => ({
            mttr: acc.mttr + curr.mttr,
            failures: acc.failures + curr.totalFailures,
            availability: acc.availability + curr.availability,
            downtime: acc.downtime + (curr.totalCorrectiveHours)
        }), { mttr: 0, failures: 0, availability: 0, downtime: 0 });
        
        return {
            mttr: sums.mttr / count,
            failures: sums.failures,
            availability: sums.availability / count,
            downtime: sums.downtime
        };
    }, [reportData]);

    // 3. EXPORTAÇÃO PDF
    const generateAnalyticalPDF = () => {
        if (!reportData || typeof window.jspdf === 'undefined') {
            alert('Aguarde o carregamento das bibliotecas ou gere os dados primeiro.');
            return;
        }
        
        setIsGeneratingPdf(true);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(18);
        doc.text("Laudo Técnico de Confiabilidade & Recorrência", 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Período: ${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()}`, 14, 28);
        doc.text(`Emissão: ${new Date().toLocaleString()}`, 14, 33);

        // Resumo KPI
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 40, 180, 25, 'F');
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Disponibilidade Média: ${totals.availability.toFixed(2)}%`, 20, 50);
        doc.text(`MTTR Global: ${totals.mttr.toFixed(2)}h`, 20, 60);
        doc.text(`Total de Falhas: ${totals.failures}`, 110, 50);
        doc.text(`Horas Paradas (Down): ${totals.downtime.toFixed(2)}h`, 110, 60);

        // Tabela de Detalhes
        const tableBody = detailedFailures.map(row => [
            new Date(row.scheduledDate).toLocaleDateString(),
            row.equipmentId,
            row.equipmentName,
            row.isCritical ? 'CRÍTICO' : 'Normal',
            row.correctiveCategory || 'Geral',
            row.rootCause || 'Não informada',
            row.durationHours.toFixed(2) + 'h'
        ]);

        (doc as any).autoTable({
            startY: 75,
            head: [['Data', 'Tag', 'Equipamento', 'Classe', 'Cat.', 'Causa Raiz', 'Tempo']],
            body: tableBody,
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 20 }, 
                5: { cellWidth: 50 } // Causa Raiz maior
            }
        });

        // Rodapé com Conceitos
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("* MTBF/MTTR consideram apenas falhas funcionais (Corretivas). Paradas programadas não afetam estes índices.", 14, finalY);

        doc.save(`Analise_Falhas_${startDate}_${endDate}.pdf`);
        setIsGeneratingPdf(false);
    };

    return (
        <div className="space-y-8 pb-12">
            <Header 
                title="Relatórios de Engenharia & Confiabilidade" 
                subtitle="Análise profunda de falhas, recorrência e KPIs de performance (MTBF/MTTR)." 
            />

            {/* BARRA DE CONTROLE E FILTROS */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                    <div className="md:col-span-2 flex gap-2">
                        <button onClick={handleGenerate} className="flex-1 h-12 bg-slate-900 text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center gap-2">
                            <ChartIcon className="w-4 h-4"/> Processar Indicadores
                        </button>
                        {reportData && (
                            <button 
                                onClick={generateAnalyticalPDF} 
                                disabled={isGeneratingPdf}
                                className="px-6 h-12 bg-red-600 text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-red-300"
                            >
                                {isGeneratingPdf ? <ClockIcon className="w-4 h-4 animate-spin"/> : <DownloadIcon className="w-4 h-4"/>}
                                Laudo PDF
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {reportData && (
                <>
                    {/* CARDS DE KPI MACRO */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Disponibilidade</p>
                            <div className="flex items-end gap-2">
                                <span className={`text-3xl font-black ${totals.availability > 95 ? 'text-emerald-600' : 'text-amber-500'}`}>{totals.availability.toFixed(1)}%</span>
                                <ShieldCheckIcon className="w-5 h-5 text-emerald-500 mb-1" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MTTR (Médio)</p>
                            <div className="flex items-end gap-2">
                                <span className={`text-3xl font-black ${totals.mttr > 1 ? 'text-rose-600' : 'text-emerald-600'}`}>{totals.mttr.toFixed(1)}h</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Falhas (P)</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-slate-800 dark:text-white">{totals.failures}</span>
                                <WrenchIcon className="w-5 h-5 text-blue-500 mb-1" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horas Paradas (TM)</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-amber-600">{totals.downtime.toFixed(1)}h</span>
                                <ClockIcon className="w-5 h-5 text-amber-500 mb-1" />
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO DE ANÁLISE DE RECORRÊNCIA (TABELA DETALHADA) */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Análise de Recorrência de Falhas</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Lista cronológica de intervenções corretivas. 
                                    <span className="font-bold text-slate-700 ml-1">Agrupado por Equipamento</span> para identificar repetições.
                                </p>
                            </div>
                            
                            <div className="flex gap-3">
                                <select 
                                    value={filterCategory} 
                                    onChange={(e) => setFilterCategory(e.target.value)} 
                                    className="form-input h-10 py-1 text-xs font-bold w-48"
                                >
                                    <option value="Todas">Todas as Categorias</option>
                                    {Object.values(CorrectiveCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar O.S. ou Ativo..." 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="form-input h-10 pl-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Data Falha</th>
                                        <th className="px-6 py-4 text-left">Ativo / Equipamento</th>
                                        <th className="px-6 py-4 text-center">Criticidade</th>
                                        <th className="px-6 py-4 text-left">Problema / Causa Raiz</th>
                                        <th className="px-6 py-4 text-center">Categoria</th>
                                        <th className="px-6 py-4 text-center">Tempo (h)</th>
                                        <th className="px-6 py-4 text-right">O.S.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white dark:bg-gray-800">
                                    {detailedFailures.length > 0 ? detailedFailures.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                {new Date(item.scheduledDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-800 uppercase">{item.equipmentId}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{item.equipmentName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.isCritical ? (
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-[9px] font-black uppercase flex items-center justify-center gap-1 mx-auto w-fit">
                                                        <TargetIcon className="w-3 h-3"/> Classe A
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase">Classe C</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-xs font-bold text-slate-700 line-clamp-1">{item.description}</p>
                                                {item.rootCause && (
                                                    <p className="text-[10px] text-rose-500 font-medium mt-1 italic">
                                                        <span className="font-bold uppercase not-italic text-rose-700">Causa:</span> {item.rootCause}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 border border-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase">
                                                    {item.correctiveCategory || 'Geral'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xs font-mono font-bold ${item.durationHours > 2 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {item.durationHours.toFixed(2)}h
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">#{item.id}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">
                                                Nenhuma falha corretiva encontrada com os filtros atuais.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
