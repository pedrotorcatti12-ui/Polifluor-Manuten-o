
import React, { useState, useEffect } from 'react';
import { MaintenancePlan, EquipmentType, TaskDetail, AssetCategory, MaintenanceType, Equipment, MaintenanceStatus, MaintenanceTask } from '../types';
import { CloseIcon, WrenchIcon, HomeIcon, CheckCircleIcon, LightBulbIcon } from './icons';
import { TaskDetailsSection, DetailWithId } from './TaskDetailsSection';
import { INITIAL_PREDEFINED_ACTIONS, INITIAL_PREDEFINED_MATERIALS, MONTHS } from '../constants';
import { useDataContext } from '../contexts/DataContext';

interface MaintenancePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: MaintenancePlan) => void;
    existingPlan: MaintenancePlan | null;
    equipmentTypes: EquipmentType[];
}

export const MaintenancePlanModal: React.FC<MaintenancePlanModalProps> = ({
    isOpen, onClose, onSave, existingPlan, equipmentTypes,
}) => {
    const { equipmentData } = useDataContext();
    const [description, setDescription] = useState('');
    const [equipmentTypeId, setEquipmentTypeId] = useState('');
    const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
    const [frequency, setFrequency] = useState(1);
    const [mType, setMType] = useState<MaintenanceType>(MaintenanceType.Preventive);
    const [tasks, setTasks] = useState<DetailWithId[]>([]);
    const [filterCategory, setFilterCategory] = useState<AssetCategory | 'Todos'>('Todos');
    const [startMonth, setStartMonth] = useState('Janeiro');
    const [maintainer, setMaintainer] = useState('Manutenção Interna');

    useEffect(() => {
        if (existingPlan) {
            setDescription(existingPlan.description);
            setEquipmentTypeId(existingPlan.equipment_type_id);
            setFrequency(existingPlan.frequency);
            setMType(existingPlan.maintenance_type);
            setTasks(existingPlan.tasks.map(t => ({ ...t, id: crypto.randomUUID() })));
            setSelectedEquipments(existingPlan.target_equipment_ids || []);
            setStartMonth(existingPlan.start_month || 'Janeiro');
            setMaintainer(existingPlan.default_maintainer || 'Manutenção Interna');
        } else {
            setDescription('');
            setEquipmentTypeId('');
            setFrequency(1);
            setMType(MaintenanceType.Preventive);
            setTasks([]);
            setSelectedEquipments([]);
            setStartMonth('Janeiro');
            setMaintainer('Manutenção Interna');
        }
    }, [existingPlan, isOpen]);

    const handleSelectAllVisible = () => {
        const visibleIds = filteredAssets.map(a => a.id);
        const allSelected = visibleIds.every(id => selectedEquipments.includes(id));
        if (allSelected) {
            setSelectedEquipments(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            setSelectedEquipments(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    const handleSelectByType = () => {
        if (!equipmentTypeId) return;
        const ids = equipmentData.filter(e => e.model === equipmentTypeId).map(e => e.id);
        setSelectedEquipments(prev => Array.from(new Set([...prev, ...ids])));
    };

    const filteredAssets = equipmentData.filter(eq => 
        filterCategory === 'Todos' || eq.category === filterCategory
    );

    const toggleAsset = (id: string) => {
        setSelectedEquipments(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const planData: MaintenancePlan = {
            id: existingPlan?.id || `PLANO-${Date.now()}`,
            description,
            equipment_type_id: equipmentTypeId,
            target_equipment_ids: selectedEquipments,
            frequency,
            maintenance_type: mType,
            default_maintainer: maintainer,
            start_month: startMonth,
            tasks: tasks.map(({ id, ...rest }) => rest),
        };
        onSave(planData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col border border-slate-200" onClick={e => e.stopPropagation()}>
                
                <div className="px-8 py-6 bg-slate-800 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl">
                            <WrenchIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter">Configuração de Estratégia em Massa</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Defina as regras e replique para os ativos selecionados</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><CloseIcon /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">1. Regras do Plano</h3>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Título do Planejamento</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ex: Preventiva Trimestral de Prensas" className="w-full h-12 form-input font-bold" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipo de Ativo Padrão</label>
                                    <select value={equipmentTypeId} onChange={e => setEquipmentTypeId(e.target.value)} className="w-full h-12 form-input font-bold">
                                        <option value="">Selecione um tipo...</option>
                                        {equipmentTypes.map(t => <option key={t.id} value={t.id}>{t.description}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipo de Manutenção</label>
                                    <select value={mType} onChange={e => setMType(e.target.value as any)} className="w-full h-12 form-input font-bold">
                                        {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Freq. (Meses)</label>
                                    <input type="number" value={frequency} onChange={e => setFrequency(Number(e.target.value))} required min="1" className="w-full h-12 form-input font-bold text-center" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Mês de Início</label>
                                    <select value={startMonth} onChange={e => setStartMonth(e.target.value)} className="w-full h-12 form-input font-bold">
                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <TaskDetailsSection
                                details={tasks}
                                onDetailsChange={setTasks}
                                predefinedActions={INITIAL_PREDEFINED_ACTIONS}
                                predefinedMaterials={INITIAL_PREDEFINED_MATERIALS}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">2. Ativos Vinculados ({selectedEquipments.length})</h3>
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={handleSelectByType} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase border border-blue-100 hover:bg-blue-100">Selecionar todos do Tipo</button>
                                <button type="button" onClick={handleSelectAllVisible} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase border border-slate-200">Selecionar Visíveis</button>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 h-[400px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {filteredAssets.map(eq => (
                                    <button
                                        key={eq.id}
                                        type="button"
                                        onClick={() => toggleAsset(eq.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedEquipments.includes(eq.id) ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-left">
                                                <p className="text-xs font-black text-slate-800 uppercase">{eq.id}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{eq.name}</p>
                                            </div>
                                        </div>
                                        {selectedEquipments.includes(eq.id) && <CheckCircleIcon className="w-5 h-5 text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase text-slate-400">Descartar</button>
                    <button type="submit" className="px-12 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4"/> Salvar e Replicar Cronograma
                    </button>
                </div>
            </form>
        </div>
    );
};
