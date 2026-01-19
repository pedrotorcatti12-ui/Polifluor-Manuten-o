import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { EquipmentType } from '../types';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons';
import { EquipmentTypeModal } from '../components/EquipmentTypeModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useDataContext } from '../contexts/DataContext';
import { useDebounce } from '../hooks/useDebounce';

export const EquipmentTypesPage: React.FC = () => {
    const { equipmentTypes, setEquipmentTypes, equipmentData } = useDataContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<EquipmentType | null>(null);
    const [deletingType, setDeletingType] = useState<EquipmentType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredEquipmentTypes = useMemo(() => {
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        if (!lowercasedTerm) {
            return equipmentTypes;
        }
        return equipmentTypes.filter(type =>
            type.description.toLowerCase().includes(lowercasedTerm)
        );
    }, [equipmentTypes, debouncedSearchTerm]);


    const openModal = (type: EquipmentType | null = null) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingType(null);
        setIsModalOpen(false);
    };

    const handleSave = (type: EquipmentType) => {
        if (editingType) {
            setEquipmentTypes(prev => prev.map(t => t.id === type.id ? type : t));
        } else {
            const newId = type.description.toUpperCase().replace(/\s+/g, '_');
            if (equipmentTypes.some(t => t.id === newId)) {
                alert(`Erro: O ID gerado "${newId}" já existe. Por favor, escolha uma descrição diferente.`);
                return;
            }
            const newType = { ...type, id: newId };
            setEquipmentTypes(prev => [...prev, newType].sort((a,b) => a.description.localeCompare(b.description)));
        }
        closeModal();
    };
    
    const handleDelete = () => {
        if (!deletingType) return;
        setEquipmentTypes(prev => prev.filter(t => t.id !== deletingType.id));
        setDeletingType(null);
    };
    
    const handleDeleteClick = (type: EquipmentType) => {
        const isInUse = equipmentData.some(eq => eq.model === type.id);
        if (isInUse) {
            alert(`Não é possível excluir o tipo "${type.description}" pois ele está sendo utilizado por um ou mais equipamentos. Altere o tipo dos equipamentos antes de excluir.`);
            return;
        }
        setDeletingType(type);
    };

    return (
        <>
            <Header
                title="Cadastro de Tipo de Equipamentos"
                subtitle="Gerencie os tipos de equipamentos utilizados no sistema."
                actions={
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm">
                        <PlusIcon />
                        Adicionar Tipo
                    </button>
                }
            />

            <div className="mt-4">
                 <input
                    type="text"
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 form-input"
                />
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredEquipmentTypes.length > 0 ? (
                            filteredEquipmentTypes.map(type => (
                                <tr key={type.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{type.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => openModal(type)} className="p-2 text-gray-500 hover:text-blue-500" title="Editar"><EditIcon /></button>
                                            <button onClick={() => handleDeleteClick(type)} className="p-2 text-gray-500 hover:text-red-500" title="Excluir"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={2} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    {searchTerm 
                                        ? `Nenhum resultado para "${searchTerm}"`
                                        : "Nenhum tipo de equipamento cadastrado."
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <EquipmentTypeModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleSave}
                    existingType={editingType}
                />
            )}

            {deletingType && (
                <ConfirmationModal
                    isOpen={!!deletingType}
                    onClose={() => setDeletingType(null)}
                    onConfirm={handleDelete}
                    title="Confirmar Exclusão"
                    message={`Tem certeza que deseja excluir o tipo "${deletingType.description}"?`}
                />
            )}
        </>
    );
};