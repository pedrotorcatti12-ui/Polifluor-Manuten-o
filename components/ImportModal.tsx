
import React, { useState, useCallback } from 'react';
// FIX: Corrected import paths will be resolved by the new types.ts
import { Equipment, MaintenanceStatus, MaintenanceTask, MaintenanceType, AssetCategory } from '../types';
import { MONTHS } from '../constants';
import { CloseIcon } from './icons';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Equipment[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
            setError('');
            setSuccessMessage('');
        }
    };

    const handleImport = useCallback(() => {
        if (!file) {
            setError('Por favor, selecione um arquivo CSV.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const updatedData = parseCSV(text);
                onImport(updatedData);
                setSuccessMessage(`Importação bem-sucedida! ${updatedData.length} registros de equipamento atualizados.`);
                setTimeout(onClose, 2000);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar o arquivo.');
            }
        };
        reader.onerror = () => {
             setError('Não foi possível ler o arquivo.');
        }
        reader.readAsText(file);
    }, [file, onImport, onClose]);

    const parseCSV = (csvText: string): Equipment[] => {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['Equipamento ID', 'Nome do Equipamento', 'Mês', 'Status'];
        
        if (!requiredHeaders.every(h => headers.includes(h))) {
            throw new Error('Cabeçalhos ausentes ou incorretos no CSV. Necessário: ' + requiredHeaders.join(', '));
        }

        const dataByEquipment: { [id: string]: { name: string, schedule: { [month: string]: Partial<MaintenanceTask> } } } = {};

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const entry: { [key: string]: string } = {};
            headers.forEach((header, index) => {
                entry[header] = values[index]?.trim().replace(/"/g, '');
            });

            const id = entry['Equipamento ID'];
            const name = entry['Nome do Equipamento'];
            const month = entry['Mês']?.toUpperCase();
            const status = entry['Status'] as MaintenanceStatus;

            if (!id || !name || !month || !status) continue;
            
            if (!dataByEquipment[id]) {
                dataByEquipment[id] = { name, schedule: {} };
            }
            dataByEquipment[id].schedule[month] = {
                status: status,
                type: entry['Tipo'] as MaintenanceType || null,
                description: entry['Descrição'] || '',
            };
        }
        
        return Object.entries(dataByEquipment).map(([id, data]) => ({
            id,
            name: data.name,
            location: '', // Location can be added later
            category: AssetCategory.Industrial,
            status: 'Ativo',
            // FIX: Added required is_critical property
            is_critical: false,
            schedule: MONTHS.map((month): MaintenanceTask => {
                const taskData = data.schedule[month.toUpperCase()];
                // Assuming imported data is for the current year as it's not specified in the CSV.
                return {
                    id: crypto.randomUUID(),
                    year: new Date().getFullYear(),
                    month,
                    status: taskData?.status || MaintenanceStatus.None,
                    type: taskData?.type || null,
                    description: taskData?.description || '',
                    details: [],
                };
            }),
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 relative border border-gray-600" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon />
                </button>
                <h2 className="text-xl font-bold text-white mb-2">Importar Cronograma de CSV</h2>
                <p className="text-sm text-gray-400 mb-4">Selecione um arquivo CSV para atualizar os dados de manutenção. O arquivo substituirá os dados existentes.</p>
                
                <div className="mt-4">
                    <label className="block w-full px-4 py-6 border-2 border-dashed border-gray-600 rounded-md text-center cursor-pointer hover:border-blue-500 hover:bg-gray-700/50">
                        <span className="block text-sm text-gray-400">{file ? file.name : 'Clique para selecionar um arquivo CSV'}</span>
                        <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                {successMessage && <p className="mt-4 text-sm text-green-500">{successMessage}</p>}

                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold text-sm hover:bg-gray-500 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleImport} disabled={!file} className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        Importar Arquivo
                    </button>
                </div>
            </div>
        </div>
    );
};