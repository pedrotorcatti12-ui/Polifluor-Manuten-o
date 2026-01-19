
import React, { useMemo } from 'react';
import { Page, MaintenanceStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import {
    SettingsIcon, UsersIcon, InventoryIcon, PackageIcon, ClipboardListIcon,
    ScheduleIcon, HomeIcon, ChartIcon, ShieldCheckIcon, SearchIcon,
    WrenchIcon, InfoIcon, DocumentTextIcon, ShoppingCartIcon, RefreshIcon,
    TargetIcon
} from './icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  page: Page;
  onClick: (e: React.MouseEvent) => void;
  isPriority?: boolean;
  badge?: string | number;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, page, onClick, isPriority, badge, isCollapsed }) => {
  const { currentPage, setCurrentPage } = useAppContext();
  const isActive = currentPage === page;
  
  const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentPage(page);
      onClick(e);
  };
  
  return (
    <li>
      <button
        onClick={handleClick}
        className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-black transition-all duration-300 rounded-2xl mb-1 relative overflow-hidden ${
          isActive
            ? isPriority 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                : 'bg-slate-900 text-white shadow-md'
            : isPriority 
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100' 
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800'
        } ${isCollapsed ? 'justify-center px-0' : ''}`}
        title={isCollapsed ? label : undefined}
      >
        {isActive && !isPriority && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-full my-3" />
        )}
        
        <div className="flex items-center">
            <div className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''} ${!isCollapsed ? 'mr-3' : ''}`}>{icon}</div>
            {!isCollapsed && <span className="whitespace-nowrap uppercase tracking-tighter text-xs">{label}</span>}
        </div>
        
        {!isCollapsed && badge !== undefined && badge !== 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white shadow-sm'}`}>
                {badge}
            </span>
        )}
        {isCollapsed && badge !== undefined && badge !== 0 && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white shadow-sm"></div>
        )}
      </button>
    </li>
  );
};

const NavGroup: React.FC<{ title: string, children: React.ReactNode, sub?: string, isCollapsed?: boolean }> = ({ title, children, sub, isCollapsed }) => (
    <div className="mt-8">
        {!isCollapsed && (
            <div className="px-4 mb-3">
                <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">{title}</h3>
                {sub && <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{sub}</p>}
            </div>
        )}
        {isCollapsed && <div className="mx-auto w-8 border-t border-slate-100 dark:border-gray-800 mb-4" />}
        <ul className="space-y-1">
            {children}
        </ul>
    </div>
);

interface SidebarProps {
    onCloseMobile?: () => void;
    isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile, isCollapsed }) => {
  const { setCurrentPage } = useAppContext();
  const { workOrders } = useDataContext();
  
  const delayedCount = useMemo(() => 
    workOrders.filter(o => o.status === MaintenanceStatus.Delayed).length, 
  [workOrders]);

  const handleNavClick = (e: React.MouseEvent) => {
      if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-full h-full flex flex-col no-print overflow-hidden select-none">
      {/* BRAND HEADER */}
      <div 
        className={`flex items-center h-24 border-b border-slate-50 dark:border-gray-800 bg-white transition-all cursor-pointer hover:bg-slate-50 ${isCollapsed ? 'justify-center' : 'px-6'}`} 
        onClick={(e) => { e.stopPropagation(); setCurrentPage('home'); if(onCloseMobile) onCloseMobile(); }}
      >
         <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 flex-shrink-0 transform -rotate-3 group-hover:rotate-0 transition-transform">
            <WrenchIcon className="h-6 w-6 text-white" />
         </div>
         {!isCollapsed && (
             <div className="ml-3 overflow-hidden animate-fade-in">
                 <span className="block text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">SGMI 2.0</span>
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Unidade Polifluor</span>
             </div>
         )}
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
        
        <div className="mb-2">
            <NavItem icon={<HomeIcon />} label="Dashboard Principal" page="home" onClick={handleNavClick} isCollapsed={isCollapsed} />
        </div>

        <div className={`mt-8 transition-all ${!isCollapsed ? 'p-3 rounded-[2rem] bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700' : ''}`}>
             {!isCollapsed && (
                 <div className="px-3 mb-4 flex items-center gap-2 animate-fade-in">
                    <TargetIcon className="w-4 h-4 text-blue-600" />
                    <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Célula de Controle</h3>
                 </div>
             )}
             <ul className="space-y-1">
                <NavItem icon={<ClipboardListIcon />} label="Zona de Combate" page="work_orders" onClick={handleNavClick} isPriority badge={delayedCount} isCollapsed={isCollapsed} />
                <NavItem icon={<ScheduleIcon />} label="Visão Estratégica" page="schedule" onClick={handleNavClick} isPriority isCollapsed={isCollapsed} />
                <NavItem icon={<ChartIcon />} label="Termômetro Fábrica" page="dashboard" onClick={handleNavClick} isPriority isCollapsed={isCollapsed} />
             </ul>
        </div>

        <NavGroup title="Operação Diária" sub="Gestão de Suprimentos" isCollapsed={isCollapsed}>
            <NavItem icon={<ShoppingCartIcon />} label="Compras / Peças" page="purchasing" onClick={handleNavClick} isCollapsed={isCollapsed} />
            <NavItem icon={<InventoryIcon />} label="Almoxarifado" page="inventory" onClick={handleNavClick} isCollapsed={isCollapsed} />
        </NavGroup>

        <NavGroup title="Engenharia de Ativos" sub="Configuração e Fichas" isCollapsed={isCollapsed}>
            <NavItem icon={<PackageIcon />} label="Fichas das Máquinas" page="equipment" onClick={handleNavClick} isCollapsed={isCollapsed} />
            <NavItem icon={<RefreshIcon />} label="Auditoria Estoque" page="inventory_logs" onClick={handleNavClick} isCollapsed={isCollapsed} />
        </NavGroup>

        <NavGroup title="Business Intelligence" sub="Compliance IATF 16949" isCollapsed={isCollapsed}>
            <NavItem icon={<TargetIcon />} label="BI Avançado" page="advanced_reports" onClick={handleNavClick} isCollapsed={isCollapsed} />
            <NavItem icon={<ShieldCheckIcon />} label="Governança IATF" page="quality" onClick={handleNavClick} isCollapsed={isCollapsed} />
            <NavItem icon={<SearchIcon />} label="Busca Mestra O.S." page="search_os" onClick={handleNavClick} isCollapsed={isCollapsed} />
            <NavItem icon={<DocumentTextIcon />} label="Central Docs" page="documentation" onClick={handleNavClick} isCollapsed={isCollapsed} />
        </NavGroup>
      </nav>

      {/* FOOTER NAV */}
      <div className={`p-4 border-t border-slate-50 dark:border-gray-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
         <button 
            onClick={(e) => { e.stopPropagation(); setCurrentPage('settings'); handleNavClick(e); }}
            className={`flex items-center w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors ${isCollapsed ? 'justify-center' : 'px-4'}`}
            title={isCollapsed ? 'Configurações' : undefined}
         >
            <SettingsIcon className={`w-4 h-4 ${!isCollapsed ? 'mr-3' : ''}`} />
            {!isCollapsed && 'Configurações'}
         </button>
      </div>
    </aside>
  );
};
