import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { 
    UsersIcon, 
    WrenchIcon, 
    DeleteIcon, 
    PlusIcon,
    RefreshIcon,
    ArrowPathIcon,
    EditIcon,
    LightBulbIcon
} from '../components/icons';
import { useAppContext } from '../contexts/AppContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

type MasterDataType = 'maintainers' | 'requesters';

const DataList: React.FC<{
    title: string;
    icon: React.ReactNode;
    items: string[];
    onAdd: (item: string) => void;
    onUpdate: (oldValue: string, newValue: string) => void;
    onRemove: (item: string) => void;
}> = ({ title, icon, items, onAdd, onUpdate, onRemove }) => {
    const [newItem, setNewItem] = useState('');
    const [editingItem, setEditingItem] = useState<{ old: string, new: string } | null>(null);

    const handleAdd = () => {
        if(newItem.trim()) onAdd(newItem.trim());
        setNewItem('');
    };
    
    const handleUpdate = () => {
        if(editingItem && editingItem.new.trim() && editingItem.old !== editingItem.new.trim()) {
            onUpdate(editingItem.old, editingItem.new.trim());
        }
        setEditingItem(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">{icon}</div>
                <div>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">{title}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{items.length} Registros</p>
                </div>
            </div>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={newItem} 
                    onChange={e => setNewItem(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAdd()}
                    placeholder="Adicionar novo..."
                    className="flex-1 form-input h-12 bg-slate-50"
                />
                <button onClick={handleAdd} className="h-12 w-12 flex items-center justify-center bg-slate-800 text-white rounded-xl hover:bg-blue-600"><PlusIcon/></button>
            </div>

            <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2">
                {items.map(item => (
                    <div key={item} className="group flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        {editingItem?.old === item ? (
                            <input 
                                autoFocus
                                value={editingItem.new}
                                onChange={e => setEditingItem({ ...editingItem, new: e.target.value })}
                                onBlur={handleUpdate}
                                onKeyPress={e => e.key === 'Enter' && handleUpdate()}
                                className="flex-1 bg-transparent font-bold text-blue-600 outline-none"
                            />
                        ) : (
                            <p className="font-bold text-sm text-slate-700">{item}</p>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <button onClick={() => setEditingItem({ old: item, new: item })} className="p-2 text-slate-400 hover:text-blue-600"><EditIcon className="w-4 h-4"/></button>
                            <button onClick={() => onRemove(item)} className="p-2 text-slate-400 hover:text-rose-600"><DeleteIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const SettingsPage: React.FC = () => {
    const { 
        maintainers, requesters,
        handleMaintainerSave, handleMaintainerDelete,
        handleRequesterSave, handleRequesterDelete,
        handleBulkDeleteWorkOrders,
        forceFullDatabaseRefresh, isSyncing,
        runAutoClassification, refreshPlanTargets, showToast
    } = useDataContext();
    
    const { requestAdminPassword } = useAppContext();
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isRunningAuto, setIsRunningAuto] = useState(false);

    const handleBulkDeleteRequest = () => {
        requestAdminPassword(() => {
            setIsBulkDeleteModalOpen(true);
        });
    };

    const handleBulkDeleteConfirm = async () => {
        const success = await handleBulkDeleteWorkOrders();
        if (success) {
            setIsBulkDeleteModalOpen(false);
        }
    };

    const handleRunAutomation = async () => {
        setIsRunningAuto(true);
        requestAdminPassword(async () => {
            const cSuccess = await runAutoClassification();
            const lSuccess = await refreshPlanTargets();
            if (cSuccess && lSuccess) {
                showToast("Automação de inteligência executada com sucesso!", "success");
            } else {
                showToast("Houve um erro ao executar a automação.", "error");
            }
            setIsRunningAuto(false);
        });
    };


    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <Header 
                title="Cadastros Base" 
                subtitle="Gestão centralizada de mantenedores e solicitantes."
                actions={
                    <button 
                        onClick={() => forceFullDatabaseRefresh()} 
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all text-xs uppercase tracking-widest disabled:bg-slate-300"
                    >
                        {isSyncing ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <RefreshIcon className="w-4 h-4"/>}
                        {isSyncing ? 'Sincronizando...' : 'Forçar Sincronização'}
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minHeight: '60vh' }}>
                <DataList 
                    title="Mantenedores" 
                    icon={<WrenchIcon/>} 
                    items={maintainers}
                    onAdd={(item) => requestAdminPassword(() => handleMaintainerSave(item))}
                    onUpdate={(oldV, newV) => requestAdminPassword(() => handleMaintainerSave(newV, oldV))}
                    onRemove={(item) => requestAdminPassword(() => handleMaintainerDelete(item))}
                />
                <DataList 
                    title="Solicitantes" 
                    icon={<UsersIcon/>} 
                    items={requesters}
                    onAdd={(item) => requestAdminPassword(() => handleRequesterSave(item))}
                    onUpdate={(oldV, newV) => requestAdminPassword(() => handleRequesterSave(newV, oldV))}
                    onRemove={(item) => requestAdminPassword(() => handleRequesterDelete(item))}
                />
            </div>
            
            {/* Seção de Automação */}
            <div className="mt-8">
                <h2 className="text-base font-black text-indigo-600 uppercase tracking-tight border-b-2 border-indigo-200 pb-2 mb-4">
                    Automação e Inteligência de Dados
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 flex justify-between items-center shadow-sm">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <LightBulbIcon className="w-5 h-5 text-indigo-500" />
                            Classificação Automática e Vinculação
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Executa algoritmos no servidor para corrigir Tipos de Equipamento baseados no nome e revincular todos os Planos de Manutenção. Use após importar dados em massa.
                        </p>
                    </div>
                    <button 
                        onClick={handleRunAutomation}
                        disabled={isRunningAuto}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                        {isRunningAuto ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <WrenchIcon className="w-4 h-4" />}
                        {isRunningAuto ? 'Processando...' : 'Rodar Correção Automática'}
                    </button>
                </div>
            </div>

            {/* Zona de Perigo */}
            <div className="mt-12">
                <h2 className="text-base font-black text-rose-600 uppercase tracking-tight border-b-2 border-rose-200 pb-2 mb-4">
                    Zona de Perigo
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-rose-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800">Limpar Cronograma Inteiro</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Ação irreversível. Exclui <strong>todas</strong> as Ordens de Serviço (preventivas, corretivas, etc.). Use com extrema cautela.
                        </p>
                    </div>
                    <button 
                        onClick={handleBulkDeleteRequest} 
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg hover:bg-rose-700">
                        <DeleteIcon className="w-4 h-4" />
                        Apagar Todas as O.S.
                    </button>
                </div>
            </div>

            {isBulkDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isBulkDeleteModalOpen}
                    onClose={() => setIsBulkDeleteModalOpen(false)}
                    onConfirm={handleBulkDeleteConfirm}
                    title="APAGAR TODO O CRONOGRAMA?"
                    message="Esta é sua última chance. Esta ação é IRREVERSÍVEL e vai deletar TODAS as ordens de serviço. Confirma a exclusão total?"
                />
            )}
        </div>
    );
};