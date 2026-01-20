
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import { LogoutIcon, SunIcon, MoonIcon, PlusIcon, HomeIcon, ClipboardListIcon, ArrowPathIcon, GithubIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

const PolifluorBrand = () => (
    <div className="bg-[#D32F2F] text-white px-3 py-1 skew-x-[-10deg] rounded-sm mr-4 shadow-sm">
        <span className="font-black italic text-sm tracking-tighter skew-x-[10deg] block">POLIFLUOR</span>
    </div>
);

const ShortcutBtn: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
            active 
            ? 'bg-slate-100 text-[#D32F2F] font-bold shadow-sm' 
            : 'text-gray-500 hover:bg-gray-50'
        }`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span className="text-xs hidden xl:block">{label}</span>
    </button>
);

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenCorrectiveRequest, onToggleSidebar }) => {
    const { theme, setTheme, handleLogout, currentPage, setCurrentPage } = useAppContext();
    const { isSyncing, cloudConnected, showToast } = useDataContext();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return (
        <>
            <header className="bg-white dark:bg-gray-900 shadow-sm px-6 flex justify-between items-center no-print sticky top-0 z-40 border-b border-slate-200 h-16">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="p-2 text-gray-500 rounded-lg hover:bg-slate-100">
                        <ArrowPathIcon className={isSyncing ? "animate-spin" : ""} />
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    <PolifluorBrand />

                    <div className="flex items-center gap-1">
                        <ShortcutBtn icon={<HomeIcon />} label="Início" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
                        <ShortcutBtn icon={<ClipboardListIcon />} label="O.S." active={currentPage === 'work_orders'} onClick={() => setCurrentPage('work_orders')} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border ${cloudConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${cloudConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className="text-[10px] font-black uppercase">{cloudConnected ? 'Online' : 'Offline'}</span>
                    </div>

                    <button 
                        onClick={onOpenCorrectiveRequest} 
                        className="px-5 py-2 bg-[#D32F2F] hover:bg-red-800 text-white font-black rounded-lg transition-all text-xs uppercase shadow-md flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4"/>
                        Solicitar Corretiva
                    </button>
                    
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
                        {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    </button>
                    
                    <button onClick={() => setIsLogoutModalOpen(true)} className="p-2 text-gray-400 hover:text-red-600 ml-2">
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <ConfirmationModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => { handleLogout(); setIsLogoutModalOpen(false); }}
                title="Sair do Sistema"
                message="Deseja realmente fazer logout do SGMI 2.0?"
            />
        </>
    );
};

interface AppHeaderProps {
    onOpenCorrectiveRequest: () => void;
    onToggleSidebar: () => void;
}
