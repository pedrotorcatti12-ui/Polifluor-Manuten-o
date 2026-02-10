
import React, { useMemo, useState } from 'react';
import { Equipment, MaintenancePlan } from '../types';
import { CloseIcon, CheckCircleIcon, ExclamationTriangleIcon, SearchIcon, TargetIcon, ClipboardListIcon } from './icons';

interface PlanCoverageModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipmentData: Equipment[];
    maintenancePlans: MaintenancePlan[];
}

export const PlanCoverageModal: React.FC<PlanCoverageModalProps> = ({ isOpen, onClose, equipmentData, maintenancePlans }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const auditData = useMemo(() => {
        // Considerar apenas ativos não desativados/inativos para a métrica não ficar distorcida
        const activeEquipments = equipmentData.filter(eq => eq.status !== 'Inativo' && eq.status !== 'Desativado');

        return activeEquipments.map(eq => {
            // Encontrar se existe algum plano que tenha este equipamento como alvo
            const linkedPlan = maintenancePlans.find(plan => 
                plan.targetEquipmentIds && plan.targetEquipmentIds.includes(eq.id)
            );

            const hasPlan = !!linkedPlan;
            const checklistCount = linkedPlan?.tasks?.length || 0;
            const hasChecklist = checklistCount > 0;

            let status: 'ok' | 'no_plan' | 'empty_plan' = 'ok';
            if (!hasPlan) status = 'no_plan';
            else if (!hasChecklist) status = 'empty_plan';

            return {
                id: eq.id,
                name: eq.name,
                typeId: eq.typeId,
                location: eq.location,
                planName: linkedPlan?.description || '---',
                checklistCount,
                status,
                isCritical: eq.isCritical
            };
        }).sort((a, b) => {
            // Ordenar: Sem plano primeiro, depois plano vazio, depois OK
            const score = (s: string) => s === 'no_plan' ? 0 : s === 'empty_plan' ? 1 : 2;
            return score(a.status) - score(b.status);
        });
    }, [equipmentData, maintenancePlans]);

    const filteredData = useMemo(() => {
        return auditData.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.planName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [auditData, searchTerm]);

    const stats = useMemo(() => {
        const total = auditData.length;
        const covered = auditData.filter(i => i.status !== 'no_plan').length;
        const healthy = auditData.filter(i => i.status === 'ok').length;
        
        return {
            total,
            coveragePct: total > 0 ? (covered / total) * 100 : 0,
            healthPct: total > 0 ? (healthy / total) * 100 : 0,
            missingPlans: total - covered,
            emptyChecklists: covered - healthy
        };
    }, [auditData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Auditoria de Cobertura</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status dos Planos e Checklists por Equipamento</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-800">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total de Ativos</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cobertura de Planos</p>
                        <div className="flex items-end gap-2">
                            <p className={`text-3xl font-black ${stats.coveragePct === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {stats.coveragePct.toFixed(1)}%
                            </p>
                            <TargetIcon className={`w-5 h-5 mb-1 ${stats.coveragePct === 100 ? 'text-emerald-500' : 'text-amber-500'}`} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">{stats.missingPlans} sem plano vinculado</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Saúde dos Checklists</p>
                        <div className="flex items-end gap-2">
                            <p className={`text-3xl font-black ${stats.healthPct === 100 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {stats.healthPct.toFixed(1)}%
                            </p>
                            <ClipboardListIcon className={`w-5 h-5 mb-1 ${stats.healthPct === 100 ? 'text-emerald-500' : 'text-rose-500'}`} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">{stats.emptyChecklists} planos vazios</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Filtrar lista..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 form-input text-sm border-slate-200 bg-slate-50"
                            />
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-800">
                        <thead className="bg-slate-50 dark:bg-gray-800 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipamento</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano Vinculado</th>
                                <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Checklist</th>
                                <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                            {filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</span>
                                            {item.isCritical && (
                                                <span title="Crítico">
                                                    <TargetIcon className="w-3 h-3 text-orange-500" />
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono text-slate-400">{item.id}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {item.location || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${item.status === 'no_plan' ? 'text-rose-500 italic' : 'text-blue-600'}`}>
                                            {item.planName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                                            item.checklistCount > 0 
                                            ? 'bg-slate-100 text-slate-600' 
                                            : 'bg-rose-100 text-rose-600'
                                        }`}>
                                            {item.checklistCount} Itens
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.status === 'ok' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                                                <CheckCircleIcon className="w-3 h-3" /> Completo
                                            </span>
                                        )}
                                        {item.status === 'empty_plan' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">
                                                <ExclamationTriangleIcon className="w-3 h-3" /> Sem Checklist
                                            </span>
                                        )}
                                        {item.status === 'no_plan' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase">
                                                <ExclamationTriangleIcon className="w-3 h-3" /> Sem Plano
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredData.length === 0 && (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                            Nenhum ativo encontrado com este filtro.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
