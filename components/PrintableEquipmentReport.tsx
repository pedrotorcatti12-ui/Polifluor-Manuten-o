

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
// FIX: Corrected import path for types
import { Equipment, MaintenanceStatus } from '../types';
import { useMaintenanceMetrics } from '../hooks/useMaintenanceMetrics';

interface PrintableEquipmentReportProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  viewYear: number;
}

export const PrintableEquipmentReport: React.FC<PrintableEquipmentReportProps> = ({ isOpen, onClose, equipment, viewYear }) => {
  const { metrics, executedTasks } = useMaintenanceMetrics(equipment, viewYear);

  useEffect(() => {
    if (isOpen) {
      const handleAfterPrint = () => {
        onClose();
      };
      window.addEventListener('afterprint', handleAfterPrint);
      window.print();
      return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const portalRoot = document.getElementById('printable-portal');
  if (!portalRoot) {
    console.error("The 'printable-portal' element was not found in the DOM.");
    return null;
  }

  const printableContent = (
    <div className="p-8 printable-report-content text-black bg-white font-sans">
      <header className="border-b-2 border-black pb-4 mb-6 text-center">
        <h1 className="text-2xl font-bold">Relatório de Equipamento e Confiabilidade</h1>
        <p className="text-sm text-gray-600">Ano de Referência: {viewYear} | Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
      </header>

      <section className="mb-6">
        <h2 className="text-lg font-semibold border-b border-gray-400 pb-1 mb-3">1. Dados do Equipamento</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div><strong>CÓDIGO:</strong> {equipment.id}</div>
          <div><strong>NOME:</strong> {equipment.name}</div>
          <div><strong>LOCALIZAÇÃO:</strong> {equipment.location}</div>
          <div><strong>MODELO:</strong> {equipment.model || 'N/A'}</div>
          <div><strong>FABRICANTE:</strong> {equipment.manufacturer || 'N/A'}</div>
          <div><strong>ANO:</strong> {equipment.yearOfManufacture || 'N/A'}</div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold border-b border-gray-400 pb-1 mb-3">2. Indicadores de Confiabilidade (Ano: {viewYear})</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left">Indicador</th>
              <th className="border border-gray-400 p-2 text-center">Valor</th>
              <th className="border border-gray-400 p-2 text-left">Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">MTBF (h)</td>
              <td className="border border-gray-400 p-2 text-center font-bold">{metrics.mtbf?.toFixed(2) ?? 'N/A'}</td>
              <td className="border border-gray-400 p-2">Tempo Médio Entre Falhas</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">MTTR (h)</td>
              <td className="border border-gray-400 p-2 text-center font-bold">{metrics.mttr?.toFixed(2) ?? 'N/A'}</td>
              <td className="border border-gray-400 p-2">Tempo Médio Para Reparo</td>
            </tr>
             <tr>
              <td className="border border-gray-400 p-2 font-medium">Disponibilidade (%)</td>
              <td className="border border-gray-400 p-2 text-center font-bold">{metrics.availability?.toFixed(2) ?? 'N/A'}</td>
              <td className="border border-gray-400 p-2">Disponibilidade Inerente</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-gray-400 pb-1 mb-3">3. Histórico de Manutenções Executadas ({viewYear})</h2>
        {executedTasks.length > 0 ? (
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 text-left w-24">Data</th>
                <th className="border border-gray-400 p-2 text-left">Tipo</th>
                <th className="border border-gray-400 p-2 text-left">Descrição</th>
                <th className="border border-gray-400 p-2 text-left">Responsável</th>
                <th className="border border-gray-400 p-2 text-center w-20">HH</th>
              </tr>
            </thead>
            <tbody>
              {executedTasks.map((task, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2">{task.startDate ? new Date(task.startDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                  <td className="border border-gray-400 p-2">{task.type}</td>
                  <td className="border border-gray-400 p-2">{task.description}</td>
                  <td className="border border-gray-400 p-2">{task.maintainer?.name || 'N/A'}</td>
                  <td className="border border-gray-400 p-2 text-center">{task.manHours?.toFixed(2) || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-center text-gray-600 py-4">Nenhum registro de manutenção executada encontrado para {viewYear}.</p>
        )}
      </section>

      <footer className="pt-16 text-sm">
         <div className="flex justify-around">
            <div className="text-center">
                <div className="border-t border-black w-72 pt-1">Assinatura do Responsável</div>
            </div>
         </div>
      </footer>
    </div>
  );

  return ReactDOM.createPortal(printableContent, portalRoot);
};