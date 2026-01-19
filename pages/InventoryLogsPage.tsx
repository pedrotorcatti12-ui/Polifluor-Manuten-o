
import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { RefreshIcon, SearchIcon, ArrowPathIcon, PackageIcon } from '../components/icons';

export const InventoryLogsPage: React.FC = () => {
    const { stockMovements } = useDataContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = useMemo(() => {
        return stockMovements.filter(m => 
            m.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.partId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.reason.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [stockMovements, searchTerm]);

    return (
        <div className="space-y-6">
            <Header title="Rastreabilidade de Estoque" subtitle="Auditoria completa de cada peça que entrou ou saiu da planta." />

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Filtrar por O.S., Peça ou Usuário..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-9 form-input border-gray-100 bg-gray-50 focus:bg-white" 
                    />
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-[10px] font-black uppercase text-gray-400 border border-gray-100">
                    Total: {filtered.length} Movimentos
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-500 tracking-widest">
                        <tr>
                            <th className="px-6 py-3 text-left">Data/Hora</th>
                            <th className="px-6 py-3 text-left">Peça / Produto</th>
                            <th className="px-6 py-3 text-center">Tipo</th>
                            <th className="px-6 py-3 text-center">Qtd</th>
                            <th className="px-6 py-3 text-left">Motivo / Destino</th>
                            <th className="px-6 py-3 text-left">Responsável</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(move => (
                            <tr key={move.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                    {new Date(move.date).toLocaleString('pt-BR')}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs font-black text-gray-700 uppercase">{move.partName}</p>
                                    <p className="text-[9px] font-bold text-blue-600 uppercase">{move.partId}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${move.type === 'Entrada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                        {move.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-black text-sm text-gray-800">
                                    {move.type === 'Saída' ? '-' : '+'}{move.quantity}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase">
                                        {move.reason}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">
                                    {move.user}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic text-xs uppercase tracking-widest border-t">
                        Sem registros de movimentação.
                    </div>
                )}
            </div>
        </div>
    );
};
