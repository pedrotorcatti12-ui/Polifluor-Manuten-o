import React, { useState, useMemo } from 'react';
import { WorkOrder, MaintenanceStatus, MaintenanceType } from '../types';
import { Header } from '../components/Header';
// FIX: Import DownloadIcon
import { DownloadIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { useDataContext } from '../contexts/DataContext';

interface HistoricalRecord {
    id: string; // OS number or Work Order ID
    equipmentId: string;
    equipmentName: string;
    location: string;
    type: MaintenanceType | null;
    description: string;
    executionDate: string;
    maintainer: string;
    manHours: number;
}

const ITEMS_PER_PAGE = 20;

export const HistoryPage: React.FC = () => {
    const { equipmentData, workOrders } = useDataContext();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const equipmentMap = useMemo(() => new Map(equipmentData.map(e => [e.id, e])), [equipmentData]);

    const allHistoricalRecords = useMemo(() => {
        // FONTE ÚNICA DA VERDADE: Apenas Ordens de Serviço (WorkOrders) executadas.
        const records: HistoricalRecord[] = workOrders
            .filter(order => order.status === MaintenanceStatus.Executed)
            .map(order => {
                const equipment = equipmentMap.get(order.equipmentId);
                // FIX: Access manHours property correctly
                const totalHours = (order.manHours || []).reduce((sum, entry) => sum + entry.hours, 0);
                const maintainers = (order.manHours || []).map(mh => mh.maintainer).join(', ') || 'N/A';
                
                return {
                    id: order.id,
                    equipmentId: order.equipmentId,
                    equipmentName: equipment?.name || 'Ativo não localizado',
                    // FIX: Access location property correctly
                    location: equipment?.location || 'N/A',
                    type: order.type,
                    description: order.description,
                    // Usa a data de finalização como a data de execução real.
                    executionDate: order.endDate || order.scheduledDate,
                    maintainer: maintainers,
                    manHours: totalHours,
                };
            });
        
        // Ordena pela data de execução mais recente.
        return records.sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime());

    }, [workOrders, equipmentMap]);

    const filteredRecords = useMemo(() => {
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        
        return allHistoricalRecords.filter(record => {
            // Date filtering
            if (startDate) {
                if (new Date(record.executionDate) < new Date(startDate)) return false;
            }
            if (endDate) {
                if (new Date(record.executionDate) > new Date(new Date(endDate).setHours(23, 59, 59, 999))) return false;
            }

            // Search term filtering
            const matchesSearch = lowercasedTerm === '' ||
                record.id.toLowerCase().includes(lowercasedTerm) ||
                record.equipmentName.toLowerCase().includes(lowercasedTerm) ||
                record.equipmentId.toLowerCase().includes(lowercasedTerm) ||
                record.description.toLowerCase().includes(lowercasedTerm) ||
                record.maintainer.toLowerCase().includes(lowercasedTerm) ||
                (record.type && record.type.toLowerCase().includes(lowercasedTerm));
            
            return matchesSearch;
        });
    }, [allHistoricalRecords, startDate, endDate, debouncedSearchTerm]);

    const paginatedRecords = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredRecords, currentPage]);

    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
    
     React.useEffect(() => {
        setCurrentPage(1);
    }, [filteredRecords.length]);

    const handleExportCSV = () => {
        if (filteredRecords.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }

        const headers = [
            "OS_ID", "Data_Execucao", "Equipamento_ID", "Equipamento_Nome", 
            "Localizacao", "Tipo_Manutencao", "Descricao", "Responsavel", "Horas_Trabalhadas"
        ];
        
        const csvRows = [headers.join(',')];

        for (const record of filteredRecords) {
            const values = [
                `"${record.id}"`,
                `"${new Date(record.executionDate).toLocaleString('pt-BR')}"`,
                `"${record.equipmentId}"`,
                `"${record.equipmentName}"`,
                `"${record.location}"`,
                `"${record.type || 'N/A'}"`,
                `"${record.description.replace(/"/g, '""')}"`, // Handle quotes in description
                `"${record.maintainer}"`,
                record.manHours.toFixed(2),
            ];
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `historico_manutencao_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div>
            <Header
                title="Histórico de Manutenção"
                subtitle="Consulte e exporte todas as ordens de serviço executadas."
                 actions={
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition-colors text-sm">
                        <DownloadIcon />
                        Exportar para Excel (CSV)
                    </button>
                }
            />
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
                         <input
                            type="text"
                            placeholder="Buscar por OS, equipamento, tipo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full form-input"
                        />
                    </div>
                     <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Inicial</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full form-input"/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Final</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full form-input"/>
                    </div>
                 </div>
            </div>

             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">OS</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Equipamento</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Descrição</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Data Execução</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Responsável</th>
                                <th className="px-4 py-3 text-center text-xs font-medium">HH</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedRecords.map((record, index) => (
                                <tr key={`${record.id}-${index}`}>
                                    <td className="px-4 py-4 font-bold text-sm">{record.id}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="font-semibold">{record.equipmentName}</div>
                                        <div className="text-xs text-gray-500">{record.location}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm">{record.type}</td>
                                    <td className="px-4 py-4 text-sm max-w-xs truncate" title={record.description}>{record.description}</td>
                                    <td className="px-4 py-4 text-sm whitespace-nowrap">{new Date(record.executionDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-4 text-sm">{record.maintainer}</td>
                                    <td className="px-4 py-4 text-center text-sm font-mono">{record.manHours.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredRecords.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <h3 className="text-lg font-semibold">Nenhum registro encontrado</h3>
                        <p className="mt-1">Ajuste os filtros ou verifique se há manutenções executadas no período.</p>
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 p-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Mostrando {paginatedRecords.length} de {filteredRecords.length} registros
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 btn-secondary">Anterior</button>
                            <span className="self-center text-sm">{currentPage} / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 btn-secondary">Próxima</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};