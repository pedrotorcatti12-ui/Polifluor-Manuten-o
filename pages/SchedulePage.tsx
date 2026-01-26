import React, { useState, useMemo, useRef } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext';
import { MONTHS, MAINTENANCE_TYPE_CONFIG } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, CloseIcon, SearchIcon, TargetIcon } from '../components/icons';
import { WorkOrder, MaintenanceType, Equipment } from '../types';
import { Legend } from '../components/Legend';
import { initialStatusConfig } from '../data/dataService';
import { generateScheduleReport } from '../reports/reportGenerator';
import { useDebounce } from '../hooks/useDebounce';

interface MonthOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: WorkOrder[];
    equipmentName: string;
    monthName: string;
}

const MonthOrdersModal: React.FC<MonthOrdersModalProps> = ({ isOpen, onClose, orders, equipmentName, monthName }) => {
    const { setIsOSModalOpen, setEditingOrder } = useAppContext();
    if (!isOpen) return null;

    const handleOpenOrder = (order: WorkOrder) => {
        setEditingOrder(order);
        setIsOSModalOpen(true);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-bold">{equipmentName}</h3>
                        <p className="text-sm text-gray-500">Manutenções em {monthName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><CloseIcon /></button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {orders.map(order => (
                        <div key={order.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm">#{order.id} - {order.type}</p>
                                <p className="text-xs text-gray-600 truncate max-w-sm">{order.description}</p>
                            </div>
                            <button onClick={() => handleOpenOrder(order)} className="text-xs font-bold text-blue-600 hover:underline">Detalhes</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const SchedulePage: React.FC = () => {
    const { workOrders, equipmentData, equipmentTypes } = useDataContext();
    const [viewYear, setViewYear] = useState(2026);
    const [filterEqType, setFilterEqType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalInfo, setModalInfo] = useState<{ isOpen: boolean, orders: WorkOrder[], equipmentName: string, monthName: string }>({ isOpen: false, orders: [], equipmentName: '', monthName: '' });

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const statusMap = useMemo(() => new Map(initialStatusConfig.map(s => [s.label, s])), []);
    const ganttRef = useRef<HTMLDivElement>(null);

    const scheduleData = useMemo(() => {
        const filteredEquipment = equipmentData
            .filter(eq => (filterEqType === 'all' || eq.typeId === filterEqType))
            .filter(eq => (eq.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || eq.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())));

        const plannedOrders = workOrders.filter(order =>
            (order.type === MaintenanceType.Preventive || order.type === MaintenanceType.Predictive) &&
            new Date(order.scheduledDate).getFullYear() === viewYear
        );

        return filteredEquipment.map(eq => {
            const monthlyTasks: WorkOrder[][] = Array.from({ length: 12 }, () => []);
            plannedOrders.forEach(order => {
                if (order.equipmentId === eq.id) {
                    const monthIndex = new Date(order.scheduledDate).getMonth();
                    monthlyTasks[monthIndex].push(order);
                }
            });
            return { equipment: eq, monthlyTasks };
        });
    }, [equipmentData, workOrders, viewYear, filterEqType, debouncedSearchTerm]);

    const handleExportPdf = () => {
        // Usa o novo gerador nativo (vetorial) em vez de captura de tela
        generateScheduleReport(scheduleData, viewYear);
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <Header
                title="Cronograma Mestre de Manutenção"
                subtitle="Visão anual de atividades preventivas e preditivas por equipamento."
            />

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <button onClick={() => setViewYear(y => y - 1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-5 h-5 text-slate-500"/></button>
                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300 w-20 text-center">{viewYear}</span>
                        <button onClick={() => setViewYear(y => y + 1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-5 h-5 text-slate-500"/></button>
                    </div>
                </div>
                <div className="flex-1 flex items-center gap-4 min-w-[300px]">
                    <select value={filterEqType} onChange={e => setFilterEqType(e.target.value)} className="form-input font-bold text-sm w-64">
                        <option value="all">Todos os Tipos</option>
                        {equipmentTypes.map(type => <option key={type.id} value={type.id}>{type.description}</option>)}
                    </select>
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <input type="text" placeholder="Buscar por nome ou ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full form-input pl-9"/>
                    </div>
                </div>
                <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg">
                    <DownloadIcon className="w-4 h-4"/> Exportar PDF (A4)
                </button>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-auto custom-scrollbar">
                <div ref={ganttRef} className="min-w-[1200px]">
                    <div className="grid grid-cols-[300px_repeat(12,_1fr)] sticky top-0 bg-slate-50 dark:bg-gray-900 z-10 shadow-sm">
                        <div className="p-3 border-r border-b border-slate-100 dark:border-gray-800 text-xs font-black text-slate-500 uppercase">Equipamento</div>
                        {MONTHS.map(month => (
                            <div key={month} className="p-3 text-center border-b border-slate-100 dark:border-gray-800 text-xs font-black text-slate-500 uppercase">{month.substring(0, 3)}</div>
                        ))}
                    </div>
                    {scheduleData.map(({ equipment, monthlyTasks }) => (
                        <div key={equipment.id} className="grid grid-cols-[300px_repeat(12,_1fr)] group hover:bg-blue-50/30 dark:hover:bg-blue-900/20">
                            <div className={`p-3 border-r border-slate-100 dark:border-gray-800 truncate ${equipment.isCritical ? 'font-black text-orange-600' : 'font-semibold'}`}>
                                <p className="text-sm flex items-center gap-1">{equipment.name} {equipment.isCritical && <TargetIcon className="w-3 h-3"/>}</p>
                                <p className="text-xs text-slate-400">{equipment.id}</p>
                            </div>
                            {monthlyTasks.map((orders, monthIndex) => (
                                <button
                                    key={monthIndex}
                                    onClick={() => orders.length > 0 && setModalInfo({ isOpen: true, orders, equipmentName: equipment.name, monthName: MONTHS[monthIndex] })}
                                    className="border-r border-slate-100 dark:border-gray-800 flex items-center justify-center p-2 space-x-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:hover:bg-transparent"
                                    disabled={orders.length === 0}
                                    title={orders.length > 0 ? `${orders.length} O.S. em ${MONTHS[monthIndex]}` : ''}
                                >
                                    {Object.values(MaintenanceType).map(type => {
                                        const count = orders.filter(o => o.type === type).length;
                                        if (count === 0) return null;
                                        const config = MAINTENANCE_TYPE_CONFIG[type];
                                        return <div key={type} className={`w-3 h-3 rounded-full ${config.color}`} title={`${count}x ${type}`}></div>;
                                    })}
                                </button>
                            ))}
                        </div>
                    ))}
                     {scheduleData.length === 0 && (
                        <div className="p-20 text-center text-slate-400 font-bold">Nenhum equipamento encontrado com os filtros aplicados.</div>
                     )}
                </div>
            </div>

            <Legend statusMap={statusMap} />
            {modalInfo.isOpen && <MonthOrdersModal {...modalInfo} onClose={() => setModalInfo(prev => ({ ...prev, isOpen: false }))} />}
        </div>
    );
};