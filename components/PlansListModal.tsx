
import React, { useState } from 'react';
import { MaintenancePlan, EquipmentType } from '../types';
import { CloseIcon, EditIcon, PlusIcon, DeleteIcon, ArrowPathIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';
import { MONTHS } from '../constants';

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
  const { handleBulkReprogramPlans } = useDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [reprogramFromMonth, setReprogramFromMonth] = useState('Janeiro');
  const [reprogramToMonth, setReprogramToMonth] = useState('Fevereiro');
  const [reprogramTypeId, setReprogramTypeId] = useState('Todos');

  if (!isOpen) return null;

  const handleBulkReprogram = () => {
      if (reprogramFromMonth === reprogramToMonth) {
          alert("O mês de origem e destino não podem ser os mesmos.");
          return;
      }
      if (window.confirm(`Tem certeza que deseja mover todos os planos de '${reprogramFromMonth}' para '${reprogramToMonth}' para o tipo selecionado?`)) {
          handleBulkReprogramPlans(reprogramFromMonth, reprogramToMonth, reprogramTypeId);
      }
  };

  const filteredPlans = plans.filter(p => {
    const term = searchTerm.toLowerCase();
    const description = (p.description || '').toLowerCase();
    const typeId = (p.equipmentTypeId || '').toLowerCase();
    
    return description.includes(term) || typeId.includes(term);
  });

  const getTypeName = (id: string) => {
    if (!id) return 'N/A';
    const type = equipmentTypes.find(t => t.id === id);
    return type ? type.description : id;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl p-6 m-4 relative border border-gray-200 dark:border-gray-600 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <CloseIcon />
        </button>

        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Planos de Manutenção</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie a frequência e as tarefas padrão de cada tipo de equipamento.</p>
            </div>
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm">
                <PlusIcon className="w-4 h-4" /> Novo Plano
            </button>
        </div>
        
        <div className="mb-4 p-4 bg-slate-50 dark:bg-gray-700/50 rounded-lg border border-slate-200 dark:border-gray-600">
            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-300 mb-3 flex items-center gap-2"><ArrowPathIcon className="w-4 h-4" /> Reprogramação Rápida</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-1">
                    <label className="text-[10px] font-bold">Mês de Origem</label>
                    <select value={reprogramFromMonth} onChange={e => setReprogramFromMonth(e.target.value)} className="form-input w-full text-xs">
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="text-[10px] font-bold">Mês de Destino</label>
                    <select value={reprogramToMonth} onChange={e => setReprogramToMonth(e.target.value)} className="form-input w-full text-xs">
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="text-[10px] font-bold">Aplicar para o Tipo de Ativo</label>
                    <select value={reprogramTypeId} onChange={e => setReprogramTypeId(e.target.value)} className="form-input w-full text-xs">
                        <option value="Todos">Todos os Tipos</option>
                        {equipmentTypes.map(t => <option key={t.id} value={t.id}>{t.description}</option>)}
                    </select>
                </div>
                <button onClick={handleBulkReprogram} className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-700">Reprogramar em Lote</button>
            </div>
        </div>

        <div className="mb-4">
            <input 
                type="text" 
                placeholder="Buscar plano por descrição ou tipo..." 
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mês Início</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Frequência</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">Tarefas Principais</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPlans.map(plan => (
                        <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white align-top">{plan.description}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 align-top">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
                                    {getTypeName(plan.equipmentTypeId)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold align-top">{plan.startMonth}</td>
                            <td className="px-6 py-4 text-sm text-center align-top">
                                <span className="font-bold text-gray-800 dark:text-white">{plan.frequency}</span>
                                <span className="text-gray-500 text-xs ml-1">meses</span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500 align-top">
                                <ul className="list-disc pl-4 space-y-1">
                                    {(plan.tasks || []).slice(0, 3).map((t, idx) => (
                                        <li key={idx} className="truncate max-w-[200px]" title={t.action}>{t.action}</li>
                                    ))}
                                    {(plan.tasks || []).length > 3 && <li className="text-slate-400 italic">...e mais {(plan.tasks?.length || 0) - 3} itens</li>}
                                </ul>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium align-top">
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
