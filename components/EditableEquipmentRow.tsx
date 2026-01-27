

import React, { useMemo } from 'react';
import { Equipment, MaintenanceStatus, MaintenanceType, EquipmentType } from '../types';
import { EditIcon, InfoIcon, DeleteIcon, TargetIcon, ExclamationTriangleIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext';

export const EditableEquipmentRow: React.FC<{
    equipment: Equipment;
    onView: (eq: Equipment) => void;
    onEdit: (eq: Equipment) => void;
    onDelete: (eq: Equipment) => void;
    equipmentTypes: EquipmentType[];
}> = ({ equipment, onView, onEdit, onDelete, equipmentTypes }) => {
    const { workOrders } = useDataContext();
    const { userRole } = useAppContext();
    
    const isAdmin = userRole === 'admin';

    const hasHighFailureRate = useMemo(() => {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const correctiveCount = workOrders.filter(wo => 
            wo.equipmentId === equipment.id && 
            wo.type === MaintenanceType.Corrective &&
            new Date(wo.scheduledDate) > last30Days
        ).length;

        return correctiveCount >= 3;
    }, [workOrders, equipment.id]);
    
    const equipmentTypeName = useMemo(() => {
        // FIX: Use typeId to find the equipment type description instead of model.
        return equipmentTypes.find(t => t.id === equipment.typeId)?.description || equipment.typeId || 'Não definido';
    }, [equipment.typeId, equipmentTypes]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border transition-all hover:shadow-md ${hasHighFailureRate ? 'border-l-8 border-rose-500' : (equipment.isCritical ? 'border-l-8 border-orange-500' : 'border-slate-100')}`}>
            <div className="flex justify-between items-center p-6">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                     <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
                        <span className="text-xs font-black text-slate-500">{equipment.id}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                             <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">{equipment.name}</h3>
                             {equipment.isCritical && (
                                 <span className="px-2 py-0.5 bg-orange-600 text-white text-[7px] font-black rounded uppercase flex items-center gap-1 shadow-sm">
                                     <TargetIcon className="w-2 h-2" /> Ativo Crítico
                                 </span>
                             )}
                             {hasHighFailureRate && (
                                 <span className="px-2 py-0.5 bg-rose-600 text-white text-[7px] font-black rounded uppercase flex items-center gap-1 shadow-sm animate-pulse">
                                     <ExclamationTriangleIcon className="w-2 h-2" /> Falhas Recorrentes
                                 </span>
                             )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">
                            {equipment.location || 'N/A'} • {equipmentTypeName}
                        </p>
                     </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${equipment.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{equipment.status}</span>
                    <div className="w-[1px] h-8 bg-slate-100 mx-1"></div>
                    <button onClick={(e) => { e.stopPropagation(); onView(equipment); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Ver Relatório de Confiabilidade"><InfoIcon className="w-5 h-5"/></button>
                    {isAdmin && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(equipment); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar Ficha"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(equipment); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Desativar Ativo"><DeleteIcon className="w-5 h-5"/></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};