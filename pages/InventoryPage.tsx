import React, { useState, useMemo } from 'react';
// FIX: Add missing imports
import { SparePart } from '../types';
import { Header } from '../components/Header';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon, EditIcon, DeleteIcon, ClipboardListIcon, ChevronDownIcon, PackageIcon, ShieldCheckIcon, SearchIcon, RefreshIcon, DocumentTextIcon, CheckCircleIcon, WrenchIcon } from '../components/icons';
import { StockStatusBadge } from '../components/StockStatusBadge';
import { SparePartModal } from '../components/SparePartModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useDataContext } from '../contexts/DataContext';
import { useAppContext } from '../contexts/AppContext';

declare const window: any;

const StockLevelBar: React.FC<{ current: number; min: number }> = ({ current, min }) => {
    const max = min > 0 ? min * 2 : current * 2 || 1; // Define um teto visual
    const percentage = Math.min((current / max) * 100, 100);
    const minPercentage = (min / max) * 100;

    let barColor = 'bg-emerald-500';
    if (current < min) barColor = 'bg-rose-500';
    else if (current === min) barColor = 'bg-amber-500';

    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 relative">
            <div 
                className={`h-2.5 rounded-full ${barColor} transition-all duration-500`} 
                style={{ width: `${percentage}%` }}
            ></div>
            {min > 0 && (
                <div 
                    className="absolute top-0 h-full w-0.5 bg-slate-600/50" 
                    style={{ left: `${minPercentage}%` }}
                    title={`Mínimo: ${min}`}
                ></div>
            )}
        </div>
    );
};

export const InventoryPage: React.FC = () => {
  // FIX: Destructure missing properties from context
  const { inventoryData, handlePartSave, handleInventoryAdjustment } = useDataContext();
  const { userRole } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  
  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false);
  const [adjustPartId, setAdjustPartId] = useState('');
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Contagem Cíclica');
  
  const isAdmin = userRole === 'admin';

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    return inventoryData.filter(part =>
      part.name.toLowerCase().includes(term) ||
      part.id.toLowerCase().includes(term) ||
      part.location.toLowerCase().includes(term)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [inventoryData, debouncedSearchTerm]);

  const totalItemsCount = useMemo(() => 
    inventoryData.reduce((sum, part) => sum + (part.currentStock || 0), 0),
  [inventoryData]);

  const handleSavePart = async (part: SparePart) => {
      await handlePartSave(part);
      setIsPartModalOpen(false);
  };

  const handleQuickAdjust = async () => {
      if (!adjustPartId) return;
      const success = await handleInventoryAdjustment(adjustPartId, adjustQty, adjustReason, 'Gestor Manutenção');
      if (success) {
          setIsQuickAdjustOpen(false);
          setAdjustPartId('');
      }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Header 
        title="Almoxarifado Técnico (FO-044)" 
        subtitle="Controle físico-financeiro com baixa automática via O.S."
        actions={ isAdmin && (
          <div className="flex gap-2">
              <button onClick={() => setIsQuickAdjustOpen(true)} className="px-4 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                <RefreshIcon className="w-4 h-4" /> Inventário Rápido
              </button>
              <button onClick={() => { setEditingPart(null); setIsPartModalOpen(true); }} className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                <PlusIcon className="w-5 h-5" /> Novo Item
              </button>
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-slate-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl"><PackageIcon className="w-6 h-6"/></div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abaixo do Mínimo</p>
                  <p className="text-2xl font-black text-rose-600">{inventoryData.filter(p => p.currentStock < p.minStock).length}</p>
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-slate-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><ClipboardListIcon className="w-6 h-6"/></div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKUs Cadastrados</p>
                  <p className="text-2xl font-black">{inventoryData.length}</p>
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-slate-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><WrenchIcon className="w-6 h-6"/></div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade Total</p>
                  <p className="text-2xl font-black">{totalItemsCount}</p>
              </div>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50 flex flex-wrap gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, código ou local..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-12 pr-4 py-4 form-input border-none bg-white dark:bg-gray-800 shadow-sm rounded-2xl font-bold text-sm" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-700">
            <thead className="bg-slate-900 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Produto</th>
                <th className="px-6 py-5 text-left w-64">Nível de Estoque</th>
                <th className="px-6 py-5 text-center">Mín.</th>
                <th className="px-6 py-5 text-center">Atual</th>
                <th className="px-6 py-5 text-center">Local</th>
                <th className="px-6 py-5 text-center">Status</th>
                {isAdmin && <th className="px-6 py-5 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-50 dark:divide-gray-700">
              {filteredData.map(part => (
                  <tr key={part.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                        <p className="font-black text-slate-800 text-sm">{part.name}</p>
                        <p className="font-mono text-xs font-bold text-blue-600">{part.id}</p>
                    </td>
                    <td className="px-6 py-4">
                        <StockLevelBar current={part.currentStock ?? 0} min={part.minStock ?? 0} />
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-mono text-slate-400">{part.minStock ?? 0} {part.unit}</td>
                    <td className="px-6 py-4 text-center font-black text-base">{part.currentStock ?? 0} <span className="text-xs font-normal text-slate-400">{part.unit}</span></td>
                    <td className="px-6 py-4 text-center text-xs">{part.location}</td>
                    <td className="px-6 py-4 text-center"><StockStatusBadge currentStock={part.currentStock ?? 0} minStock={part.minStock ?? 0} /></td>
                    {isAdmin && (
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => { setEditingPart(part); setIsPartModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><EditIcon className="w-4 h-4"/></button>
                        </td>
                    )}
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPartModalOpen && <SparePartModal isOpen={true} onClose={() => setIsPartModalOpen(false)} onSave={handleSavePart} existingPart={editingPart} />}
      
      {isQuickAdjustOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-2xl w-full max-w-md">
                  <h3 className="text-xl font-black uppercase mb-4">Ajuste Rápido de Saldo</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold uppercase">Peça</label>
                          <select value={adjustPartId} onChange={e => {
                              setAdjustPartId(e.target.value);
                              const p = inventoryData.find(x => x.id === e.target.value);
                              if(p) setAdjustQty(p.currentStock);
                          }} className="w-full form-input">
                              <option value="">Selecione...</option>
                              {inventoryData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold uppercase">Nova Quantidade Real</label>
                          <input type="number" value={adjustQty} onChange={e => setAdjustQty(Number(e.target.value))} className="w-full form-input font-black text-lg" />
                      </div>
                      <div>
                          <label className="text-xs font-bold uppercase">Motivo</label>
                          <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} className="w-full form-input" />
                      </div>
                      <button onClick={handleQuickAdjust} className="w-full py-3 bg-emerald-600 text-white font-black uppercase rounded-xl hover:bg-emerald-700">Confirmar Ajuste</button>
                      <button onClick={() => setIsQuickAdjustOpen(false)} className="w-full py-2 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};