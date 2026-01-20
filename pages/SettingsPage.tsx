
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { 
    UsersIcon, 
    WrenchIcon, 
    PackageIcon, 
    SearchIcon, 
    DeleteIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    RefreshIcon,
    ArrowPathIcon,
    EditIcon
} from '../components/icons';

type MasterDataType = 'maintainers' | 'requesters' | 'equipment_types';

export const SettingsPage: React.FC = () => {
    const { 
        maintainers, setMaintainers,
        requesters, setRequesters,
        equipmentTypes, setEquipmentTypes,
        handleEquipmentTypeSave, handleEquipmentTypeDelete,
        equipmentData,
        workOrders,
        syncData,
        logActivity,
        isSyncing,
        showToast
    } = useDataContext();

    const [activeTab, setActiveTab] = useState<MasterDataType>('maintainers');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // CÁLCULO DE VÍNCULOS PARA INTEGRIDADE
    const getUsageCount = (item: string, type: MasterDataType) => {
        if (type === 'maintainers') {
            return workOrders.filter(wo => wo.manHours.some(mh => mh.maintainer === item)).length;
        }
        if (type === 'requesters') {
            return workOrders.filter(wo => wo.requester === item).length;
        }
        if (type === 'equipment_types') {
            return equipmentData.filter(eq => eq.model === item).length;
        }
        return 0;
    };

    const handleRemove = async (item: string, type: MasterDataType) => {
        const count = getUsageCount(item, type);
        if (count > 0) {
            alert(`BLOQUEIO DE INTEGRIDADE: Não é possível excluir "${item}" pois existem ${count} registros vinculados.`);
            return;
        }

        if (confirm(`Deseja remover "${item}" permanentemente?`)) {
            if (type === 'maintainers') setMaintainers(prev => prev.filter(i => i !== item));
            if (type === 'requesters') setRequesters(prev => prev.filter(i => i !== item));
            if (type === 'equipment_types') {
                const success = await handleEquipmentTypeDelete(item);
                if(success) showToast("Tipo excluído", "info");
            }
            
            logActivity({
                action_type: 'UPDATE_STATUS',
                description: `Remoção de Master Data: ${item} (${type})`
            });
        }
    };

    const handleSaveInline = async (oldValue: string, type: MasterDataType) => {
        if (!editValue.trim() || editValue === oldValue) {
            setEditingId(null);
            return;
        }

        if (type === 'maintainers') setMaintainers(prev => prev.map(i => i === oldValue ? editValue : i));
        if (type === 'requesters') setRequesters(prev => prev.map(i => i === oldValue ? editValue : i));
        if (type === 'equipment_types') {
            // Para equipment_types, a edição de ID/Descrição é mais complexa pois é PK.
            // Aqui estamos editando a Descrição, mantendo o ID.
            const existing = equipmentTypes.find(t => t.id === oldValue);
            if(existing) {
                await handleEquipmentTypeSave({ ...existing, description: editValue });
            }
        }
        
        setEditingId(null);
    };

    const handleAddItem = async () => {
        const val = searchTerm.trim();
        if (!val) return;

        if (activeTab === 'maintainers') setMaintainers(prev => [...prev, val]);
        if (activeTab === 'requesters') setRequesters(prev => [...prev, val]);
        if (activeTab === 'equipment_types') {
            const id = val.toUpperCase().replace(/\s+/g, '_');
            await handleEquipmentTypeSave({ id, description: val });
        }

        setSearchTerm('');
        logActivity({ action_type: 'CREATE_OS', description: `Novo cadastro em Master Data: ${val} (${activeTab})` });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <Header 
                title="Master Data Management" 
                subtitle="Gestão centralizada de cadastros base e integridade referencial."
                actions={
                    <button 
                        onClick={() => syncData()} 
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all text-xs uppercase tracking-widest disabled:bg-slate-300"
                    >
                        {isSyncing ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <RefreshIcon className="w-4 h-4"/>}
                        {isSyncing ? 'Sincronizando...' : 'Salvar e Sincronizar'}
                    </button>
                }
            />

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><UsersIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mantenedores Ativos</p>
                        <p className="text-2xl font-black">{maintainers.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><PackageIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Famílias de Ativos</p>
                        <p className="text-2xl font-black">{equipmentTypes.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><WrenchIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vínculos Ativos</p>
                        <p className="text-2xl font-black">{workOrders.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
                {/* SIDEBAR TABS */}
                <div className="w-full md:w-64 bg-slate-50 dark:bg-gray-900 border-r border-slate-100 p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('maintainers')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'maintainers' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm border border-blue-100' : 'text-slate-400 hover:bg-white/50'}`}
                    >
                        <UsersIcon className="w-4 h-4"/> Mantenedores
                    </button>
                    <button 
                        onClick={() => setActiveTab('requesters')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'requesters' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm border border-blue-100' : 'text-slate-400 hover:bg-white/50'}`}
                    >
                        <WrenchIcon className="w-4 h-4"/> Solicitantes
                    </button>
                    <button 
                        onClick={() => setActiveTab('equipment_types')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'equipment_types' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm border border-blue-100' : 'text-slate-400 hover:bg-white/50'}`}
                    >
                        <PackageIcon className="w-4 h-4"/> Tipos de Ativo
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 p-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder={`Buscar ou cadastrar novo ${activeTab === 'maintainers' ? 'mantenedor' : 'item'}...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAddItem()}
                                className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-sm shadow-inner"
                            />
                        </div>
                        <button 
                            onClick={handleAddItem}
                            className="px-8 h-14 bg-slate-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                        >
                            Cadastrar
                        </button>
                    </div>

                    <div className="space-y-2">
                        {(activeTab === 'equipment_types' ? equipmentTypes : activeTab === 'maintainers' ? maintainers : requesters).map((item: any, idx: number) => {
                            const label = activeTab === 'equipment_types' ? item.description : item;
                            const id = activeTab === 'equipment_types' ? item.id : item;
                            const count = getUsageCount(id, activeTab);
                            const isEditing = editingId === id;

                            return (
                                <div key={id} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-slate-50 rounded-2xl hover:border-blue-100 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-2 rounded-lg ${count > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                                            <CheckCircleIcon className="w-5 h-5"/>
                                        </div>
                                        {isEditing ? (
                                            <input 
                                                autoFocus
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onBlur={() => handleSaveInline(id, activeTab)}
                                                onKeyPress={e => e.key === 'Enter' && handleSaveInline(id, activeTab)}
                                                className="bg-blue-50 border-none rounded-lg font-black text-sm p-1 text-blue-700"
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase">{label}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {id}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${count > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                {count > 0 ? `${count} Vínculos` : 'Sem uso'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingId(id); setEditValue(label); }}
                                                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <EditIcon className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleRemove(id, activeTab)}
                                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                            >
                                                <DeleteIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
