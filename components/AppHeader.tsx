import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import { LogoutIcon, SunIcon, MoonIcon, PlusIcon, HomeIcon, ClipboardListIcon, ScheduleIcon, ArrowPathIcon, RefreshIcon, GithubIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

declare const JSZip: any;

interface AppHeaderProps {
    onOpenCorrectiveRequest: () => void;
    onToggleSidebar: () => void;
}

const ShortcutBtn: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
            active 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 shadow-sm' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span className="text-xs font-bold hidden xl:block">{label}</span>
    </button>
);

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenCorrectiveRequest, onToggleSidebar }) => {
    const { theme, setTheme, handleLogout, currentPage, setCurrentPage } = useAppContext();
    const { isSyncing, syncData, loadDataFromCloud, cloudConnected, lastSyncTime, showToast } = useDataContext();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleGithubSync = async () => {
        setIsExporting(true);
        showToast("Gerando pacote para upload no GitHub...", "info");
        
        try {
            const zip = new JSZip();
            // Simulação de empacotamento. Em um ambiente local real, você usaria o CLI do Git.
            zip.file("README_GITHUB.md", "# SGMI 2.0 - Sincronização Manual\nExtraia este conteúdo na sua pasta local e use o comando 'git push'.");
            
            const content = await zip.generateAsync({type:"blob"});
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SGMI_SYNC_${new Date().getTime()}.zip`;
            link.click();
            
            showToast("Pacote ZIP baixado! Carregue os arquivos no site do GitHub.", "success");
        } catch (error) {
            showToast("Erro ao gerar pacote de sincronização.", "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <header className="bg-white dark:bg-gray-900 shadow-sm px-6 flex justify-between items-center no-print sticky top-0 z-40 border-b border-gray-200 h-20">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="p-2 text-gray-600 rounded-xl hover:bg-slate-100 border border-slate-200 shadow-sm">
                        <ArrowPathIcon className={isSyncing ? "animate-spin" : ""} />
                    </button>

                    <div className="flex items-center gap-2">
                        <ShortcutBtn icon={<HomeIcon />} label="Início" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
                        <ShortcutBtn icon={<ClipboardListIcon />} label="O.S." active={currentPage === 'work_orders'} onClick={() => setCurrentPage('work_orders')} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleGithubSync}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                    >
                        {isExporting ? <ArrowPathIcon className="animate-spin w-3 h-3"/> : <GithubIcon className="w-3 h-3"/>}
                        Sync GitHub
                    </button>

                    <div className="flex flex-col items-end">
                        <div className="flex gap-2">
                            <button onClick={() => loadDataFromCloud()} disabled={isSyncing} className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100">
                                <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            </button>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${cloudConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${cloudConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                                <span className="text-[10px] font-black uppercase">{cloudConnected ? 'Cloud ON' : 'Offline'}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={onOpenCorrectiveRequest} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all text-xs uppercase shadow-lg">
                        + Corretiva
                    </button>
                    
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
                        {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    </button>
                </div>
            </header>

            <ConfirmationModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => { handleLogout(); setIsLogoutModalOpen(false); }}
                title="Sair do Sistema"
                message="Deseja realmente sair?"
            />
        </>
    );
};
