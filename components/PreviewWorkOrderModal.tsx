// components/PreviewWorkOrderModal.tsx
import React, { useState, useRef } from 'react';
import { FlatTask, MaintenanceType } from '../types';
import { PrintableWorkOrder } from './PrintableWorkOrder';
import { CloseIcon, DownloadIcon, ArrowPathIcon } from './icons';

declare const html2canvas: any;
declare const window: any;

interface PreviewWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskData: FlatTask;
}

const RadioGroup: React.FC<{
    label: string;
    name: string;
    value: 'Sim' | 'Não' | '';
    onChange: (value: 'Sim' | 'Não') => void;
}> = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
        <div className="flex gap-4">
            <label className="flex items-center text-sm">
                <input type="radio" name={name} value="Sim" checked={value === 'Sim'} onChange={() => onChange('Sim')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                <span className="ml-2">Sim</span>
            </label>
            <label className="flex items-center text-sm">
                <input type="radio" name={name} value="Não" checked={value === 'Não'} onChange={() => onChange('Não')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                <span className="ml-2">Não</span>
            </label>
        </div>
    </div>
);

export const PreviewWorkOrderModal: React.FC<PreviewWorkOrderModalProps> = ({ isOpen, onClose, taskData }) => {
    const [editedOsNumber, setEditedOsNumber] = useState(taskData.task.osNumber || '0001');
    const [partReplaced, setPartReplaced] = useState<'Sim' | 'Não' | ''>('');
    const [purchasingInvolved, setPurchasingInvolved] = useState<'Sim' | 'Não' | ''>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const printableContentRef = useRef<HTMLDivElement>(null);

    const isPredictive = taskData.task.type === MaintenanceType.Predictive;

    if (!isOpen) return null;

    const handleGeneratePdf = () => {
        const contentToPrint = printableContentRef.current;
        if (!contentToPrint) {
            alert("Erro: O conteúdo para impressão não foi encontrado.");
            return;
        }

        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
          alert('As bibliotecas de geração de PDF (jsPDF, html2canvas) não puderam ser carregadas. Verifique sua conexão com a internet e tente novamente.');
          return;
        }

        setIsGenerating(true);

        html2canvas(contentToPrint, { scale: 3, useCORS: true })
          .then((canvas: HTMLCanvasElement) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const fileName = `OS_${isPredictive ? 'Preditiva' : 'Preventiva'}_${editedOsNumber}.pdf`;
            pdf.save(fileName);
            
            setIsGenerating(false);
            onClose();
          })
          .catch((err: any) => {
            console.error("Error generating PDF:", err);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, verifique o console.");
            setIsGenerating(false);
          });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print" onClick={onClose}>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl p-4 m-4 relative border border-gray-200 dark:border-gray-700 max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pré-visualização do Documento</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-1 flex mt-4 gap-4 overflow-hidden">
                    {/* Preview Panel */}
                    <div className="flex-1 overflow-y-auto bg-gray-300 dark:bg-gray-900 p-4 rounded-md">
                        <div ref={printableContentRef} className="mx-auto" style={{ width: '210mm', transformOrigin: 'top center', transform: 'scale(0.95)' }}>
                            <PrintableWorkOrder
                                taskData={taskData}
                                editedOsNumber={editedOsNumber}
                                partReplaced={partReplaced}
                                purchasingInvolved={purchasingInvolved}
                            />
                        </div>
                    </div>
                    {/* Controls Panel */}
                    <div className="w-64 flex-shrink-0 space-y-6">
                        <div>
                            <label htmlFor="os-number-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nº da O.S.
                            </label>
                            <input
                                type="text"
                                id="os-number-edit"
                                value={editedOsNumber}
                                onChange={e => setEditedOsNumber(e.target.value)}
                                className="w-full form-input"
                            />
                        </div>

                        {!isPredictive && (
                            <>
                                <RadioGroup
                                    label="Houve substituição de peça?"
                                    name="partReplaced"
                                    value={partReplaced}
                                    onChange={setPartReplaced}
                                />
                                 <RadioGroup
                                    label="Interação com Compras?"
                                    name="purchasingInvolved"
                                    value={purchasingInvolved}
                                    onChange={setPurchasingInvolved}
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button 
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 w-48 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <DownloadIcon />}
                        {isGenerating ? 'Gerando...' : 'Baixar PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};