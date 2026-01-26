import React, { useState, useEffect, useMemo } from 'react';
import { WorkOrder, Equipment, SparePart, MaintenanceStatus, MaintenanceType, TaskDetail, CorrectiveCategory, ManHourEntry, PurchaseRequest } from '../types';
import { CloseIcon, CheckCircleIcon, ClipboardListIcon, ExclamationTriangleIcon, PlusIcon, DeleteIcon, UploadIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext'; // Import AppContext
import { ConfirmationModal } from './ConfirmationModal'; // Import ConfirmationModal

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

type Tab = 'summary' | 'checklist' | 'resources';

export const WorkOrderControlModal: React.FC<WorkOrderControlModalProps> = ({ isOpen, onClose, existingOrder, equipmentData, inventoryData, nextOSNumber, maintainers, requesters }) => {
    const { handleUnifiedSave, handleWorkOrderDelete, showToast } = useDataContext();
    const { userRole, requestAdminPassword } = useAppContext(); // Get user role
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation
    
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
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
    
    // PDF Report
    const [reportPdf, setReportPdf] = useState<string | null>(null);
    const [pdfFileName, setPdfFileName] = useState<string>('');

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
                setPurchaseRequests(existingOrder.purchaseRequests || []);
                
                setReportPdf(existingOrder.reportPdfBase64 || null);
                if(existingOrder.reportPdfBase64) setPdfFileName(`Relatorio_${existingOrder.id}.pdf`);
                else setPdfFileName('');

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
                setPurchaseRequests([]);
                setObservations('');
                setMachineStopped(false);
                setRuntimeHours('');
                setReportPdf(null);
                setPdfFileName('');
            }
        }
    }, [existingOrder, nextOSNumber, isOpen]);

    const handleChecklistItemToggle = (indexToToggle: number) => {
        setChecklist(prev => prev.map((item, index) => 
            index === indexToToggle ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setReportPdf(base64.split(',')[1]); // Remove o prefixo "data:application/pdf;base64,"
                setPdfFileName(file.name);
            };
            reader.readAsDataURL(file);
        } else {
            showToast("Por favor, selecione um arquivo .pdf", "warning");
        }
    };

    const handleSave = async (forceStatus?: MaintenanceStatus) => {
        const targetStatus = forceStatus || status;

        if (!equipmentId || !description || !requester) { 
            showToast('Preencha os campos obrigatórios (*)', 'warning'); 
            setActiveTab('summary');
            return; 
        }

        const notes = runtimeHours ? `Horímetro: ${runtimeHours}h\n${leadTimeAlert ? '[ALERTA 30 DIAS ATIVADO]' : ''}` : '';
        
        const order: WorkOrder = {
            id, equipmentId, type, status: targetStatus,
            equipments: selectedEquipment || null,
            scheduledDate: scheduledDate,
            endDate: targetStatus === MaintenanceStatus.Executed ? (endDate || new Date().toISOString().slice(0, 16)) : undefined,
            description, checklist,
            rootCause: isCorrective ? rootCause : undefined,
            correctiveCategory: isCorrective ? correctiveCategory : undefined,
            machineStopped,
            requester,
            manHours,
            materialsUsed,
            purchaseRequests,
            observations,
            miscNotes: notes,
            reportPdfBase64: reportPdf || undefined,
        };

        const success = await handleUnifiedSave(order);
        if (success) {
            onClose();
        }
    };

    // New Delete Handlers
    const handleDeleteClick = () => {
        if (!existingOrder) return; // Can't delete unsaved order (just close)

        if (userRole === 'admin') {
            requestAdminPassword(() => setIsDeleteModalOpen(true));
        } else {
            if (existingOrder.status === MaintenanceStatus.Executed) {
                showToast("Apenas administradores podem excluir O.S. finalizadas.", "error");
                return;
            }
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!existingOrder) return;
        const success = await handleWorkOrderDelete(existingOrder.id);
        if (success) {
            setIsDeleteModalOpen(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-fade-in border border-slate-200">
                
                {/* Header */}
                <div className={`px-8 py-5 text-white flex justify-between items-center transition-colors ${machineStopped ? 'bg-rose-700' : isCorrective ? 'bg-slate-800' : 'bg-blue-700'}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                           {machineStopped ? <ExclamationTriangleIcon className="w-6 h-6 animate-pulse"/> : <ClipboardListIcon className="w-6 h-6" />}
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
                    <button onClick={() => setActiveTab('summary')} className={`flex-1 py-4 text-xs font-black uppercase border-b-4 ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>1. Dados Gerais</button>
                    <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-4 text-xs font-black uppercase border-b-4 ${activeTab === 'checklist' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-400'}`}>2. Checklist</button>
                    <button onClick={() => setActiveTab('resources')} className={`flex-1 py-4 text-xs font-black uppercase border-b-4 ${activeTab === 'resources' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>3. Recursos e Baixa</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    {activeTab === 'summary' && (
                        <div className="space-y-6">
                             <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${machineStopped ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
                                <span className="text-[10px] font-black uppercase text-slate-500">Máquina Parada (Urgência Crítica)?</span>
                                <input type="checkbox" checked={machineStopped} onChange={() => setMachineStopped(!machineStopped)} className="w-6 h-6 text-rose-600 rounded" />
                            </div>
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
                                        <label className="text-[10px] font-black uppercase text-slate-400">Solicitante *</label>
                                        <select value={requester} onChange={e => setRequester(e.target.value)} className="w-full form-input h-12">
                                            <option value="">Selecione...</option>
                                            {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'checklist' && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-[10px] font-black uppercase text-slate-400">Roteiro de Execução</h3>
                            {checklist.length > 0 ? (
                                <div className="space-y-3">
                                    {checklist.map((item, index) => (
                                        <label key={index} className="flex items-start p-4 bg-slate-50 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-blue-200 transition-all has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-200">
                                            <input
                                                type="checkbox"
                                                checked={item.checked || false}
                                                onChange={() => handleChecklistItemToggle(index)}
                                                className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 flex-shrink-0"
                                            />
                                            <div className="ml-4">
                                                <span className={`text-sm font-bold ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                    {item.action}
                                                </span>
                                                {item.materials && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        <span className="font-bold">Material:</span> {item.materials}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                                    <ClipboardListIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-400 font-bold">Nenhum checklist definido para esta O.S.</p>
                                    <p className="text-xs text-slate-400 mt-1">Checklists são herdados de Planos de Manutenção Preventiva.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="space-y-6 animate-fade-in">
                             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4">Anexar Relatório Técnico (.pdf)</h3>
                                {reportPdf ? (
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                            <span className="text-xs font-bold text-emerald-800">{pdfFileName || 'Relatório Anexado'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => window.open(`data:application/pdf;base64,${reportPdf}`)} className="text-xs font-bold text-blue-600 hover:underline">Ver</button>
                                            <button type="button" onClick={() => { setReportPdf(null); setPdfFileName(''); }} className="text-xs font-bold text-rose-600 hover:underline">Remover</button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                                        <UploadIcon className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-500">Clique para selecionar o arquivo</span>
                                        <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                                    </label>
                                )}
                            </div>

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

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4">Horas-Homem (Apontamento)</h3>
                                {manHours.map((mh, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <select value={mh.maintainer} onChange={e => {
                                            const newL = [...manHours];
                                            newL[idx].maintainer = e.target.value;
                                            setManHours(newL);
                                        }} className="flex-1 form-input text-xs font-bold">
                                            <option value="">Selecione o Técnico...</option>
                                            {maintainers.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <input type="number" value={mh.hours} onChange={e => {
                                            const newL = [...manHours];
                                            newL[idx].hours = Number(e.target.value);
                                            setManHours(newL);
                                        }} className="w-24 form-input text-xs font-bold" placeholder="HH" />
                                        <button onClick={() => setManHours(manHours.filter((_, i) => i !== idx))} className="p-2 text-rose-500"><DeleteIcon /></button>
                                    </div>
                                ))}
                                <button onClick={() => setManHours([...manHours, { maintainer: '', hours: 1 }])} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mt-2">
                                    <PlusIcon className="w-3 h-3"/> Adicionar Apontamento
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Status Atual</label>
                                    <select value={status} onChange={e => setStatus(e.target.value as MaintenanceStatus)} className="w-full form-input h-12">
                                        {Object.values(MaintenanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
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

                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                    {/* Botão de Excluir (Nova Funcionalidade) */}
                    <div>
                        {existingOrder && (
                            <button 
                                onClick={handleDeleteClick} 
                                className="px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs uppercase flex items-center gap-2 transition-colors"
                            >
                                <DeleteIcon className="w-4 h-4"/> Excluir O.S.
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-3 font-bold text-slate-400 uppercase text-xs tracking-widest">Cancelar</button>
                        <button onClick={() => handleSave()} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700">Salvar Alterações</button>
                        <button onClick={() => handleSave(MaintenanceStatus.Executed)} className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-emerald-700 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" /> Finalizar Manutenção
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && existingOrder && (
                <ConfirmationModal 
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Ordem de Serviço"
                    message={`Tem certeza que deseja mover a O.S. #${existingOrder.id} para a lixeira?`}
                />
            )}
        </div>
    );
};