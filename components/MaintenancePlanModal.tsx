import React, { useState, useEffect } from 'react';
import { MaintenancePlan, EquipmentType, TaskDetail, MaintenanceType, Equipment } from '../types';
import { CloseIcon, PlusIcon, DeleteIcon, WrenchIcon, TargetIcon, ScheduleIcon } from './icons';

interface MaintenancePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: MaintenancePlan, applyToAll: boolean) => void;
    existingPlan: MaintenancePlan | null;
    equipmentTypes: EquipmentType[];
    equipmentData: Equipment[]; // Adicionado para seleção específica
}

// Lista de tarefas comuns para sugestão
const COMMON_TASKS = [
    "Limpeza geral do equipamento",
    "Reaperto de contatos elétricos",
    "Verificação do nível de óleo hidráulico",
    "Verificação do nível de óleo lubrificante",
    "Lubrificação de barramentos e fusos",
    "Medição de corrente do motor principal",
    "Verificar tensão das correias",
    "Limpeza de filtros de ar do painel elétrico",
    "Inspeção de vazamentos (óleo, ar, água)",
    "Verificar funcionamento de botões de emergência",
    "Inspeção de mangueiras e conexões",
    "Calibração de sensores de temperatura",
    "Teste de funcionamento de chaves de segurança"
];

export const MaintenancePlanModal: React.FC<MaintenancePlanModalProps> = ({
    isOpen, onClose, onSave, existingPlan, equipmentTypes, equipmentData
}) => {
    const [description, setDescription] = useState('');
    const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>(MaintenanceType.Preventive);
    const [frequency, setFrequency] = useState(1);
    const [startMonth, setStartMonth] = useState('Janeiro');
    const [tasks, setTasks] = useState<TaskDetail[]>([]);
    
    // Novo sistema de alvo
    const [targetType, setTargetType] = useState<'byType' | 'specific'>('byType');
    const [equipmentTypeId, setEquipmentTypeId] = useState('');
    const [targetEquipmentIds, setTargetEquipmentIds] = useState<string[]>([]);

    useEffect(() => {
        if (existingPlan) {
            setDescription(existingPlan.description);
            setMaintenanceType(existingPlan.maintenanceType || MaintenanceType.Preventive);
            setFrequency(existingPlan.frequency);
            setStartMonth(existingPlan.startMonth || 'Janeiro');
            setTasks(existingPlan.tasks || []);
            setEquipmentTypeId(existingPlan.equipmentTypeId);
            setTargetEquipmentIds(existingPlan.targetEquipmentIds || []);
            if(existingPlan.targetEquipmentIds && existingPlan.targetEquipmentIds.length > 0) {
                setTargetType('specific');
            } else {
                setTargetType('byType');
            }
        } else {
            // Resetar para um novo plano
            setDescription('');
            setMaintenanceType(MaintenanceType.Preventive);
            setFrequency(1);
            setStartMonth('Janeiro');
            setTasks([]);
            setTargetType('byType');
            setEquipmentTypeId('');
            setTargetEquipmentIds([]);
        }
    }, [existingPlan, isOpen]);
    
    const handleTaskChange = (index: number, value: string) => {
        const newTasks = [...tasks];
        newTasks[index].action = value;
        setTasks(newTasks);
    };

    const addTask = () => setTasks([...tasks, { action: '' }]);
    const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));
    
    const handleTargetEquipmentToggle = (eqId: string) => {
        setTargetEquipmentIds(prev => 
            prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
        );
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const planData: MaintenancePlan = {
            id: existingPlan?.id || crypto.randomUUID(),
            description,
            maintenanceType,
            frequency,
            startMonth,
            tasks,
            equipmentTypeId: targetType === 'byType' ? equipmentTypeId : '',
            targetEquipmentIds: targetType === 'specific' ? targetEquipmentIds : []
        };
        onSave(planData, false);
    };

    const sortedEquipment = [...equipmentData].sort((a,b) => a.id.localeCompare(b.id));

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-slate-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{existingPlan ? 'Editar Estratégia' : 'Nova Estratégia de Manutenção'}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cérebro do Planejamento (PCM)</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* Linha 1: Descrição e Tipo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Descrição da Estratégia *</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ex: Preventiva Elétrica Semestral - Prensas" className="w-full form-input h-12 font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Natureza da Manutenção *</label>
                            <select value={maintenanceType} onChange={e => setMaintenanceType(e.target.value as MaintenanceType)} required className="w-full form-input h-12 font-bold">
                                <option value={MaintenanceType.Preventive}>Preventiva (Baseada no Tempo)</option>
                                <option value={MaintenanceType.Predictive}>Preditiva (Baseada na Condição)</option>
                                <option value={MaintenanceType.RevisaoPeriodica}>Revisão Periódica (Parada Programada)</option>
                                <option value={MaintenanceType.Melhoria}>Melhoria Contínua</option>
                            </select>
                        </div>
                    </div>

                     {/* Linha 2: Agendamento e Alvo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                <ScheduleIcon className="w-4 h-4 text-slate-400"/>
                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Agendamento</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-bold text-slate-500 block">Frequência *</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={frequency} onChange={e => setFrequency(Math.max(1, Number(e.target.value)))} required min="1" className="w-full form-input h-10 font-bold" />
                                        <span className="text-sm font-bold text-slate-500">Meses</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-slate-500 block">Mês de Início *</label>
                                    <select value={startMonth} onChange={e => setStartMonth(e.target.value)} required className="w-full form-input h-10 font-bold">
                                        {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <div className="flex items-center gap-2 mb-3">
                                <TargetIcon className="w-4 h-4 text-slate-400"/>
                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Alvo do Plano</h3>
                            </div>
                            <div className="flex gap-2 bg-slate-200 p-1 rounded-lg">
                                <button type="button" onClick={() => setTargetType('byType')} className={`flex-1 text-center text-[9px] font-black uppercase p-2 rounded ${targetType === 'byType' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Por Tipo</button>
                                <button type="button" onClick={() => setTargetType('specific')} className={`flex-1 text-center text-[9px] font-black uppercase p-2 rounded ${targetType === 'specific' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Específico</button>
                            </div>
                             {targetType === 'byType' ? (
                                <select value={equipmentTypeId} onChange={e => setEquipmentTypeId(e.target.value)} required={targetType === 'byType'} className="w-full mt-2 form-input font-bold text-sm">
                                    <option value="">Selecione uma família de ativos...</option>
                                    {equipmentTypes.map(t => <option key={t.id} value={t.id}>{t.description}</option>)}
                                </select>
                             ) : (
                                 <div className="mt-2 p-2 bg-white border border-slate-200 rounded-lg max-h-24 overflow-y-auto custom-scrollbar">
                                     {sortedEquipment.map(eq => (
                                         <label key={eq.id} className="flex items-center gap-2 p-1 text-xs font-bold rounded hover:bg-slate-50">
                                             <input type="checkbox" checked={targetEquipmentIds.includes(eq.id)} onChange={() => handleTargetEquipmentToggle(eq.id)} className="w-4 h-4 rounded" />
                                             {eq.id} - <span className="text-slate-500 truncate">{eq.name}</span>
                                         </label>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Linha 3: Checklist */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                            <WrenchIcon className="w-4 h-4 text-slate-400"/>
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Roteiro de Tarefas (Checklist)</h3>
                        </div>
                      <div className="space-y-2">
                        <datalist id="common-tasks">
                            {COMMON_TASKS.map(task => <option key={task} value={task} />)}
                        </datalist>
                        {tasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-2 group">
                            <input
                              type="text"
                              list="common-tasks"
                              placeholder="Descreva a tarefa ou escolha uma sugestão..."
                              value={task.action}
                              onChange={(e) => handleTaskChange(index, e.target.value)}
                              className="w-full form-input h-11"
                            />
                            <button type="button" onClick={() => removeTask(index)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full opacity-50 group-hover:opacity-100 transition-opacity">
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={addTask} className="mt-2 flex items-center gap-1.5 text-xs font-black text-blue-600 hover:underline uppercase">
                          <PlusIcon className="w-4 h-4" /> Adicionar Tarefa
                        </button>
                      </div>
                    </div>
                </div>

                <div className="flex justify-end p-6 border-t bg-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-400 uppercase text-xs tracking-widest">Cancelar</button>
                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700">
                        {existingPlan ? 'Atualizar Plano' : 'Salvar Plano'}
                    </button>
                </div>
            </form>
        </div>
    );
};
