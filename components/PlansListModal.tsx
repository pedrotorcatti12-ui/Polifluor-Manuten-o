
import React, { useState } from 'react';
import { MaintenancePlan, EquipmentType } from '../types';
import { CloseIcon, EditIcon, PlusIcon, DeleteIcon } from './icons';

interface PlansListModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: MaintenancePlan[];
  equipmentTypes: EquipmentType[];
  onEdit: (plan: MaintenancePlan) => void;
  onAdd: () => void;
  onDelete: (plan: MaintenancePlan) => void;
}

export const PlansListModal: React.FC<PlansListModalProps> = ({ 
    isOpen, onClose, plans, equipmentTypes, onEdit, onAdd, onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredPlans = plans.filter(p => {
    const term = searchTerm.toLowerCase();
    const description = (p.description || '').toLowerCase();
    // Support both snake_case and camelCase property names during transition
    const typeId = (p.equipment_type_id || (p as any).equipmentTypeId || '').toLowerCase();
    
    return description.includes(term) || typeId.includes(term);
  });

  const getTypeName = (id: string) => {
      const type = equipmentTypes.find(t => t.id === id);
      return type ? type.description : id;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 m-4 relative border border-gray-200 dark:border-gray-600 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <CloseIcon />
        </button>

        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Planos de Manutenção</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie a frequência e as tarefas padrão de cada tipo de equipamento.</p>
            </div>
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm">
                <PlusIcon className="w-4 h-4" /> Novo Plano
            </button>
        </div>

        <div className="mb-4">
            <input 
                type="text" 
                placeholder="Buscar plano..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full form-input"
            />
        </div>

        <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição do Plano</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aplica-se a (Tipo)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Frequência</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarefas</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPlans.map(plan => (
                        <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{plan.description}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
                                    {getTypeName(plan.equipment_type_id || (plan as any).equipmentTypeId)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                                <span className="font-bold text-gray-800 dark:text-white">{plan.frequency}</span>
                                <span className="text-gray-500 text-xs ml-1">meses</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center text-gray-500">
                                {plan.tasks?.length || 0} itens
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex justify-center items-center space-x-2">
                                    <button onClick={() => onEdit(plan)} className="p-2 text-gray-500 hover:text-blue-500" title="Editar Periodicidade e Tarefas">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onDelete(plan)} className="p-2 text-gray-500 hover:text-red-500" title="Excluir Plano">
                                        <DeleteIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredPlans.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Nenhum plano encontrado.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
