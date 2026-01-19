
import React, { useState, useMemo } from 'react';
import { useDataContext } from '../contexts/DataContext';
import { Equipment, MaintenanceTask, SelectedTask, MaintenanceStatus } from '../types';
import { Header } from '../components/Header';
import { MaintenanceSchedule } from '../components/MaintenanceSchedule';
import { WorkOrderModal } from '../components/WorkOrderModal';
import { LoadBalancerModal } from '../components/LoadBalancerModal';
import { CompactYearlySchedule } from '../components/CompactYearlySchedule';
import { useDebounce } from '../hooks/useDebounce';
import { DownloadIcon, RefreshIcon, ClipboardListIcon } from '../components/icons';
import { MONTHS } from '../constants';
import { useToast } from '../contexts/ToastContext';

export const SchedulePage: React.FC = () => {
    const { showToast } = useToast();
    const {
        equipmentData,
        setEquipmentData,
        statusConfig,
        maintainers,
        requesters,
        standardTasks,
        standardMaterials
    } = useDataContext();

    const [viewYear, setViewYear] = useState(2026);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
    const [isLoadBalancerOpen, setIsLoadBalancerOpen] = useState(false);
    const [isCompactViewOpen, setIsCompactViewOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredEquipment = useMemo(() => {
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        return equipmentData.filter(eq => 
            eq.id.toLowerCase().includes(lowercasedTerm) ||
            eq.name.toLowerCase().includes(lowercasedTerm) ||
            eq.location.toLowerCase().includes(lowercasedTerm)
        );
    }, [equipmentData, debouncedSearchTerm]);

    const handleCellClick = (equipment: Equipment, monthIndex: number, task: MaintenanceTask) => {
        setSelectedTask({ equipment, monthIndex, year: viewYear, task });
    };

    const handleTaskUpdate = (updatedTask: MaintenanceTask) => {
        if (!selectedTask) return;
        setEquipmentData(prevData =>
            prevData.map(eq => {
                if (eq.id === selectedTask.equipment.id) {
                    const scheduleIndex = eq.schedule.findIndex(t => t.id === selectedTask.task.id);
                    if (scheduleIndex > -1) {
                        const newSchedule = [...eq.schedule];
                        newSchedule[scheduleIndex] = updatedTask;
                        return { ...eq, schedule: newSchedule };
                    } else {
                        return { ...eq, schedule: [...eq.schedule, updatedTask] };
                    }
                }
                return eq;
            })
        );
        setSelectedTask(null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Header
                title="Planejamento Mestre 2026"
                subtitle="Gestão estratégica de paradas preventivas e carga de trabalho."
                actions={
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsCompactViewOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-black rounded-xl text-[10px] uppercase border border-emerald-100 hover:bg-emerald-100 transition-all"
                        >
                            <ClipboardListIcon className="w-4 h-4" /> Visão Compacta
                        </button>
                        <button 
                            onClick={() => setIsLoadBalancerOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-black rounded-xl text-[10px] uppercase border border-blue-100 hover:bg-blue-100 transition-all"
                        >
                            <RefreshIcon className="w-4 h-4" /> Balancear Carga
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase shadow-lg">
                            <DownloadIcon className="w-4 h-4"/> Exportar Lista
                        </button>
                    </div>
                }
            />

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Filtrar cronograma por Ativo ou Setor..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full form-input pl-4 h-12 rounded-xl border-none bg-slate-50 font-bold" 
                    />
                </div>
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

            {isLoadBalancerOpen && (
                <LoadBalancerModal 
                    isOpen={isLoadBalancerOpen}
                    onClose={() => setIsLoadBalancerOpen(false)}
                    equipmentData={equipmentData}
                    onApply={(newData) => { 
                        setEquipmentData(newData); 
                        setIsLoadBalancerOpen(false);
                        showToast('Cronograma balanceado com sucesso!', 'success');
                    }}
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
