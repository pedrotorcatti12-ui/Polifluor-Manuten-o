


import React, { useMemo } from 'react';
import { Page, MaintenanceStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import {
    SettingsIcon, UsersIcon, InventoryIcon, PackageIcon, ClipboardListIcon,
    ScheduleIcon, HomeIcon, ChartIcon, ShieldCheckIcon,
    WrenchIcon, InfoIcon, DocumentTextIcon, ShoppingCartIcon, RefreshIcon,
    TargetIcon, ChevronRightIcon, ChevronLeftIcon, DownloadIcon
} from './icons';

// Componente NavItem Estilizado Polifluor
const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    page: Page;
    onClick: () => void;
    isActive: boolean;
    isCollapsed: boolean;
    badge?: number;
    badgeType?: 'notification' | 'info';
}> = ({ icon, label, page, onClick, isActive, isCollapsed, badge, badgeType = 'notification' }) => {
    
    const badgeColorClass = badgeType === 'notification' && badge && badge > 0
        ? 'bg-[#D32F2F] text-white' 
        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

    const showBadgeInExpanded = badge !== undefined;
    const showBadgeAsNotification = badgeType === 'notification' && badge !== undefined && badge > 0;

    return (
        <li className="relative group">
            <button
                onClick={onClick}
                className={`flex items-center w-full p-3 mb-1 transition-all duration-200 rounded-lg border-l-4
                ${isActive 
                    ? `bg-slate-50 border-[#D32F2F] text-[#D32F2F]` // Ativo: Borda vermelha esquerda, fundo cinza claro
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900' // Inativo
                }
                ${isCollapsed ? 'justify-center pl-0 border-l-0' : ''}`}
            >
                <div className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
                        className: `w-5 h-5 ${isActive ? 'text-[#D32F2F]' : 'text-slate-400 group-hover:text-slate-600'}` 
                    })}
                </div>

                {!isCollapsed && (
                    <span className={`ml-3 text-xs font-bold tracking-tight truncate flex-1 text-left ${isActive ? 'text-slate-900' : ''}`}>
                        {label}
                    </span>
                )}

                {!isCollapsed && showBadgeInExpanded && (badgeType === 'info' || showBadgeAsNotification) ? (
                    <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${badgeColorClass}`}>
                        {badge}
                    </span>
                ) : null}

                {isCollapsed && showBadgeAsNotification ? (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#D32F2F] rounded-full border border-white"></span>
                ) : null}
            </button>

            {/* Tooltip */}
            {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                    {label}
                </div>
            )}
        </li>
    );
};

const SectionHeader: React.FC<{ title: string; isCollapsed: boolean }> = ({ title, isCollapsed }) => {
    if (isCollapsed) return <div className="h-px bg-slate-200 my-4 mx-4"></div>;
    return (
        <h3 className="px-4 mt-6 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {title}
        </h3>
    );
};

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, onCloseMobile }) => {
    const { currentPage, setCurrentPage, userRole } = useAppContext();
    const { workOrders, equipmentData, equipmentTypes, inventoryData } = useDataContext();

    const delayedCount = useMemo(() => 
        workOrders.filter(o => o.status === MaintenanceStatus.Delayed).length, 
    [workOrders]);
    
    const assetCount = useMemo(() => equipmentData.length, [equipmentData]);
    const assetTypeCount = useMemo(() => equipmentTypes.length, [equipmentTypes]);
    const inventoryCount = useMemo(() => inventoryData.length, [inventoryData]);

    const handleNav = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 768) onCloseMobile();
    };
    
    const isAdmin = userRole === 'admin';

    return (
        <aside className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
            {/* BRAND AREA */}
            <div className={`flex items-center h-20 border-b border-slate-100 transition-all ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-[#D32F2F] rounded-md flex items-center justify-center text-white shadow-md flex-shrink-0">
                        <span className="font-black italic text-xs">PF</span>
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in min-w-[120px]">
                            <h1 className="text-lg font-black text-slate-900 leading-none tracking-tighter italic">POLIFLUOR</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">SGMI 2.0</p>
                        </div>
                    )}
                </div>
            </div>

            {/* NAV SCROLLABLE */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar">
                
                <ul className="space-y-0.5">
                    <NavItem icon={<HomeIcon />} label="Visão Geral" page="home" onClick={() => handleNav('home')} isActive={currentPage === 'home'} isCollapsed={isCollapsed} />
                    {isAdmin && <NavItem icon={<ChartIcon />} label="Dashboard KPI" page="dashboard" onClick={() => handleNav('dashboard')} isActive={currentPage === 'dashboard'} isCollapsed={isCollapsed} />}
                </ul>

                <SectionHeader title="Planejamento & Operações" isCollapsed={isCollapsed} />
                <ul className="space-y-0.5">
                    <NavItem icon={<ClipboardListIcon />} label="Ordens de Serviço" page="work_orders" onClick={() => handleNav('work_orders')} isActive={currentPage === 'work_orders'} isCollapsed={isCollapsed} badge={delayedCount} />
                    {isAdmin && <NavItem icon={<TargetIcon />} label="Planejamento" page="planning" onClick={() => handleNav('planning')} isActive={currentPage === 'planning'} isCollapsed={isCollapsed} />}
                    <NavItem icon={<ScheduleIcon />} label="Cronograma" page="schedule" onClick={() => handleNav('schedule')} isActive={currentPage === 'schedule'} isCollapsed={isCollapsed} />
                    {isAdmin && <NavItem icon={<PackageIcon />} label="Equipamentos" page="equipment" onClick={() => handleNav('equipment')} isActive={currentPage === 'equipment'} isCollapsed={isCollapsed} badge={assetCount} badgeType="info" />}
                    {isAdmin && <NavItem icon={<WrenchIcon />} label="Tipos de Equipamento" page="equipment_types" onClick={() => handleNav('equipment_types')} isActive={currentPage === 'equipment_types'} isCollapsed={isCollapsed} badge={assetTypeCount} badgeType="info" />}
                </ul>

                {isAdmin && (
                    <>
                        <SectionHeader title="Recursos & Suprimentos" isCollapsed={isCollapsed} />
                        <ul className="space-y-0.5">
                            <NavItem icon={<InventoryIcon />} label="Almoxarifado" page="inventory" onClick={() => handleNav('inventory')} isActive={currentPage === 'inventory'} isCollapsed={isCollapsed} badge={inventoryCount} badgeType="info" />
                            <NavItem icon={<ShoppingCartIcon />} label="Compras" page="purchasing" onClick={() => handleNav('purchasing')} isActive={currentPage === 'purchasing'} isCollapsed={isCollapsed} />
                        </ul>
                    </>
                )}

                <SectionHeader title="Qualidade & Reports" isCollapsed={isCollapsed} />
                <ul className="space-y-0.5">
                    {isAdmin && <NavItem icon={<ShieldCheckIcon />} label="Conformidade IATF" page="quality" onClick={() => handleNav('quality')} isActive={currentPage === 'quality'} isCollapsed={isCollapsed} />}
                    <NavItem icon={<WrenchIcon />} label="Histórico de Manutenção" page="history" onClick={() => handleNav('history')} isActive={currentPage === 'history'} isCollapsed={isCollapsed} />
                    {isAdmin && <NavItem icon={<DownloadIcon />} label="Central de Relatórios" page="reports" onClick={() => handleNav('reports')} isActive={currentPage === 'reports'} isCollapsed={isCollapsed} />}
                </ul>

                <SectionHeader title="Sistema" isCollapsed={isCollapsed} />
                <ul className="space-y-0.5">
                    {isAdmin && <NavItem icon={<SettingsIcon />} label="Configurações" page="settings" onClick={() => handleNav('settings')} isActive={currentPage === 'settings'} isCollapsed={isCollapsed} />}
                    <NavItem icon={<DocumentTextIcon />} label="Central de Impressão" page="documentation" onClick={() => handleNav('documentation')} isActive={currentPage === 'documentation'} isCollapsed={isCollapsed} />
                     <NavItem icon={<InfoIcon />} label="Sobre o SGMI" page="information" onClick={() => handleNav('information')} isActive={currentPage === 'information'} isCollapsed={isCollapsed} />
                </ul>
            </nav>

            {/* FOOTER TOGGLE */}
            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={onToggle}
                    className="flex items-center justify-center w-full py-2 bg-slate-50 text-slate-400 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                </button>
            </div>
        </aside>
    );
};