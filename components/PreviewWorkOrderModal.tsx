

// components/PreviewWorkOrderModal.tsx
import React, { useState } from 'react';
import { FlatTask, MaintenanceType } from '../types';
import { PrintableWorkOrder } from './PrintableWorkOrder';
import { CloseIcon, DownloadIcon, ArrowPathIcon } from './icons';

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
    const [isPrinting, setIsPrinting] = useState(false);

    const isPredictive = taskData.task.type === MaintenanceType.Predictive;

    if (!isOpen) return null;

    const handlePrint = () => {
        setIsPrinting(true);
        // Delay to allow UI update before print dialog blocks it
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };
    
    return (
        <>
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
                        <div className="flex-1 overflow-y-auto bg-gray-300 dark:bg-gray-900 p-4 rounded-md printable-area">
                            <div className="mx-auto bg-white" style={{ width: '210mm' }}>
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
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="flex items-center justify-center gap-2 w-48 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isPrinting ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <DownloadIcon />}
                            Imprimir / Salvar PDF
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .printable-area, .printable-area * { visibility: visible !important; }
                    .printable-area {
                        position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important;
                        padding: 0 !important; margin: 0 !important; overflow: visible !important; background-color: white !important;
                    }
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 0; }
                }
            `}</style>
        </>
    );
};