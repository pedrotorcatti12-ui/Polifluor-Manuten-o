
import React, { useState, useMemo } from 'react';
import { useDataContext } from '../contexts/DataContext';
import { Equipment, MaintenanceTask, SelectedTask, MaintenanceStatus, MaintenanceType } from '../types';
import { Header } from '../components/Header';
import { MaintenanceSchedule } from '../components/MaintenanceSchedule';
import { WorkOrderModal } from '../components/WorkOrderModal';
import { CompactYearlySchedule } from '../components/CompactYearlySchedule';
import { useDebounce } from '../hooks/useDebounce';
import { DownloadIcon, RefreshIcon, ClipboardListIcon } from '../components/icons';
import { MONTHS } from '../constants';
import { useToast } from '../contexts/ToastContext';

export const SchedulePage: React.FC = () => {
    const { showToast } = useToast();
    const {
        equipmentData,
        workOrders,
        statusConfig,
        maintainers,
        requesters,
        standardTasks,
        standardMaterials,
        handleUnifiedSave,
        generateFullPlanning2026
    } = useDataContext();

    const [viewYear, setViewYear] = useState(2026);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
    const [isCompactViewOpen, setIsCompactViewOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredEquipment = useMemo(() => {
        const term = debouncedSearchTerm.toLowerCase();
        
        return equipmentData.filter(eq => 
            eq.id.toLowerCase().includes(term) ||
            eq.name.toLowerCase().includes(term) ||
            eq.location.toLowerCase().includes(term)
        ).map(eq => {
            const eqOrders = workOrders.filter(wo => wo.equipmentId === eq.id);
            const dynamicSchedule = eqOrders.map(wo => {
                const d = new Date(wo.scheduledDate);
                return {
                    id: wo.id,
                    year: d.getFullYear(),
                    month: MONTHS[d.getMonth()],
                    status: wo.status,
                    type: wo.type,
                    description: wo.description,
                    osNumber: wo.id,
                    startDate: wo.scheduledDate
                } as MaintenanceTask;
            });

            return { ...eq, schedule: dynamicSchedule };
        });
    }, [equipmentData, workOrders, debouncedSearchTerm]);

    const handleCellClick = (equipment: Equipment, monthIndex: number, task: MaintenanceTask) => {
        setSelectedTask({ equipment, monthIndex, year: viewYear, task });
    };

    const handleTaskUpdate = async (updatedTask: MaintenanceTask) => {
        if (!selectedTask) return;
        
        const woToSave = workOrders.find(w => w.id === updatedTask.id) || {
            id: updatedTask.id,
            equipmentId: selectedTask.equipment.id,
            requester: 'Cronograma',
            manHours: [],
            materialsUsed: []
        };

        const newDate = new Date(viewYear, MONTHS.indexOf(updatedTask.month), 1, 8, 0);
        
        await handleUnifiedSave({
            ...woToSave,
            type: updatedTask.type || MaintenanceType.Preventive,
            status: updatedTask.status,
            description: updatedTask.description,
            scheduledDate: updatedTask.startDate || newDate.toISOString(),
        } as any);

        setSelectedTask(null);
        showToast("Cronograma atualizado com sucesso.", "success");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title="Planejamento Mestre 2026"
                subtitle="Gestão estratégica Polifluor. Frequências baseadas na criticidade IATF."
                actions={
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { generateFullPlanning2026(); showToast("Plano 2026 regenerado.", "info"); }} 
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-black rounded-xl text-[10px] uppercase border border-slate-200 hover:bg-slate-200 transition-all"
                        >
                            <RefreshIcon className="w-4 h-4" /> Resetar Plano 2026
                        </button>
                        <button 
                            onClick={() => setIsCompactViewOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-black rounded-xl text-[10px] uppercase border border-emerald-100 hover:bg-emerald-100 transition-all"
                        >
                            <ClipboardListIcon className="w-4 h-4" /> Visão Compacta
                        </button>
                    </div>
                }
            />

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <input 
                    type="text" 
                    placeholder="Filtrar por Ativo (Ex: PH-15) ou Setor (Ex: Moldagem)..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full form-input h-12 rounded-xl bg-slate-50 font-bold" 
                />
            </div>

            <MaintenanceSchedule
                equipmentData={filteredEquipment}
                viewYear={viewYear}
                onCellClick={handleCellClick}
                statusMap={new Map(statusConfig.map(s => [s.label, s]))}
                onEdit={() => {}} 
                onDelete={() => {}} 
                onViewDetails={() => {}} 
                onAddCorrective={() => {}}
            />

            {selectedTask && (
                <WorkOrderModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    onTaskUpdate={handleTaskUpdate}
                    statusConfig={statusConfig}
                    maintainers={maintainers}
                    requesters={requesters}
                    standardTasks={standardTasks}
                    standardMaterials={standardMaterials}
                />
            )}

            <CompactYearlySchedule 
                isOpen={isCompactViewOpen} 
                onClose={() => setIsCompactViewOpen(false)} 
                equipmentData={filteredEquipment} 
                year={viewYear}
            />
        </div>
    );
};
