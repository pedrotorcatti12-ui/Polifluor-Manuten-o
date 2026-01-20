
import React, { useState, useEffect, useMemo } from 'react';
import { WorkOrder, Equipment, SparePart, MaintenanceStatus, MaintenanceType, TaskDetail, CorrectiveCategory, ManHourEntry } from '../types';
import { CloseIcon, CheckCircleIcon, ClockIcon, ClipboardListIcon, ExclamationTriangleIcon, PlusIcon, DeleteIcon, ShoppingCartIcon, DocumentTextIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';

interface WorkOrderControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: WorkOrder) => void;
    existingOrder: WorkOrder | null;
    equipmentData: Equipment[];
    inventoryData: SparePart[];
    nextOSNumber: string; 
    maintainers: string[];
    requesters: string[];
}

type Tab = 'summary' | 'checklist' | 'analysis' | 'resources';

export const WorkOrderControlModal: React.FC<WorkOrderControlModalProps> = ({ isOpen, onClose, existingOrder, equipmentData, inventoryData, nextOSNumber, maintainers, requesters }) => {
    const { handleUnifiedSave, isSyncing, showToast, handlePartSave } = useDataContext();
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    
    // Core Fields
    const [id, setId] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [type, setType] = useState<MaintenanceType>(MaintenanceType.Corrective);
    const [status, setStatus] = useState<MaintenanceStatus>(MaintenanceStatus.Scheduled);
    const [scheduledDate, setScheduledDate] = useState(''); 
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [requester, setRequester] = useState('');
    const [observations, setObservations] = useState('');
    
    // Checklist
    const [checklist, setChecklist] = useState<TaskDetail[]>([]);
    
    // Corrective/Specific Fields
    const [rootCause, setRootCause] = useState('');
    const [correctiveCategory, setCorrectiveCategory] = useState<CorrectiveCategory>(CorrectiveCategory.Mechanical);
    const [machineStopped, setMachineStopped] = useState(false);
    
    // Campos para Gerador/Máquinas com Horímetro
    const [runtimeHours, setRuntimeHours] = useState('');
    const [leadTimeAlert, setLeadTimeAlert] = useState(false);

    // Resources
    const [manHours, setManHours] = useState<ManHourEntry[]>([]);
    const [materialsUsed, setMaterialsUsed] = useState<{ partId: string; quantity: number }[]>([]);

    const selectedEquipment = useMemo(() => equipmentData.find(e => e.id === equipmentId), [equipmentId, equipmentData]);
    const isCorrective = type === MaintenanceType.Corrective;

    useEffect(() => {
        if (isOpen) {
            if (existingOrder) {
                setId(existingOrder.id);
                setEquipmentId(existingOrder.equipmentId);
                setType(existingOrder.type);
                setStatus(existingOrder.status);
                setScheduledDate(existingOrder.scheduledDate ? existingOrder.scheduledDate.slice(0,16) : '');
                setEndDate(existingOrder.endDate ? existingOrder.endDate.slice(0,16) : '');
                setDescription(existingOrder.description || '');
                setRequester(existingOrder.requester || '');
                setObservations(existingOrder.observations || '');
                setChecklist(existingOrder.checklist || []);
                setRuntimeHours(existingOrder.miscNotes?.match(/Horímetro: (\d+)/)?.[1] || '');
                
                setRootCause(existingOrder.rootCause || '');
                setCorrectiveCategory(existingOrder.correctiveCategory || CorrectiveCategory.Mechanical);
                setMachineStopped(existingOrder.machineStopped || false);
                
                setManHours(existingOrder.manHours || []);
                setMaterialsUsed(existingOrder.materialsUsed || []);
            } else {
                setId(nextOSNumber);
                const now = new Date();
                const offset = now.getTimezoneOffset() * 60000;
                const localISO = new Date(now.getTime() - offset).toISOString().slice(0, 16);
                setScheduledDate(localISO);
                setType(MaintenanceType.Preventive);
                setStatus(MaintenanceStatus.Scheduled);
                setEquipmentId('');
                setDescription('');
                setRequester('');
                setChecklist([]);
                setEndDate('');
                setManHours([]);
                setMaterialsUsed([]);
                setObservations('');
                setRuntimeHours('');
            }
        }
    }, [existingOrder, nextOSNumber, isOpen]);

    const handleCloudSave = async (forceStatus?: MaintenanceStatus) => {
        const targetStatus = forceStatus || status;

        if (!equipmentId || !description || !requester) { 
            showToast('Preencha os campos obrigatórios (*)', 'warning'); 
            return; 
        }

        const notes = runtimeHours ? `Horímetro: ${runtimeHours}h\n${leadTimeAlert ? '[ALERTA 30 DIAS ATIVADO]' : ''}` : '';
        
        // FIX: Corrected property name from 'scheduled_date' to 'scheduledDate'
        const order: WorkOrder = {
            id, equipmentId, type, status: targetStatus,
            scheduledDate: scheduledDate,
            endDate: targetStatus === MaintenanceStatus.Executed ? endDate : undefined,
            description, checklist,
            rootCause: isCorrective ? rootCause : undefined,
            correctiveCategory: isCorrective ? correctiveCategory : undefined,
            machineStopped,
            requester,
            manHours,
            materialsUsed,
            observations,
            miscNotes: notes
        };

        const success = await handleUnifiedSave(order);
        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-fade-in border border-slate-200">
                
                {/* Header */}
                <div className={`px-8 py-5 text-white flex justify-between items-center ${isCorrective ? 'bg-rose-700' : 'bg-blue-700'}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <ClipboardListIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Protocolo de Manutenção</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black">#{id}</span>
                                <span className="text-white/50">|</span>
                                <span className="text-lg font-bold">{selectedEquipment?.name || 'Selecione o Ativo'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><CloseIcon className="w-6 h-6"/></button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-50 border-b border-slate-200">
                    <button onClick={() => setActiveTab('summary')} className={`flex-1 py-4 text-xs font-black uppercase border-b-4 ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>1. Dados & Horímetro</button>
                    <button onClick={() => setActiveTab('resources')} className={`flex-1 py-4 text-xs font-black uppercase border-b-4 ${activeTab === 'resources' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>2. Materiais & Baixa</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Ativo *</label>
                                    <select value={equipmentId} onChange={e => setEquipmentId(e.target.value)} className="w-full form-input h-12 font-bold">
                                        <option value="">Selecione...</option>
                                        {equipmentData.map(e => <option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400">Horímetro Atual (h)</label>
                                        <input type="number" value={runtimeHours} onChange={e => setRuntimeHours(e.target.value)} placeholder="Ex: 69" className="w-full form-input h-12 font-black text-blue-600" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-6">
                                        <input type="checkbox" checked={leadTimeAlert} onChange={e => setLeadTimeAlert(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                                        <span className="text-[9px] font-black uppercase text-slate-500">Aviso 30 dias antes</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Data Programada</label>
                                    <input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full form-input h-12 font-bold" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Descrição Técnica (O que foi feito?) *</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-32 form-input font-bold" placeholder="Ex: Troca de óleo diesel, filtros..."></textarea>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Referência do Chamado (E-mail/E-Doc) *</label>
                                    <input type="text" value={observations} onChange={e => setObservations(e.target.value)} placeholder="Ex: E-mail Amato 27/08" className="w-full form-input h-12" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4">Peças Utilizadas (Consumo Automático)</h3>
                                {materialsUsed.map((mat, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <select value={mat.partId} onChange={e => {
                                            const newL = [...materialsUsed];
                                            newL[idx].partId = e.target.value;
                                            setMaterialsUsed(newL);
                                        }} className="flex-1 form-input text-xs font-bold">
                                            <option value="">Selecione a Peça...</option>
                                            {inventoryData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" value={mat.quantity} onChange={e => {
                                            const newL = [...materialsUsed];
                                            newL[idx].quantity = Number(e.target.value);
                                            setMaterialsUsed(newL);
                                        }} className="w-24 form-input text-xs font-bold" />
                                        <button onClick={() => setMaterialsUsed(materialsUsed.filter((_, i) => i !== idx))} className="p-2 text-rose-500"><DeleteIcon /></button>
                                    </div>
                                ))}
                                <button onClick={() => setMaterialsUsed([...materialsUsed, { partId: '', quantity: 1 }])} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mt-2">
                                    <PlusIcon className="w-3 h-3"/> Adicionar Item
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Técnico Responsável</label>
                                    <select value={requester} onChange={e => setRequester(e.target.value)} className="w-full form-input h-12">
                                        <option value="">Selecione...</option>
                                        {maintainers.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Data de Término Real</label>
                                    <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full form-input h-12" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 font-bold text-slate-400 uppercase text-xs tracking-widest">Cancelar</button>
                    <button onClick={() => handleCloudSave(MaintenanceStatus.Executed)} className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-emerald-700 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" /> Finalizar Manutenção
                    </button>
                </div>
            </div>
        </div>
    );
};
