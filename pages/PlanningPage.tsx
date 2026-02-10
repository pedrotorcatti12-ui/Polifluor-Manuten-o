
import React, { useState } from 'react';
import { MaintenancePlan } from '../types';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext';
import { MaintenancePlanModal } from '../components/MaintenancePlanModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PlusIcon, EditIcon, DeleteIcon, TargetIcon, InfoIcon, WrenchIcon, ArrowPathIcon, ShieldCheckIcon, ClockIcon } from '../components/icons';
import { PlanInfoModal } from '../components/PlanInfoModal';
import { PlanCoverageModal } from '../components/PlanCoverageModal';

export const PlanningPage: React.FC = () => {
    const { equipmentData, equipmentTypes, maintenancePlans, handlePlanSave, handlePlanDelete, showToast, generateFullPlanning2026, handleBulkDeleteWorkOrders } = useDataContext();
    const { requestAdminPassword, setCurrentPage, userRole } = useAppContext();
    
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<MaintenancePlan | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const canManage = userRole === 'admin' || userRole === 'gestor';

    const openPlanModal = (plan: MaintenancePlan | null = null) => {
      setEditingPlan(plan);
      setIsPlanModalOpen(true);
    };

    const closePlanModal = () => {
      setEditingPlan(null);
      setIsPlanModalOpen(false);
    };

    const onSavePlan = async (plan: MaintenancePlan, applyToAll: boolean) => {
        await handlePlanSave(plan, applyToAll);
        closePlanModal();
    };

    const handleDeleteRequest = (plan: MaintenancePlan) => {
        requestAdminPassword(() => {
            setDeletingPlan(plan);
        });
    };

    const onDeletePlanConfirm = async () => {
        if (!deletingPlan) return;
        const success = await handlePlanDelete(deletingPlan.id);
        if (success) {
            setDeletingPlan(null);
            showToast("Plano excluído", "info");
        }
    };
    
    const handleGenerateSchedule = () => {
        requestAdminPassword(async () => {
            setIsGenerating(true);
            const success = await generateFullPlanning2026();
            if (success) {
                showToast("Cronograma Mestre de 2026 atualizado!", "success", {
                    label: "Ver Cronograma",
                    onClick: () => setCurrentPage('schedule')
                });
            }
            setIsGenerating(false);
        });
    };
    
    const handleBulkDeleteRequest = () => {
        requestAdminPassword(() => {
            setIsBulkDeleteModalOpen(true);
        });
    };

    const handleBulkDeleteConfirm = async () => {
        const success = await handleBulkDeleteWorkOrders();
        if (success) {
            setIsBulkDeleteModalOpen(false);
            showToast("Todas as O.S. foram excluídas. O cronograma está limpo.", "success");
        }
    };
    
    // Simulação da função de Backlog (na prática, rodaria o SQL via RPC)
    const handleBacklogRecovery = () => {
        alert("Para executar o Nivelamento de Backlog (Mover pendências do mês atual para o próximo), execute o script 'reprogram_january_backlog.sql' no banco de dados. \n\nIsso distribuirá as tarefas nas 4 semanas do mês seguinte.");
    };

    const getTypeName = (id: string) => equipmentTypes.find(t => t.id === id)?.description || 'N/A';

    return (
        <>
            <Header
                title="Estratégias de Manutenção"
                subtitle="Crie e gerencie os planos que automatizam o cronograma de preventivas."
                actions={
                    canManage && (
                        <div className="flex gap-2">
                            <button onClick={handleBacklogRecovery} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg" title="Mover pendências vencidas para o próximo mês">
                                <ClockIcon className="w-4 h-4" /> Gestão de Backlog
                            </button>
                            <button onClick={() => setIsAuditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg">
                                <ShieldCheckIcon className="w-4 h-4" /> Auditoria de Cobertura
                            </button>
                            <button onClick={handleBulkDeleteRequest} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg">
                                <DeleteIcon className="w-4 h-4" />
                                Limpar
                            </button>
                            <button onClick={handleGenerateSchedule} disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg disabled:bg-slate-400">
                                {isGenerating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <WrenchIcon className="w-4 h-4" />}
                                {isGenerating ? 'Gerando...' : 'Gerar 2026'}
                            </button>
                            <button onClick={() => openPlanModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg">
                                <PlusIcon className="w-4 h-4" /> Nova Estratégia
                            </button>
                        </div>
                    )
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {maintenancePlans.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-lg transition-all group">
                        <div>
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-slate-100 rounded-xl text-slate-600 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <TargetIcon className="w-5 h-5"/>
                                </div>
                                {canManage && (
                                    <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openPlanModal(plan)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><EditIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteRequest(plan)} className="p-2 text-slate-400 hover:bg-rose-50 rounded-lg text-rose-500"><DeleteIcon className="w-4 h-4"/></button>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{plan.description}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase">
                                    {getTypeName(plan.equipmentTypeId)}
                                </span>
                                {(plan.tasks?.length || 0) === 0 && (
                                    <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-md uppercase flex items-center gap-1">
                                        <InfoIcon className="w-3 h-3" /> Vazio
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Frequência</p>
                                <p className="text-lg font-black text-slate-700">{plan.frequency}m</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Tarefas</p>
                                <p className="text-lg font-black text-slate-700">{plan.tasks?.length || 0}</p>
                            </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Alvos</p>
                                <p className="text-lg font-black text-slate-700">{plan.targetEquipmentIds?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isPlanModalOpen && (
              <MaintenancePlanModal
                isOpen={isPlanModalOpen}
                onClose={closePlanModal}
                onSave={onSavePlan}
                existingPlan={editingPlan}
                equipmentTypes={equipmentTypes}
                equipmentData={equipmentData}
              />
            )}
            
            {isAuditModalOpen && (
                <PlanCoverageModal 
                    isOpen={isAuditModalOpen}
                    onClose={() => setIsAuditModalOpen(false)}
                    equipmentData={equipmentData}
                    maintenancePlans={maintenancePlans}
                />
            )}

            {deletingPlan && (
              <ConfirmationModal
                isOpen={!!deletingPlan}
                onClose={() => setDeletingPlan(null)}
                onConfirm={onDeletePlanConfirm}
                title="Excluir Plano"
                message={`Tem certeza que deseja excluir o plano "${deletingPlan.description}"? A exclusão não afetará O.S. já geradas.`}
              />
            )}
            {isBulkDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isBulkDeleteModalOpen}
                    onClose={() => setIsBulkDeleteModalOpen(false)}
                    onConfirm={handleBulkDeleteConfirm}
                    title="Limpar TODO o Cronograma?"
                    message="Esta ação é IRREVERSÍVEL e irá apagar TODAS as Ordens de Serviço (preventivas e corretivas) do banco de dados. Deseja continuar?"
                />
            )}
            {isInfoModalOpen && (
                <PlanInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
            )}
        </>
    );
};
