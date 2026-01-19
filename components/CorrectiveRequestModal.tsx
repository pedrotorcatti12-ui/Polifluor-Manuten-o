
import React, { useState, useMemo } from 'react';
import { Equipment, CorrectiveCategory, MaintenanceStatus } from '../types';
import { CloseIcon, ClockIcon, ExclamationTriangleIcon, TargetIcon, WrenchIcon, PackageIcon, ShieldCheckIcon, HomeIcon, CheckCircleIcon } from './icons';

interface CorrectiveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (equipmentId: string, description: string, requester: string, priority: 'Alta' | 'Média' | 'Baixa', osNumber: string, category?: CorrectiveCategory, failureDateTime?: string) => void;
    equipmentList: Equipment[];
    requesters: string[];
}

export const CorrectiveRequestModal: React.FC<CorrectiveRequestModalProps> = ({
    isOpen, onClose, onCreate, equipmentList, requesters
}) => {
    const [isEmergency, setIsEmergency] = useState(false);
    const [equipmentId, setEquipmentId] = useState('');
    const [customAsset, setCustomAsset] = useState('');
    const [description, setDescription] = useState('');
    const [requester, setRequester] = useState('');
    const [category, setCategory] = useState<CorrectiveCategory>(CorrectiveCategory.Mechanical);
    const [subsystem, setSubsystem] = useState('');
    const [riskClass, setRiskClass] = useState('PRODUTIVIDADE');
    const [productionOrder, setProductionOrder] = useState('');
    const [probableMaterials, setProbableMaterials] = useState('');
    const [isMachineStopped, setIsMachineStopped] = useState(false);
    const [failureDateTime, setFailureDateTime] = useState(() => new Date().toISOString().slice(0, 16));

    const sortedEquipment = useMemo(() => {
        return [...equipmentList].sort((a, b) => a.id.localeCompare(b.id));
    }, [equipmentList]);

    const handleToggleEmergency = () => {
        const newState = !isEmergency;
        setIsEmergency(newState);
        if (newState) {
            setIsMachineStopped(true);
            setRiskClass('CRÍTICO/SEGURANÇA');
        } else {
            setRiskClass('PRODUTIVIDADE');
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalId = equipmentId || customAsset;
        if (!finalId || !description || !requester) return;

        const isPredial = category === CorrectiveCategory.Other || riskClass === 'ESTÉTICA';
        const technicalHeader = `[TIPO: ${isPredial ? 'PREDIAL/PASSIVO' : 'INDUSTRIAL'}] [RISCO: ${riskClass}] [SUBSISTEMA: ${subsystem || 'GERAL'}]\nMATERIAIS: ${probableMaterials || 'N/A'}\n---\n`;
        
        onCreate(
            finalId, 
            technicalHeader + description, 
            requester, 
            isEmergency ? 'Alta' : 'Média', 
            '', 
            category, 
            failureDateTime
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-fade-in-up">
                
                <div className={`px-8 py-5 text-white transition-all duration-500 flex justify-between items-center ${isEmergency ? 'bg-rose-700 shadow-[0_4px_25px_rgba(190,18,60,0.4)]' : 'bg-slate-800'}`}>
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${isEmergency ? 'bg-white text-rose-700 animate-pulse' : 'bg-blue-600 text-white'}`}>
                            {isEmergency ? <ExclamationTriangleIcon className="w-7 h-7" /> : <WrenchIcon className="w-7 h-7" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                                {isEmergency ? 'Chamado Crítico' : 'Nova Solicitação Corretiva'}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mt-2 flex items-center gap-2">
                                <ShieldCheckIcon className="w-3 h-3"/> Inclui Ativos Industriais e Passivos Prediais
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><CloseIcon className="w-6 h-6"/></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar bg-slate-50/50">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-center gap-2 ${isEmergency ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase ${isEmergency ? 'text-rose-600' : 'text-slate-400'}`}>Grau Crítico?</span>
                                <button type="button" onClick={handleToggleEmergency} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEmergency ? 'bg-rose-600' : 'bg-slate-300'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEmergency ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3 text-blue-500" /> Data e Hora Real do Início
                            </label>
                            <input type="datetime-local" value={failureDateTime} onChange={e => setFailureDateTime(e.target.value)} required className="w-full h-12 form-input font-black text-sm bg-white border-slate-200" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ativo Cadastrado (Opcional)</label>
                            <select value={equipmentId} onChange={e => { setEquipmentId(e.target.value); if(e.target.value) setCustomAsset(''); }} className="w-full h-12 form-input font-black text-sm bg-white">
                                <option value="">Não listado / Predial...</option>
                                {sortedEquipment.map(eq => <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ou Digite o Ativo Passivo (Mesa, Balcão, etc)</label>
                            <input type="text" value={customAsset} onChange={e => { setCustomAsset(e.target.value); if(e.target.value) setEquipmentId(''); }} placeholder="Ex: MESA ESCRITÓRIO 04" className="w-full h-12 form-input font-bold text-sm bg-white" disabled={!!equipmentId} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                            <select value={category} onChange={e => setCategory(e.target.value as CorrectiveCategory)} className="w-full h-12 form-input font-black text-xs">
                                {Object.values(CorrectiveCategory).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                                <option value="PREDIAL">PREDIAL / ESTRUTURAL</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classe de Risco</label>
                            <select value={riskClass} onChange={e => setRiskClass(e.target.value)} className="w-full h-12 form-input font-black text-xs">
                                <option value="PRODUTIVIDADE">PRODUTIVIDADE</option>
                                <option value="ESTÉTICA">FACILITY / MOBILIÁRIO</option>
                                <option value="CRÍTICO/SEGURANÇA">SEGURANÇA / MEIO AMBIENTE</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subconjunto / Localização Detalhada</label>
                            <input type="text" value={subsystem} onChange={e => setSubsystem(e.target.value)} placeholder="Ex: Sala de Reunião, Corredor B..." className="w-full h-12 form-input font-bold text-xs" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Problema *</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} placeholder="Descreva a falha ou necessidade..." className="w-full p-4 form-input font-bold text-sm" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Solicitante *</label>
                                <select value={requester} onChange={e => setRequester(e.target.value)} required className="w-full h-12 form-input font-black text-xs">
                                    <option value="">Quem solicita?</option>
                                    {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-100 border-t border-slate-200 flex justify-end items-center gap-8">
                    <button type="button" onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Descartar</button>
                    <button type="submit" className={`px-16 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 ${isEmergency ? 'bg-rose-600 text-white' : 'bg-blue-700 text-white'}`}>
                        {isEmergency ? <ExclamationTriangleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5" />}
                        Gerar Ordem de Serviço
                    </button>
                </div>
            </form>
        </div>
    );
};
