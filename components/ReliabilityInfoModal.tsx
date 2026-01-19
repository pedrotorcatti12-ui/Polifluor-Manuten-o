
import React from 'react';
import { CloseIcon } from './icons';

interface ReliabilityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Definition: React.FC<{ term: string, children: React.ReactNode }> = ({ term, children }) => (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-800 dark:text-white">{term}</h4>
        <p className="mt-1 text-gray-600 dark:text-gray-300">{children}</p>
    </div>
);

export const ReliabilityInfoModal: React.FC<ReliabilityInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 relative border border-gray-200 dark:border-gray-600 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Indicadores de Confiabilidade da Manutenção</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Definições e fórmulas utilizadas no sistema.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              <CloseIcon />
            </button>
        </div>

        <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
            <Definition term="MTBF (Mean Time Between Failures) - Tempo Médio Entre Falhas">
                Mede a confiabilidade de um equipamento. Representa o tempo médio que o equipamento opera sem apresentar falhas. Quanto maior o MTBF, mais confiável é a máquina.
            </Definition>
            <Definition term="MTTR (Mean Time To Repair) - Tempo Médio Para Reparo">
                Mede a manutenibilidade de um equipamento. Representa o tempo médio necessário para reparar uma falha e colocar o equipamento de volta em operação. Quanto menor o MTTR, mais eficiente é a equipe de manutenção.
            </Definition>
            <Definition term="Disponibilidade Inerente (%)">
                Representa a porcentagem de tempo que o equipamento está disponível para operar, considerando apenas as paradas por manutenções corretivas. O ideal é que este valor seja o mais próximo possível de 100%.
            </Definition>

             <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6 mb-2">Fórmulas e Siglas</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 space-y-3">
                <p><strong>P (Nº de Paradas):</strong> Total de manutenções corretivas executadas no período.</p>
                <p><strong>TM (Tempo de Reparo/Manutenção):</strong> Soma total do tempo em que a máquina ficou parada (Data Fim - Data Início).</p>
                <p><strong>TD (Tempo Total de Funcionamento):</strong> Período total disponível no calendário selecionado (ex: 24h * dias).</p>
                <p><strong>Tempo Operacional (Uptime):</strong> TD - TM</p>
                
                <div className="my-4 border-t border-gray-300 dark:border-gray-600 pt-4"></div>
                
                <p className="font-mono p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md border-l-4 border-blue-500">
                    <strong>MTBF</strong> = (TD - TM) / P
                </p>
                <p className="font-mono p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md border-l-4 border-yellow-500">
                    <strong>MTTR</strong> = TM / P
                </p>
                <p className="font-mono p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md border-l-4 border-green-500">
                    <strong>% DISPONIBILIDADE</strong> = (MTBF / (MTBF + MTTR)) * 100
                </p>
            </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
