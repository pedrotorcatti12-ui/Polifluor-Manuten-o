
import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentType, MaintenancePlan, MaintenanceTask, MaintenanceStatus, MaintenanceType as MType } from '../types';
import { Header } from '../components/Header';
import { EquipmentModal } from '../components/EquipmentModal';
import { MaintenancePlanModal } from '../components/MaintenancePlanModal';
import { PlansListModal } from '../components/PlansListModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PlusIcon, ClipboardListIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { EquipmentReport } from '../components/EquipmentReport';
import { useDataContext } from '../contexts/DataContext';
import { EditableEquipmentRow } from '../components/EditableEquipmentRow';
import { MONTHS } from '../constants';
import { getNextOSNumber } from '../utils/osGenerator';

export const EquipmentPage: React.FC = () => {
  const { equipmentData, workOrders, equipmentTypes, maintenancePlans, handleEquipmentSave, handlePlanSave, handlePlanDelete, showToast } = useDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  const [isPlansListOpen, setIsPlansListOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<MaintenancePlan | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredEquipment = useMemo(() => {
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return equipmentData.filter(eq => 
        eq.id.toLowerCase().includes(lowercasedTerm) ||
        eq.name.toLowerCase().includes(lowercasedTerm) ||
        eq.location.toLowerCase().includes(lowercasedTerm)
    );
  }, [equipmentData, debouncedSearchTerm]);

  const onSaveEquipment = async (updatedEq: Equipment) => {
    const success = await handleEquipmentSave(updatedEq);
    if (success) {
        closeEquipmentModal();
        showToast("Ativo sincronizado com sucesso", "success");
    }
  };
  
  const onSavePlan = async (plan: MaintenancePlan) => {
      const success = await handlePlanSave(plan);
      if (!success) return;

      if (plan.target_equipment_ids && plan.target_equipment_ids.length > 0) {
          const targetYear = 2026;
          const startMonthIdx = plan.start_month ? MONTHS.indexOf(plan.start_month) : 0;
          const frequency = plan.frequency || 1;

          // Processar atualizações em lote para os equipamentos selecionados
          for (const eqId of plan.target_equipment_ids) {
              const eq = equipmentData.find(e => e.id === eqId);
              if (!eq) continue;

              const keptTasks = eq.schedule.filter(t => 
                  t.year !== targetYear || 
                  t.status !== MaintenanceStatus.None || 
                  (t.planId && t.planId !== plan.id)
              );

              const newTasks: MaintenanceTask[] = [];
              let currentOsSeq = parseInt(getNextOSNumber(equipmentData, workOrders), 10);

              for (let i = startMonthIdx; i < 12; i += frequency) {
                  const newOsNumber = String(currentOsSeq++).padStart(4, '0');
                  newTasks.push({
                      id: crypto.randomUUID(),
                      year: targetYear,
                      month: MONTHS[i],
                      status: MaintenanceStatus.Scheduled,
                      type: plan.maintenance_type,
                      description: plan.description,
                      planId: plan.id,
                      details: plan.tasks,
                      osNumber: newOsNumber
                  });
              }
              
              await handleEquipmentSave({ ...eq, schedule: [...keptTasks, ...newTasks] });
          }
          showToast(`${plan.target_equipment_ids.length} Ativos atualizados conforme o plano`, 'success');
      }

      closePlanModal();
  };

  const onDeletePlan = async () => {
      if (!deletingPlan) return;
      const success = await handlePlanDelete(deletingPlan.id);
      if (success) {
          setDeletingPlan(null);
          showToast("Plano excluído", "info");
      }
  };

  const openEquipmentModal = (equipment: Equipment | null = null) => {
    setEditingEquipment(equipment);
    setIsEquipmentModalOpen(true);
  };

  const closeEquipmentModal = () => {
    setEditingEquipment(null);
    setIsEquipmentModalOpen(false);
  };

  const openPlansList = () => setIsPlansListOpen(true);
  const closePlansList = () => setIsPlansListOpen(false);

  const openPlanModal = (plan: MaintenancePlan | null = null) => {
      setEditingPlan(plan);
      setIsPlanModalOpen(true);
  };

  const closePlanModal = () => {
      setEditingPlan(null);
      setIsPlanModalOpen(false);
  };

  return (
    <>
      <Header
        title="Ativos & Planejamento"
        subtitle="Gerencie sua frota industrial e defina estratégias de manutenção preventiva/preditiva."
        actions={
          <div className="flex gap-2">
             <button onClick={openPlansList} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest hover:bg-gray-50">
                  <ClipboardListIcon className="w-4 h-4" /> Ver Estratégias
              </button>
              <button onClick={() => openEquipmentModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg">
                  <PlusIcon className="w-4 h-4" /> Novo Equipamento
              </button>
          </div>
        }
      />
      
      <div className="mb-6">
           <input
            type="text"
            placeholder="Pesquisa rápida de ativos (ID, Nome, Local)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 form-input h-12 font-bold"
          />
      </div>

      <div className="space-y-4">
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map(eq => (
                <EditableEquipmentRow
                  key={eq.id}
                  equipment={eq}
                  onView={setViewingEquipment}
                  onEdit={openEquipmentModal}
                  onDelete={setDeletingEquipment}
                />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Nenhum ativo encontrado para esta busca.</p>
            </div>
          )}
      </div>

      {isEquipmentModalOpen && <EquipmentModal isOpen={isEquipmentModalOpen} onClose={closeEquipmentModal} onSave={onSaveEquipment} existingEquipment={editingEquipment} equipmentTypes={equipmentTypes} maintenancePlans={maintenancePlans} />}
      {deletingEquipment && <ConfirmationModal isOpen={!!deletingEquipment} onClose={() => setDeletingEquipment(null)} onConfirm={() => {
          // Implementação futura: Deletar do banco via RPC ou ID
          showToast("Ação de deleção restrita para segurança de dados", "warning");
          setDeletingEquipment(null);
      }} title="Remover Ativo" message={`Tem certeza que deseja desativar o equipamento ${deletingEquipment.name}?`} />}
      {viewingEquipment && <EquipmentReport equipment={viewingEquipment} onClose={() => setViewingEquipment(null)} />}

      {isPlansListOpen && (
          <PlansListModal 
            isOpen={isPlansListOpen}
            onClose={closePlansList}
            plans={maintenancePlans}
            equipmentTypes={equipmentTypes}
            onEdit={openPlanModal}
            onAdd={() => openPlanModal(null)}
            onDelete={(p) => setDeletingPlan(p)}
          />
      )}
      {isPlanModalOpen && (
          <MaintenancePlanModal
            isOpen={isPlanModalOpen}
            onClose={closePlanModal}
            onSave={onSavePlan}
            existingPlan={editingPlan}
            equipmentTypes={equipmentTypes}
          />
      )}
      {deletingPlan && (
          <ConfirmationModal
            isOpen={!!deletingPlan}
            onClose={() => setDeletingPlan(null)}
            onConfirm={onDeletePlan}
            title="Excluir Plano"
            message={`Tem certeza que deseja excluir o plano "${deletingPlan.description}"?`}
          />
      )}
    </>
  );
};
