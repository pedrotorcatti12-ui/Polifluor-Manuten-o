// reports/pdfUtils.ts
declare const window: any;

export const addPdfHeader = (doc: any, title: string, dateRange: { start: string, end: string }) => {
    const startDate = new Date(dateRange.start).toLocaleDateString('pt-BR');
    const endDate = new Date(dateRange.end).toLocaleDateString('pt-BR');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo Polifluor
    doc.setFillColor(211, 47, 47); // #D32F2F
    doc.rect(14, 15, 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(10);
    doc.text('POLIFLUOR', 16, 20.5);

    // Unidade/Sistema
    doc.setTextColor(100);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('SGMI 2.0 - UNIDADE INDUSTRIAL', pageWidth - 14, 20, { align: 'right' });

    // Barra de Título
    doc.setFillColor(30, 41, 59); // slate-800, a navy blue
    doc.rect(14, 28, pageWidth - 28, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), pageWidth / 2, 34.5, { align: 'center' });

    // Período de análise
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(`Período: ${startDate} a ${endDate} | Emissão: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 45, { align: 'center' });
};

export const addPdfFooter = (doc: any) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150);

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Linha do rodapé
        doc.setDrawColor(220, 220, 220);
        doc.line(14, doc.internal.pageSize.getHeight() - 15, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 15);
        
        // Texto
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
        doc.text(
            `SGMI 2.0 - Emitido em: ${new Date().toLocaleString('pt-BR')}`,
            doc.internal.pageSize.getWidth() - 14,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'right' }
        );
    }
};