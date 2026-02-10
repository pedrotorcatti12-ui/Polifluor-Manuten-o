
import React, { useState, useRef, useEffect } from 'react';
import { FlatTask, MaintenanceType } from '../types';
import { CloseIcon, ArrowPathIcon, CheckCircleIcon, ClipboardListIcon } from './icons';
import { PrintableWorkOrder } from './PrintableWorkOrder';
import { PrintableCorrectiveWorkOrder } from './PrintableCorrectiveWorkOrder';
import { useDataContext } from '../contexts/DataContext';

declare const html2canvas: any;
declare const window: any;

interface BulkPrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: FlatTask[];
    documentType: 'Preventive' | 'Predictive' | 'Corrective';
}

export const BulkPrintModal: React.FC<BulkPrintModalProps> = ({ isOpen, onClose, tasks, documentType }) => {
    const { markTasksAsPrepared } = useDataContext();
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isError, setIsError] = useState(false);
    const renderRef = useRef<HTMLDivElement>(null);
    const pdfDoc = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(-1);
            setProgress(0);
            setIsFinished(false);
            setIsError(false);
        }
    }, [isOpen]);

    const generateEmailTemplate = () => {
        const date = new Date().toLocaleDateString('pt-BR');
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const osList = tasks.map(t => 
            `[ ] O.S. #${t.task.osNumber || 'S/N'} - ${t.equipment.name} (${t.equipment.location})`
        ).join('\n');
        
        return `PROTOCOLO DE SAÍDA DE O.S. - MANUTENÇÃO\nData: ${date} às ${time}\n\nPrezados,\n\nSeguem as Ordens de Serviço impressas e encaminhadas para execução em campo:\n\n${osList}\n\nStatus no Sistema: EM CAMPO (Aguardando Retorno)\n\nAtenciosamente,\nSGMI 2.0 - Controle de Manutenção`;
    };

    const handleCopyEmail = () => {
        const text = generateEmailTemplate();
        navigator.clipboard.writeText(text);
        alert("PROTOCOLO COPIADO!\n\nCole (Ctrl+V) no seu e-mail ou WhatsApp para formalizar a entrega.");
    };

    const startProcess = async () => {
        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('Bibliotecas de impressão não carregadas. Verifique a internet.');
            return;
        }
        const { jsPDF } = window.jspdf;
        pdfDoc.current = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        setCurrentIndex(0);
        processNext(0);
    };

    const processNext = async (index: number) => {
        if (index >= tasks.length) {
            finishProcess();
            return;
        }

        setTimeout(async () => {
            try {
                const element = renderRef.current;
                if (!element) throw new Error("Falha no renderizador");

                const canvas = await html2canvas(element, { scale: 2.5, useCORS: true, logging: false });
                const imgData = canvas.toDataURL('image/png');
                const pdf = pdfDoc.current;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                if (index > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
                const nextIdx = index + 1;
                setCurrentIndex(nextIdx);
                setProgress(Math.round((nextIdx / tasks.length) * 100));
                processNext(nextIdx);
            } catch (err) {
                console.error("Erro no lote:", err);
                setIsError(true);
            }
        }, 300); // Delay para renderização do React
    };

    const finishProcess = () => {
        const fileName = `LOTE_${documentType.toUpperCase()}_${new Date().getTime()}.pdf`;
        pdfDoc.current.save(fileName);
        
        // AQUI: Atualiza o banco de dados mudando status para "Em Campo"
        const keys = tasks.map(t => t.key);
        markTasksAsPrepared(keys);
        
        setIsFinished(true);
    };

    if (!isOpen) return null;

    // Helper para determinar se a tarefa atual deve usar o layout corretivo
    const isCurrentTaskCorrective = () => {
        if (currentIndex < 0 || currentIndex >= tasks.length) return false;
        const type = tasks[currentIndex].task.type;
        return type === MaintenanceType.Corrective || type === MaintenanceType.Predial || type === MaintenanceType.Melhoria;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
                <div className="p-6 text-center">
                    {!isFinished && !isError && currentIndex === -1 && (
                        <>
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardListIcon className="w-8 h-8"/>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Imprimir Lote ({tasks.length})</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                1. Gera PDF único com todas as O.S.<br/>
                                2. Muda status para <strong>"EM CAMPO"</strong>.<br/>
                                3. Gera protocolo de e-mail.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 py-3 text-xs font-black uppercase text-gray-400 hover:text-gray-600">Cancelar</button>
                                <button onClick={startProcess} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 transition-all">
                                    Confirmar e Imprimir
                                </button>
                            </div>
                        </>
                    )}

                    {currentIndex >= 0 && !isFinished && !isError && (
                        <div className="py-8">
                            <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
                            <h3 className="text-lg font-black text-gray-900 uppercase">Processando...</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">O.S. {currentIndex + 1} de {tasks.length}</p>
                            <div className="mt-8 w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {isFinished && (
                        <div className="py-6 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-10 h-10"/>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase">Sucesso!</h3>
                            <p className="text-sm text-gray-500 mt-1 mb-6">Status atualizado para <strong>EM CAMPO</strong>.</p>
                            
                            <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Protocolo de Entrega (E-mail)</p>
                                    <button 
                                        onClick={handleCopyEmail}
                                        className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                                    >
                                        Copiar Texto
                                    </button>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono bg-white p-2 rounded border border-slate-100 h-24 overflow-y-auto">
                                    {generateEmailTemplate()}
                                </div>
                            </div>

                            <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-gray-800">
                                Fechar Janela
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Renderizador Oculto para o PDF */}
            <div className="fixed top-0 left-0 pointer-events-none opacity-0 -z-50">
                <div ref={renderRef} className="bg-white" style={{ width: '210mm' }}>
                    {currentIndex >= 0 && currentIndex < tasks.length && (
                        isCurrentTaskCorrective() ? (
                            <PrintableCorrectiveWorkOrder 
                                taskData={tasks[currentIndex]} 
                                osNumber={tasks[currentIndex].task.osNumber || '0000'} 
                            />
                        ) : (
                            <PrintableWorkOrder 
                                taskData={tasks[currentIndex]} 
                                editedOsNumber={tasks[currentIndex].task.osNumber || '0000'} 
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
