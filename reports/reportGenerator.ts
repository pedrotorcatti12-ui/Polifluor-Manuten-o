// reports/reportGenerator.ts
import { Equipment, WorkOrder, SparePart, EquipmentType, MaintenanceType, MaintenanceStatus, CorrectiveCategory } from '../types';
import { addPdfHeader, addPdfFooter } from './pdfUtils';
import { MAINTENANCE_TYPE_CONFIG, MONTHS } from '../constants';

declare const window: any;

const getJsPDF = () => {
    if (typeof window.jspdf === 'undefined' || typeof (window.jspdf as any).jsPDF === 'undefined') {
        console.error("JSPDF library not found on window object.");
        alert('ERRO CRÍTICO: A biblioteca principal de PDF (jspdf) não foi carregada.');
        return null;
    }
    const doc = new (window.jspdf as any).jsPDF();
    if (typeof (doc as any).autoTable !== 'function') {
        console.error("JSPDF-AutoTable plugin not found on jsPDF instance.");
        alert('ERRO CRÍTICO: O plugin de tabelas (jspdf-autotable) não foi carregado corretamente.');
        return null;
    }
    return doc;
};

const commonTableStyles = {
    headStyles: { fillColor: '#1E293B', textColor: '#FFFFFF', fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.1, lineColor: '#DDDDDD' },
    alternateRowStyles: { fillColor: '#F8FAFC' },
};

export const generateKpiReport = (title: string, reportData: any[], dateRange: { start: string, end: string }) => {
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, title, dateRange);
    const tableBody = reportData.map(d => [
        d.equipmentId, d.equipmentName, d.mtbf?.toFixed(2) ?? 'N/A', d.mttr.toFixed(2),
        d.availability.toFixed(2) + '%', d.globalAvailability.toFixed(2) + '%', d.totalFailures,
    ]);
    (doc as any).autoTable({ startY: 50, head: [['Ativo', 'Nome', 'MTBF (h)', 'MTTR (h)', 'Disp. Inerente', 'Disp. Operacional', 'Falhas']], body: tableBody, ...commonTableStyles });
    addPdfFooter(doc);
    doc.save(`${title.replace(/ /g, '_')}.pdf`);
};

export const generateMaterialsReport = (workOrders: WorkOrder[], inventoryData: SparePart[], dateRange: { start: string, end: string }) => {
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, 'Itens Requisitados por Ordem de Serviço', dateRange);
    const filteredOrders = workOrders.filter(wo => wo.materialsUsed && wo.materialsUsed.length > 0 && wo.scheduledDate >= dateRange.start && wo.scheduledDate <= dateRange.end);
    const tableBody = filteredOrders.flatMap(wo => wo.materialsUsed!.map(mat => {
        const part = inventoryData.find(p => p.id === mat.partId);
        return [wo.id, new Date(wo.scheduledDate).toLocaleDateString('pt-BR'), wo.equipmentId, part?.name || mat.partId, mat.quantity];
    }));
    (doc as any).autoTable({ startY: 50, head: [['OS', 'Data', 'Equipamento', 'Peça', 'Qtd.']], body: tableBody, ...commonTableStyles });
    addPdfFooter(doc);
    doc.save('Relatorio_Materiais_OS.pdf');
};

export const generateInventoryReport = (inventoryData: SparePart[], dateRange: { start: string, end: string }) => {
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, 'Relatório de Estoque Atual (FO-044)', dateRange);
    const tableBody = inventoryData.map(p => [p.id, p.name, p.location, p.currentStock, p.minStock, (p.currentStock < p.minStock ? 'CRÍTICO' : 'OK')]);
    (doc as any).autoTable({ startY: 50, head: [['Cód.', 'Descrição', 'Local', 'Atual', 'Mínimo', 'Status']], body: tableBody, ...commonTableStyles });
    addPdfFooter(doc);
    doc.save('Relatorio_Estoque_Atual.pdf');
};

export const generateOsVolumeReport = (workOrders: WorkOrder[], dateRange: { start: string, end: string }) => {
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, 'Volume de Ordens de Serviço', dateRange);
    const filtered = workOrders.filter(wo => wo.scheduledDate >= dateRange.start && wo.scheduledDate <= dateRange.end);
    const openStatus = [MaintenanceStatus.Scheduled, MaintenanceStatus.InField, MaintenanceStatus.Delayed, MaintenanceStatus.WaitingParts];
    const closedCount = filtered.filter(wo => wo.status === MaintenanceStatus.Executed).length;
    const openCount = filtered.filter(wo => openStatus.includes(wo.status)).length;
    (doc as any).autoTable({ startY: 50, head: [['Status da O.S.', 'Quantidade']], body: [['Abertas (Não Finalizadas)', openCount], ['Fechadas (Executadas)', closedCount], ['TOTAL', filtered.length]], ...commonTableStyles });
    addPdfFooter(doc);
    doc.save('Volume_Ordens_Servico.pdf');
};

export const generateChecklistReport = (workOrders: WorkOrder[], dateRange: { start: string, end: string }) => {
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, 'Relatório de Checklists das Ordens de Serviço', dateRange);
    const filtered = workOrders.filter(wo => wo.checklist && wo.checklist.length > 0 && wo.scheduledDate >= dateRange.start && wo.scheduledDate <= dateRange.end);
    let finalY = 50;
    filtered.forEach(wo => {
        if (finalY > 250) { doc.addPage(); addPdfHeader(doc, 'Relatório de Checklists das Ordens de Serviço', dateRange); finalY = 50; }
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(`OS #${wo.id} - ${wo.equipmentId} (${new Date(wo.scheduledDate).toLocaleDateString('pt-BR')})`, 14, finalY);
        finalY += 5;
        const checklistBody = wo.checklist!.map(item => [item.action]);
        (doc as any).autoTable({ startY: finalY, head: [['Tarefa do Checklist']], body: checklistBody, ...commonTableStyles });
        finalY = (doc as any).lastAutoTable.finalY + 10;
    });
    addPdfFooter(doc);
    doc.save('Relatorio_Checklists.pdf');
};

export const generateEquipmentListReport = (equipmentData: Equipment[], dateRange: { start: string, end: string }) => {
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, 'Cadastro Geral de Equipamentos (Ativos)', dateRange);
    const tableBody = equipmentData.map(eq => [eq.id, eq.name, eq.location, eq.isCritical ? 'Sim' : 'Não', eq.status]);
    (doc as any).autoTable({ startY: 50, head: [['Cód.', 'Nome', 'Localização', 'Crítico?', 'Status']], body: tableBody, ...commonTableStyles });
    addPdfFooter(doc);
    doc.save('Cadastro_Equipamentos.pdf');
};

export const generateEquipmentTypesReport = (equipmentData: Equipment[], equipmentTypes: EquipmentType[], dateRange: { start: string, end: string }) => {
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, 'Relatório de Ativos por Tipo/Família', dateRange);
    const dataForTable = equipmentTypes.map(type => ({ description: type.description, count: equipmentData.filter(eq => eq.typeId === type.id).length })).filter(item => item.count > 0).sort((a, b) => b.count - a.count);
    const tableBody = dataForTable.map(item => [item.description, item.count]);
    const totalAssets = dataForTable.reduce((sum, item) => sum + item.count, 0);
    (doc as any).autoTable({ startY: 50, head: [['TIPO / FAMÍLIA DO EQUIPAMENTO', 'QUANTIDADE TOTAL']], body: tableBody, foot: [['TOTAL GERAL DE ATIVOS', totalAssets]], footStyles: { fillColor: '#1E293B', textColor: '#FFFFFF', fontStyle: 'bold' }, ...commonTableStyles });
    addPdfFooter(doc);
    doc.save('Relatorio_Tipos_Equipamento.pdf');
};

export const generateExecutiveSummaryReport = (data: { equipmentData: Equipment[], workOrders: WorkOrder[], inventoryData: SparePart[], dateRange: { start: string, end: string }}) => {
    const { equipmentData, workOrders, inventoryData, dateRange } = data;
    const doc = getJsPDF();
    if (!doc) return;
    addPdfHeader(doc, 'Resumo Executivo Gerencial', dateRange);
    let finalY = 50;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const filteredWO = workOrders.filter(wo => { const woDate = new Date(wo.scheduledDate); return woDate >= start && woDate <= end; });
    const addSectionTitle = (title: string) => { if (finalY > 250) { doc.addPage(); finalY = 20; } doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor('#1E293B'); doc.text(title, 14, finalY); finalY += 6; };
    
    // KPI Calc simplified for report
    const correctiveOrders = filteredWO.filter(wo => wo.type === MaintenanceType.Corrective && wo.status === MaintenanceStatus.Executed);
    const totalFailures = correctiveOrders.length;
    addSectionTitle('1. Indicadores Chave de Performance');
    (doc as any).autoTable({ startY: finalY, body: [['Total de Falhas Corretivas', totalFailures], ['Total de Ordens Emitidas', filteredWO.length]], theme: 'grid', ...commonTableStyles, bodyStyles: { fontStyle: 'bold' } });
    finalY = (doc as any).lastAutoTable.finalY + 10;

    addSectionTitle('2. Análise de Ordens de Serviço');
    const osByType = Object.values(MaintenanceType).map(type => ({ type, count: filteredWO.filter(wo => wo.type === type).length })).filter(item => item.count > 0);
    (doc as any).autoTable({ startY: finalY, head: [['Natureza da O.S.', 'Quantidade']], body: osByType.map(item => [item.type, item.count]), ...commonTableStyles });
    finalY = (doc as any).lastAutoTable.finalY + 10;

    addSectionTitle('3. Situação do Almoxarifado');
    const criticalItems = inventoryData.filter(p => p.currentStock < p.minStock);
    (doc as any).autoTable({ startY: finalY, body: [['Itens com Saldo Crítico', criticalItems.length], ['Total de SKUs', inventoryData.length]], theme: 'grid', ...commonTableStyles, bodyStyles: { fontStyle: 'bold' } });
    finalY = (doc as any).lastAutoTable.finalY + 10;

    if (criticalItems.length > 0) {
        if (finalY > 250) { doc.addPage(); finalY = 50; }
        doc.setFontSize(9); doc.text('Itens Críticos:', 14, finalY); finalY += 6;
        (doc as any).autoTable({ startY: finalY, head: [['Cód.', 'Descrição', 'Saldo Atual', 'Saldo Mínimo']], body: criticalItems.map(p => [p.id, p.name, p.currentStock, p.minStock]), ...commonTableStyles, styles: { ...commonTableStyles.styles, fontSize: 7 } });
    }
    addPdfFooter(doc);
    doc.save('Resumo_Executivo.pdf');
};

// --- CRUCIAL FIX: Missing Function for SchedulePage ---
export const generateScheduleReport = (
    scheduleData: { equipment: Equipment; monthlyTasks: WorkOrder[][] }[],
    year: number
) => {
    const doc = getJsPDF();
    if (!doc) return;

    // Landscape Mode
    const landscapeDoc = new (window.jspdf as any).jsPDF({ orientation: 'landscape', format: 'a4' });
    
    addPdfHeader(landscapeDoc, `Cronograma Mestre de Manutenção - ${year}`, { start: `${year}-01-01`, end: `${year}-12-31` });

    const columns = [
        { header: 'EQUIPAMENTO', dataKey: 'equipment' },
        ...MONTHS.map((m, i) => ({ header: m.substring(0, 3).toUpperCase(), dataKey: i.toString() }))
    ];

    const body = scheduleData.map(row => {
        const rowData: any = { equipment: row.equipment.name };
        row.monthlyTasks.forEach((tasks, monthIndex) => {
            const types = Array.from(new Set(tasks.map(t => t.type)));
            rowData[monthIndex.toString()] = { content: '', customData: types }; 
        });
        return rowData;
    });

    (landscapeDoc as any).autoTable({
        startY: 50,
        columns: columns,
        body: body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, lineColor: '#DDDDDD', lineWidth: 0.1, valign: 'middle', halign: 'center', minCellHeight: 10 },
        headStyles: { fillColor: '#1E293B', textColor: '#FFFFFF', fontStyle: 'bold', halign: 'center' },
        columnStyles: { equipment: { halign: 'left', fontStyle: 'bold', cellWidth: 70 } },
        didDrawCell: (data: any) => {
            if (data.section === 'body' && data.column.dataKey !== 'equipment') {
                const types = data.cell.raw?.customData as MaintenanceType[];
                if (Array.isArray(types) && types.length > 0) {
                    const cell = data.cell;
                    const radius = 2.5;
                    const gap = 2;
                    const totalWidth = (types.length * (radius * 2)) + ((types.length - 1) * gap);
                    let startX = (cell.x + cell.width / 2) - (totalWidth / 2) + radius;
                    const yCenter = cell.y + cell.height / 2;

                    types.forEach((type, index) => {
                        const config = MAINTENANCE_TYPE_CONFIG[type];
                        if (config && config.hex) {
                            landscapeDoc.setFillColor(config.hex);
                            landscapeDoc.circle(startX + (index * (radius * 2 + gap)), yCenter, radius, 'F');
                        }
                    });
                }
            }
        }
    });

    const legendY = landscapeDoc.internal.pageSize.getHeight() - 25;
    let legendX = 14;
    landscapeDoc.setFontSize(8);
    landscapeDoc.setFont('helvetica', 'bold');
    landscapeDoc.text("LEGENDA:", legendX, legendY);
    legendX += 20;

    Object.values(MAINTENANCE_TYPE_CONFIG).forEach(config => {
        if(config.hex) {
            landscapeDoc.setFillColor(config.hex);
            landscapeDoc.circle(legendX, legendY - 1, 2, 'F');
            landscapeDoc.setTextColor(50);
            landscapeDoc.text(config.label, legendX + 4, legendY);
            legendX += 4 + landscapeDoc.getTextWidth(config.label) + 10;
        }
    });

    addPdfFooter(landscapeDoc);
    landscapeDoc.save(`Cronograma_${year}.pdf`);
};
