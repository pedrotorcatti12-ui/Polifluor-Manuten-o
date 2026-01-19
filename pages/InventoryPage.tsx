
import React, { useState, useMemo } from 'react';
import { SparePart } from '../types';
import { Header } from '../components/Header';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon, EditIcon, DeleteIcon, ClipboardListIcon, ChevronDownIcon, PackageIcon, ShieldCheckIcon, SearchIcon } from '../components/icons';
import { StockStatusBadge } from '../components/StockStatusBadge';
import { SparePartModal } from '../components/SparePartModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useDataContext } from '../contexts/DataContext';

export const InventoryPage: React.FC = () => {
  const { inventoryData, setInventoryData, stockMovements } = useDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [deletingPart, setDeletingPart] = useState<SparePart | null>(null);
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    return inventoryData.filter(part =>
      part.name.toLowerCase().includes(term) ||
      part.id.toLowerCase().includes(term) ||
      part.location.toLowerCase().includes(term)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [inventoryData, debouncedSearchTerm]);

  const handleSavePart = (part: SparePart) => {
    if (editingPart) {
      setInventoryData(prev => prev.map(p => p.id === part.id ? part : p));
    } else {
      setInventoryData(prev => [...prev, part]);
    }
    setIsPartModalOpen(false);
    setEditingPart(null);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Header 
        title="Almoxarifado Técnico (FO-044)" 
        subtitle="Sincronizado com dados PDF (Rolamentos, Correias, Elétrica)."
        actions={
          <button onClick={() => { setEditingPart(null); setIsPartModalOpen(true); }} className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
            <PlusIcon className="w-5 h-5" /> Cadastrar Novo Item
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-slate-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl"><PackageIcon className="w-6 h-6"/></div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abaixo do Mínimo</p>
                  <p className="text-2xl font-black text-rose-600">{inventoryData.filter(p => p.currentStock <= p.minStock).length}</p>
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-slate-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><ShieldCheckIcon className="w-6 h-6"/></div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens no Catálogo</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{inventoryData.length}</p>
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-slate-100 dark:border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><ClipboardListIcon className="w-6 h-6"/></div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Movimentações</p>
                  <p className="text-2xl font-black text-emerald-600">{stockMovements.length}</p>
              </div>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50 flex flex-wrap gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, código (RO-001) ou gaveta (P2B1)..." 
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
                <th className="px-6 py-5 text-left">Referência</th>
                <th className="px-6 py-5 text-left">Produto / Descrição Técnica</th>
                <th className="px-6 py-5 text-center">Localização</th>
                <th className="px-6 py-5 text-center">Est. Mínimo</th>
                <th className="px-6 py-5 text-center">Saldo Real</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-50 dark:divide-gray-700">
              {filteredData.map(part => {
                const isCritical = part.currentStock <= part.minStock;
                return (
                  <tr key={part.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded border border-blue-100 dark:border-blue-800">
                        {part.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{part.name}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-3 py-1.5 bg-slate-100 dark:bg-gray-700 text-[10px] font-black text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-gray-600 uppercase">
                        {part.location || '---'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-bold text-slate-400 font-mono italic">{part.minStock} {part.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-base font-black ${isCritical ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                        {part.currentStock} <span className="text-[10px] font-bold text-slate-400">{part.unit}</span>
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StockStatusBadge currentStock={part.currentStock} minStock={part.minStock} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingPart(part); setIsPartModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg"><EditIcon className="w-4 h-4"/></button>
                        <button onClick={() => setDeletingPart(part)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg"><DeleteIcon className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
              Nenhum item encontrado no estoque
            </div>
          )}
        </div>
      </div>

      {isPartModalOpen && <SparePartModal isOpen={true} onClose={() => setIsPartModalOpen(false)} onSave={handleSavePart} existingPart={editingPart} />}
      {deletingPart && <ConfirmationModal isOpen={!!deletingPart} onClose={() => setDeletingPart(null)} onConfirm={() => setInventoryData(p => p.filter(i => i.id !== deletingPart.id))} title="Remover Item" message="Deseja excluir permanentemente este registro de estoque?" />}
    </div>
  );
};
