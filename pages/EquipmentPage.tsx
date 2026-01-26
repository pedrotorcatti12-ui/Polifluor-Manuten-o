import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentType, MaintenancePlan } from '../types';
import { Header } from '../components/Header';
import { EquipmentModal } from '../components/EquipmentModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PlusIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { EquipmentReport } from '../components/EquipmentReport';
import { useDataContext } from '../contexts/DataContext';
import { EditableEquipmentRow } from '../components/EditableEquipmentRow';
import { useAppContext } from '../contexts/AppContext';

export const EquipmentPage: React.FC = () => {
  const { equipmentData, equipmentTypes, maintenancePlans, handleEquipmentSave, handleEquipmentDelete, showToast } = useDataContext();
  const { userRole, requestAdminPassword } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isAdmin = userRole === 'admin';

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

  const openEquipmentModal = (equipment: Equipment | null = null) => {
    setEditingEquipment(equipment);
    setIsEquipmentModalOpen(true);
  };

  const closeEquipmentModal = () => {
    setEditingEquipment(null);
    setIsEquipmentModalOpen(false);
  };
  
  const handleDeleteRequest = (equipment: Equipment) => {
      requestAdminPassword(() => {
          setDeletingEquipment(equipment);
      });
  };

  const handleDeleteConfirm = async () => {
      if (!deletingEquipment) return;
      const success = await handleEquipmentDelete(deletingEquipment.id);
      if (success) {
          setDeletingEquipment(null);
      }
  };

  return (
    <>
      <Header
        title="Cadastro de Ativos"
        subtitle="Gerencie sua frota de equipamentos industriais e prediais."
        actions={ isAdmin && (
          <div className="flex gap-2">
              <button onClick={() => openEquipmentModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg">
                  <PlusIcon className="w-4 h-4" /> Novo Equipamento
              </button>
          </div>
        )}
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
                  onDelete={handleDeleteRequest}
                  equipmentTypes={equipmentTypes}
                />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Nenhum ativo encontrado para esta busca.</p>
            </div>
          )}
      </div>

      {isEquipmentModalOpen && <EquipmentModal isOpen={isEquipmentModalOpen} onClose={closeEquipmentModal} onSave={onSaveEquipment} existingEquipment={editingEquipment} equipmentTypes={equipmentTypes} maintenancePlans={maintenancePlans} />}
      {deletingEquipment && <ConfirmationModal isOpen={!!deletingEquipment} onClose={() => setDeletingEquipment(null)} onConfirm={handleDeleteConfirm} title="Excluir Ativo" message={`Tem certeza que deseja excluir o equipamento ${deletingEquipment.name}? Esta ação não pode ser desfeita.`} />}
      {viewingEquipment && <EquipmentReport equipment={viewingEquipment} onClose={() => setViewingEquipment(null)} />}
    </>
  );
};