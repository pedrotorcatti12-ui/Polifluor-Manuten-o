
import React, { useState, useEffect } from 'react';
import { EquipmentType } from '../types';
import { CloseIcon } from './icons';

interface EquipmentTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: EquipmentType) => void;
    existingType: EquipmentType | null;
}

export const EquipmentTypeModal: React.FC<EquipmentTypeModalProps> = ({ isOpen, onClose, onSave, existingType }) => {
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (existingType) {
            setDescription(existingType.description);
        } else {
            setDescription('');
        }
    }, [existingType]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const typeData: EquipmentType = {
            id: existingType?.id || '',
            description,
        };
        onSave(typeData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 relative border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                    <CloseIcon />
                </button>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {existingType ? 'Editar Tipo de Equipamento' : 'Adicionar Novo Tipo'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Preencha a descrição do tipo de equipamento.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="type-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Descrição
                        </label>
                        <input
                            type="text"
                            id="type-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    );
};
