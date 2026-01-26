import React, { useState, useMemo, useEffect } from 'react';
import { Equipment, CorrectiveCategory, MaintenanceStatus, MaintenanceType } from '../types';
import { CloseIcon, ClockIcon, ExclamationTriangleIcon, TargetIcon, WrenchIcon, PackageIcon, ShieldCheckIcon, HomeIcon, CheckCircleIcon, DocumentTextIcon, LightBulbIcon } from './icons';

interface CorrectiveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (equipmentId: string, description: string, requester: string, priority: 'Alta' | 'Média' | 'Baixa', osNumber: string, category?: CorrectiveCategory, failureDateTime?: string, type?: MaintenanceType) => void;
    equipmentList: Equipment[];
    requesters: string[];
}

const PREDICAL_RISK_KEYWORDS = ['rachadura', 'infiltração', 'estrutura', 'poste', 'risco de queda'];

export const CorrectiveRequestModal: React.FC<CorrectiveRequestModalProps> = ({
    isOpen, onClose, onCreate, equipmentList, requesters
}) => {
    const [isEmergency, setIsEmergency] = useState(false);
    const [isExternalService, setIsExternalService] = useState(false);
    const [isPredial, setIsPredial] = useState(false);
    const [equipmentId, setEquipmentId] = useState('');
    const [customAsset, setCustomAsset] = useState('');
    const [description, setDescription] = useState('');
    const [emailRef, setEmailRef] = useState('');
    const [requester, setRequester] = useState('');
    const [category, setCategory] = useState<CorrectiveCategory>(CorrectiveCategory.Mechanical);
    const [riskClass, setRiskClass] = useState('PRODUTIVIDADE');
    const [failureDateTime, setFailureDateTime] = useState(() => new Date().toISOString().slice(0, 16));
    const [showRiskSuggestion, setShowRiskSuggestion] = useState(false);
    const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>(MaintenanceType.Corrective);

    const sortedEquipment = useMemo(() => {
        return [...equipmentList].sort((a, b) => a.id.localeCompare(b.id));
    }, [equipmentList]);

    useEffect(() => {
        if (isPredial) {
            setEquipmentId('');
            setMaintenanceType(MaintenanceType.Predial);
            const hasRisk = PREDICAL_RISK_KEYWORDS.some(kw => description.toLowerCase().includes(kw));
            setShowRiskSuggestion(hasRisk);
        } else {
            setCustomAsset('');
            setMaintenanceType(MaintenanceType.Corrective);
            setShowRiskSuggestion(false);
        }
    }, [isPredial, description]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalId = isPredial ? `PREDIAL: ${customAsset}` : equipmentId;
        if (!finalId || !description || !requester) return;

        const footer = emailRef ? `\n\n[REF E-MAIL: ${emailRef}]` : '';
        const externalTag = isExternalService ? '[SOLICITADO SERVIÇO EXTERNO] ' : '';
        
        onCreate(
            finalId, 
            externalTag + description, 
            requester, 
            isEmergency ? 'Alta' : 'Média', 
            '', 
            category, 
            failureDateTime,
            maintenanceType
        );
        onClose();
    };
    
    const applyShortcut = (asset: string, desc: string) => {
        setIsPredial(true);
        setCustomAsset(asset);
        setDescription(desc);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-fade-in-up">
                
                <div className={`px-8 py-5 text-white transition-all duration-500 flex justify-between items-center ${isEmergency ? 'bg-rose-700' : 'bg-slate-800'}`}>
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${isEmergency ? 'bg-white text-rose-700 animate-pulse' : 'bg-blue-600 text-white'}`}>
                            {isEmergency ? <ExclamationTriangleIcon className="w-7 h-7" /> : <WrenchIcon className="w-7 h-7" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">
                                {isEmergency ? 'Chamado Crítico' : 'Solicitação Corretiva'}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Vínculo com Processos ISO/IATF</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><CloseIcon className="w-6 h-6"/></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh] bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${isEmergency ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
                            <span className="text-[10px] font-black uppercase text-slate-500">Urgência Crítica?</span>
                            <input type="checkbox" checked={isEmergency} onChange={() => setIsEmergency(!isEmergency)} className="w-6 h-6 text-rose-600 rounded" />
                        </div>
                        <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${isExternalService ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                            <span className="text-[10px] font-black uppercase text-slate-500">Mão de Obra Externa?</span>
                            <input type="checkbox" checked={isExternalService} onChange={e => setIsExternalService(e.target.checked)} className="w-6 h-6 text-amber-600 rounded" />
                        </div>
                        <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${isPredial ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
                            <span className="text-[10px] font-black uppercase text-slate-500">Manutenção Predial?</span>
                            <input type="checkbox" checked={isPredial} onChange={e => setIsPredial(e.target.checked)} className="w-6 h-6 text-green-600 rounded" />
                        </div>
                    </div>

                    {isPredial && (
                         <div className="bg-white p-4 rounded-xl border border-slate-100">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Atalhos Comuns</h4>
                             <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => applyShortcut('Banheiro', 'Vazamento em tubulação/torneira do banheiro.')} className="text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-200">Vazamento</button>
                                <button type="button" onClick={() => applyShortcut('Iluminação', 'Lâmpada queimada ou problema no circuito de iluminação.')} className="text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-200">Iluminação</button>
                                <button type="button" onClick={() => applyShortcut('Serralheria', 'Necessidade de adaptação ou reparo em estrutura metálica.')} className="text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-200">Serralheria</button>
                                <button type="button" onClick={() => applyShortcut('Ar Condicionado', 'Ar condicionado não está gelando ou apresenta vazamento.')} className="text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-200">Ar Condicionado</button>
                                <button type="button" onClick={() => applyShortcut('Pintura', 'Necessidade de retoque ou pintura em parede/estrutura.')} className="text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-200">Pintura</button>
                                <button type="button" onClick={() => applyShortcut('Elétrica Predial', 'Tomada não funciona, disjuntor desarmando ou outro problema elétrico.')} className="text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-200">Elétrica</button>
                                <button type="button" onClick={() => applyShortcut('Alvenaria', 'Reparo em parede, piso ou outra estrutura.')} className="text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 hover:bg-slate-200">Alvenaria</button>
                             </div>
                         </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {isPredial ? (
                                <>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Local/Ativo Predial *</label>
                                    <input type="text" value={customAsset} onChange={e => setCustomAsset(e.target.value)} required={isPredial} className="w-full h-12 form-input font-black" placeholder="Ex: Telhado Galpão A, Banheiro" />
                                </>
                            ) : (
                                <>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Equipamento *</label>
                                    <select value={equipmentId} onChange={e => setEquipmentId(e.target.value)} required={!isPredial} className="w-full h-12 form-input font-black">
                                        <option value="">Selecione o Ativo...</option>
                                        {sortedEquipment.map(eq => <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>)}
                                    </select>
                                </>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Referência de E-mail / Cotação</label>
                            <input type="text" value={emailRef} onChange={e => setEmailRef(e.target.value)} placeholder="Ex: E-mail Prensas 04/06" className="w-full h-12 form-input font-bold" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Descrição Técnica do Problema *</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Ex: Vazamento no pistão, bico entupido..." className="w-full p-4 form-input font-bold" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Categoria da Falha *</label>
                        <select value={category} onChange={e => setCategory(e.target.value as CorrectiveCategory)} required className="w-full h-12 form-input font-black">
                           {Object.values(CorrectiveCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    
                    {showRiskSuggestion && (
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-3">
                                <LightBulbIcon className="w-6 h-6 text-amber-500" />
                                <div>
                                    <h4 className="font-bold text-amber-800 text-sm">Sugestão de Análise de Risco</h4>
                                    <p className="text-xs text-amber-700">O problema descrito pode indicar um risco estrutural. Considere abrir uma Revisão Periódica para uma análise mais aprofundada.</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setMaintenanceType(MaintenanceType.RevisaoPeriodica)} className={`px-3 py-1 text-xs font-black uppercase rounded-lg border ${maintenanceType === MaintenanceType.RevisaoPeriodica ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-700 border-amber-200'}`}>
                                {maintenanceType === MaintenanceType.RevisaoPeriodica ? 'Selecionado' : 'Sugerir Revisão'}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Setor Solicitante *</label>
                            <select value={requester} onChange={e => setRequester(e.target.value)} required className="w-full h-12 form-input font-black">
                                <option value="">Quem solicita?</option>
                                {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Data/Hora da Ocorrência</label>
                            <input type="datetime-local" value={failureDateTime} onChange={e => setFailureDateTime(e.target.value)} className="w-full h-12 form-input font-bold" />
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-100 border-t border-slate-200 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                    <button type="submit" className="px-12 py-4 bg-blue-700 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-800 transition-all">
                        Registrar Solicitação
                    </button>
                </div>
            </form>
        </div>
    );
};