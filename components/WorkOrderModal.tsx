import React, { useState, useEffect } from 'react';
import { WorkOrder, Equipment, MaintenanceStatus, MaintenanceType, TaskDetail } from '../types';
import { CloseIcon } from './icons';

interface WorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: WorkOrder) => void;
    existingOrder: WorkOrder | null;
    equipmentData: Equipment[];
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ isOpen, onClose, onSave, existingOrder, equipmentData }) => {
    const [order, setOrder] = useState<WorkOrder | null>(null);

    useEffect(() => {
        if (existingOrder) {
            setOrder(existingOrder);
        } else {
            // Create new, empty order
            setOrder({
                id: '', // Will be generated on save
                equipmentId: '',
                type: MaintenanceType.Corrective,
                status: MaintenanceStatus.Scheduled,
                scheduledDate: new Date().toISOString().slice(0, 10),
                description: '',
                checklist: [],
            });
        }
    }, [existingOrder, isOpen]);

    if (!isOpen || !order) return null;

    const handleFieldChange = (field: keyof WorkOrder, value: any) => {
        setOrder(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleChecklistItemToggle = (indexToToggle: number) => {
        if (!order || !order.checklist) return;
        const newChecklist = order.checklist.map((item, index) => 
            index === indexToToggle ? { ...item, checked: !item.checked } : item
        );
        handleFieldChange('checklist', newChecklist);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (order) {
            onSave(order);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">
                        {existingOrder ? `Ordem de Serviço #${order.id}` : 'Nova Ordem de Serviço'}
                    </h2>
                    <button type="button" onClick={onClose}><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Equipamento</label>
                            <select value={order.equipmentId} onChange={e => handleFieldChange('equipmentId', e.target.value)} required className="mt-1 w-full form-input">
                                <option value="">Selecione...</option>
                                {equipmentData.map(e => <option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Programada</label>
                            <input type="date" value={order.scheduledDate.slice(0, 10)} onChange={e => handleFieldChange('scheduledDate', e.target.value)} required className="mt-1 w-full form-input" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input type="text" value={order.description} onChange={e => handleFieldChange('description', e.target.value)} required className="mt-1 w-full form-input" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select value={order.type} onChange={e => handleFieldChange('type', e.target.value)} className="mt-1 w-full form-input">
                                {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={order.status} onChange={e => handleFieldChange('status', e.target.value)} className="mt-1 w-full form-input">
                                {Object.values(MaintenanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {order.checklist && order.checklist.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Checklist de Tarefas</h3>
                            <div className="space-y-2 p-3 bg-gray-50 rounded-md border max-h-48 overflow-y-auto">
                                {order.checklist.map((item, index) => (
                                    <label key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                                        <input type="checkbox" checked={item.checked} onChange={() => handleChecklistItemToggle(index)} className="w-5 h-5 text-blue-600 rounded" />
                                        <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.action}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Observações</label>
                        <textarea value={order.observations || ''} onChange={e => handleFieldChange('observations', e.target.value)} rows={3} className="mt-1 w-full form-input"></textarea>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t bg-slate-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                        Salvar O.S.
                    </button>
                </div>
            </form>
        </div>
    );
};
