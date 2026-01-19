
import React, { useState, useEffect, useMemo } from 'react';
import { WorkOrder, Equipment, SparePart, MaintenanceStatus, MaintenanceType, TaskDetail } from '../types';
import { CloseIcon, CheckCircleIcon, ClockIcon, ClipboardListIcon, InfoIcon, ArrowPathIcon, ShieldCheckIcon } from './icons';
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

type Tab = 'summary' | 'checklist' | 'resources' | 'audit';

export const WorkOrderControlModal: React.FC<WorkOrderControlModalProps> = ({ isOpen, onClose, existingOrder, equipmentData, nextOSNumber, maintainers, requesters }) => {
    const { handleUnifiedSave, maintenancePlans, isSyncing, showToast } = useDataContext();
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    
    const [id, setId] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [type, setType] = useState<MaintenanceType>(MaintenanceType.Corrective);
    const [status, setStatus] = useState<MaintenanceStatus>(MaintenanceStatus.Scheduled);
    const [scheduledDate, setScheduledDate] = useState(''); 
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [observations, setObservations] = useState('');
    const [checklist, setChecklist] = useState<TaskDetail[]>([]);
    const [auditComment, setAuditComment] = useState('');

    const selectedEquipment = useMemo(() => equipmentData.find(e => e.id === equipmentId), [equipmentId, equipmentData]);

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
                setObservations(existingOrder.observations || '');
                setChecklist(existingOrder.checklist || []);
                setAuditComment(existingOrder.technicalAuditComment || '');
            } else {
                setId(nextOSNumber);
                const now = new Date();
                const offset = now.getTimezoneOffset() * 60000;
                const localISO = new Date(now.getTime() - offset).toISOString().slice(0, 16);
                setScheduledDate(localISO);
                setType(MaintenanceType.Corrective);
                setStatus(MaintenanceStatus.Scheduled);
                setEquipmentId('');
                setDescription('');
                setChecklist([]);
                setAuditComment('');
                setEndDate('');
            }
        }
    }, [existingOrder, nextOSNumber, isOpen]);

    const handleEquipmentChange = (newId: string) => {
        setEquipmentId(newId);
        const eq = equipmentData.find(e => e.id === newId);
        if (eq) {
            const plan = maintenancePlans.find(p => p.equipment_type_id === eq.model);
            if (plan && plan.tasks && checklist.length === 0) {
                setChecklist(plan.tasks.map(t => ({ ...t, checked: false })));
                if (!description) setDescription(plan.description);
                if (type === MaintenanceType.Corrective) setType(plan.maintenance_type);
            }
        }
    };

    const handleCloudSave = async (finalStatus?: MaintenanceStatus) => {
        if (!id) {
            showToast('O número da O.S. é obrigatório', 'warning');
            return;
        }
        if (!equipmentId) {
            showToast('Selecione um Ativo para vincular a O.S.', 'warning');
            return;
        }

        const targetStatus = finalStatus || status;
        
        if (targetStatus === MaintenanceStatus.Executed) {
            if (!endDate) {
                showToast('A data de conclusão é obrigatória para encerrar a OS', 'error');
                setActiveTab('resources');
                return;
            }
        }
        
        const order: WorkOrder = {
            id,
            equipmentId,
            type,
            status: targetStatus,
            scheduledDate,
            endDate: targetStatus === MaintenanceStatus.Executed ? endDate : undefined,
            description,
            observations,
            checklist,
            technicalAuditComment: auditComment,
            requester: existingOrder?.requester || requesters[0] || 'Manutenção',
            machineStopped: true,
            manHours: existingOrder?.manHours || [],
            materialsUsed: existingOrder?.materialsUsed || []
        };

        const success = await handleUnifiedSave(order);
        if (success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 animate-fade-in">
                
                <div className={`px-8 py-6 text-white flex justify-between items-center transition-all duration-500 ${status === MaintenanceStatus.Executed ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            {isSyncing ? <ArrowPathIcon className="w-8 h-8 animate-spin"/> : <ClipboardListIcon className="w-8 h-8" />}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Protocolo O.S.</span>
                                <input 
                                    value={id} 
                                    onChange={e => setId(e.target.value)}
                                    className="bg-white/10 border-b-2 border-white/30 text-2xl font-black uppercase tracking-tighter w-40 px-2 focus:border-white focus:bg-white/20 focus:outline-none rounded-t-lg transition-all"
                                    placeholder="0000"
                                />
                            </div>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                                {selectedEquipment?.name || 'Vincular Ativo'} • {type}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isSyncing} className="p-3 hover:bg-white/10 rounded-full transition-colors"><CloseIcon className="w-6 h-6"/></button>
                </div>

                <div className="flex bg-slate-50 border-b border-slate-200">
                    {[
                        { id: 'summary', label: '1. Diagnóstico', icon: <InfoIcon className="w-4 h-4"/> },
                        { id: 'checklist', label: '2. Checklist', icon: <CheckCircleIcon className="w-4 h-4"/> },
                        { id: 'resources', label: '3. Reparo & MTTR', icon: <ClockIcon className="w-4 h-4"/> },
                        { id: 'audit', label: '4. Auditoria', icon: <ShieldCheckIcon className="w-4 h-4"/> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            disabled={isSyncing}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 text-[11px] font-black uppercase transition-all border-b-4 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
                    {activeTab === 'summary' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Equipamento / Máquina</label>
                                    <select 
                                        disabled={isSyncing}
                                        value={equipmentId} 
                                        onChange={e => handleEquipmentChange(e.target.value)} 
                                        className="w-full h-14 form-input font-bold text-sm bg-slate-50 border-none rounded-2xl"
                                    >
                                        <option value="">Selecione o Ativo...</option>
                                        {equipmentData.map(e => <option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Status Operacional</label>
                                    <select 
                                        disabled={isSyncing}
                                        value={status} 
                                        onChange={e => setStatus(e.target.value as any)} 
                                        className="w-full h-14 form-input font-black text-sm text-blue-600 bg-blue-50/50 border-none rounded-2xl"
                                    >
                                        {Object.values(MaintenanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Natureza do Chamado</label>
                                    <select 
                                        disabled={isSyncing}
                                        value={type} 
                                        onChange={e => setType(e.target.value as any)} 
                                        className="w-full h-14 form-input font-bold text-sm bg-slate-50 border-none rounded-2xl"
                                    >
                                        {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Início Programado</label>
                                    <input 
                                        disabled={isSyncing}
                                        type="datetime-local" 
                                        value={scheduledDate} 
                                        onChange={e => setScheduledDate(e.target.value)} 
                                        className="w-full h-14 form-input font-bold text-sm bg-slate-50 border-none rounded-2xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Escopo Técnico</label>
                                <textarea 
                                    disabled={isSyncing}
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    rows={4} 
                                    className="w-full p-5 form-input font-bold text-sm border-l-8 border-blue-600 rounded-2xl bg-slate-50" 
                                    placeholder="O que deve ser feito ou qual a falha?" 
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'checklist' && (
                        <div className="space-y-4 animate-fade-in">
                            {checklist.length > 0 ? (
                                checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                        <input 
                                            disabled={isSyncing}
                                            type="checkbox" 
                                            checked={item.checked} 
                                            onChange={() => {
                                                const newList = [...checklist];
                                                newList[idx].checked = !newList[idx].checked;
                                                setChecklist(newList);
                                            }}
                                            className="w-6 h-6 rounded-lg text-blue-600" 
                                        />
                                        <div className="flex-1">
                                            <span className={`text-sm font-bold block ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.action}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                    <p className="text-sm font-black text-slate-300 uppercase">Checklist Vazio</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                <h4 className="text-sm font-black text-blue-900 uppercase">Apontamento Real</h4>
                                <p className="text-xs text-blue-700">Crucial para o cálculo de MTTR (Tempo de Reparo).</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Entrada na Oficina / Início</label>
                                    <input disabled={isSyncing} type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full h-12 form-input font-bold bg-slate-50 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Entrega para Produção / Fim</label>
                                    <input disabled={isSyncing} type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-12 form-input font-bold bg-slate-50 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                                <h4 className="text-sm font-black text-amber-900 uppercase">Garantia da Qualidade</h4>
                                <p className="text-xs text-amber-700 mt-1">Obrigatório p/ conformidade IATF em caso de falhas críticas.</p>
                            </div>
                            <textarea 
                                disabled={isSyncing}
                                value={auditComment} 
                                onChange={e => setAuditComment(e.target.value)} 
                                className="w-full p-6 form-input text-sm font-bold bg-slate-50 border-none rounded-3xl shadow-inner min-h-[200px]" 
                                placeholder="Descreva as medidas definitivas para evitar a reincidência..."
                            />
                        </div>
                    )}
                </div>

                <div className="px-10 py-8 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 items-center">
                    <button onClick={onClose} disabled={isSyncing} className="px-8 py-3 text-xs font-black uppercase text-slate-400">Cancelar</button>
                    <button 
                        disabled={isSyncing}
                        onClick={() => handleCloudSave()} 
                        className="px-12 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl hover:bg-emerald-700 flex items-center gap-2"
                    >
                        {isSyncing ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <CheckCircleIcon className="w-4 h-4"/>}
                        {status === MaintenanceStatus.Executed ? 'Salvar Alterações' : 'Concluir O.S.'}
                    </button>
                </div>
            </div>
        </div>
    );
};
