import React, { useState, useEffect } from 'react';
import { MaintenancePlan, EquipmentType, TaskDetail } from '../types';
import { CloseIcon, PlusIcon, DeleteIcon } from './icons';

interface MaintenancePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Adjust onSave signature to allow for the optional applyToAll flag, matching its usage in PlanningPage.
    onSave: (plan: MaintenancePlan, applyToAll: boolean) => void;
    existingPlan: MaintenancePlan | null;
    equipmentTypes: EquipmentType[];
}

export const MaintenancePlanModal: React.FC<MaintenancePlanModalProps> = ({
    isOpen, onClose, onSave, existingPlan, equipmentTypes,
}) => {
    const [description, setDescription] = useState('');
    const [equipmentTypeId, setEquipmentTypeId] = useState('');
    const [frequency, setFrequency] = useState(1);
    const [tasks, setTasks] = useState<TaskDetail[]>([]);

    useEffect(() => {
        if (existingPlan) {
            setDescription(existingPlan.description);
            setEquipmentTypeId(existingPlan.equipmentTypeId);
            setFrequency(existingPlan.frequency);
            setTasks(existingPlan.tasks || []);
        } else {
            setDescription('');
            setEquipmentTypeId('');
            setFrequency(1);
            setTasks([]);
        }
    }, [existingPlan, isOpen]);
    
    const handleTaskChange = (index: number, value: string) => {
        const newTasks = [...tasks];
        newTasks[index].action = value;
        setTasks(newTasks);
    };

    const addTask = () => setTasks([...tasks, { action: '' }]);
    const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const planData: MaintenancePlan = {
            id: existingPlan?.id || '',
            description,
            equipmentTypeId,
            frequency,
            tasks,
        };
        // NOTE: The modal itself doesn't offer the 'applyToAll' option, so we default to false.
        // The type signature is widened to accommodate the call from PlanningPage.
        onSave(planData, false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">{existingPlan ? 'Editar Plano' : 'Novo Plano de Manutenção'}</h2>
                    <button type="button" onClick={onClose}><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição do Plano</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ex: Preventiva Trimestral de Prensas" className="w-full mt-1 form-input" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Equipamento</label>
                            <select value={equipmentTypeId} onChange={e => setEquipmentTypeId(e.target.value)} required className="w-full mt-1 form-input">
                                <option value="">Selecione um tipo...</option>
                                {equipmentTypes.map(t => <option key={t.id} value={t.id}>{t.description}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Frequência (em meses)</label>
                            <input type="number" value={frequency} onChange={e => setFrequency(Number(e.target.value))} required min="1" className="w-full mt-1 form-input" />
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Checklist de Tarefas</label>
                      <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-md border">
                        {tasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Descreva a tarefa"
                              value={task.action}
                              onChange={(e) => handleTaskChange(index, e.target.value)}
                              className="w-full form-input"
                            />
                            <button type="button" onClick={() => removeTask(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={addTask} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
                          <PlusIcon className="w-4 h-4" /> Adicionar Tarefa
                        </button>
                      </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t bg-slate-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Salvar Plano</button>
                </div>
            </form>
        </div>
    );
};