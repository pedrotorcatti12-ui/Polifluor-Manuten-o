
import React, { useState, useRef, useEffect } from 'react';
import { FlatTask } from '../types';
import { CloseIcon, DownloadIcon, ArrowPathIcon, CheckCircleIcon, ClipboardListIcon } from './icons';
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
        const osList = tasks.map(t => `• O.S. #${t.task.osNumber || '---'} - Equipamento: ${t.equipment.id} (${t.equipment.name})`).join('\n');
        
        return `Prezado Gestor,\n\nInformamos que as seguintes Ordens de Serviço acabam de ser emitidas e enviadas para execução em campo:\n\n${osList}\n\nData de Emissão: ${date}\nStatus: EM CAMPO\n\nAtenciosamente,\nSistema SGMI 2.0`;
    };

    const handleCopyEmail = () => {
        const text = generateEmailTemplate();
        navigator.clipboard.writeText(text);
        alert("Modelo de e-mail copiado para a área de transferência!");
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
        }, 300);
    };

    const finishProcess = () => {
        const fileName = `LOTE_${documentType.toUpperCase()}_${new Date().getTime()}.pdf`;
        pdfDoc.current.save(fileName);
        setIsFinished(true);
        
        const keys = tasks.map(t => t.key);
        markTasksAsPrepared(keys);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
                <div className="p-6 text-center">
                    {!isFinished && !isError && currentIndex === -1 && (
                        <>
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardListIcon className="w-8 h-8"/>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Preparar Lote</h2>
                            <p className="text-sm text-gray-500 mb-6">Você selecionou <strong>{tasks.length} documentos</strong>. Ao baixar, o sistema os marcará como 'Em Campo' no status oficial.</p>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 py-3 text-xs font-black uppercase text-gray-400 hover:text-gray-600">Cancelar</button>
                                <button onClick={startProcess} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 transition-all">Iniciar Geração</button>
                            </div>
                        </>
                    )}

                    {currentIndex >= 0 && !isFinished && !isError && (
                        <div className="py-8">
                            <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
                            <h3 className="text-lg font-black text-gray-900 uppercase">Gerando O.S.</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">Processando Documento {currentIndex + 1} de {tasks.length}</p>
                            <div className="mt-8 w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {isFinished && (
                        <div className="py-8 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-10 h-10"/>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase">Documentos Lançados</h3>
                            <p className="text-sm text-gray-500 mt-2 mb-6">Lote concluído e movido para 'Em Campo'.</p>
                            
                            <div className="bg-blue-50 p-4 rounded-xl mb-6 text-left border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Comunicação Tática</p>
                                <button 
                                    onClick={handleCopyEmail}
                                    className="w-full py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-[10px] font-black uppercase shadow-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Copiando Template de E-mail p/ Gestor
                                </button>
                            </div>

                            <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase shadow-lg">Fechar</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed top-[10000px] left-0 pointer-events-none opacity-0">
                <div ref={renderRef} className="bg-white" style={{ width: '210mm' }}>
                    {currentIndex >= 0 && currentIndex < tasks.length && (
                        documentType === 'Corrective' ? (
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
