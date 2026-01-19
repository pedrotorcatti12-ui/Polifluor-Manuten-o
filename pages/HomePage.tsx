
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import { Page, MaintenanceStatus } from '../types';
import { 
    WrenchIcon, 
    ClipboardListIcon, 
    ScheduleIcon, 
    ChartIcon, 
    ShieldCheckIcon,
    ArrowRightIcon,
    TargetIcon,
    PackageIcon,
    ClockIcon
} from '../components/icons';

interface MainOpCardProps {
    title: string;
    description: string;
    icon: React.ReactElement;
    page: Page;
    count?: number;
    color: string;
}

const MainOpCard: React.FC<MainOpCardProps> = ({ title, description, icon, page, count, color }) => {
    const { setCurrentPage } = useAppContext();
    const { logActivity } = useDataContext();

    const handleNavigate = () => {
        logActivity({
            action_type: 'UPDATE_STATUS',
            description: `Acesso via atalho Home: ${title}`
        });
        setCurrentPage(page);
    };

    return (
        <button 
            onClick={handleNavigate}
            className={`group flex flex-col items-start text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700 hover:border-${color}-500 relative overflow-hidden`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 -mr-8 -mt-8 rounded-full transition-transform duration-700 group-hover:scale-150`}></div>
            
            <div className={`p-4 rounded-2xl mb-6 bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 shadow-sm group-hover:scale-110 transition-transform`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
            </div>
            
            <div className="flex justify-between items-end w-full mb-3">
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{title}</h3>
                {count !== undefined && (
                    <span className={`text-4xl font-black text-${color}-600 tracking-tighter`}>{count}</span>
                )}
            </div>
            
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">
                {description}
            </p>
            
            <div className={`mt-auto flex items-center gap-2 text-[10px] font-black uppercase text-${color}-600 group-hover:gap-4 transition-all bg-${color}-50 px-4 py-2 rounded-full`}>
                Acessar Módulo <ArrowRightIcon className="w-3 h-3" />
            </div>
        </button>
    );
};

export const HomePage: React.FC = () => {
    const { setCurrentPage } = useAppContext();
    const { workOrders, equipmentData, inventoryData, logActivity } = useDataContext();

    const stats = {
        os: workOrders.filter(o => o.status !== MaintenanceStatus.Executed).length,
        pending: equipmentData.reduce((acc, eq) => acc + eq.schedule.filter(t => t.year === 2026 && t.status === MaintenanceStatus.Scheduled).length, 0),
        criticalStock: inventoryData.filter(p => p.currentStock < p.minStock).length
    };

    const handleQuickNav = (page: Page, label: string) => {
        logActivity({
            action_type: 'UPDATE_STATUS',
            description: `Navegação rápida Home: ${label}`
        });
        setCurrentPage(page);
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-fade-in px-4">
            <div className="relative mt-4 mb-12">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur opacity-25"></div>
                <div className="relative bg-slate-950 text-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between border-b-8 border-blue-600 overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                    </div>
                    <div className="relative z-10 max-w-2xl text-center md:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/10">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Enterprise Edition • v2.0 stable</span>
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-4 leading-[0.85]">
                            SGMI <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-600">2.0</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                            Gestão de Manutenção Inteligente em Nuvem. Auditoria em tempo real e conformidade total com a <span className="text-white font-bold">IATF 16949</span>.
                        </p>
                    </div>
                    <div className="hidden lg:flex relative mr-12">
                        <div className="relative">
                            <div className="absolute -inset-10 bg-blue-600/30 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[3rem] shadow-2xl flex items-center justify-center rotate-3 border-4 border-white/10">
                                <WrenchIcon className="w-24 h-24 text-white drop-shadow-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                <div>
                    <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Painel de Controle</h2>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Navegação Estratégica</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <MainOpCard title="Ordens de Serviço" description="Controle tático de Corretivas e Preventivas." icon={<ClipboardListIcon />} page="work_orders" count={stats.os} color="blue" />
                <MainOpCard title="Cronograma 2026" description="Planejamento mestre anual. Visão de carga." icon={<ScheduleIcon />} page="schedule" count={stats.pending} color="indigo" />
                <MainOpCard title="BI & Dashboards" description="Indicadores de performance industrial." icon={<ChartIcon />} page="dashboard" color="emerald" />
                <MainOpCard title="Governança IATF" description="Auditoria de falhas e conformidade." icon={<ShieldCheckIcon />} page="quality" color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><PackageIcon className="w-32 h-32" /></div>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><PackageIcon className="w-5 h-5"/></div>
                            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Estoque Crítico (FO-044)</h4>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">{stats.criticalStock} Itens</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Abaixo do estoque mínimo de segurança.</p>
                    </div>
                    <button 
                        onClick={() => handleQuickNav('inventory', 'Gerenciar Suprimentos')} 
                        className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:gap-4 transition-all"
                    >
                        Gerenciar Suprimentos <ArrowRightIcon className="w-3 h-3" />
                    </button>
                </div>

                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row justify-between items-center group">
                    <div className="max-w-md">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-blue-200">Ficha Técnica e Ativos</h4>
                        <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase">Cadastro e Monitoramento de Frota</h3>
                        <p className="text-blue-100/70 text-sm font-medium mb-6 leading-relaxed">Gerencie dados de fabricantes, manuais e criticidade de cada máquina.</p>
                        <button 
                            onClick={() => handleQuickNav('equipment', 'Acessar Equipamentos')} 
                            className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Acessar Equipamentos
                        </button>
                    </div>
                    <div className="mt-8 md:mt-0 relative">
                        <TargetIcon className="w-32 h-32 text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                        <ShieldCheckIcon className="w-24 h-24 text-white opacity-40" />
                    </div>
                </div>
            </div>
        </div>
    );
};
