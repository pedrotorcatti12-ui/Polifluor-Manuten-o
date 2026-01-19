
import React from 'react';
import { CloseIcon } from './icons';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl p-6 m-4 relative border border-gray-200 dark:border-gray-600 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Sistemática para Cálculo de Estoque Mínimo</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">FO 044</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Rev. 01 (23/05/2025)</span>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              <CloseIcon />
            </button>
        </div>

        <div className="mt-4 prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
            <p>O gestor de manutenção deve determinar quais peças e a quantidade mínima que deverá ser mantida em estoque com base na seguinte regra:</p>
            
            <div className="p-4 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                <p className="font-bold text-lg text-blue-800 dark:text-blue-300">Consumo Médio Mensal X Tempo Médio de Entrega</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <p className="font-bold text-sm mb-1">Exemplo de Cálculo:</p>
                    <ul className="text-sm space-y-1">
                        <li>Consumo: <strong>2 peças/mês</strong></li>
                        <li>Entrega: <strong>15 dias</strong> (0,5 mês)</li>
                        <li className="pt-1 border-t border-gray-300 dark:border-gray-500 mt-1">
                            Cálculo: 2 * 0,5 = <strong>1 peça</strong>
                        </li>
                    </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="font-bold text-sm text-yellow-800 dark:text-yellow-300 mb-1">⚠ Margem de Segurança:</p>
                    <p className="text-sm">Considerar margem de segurança de <strong>10%</strong> sobre o tempo de entrega.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(Ex: 15 dias + 10% = 16,5 dias)</p>
                </div>
            </div>

            <h4 className="font-bold mt-6 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Critério para Arredondamento</h4>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold">Resultado do Cálculo</th>
                            <th className="px-4 py-2 text-center font-semibold">Estoque Mínimo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        <tr><td className="px-4 py-2">0,01 a 0,99</td><td className="px-4 py-2 text-center font-mono font-bold">1 peça</td></tr>
                        <tr><td className="px-4 py-2">1,01 a 1,50</td><td className="px-4 py-2 text-center font-mono font-bold">1 peça</td></tr>
                        <tr><td className="px-4 py-2">1,51 a 1,99</td><td className="px-4 py-2 text-center font-mono font-bold">2 peças</td></tr>
                        <tr><td className="px-4 py-2">2,01 a 2,50</td><td className="px-4 py-2 text-center font-mono font-bold">2 peças</td></tr>
                        <tr><td className="px-4 py-2">2,51 a 2,99</td><td className="px-4 py-2 text-center font-mono font-bold">3 peças</td></tr>
                        <tr><td className="px-4 py-2">3,01 a 3,50</td><td className="px-4 py-2 text-center font-mono font-bold">3 peças</td></tr>
                        <tr><td className="px-4 py-2 italic text-gray-500" colSpan={2}>...e assim por diante.</td></tr>
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 pt-2">
                Nota: O inventário de peças deve ser feito mensalmente pelo gestor de manutenção para atualização das quantidades em estoque.
            </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
