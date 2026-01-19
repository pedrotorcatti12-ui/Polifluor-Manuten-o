import React from 'react';
import { CloseIcon } from './icons';

interface PlanInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Definition: React.FC<{ term: string; children: React.ReactNode }> = ({ term, children }) => (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <h4 className="font-bold text-gray-800 dark:text-white">{term}</h4>
        <p className="mt-1 text-gray-600 dark:text-gray-300">{children}</p>
    </div>
);

export const PlanInfoModal: React.FC<PlanInfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 relative border border-gray-200 dark:border-gray-600 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Entendendo o Planejamento de Manutenção</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Um guia sobre os tipos de manutenção e os benefícios dos planos.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <CloseIcon />
                    </button>
                </div>

                <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4 mb-2">O Que é um Plano de Manutenção?</h3>
                    <p>Um Plano de Manutenção é um conjunto de tarefas padronizadas que são executadas em um equipamento em intervalos de tempo definidos (frequência). O objetivo é criar uma rotina de cuidados para prevenir falhas e garantir a confiabilidade da máquina.</p>
                    
                    <div className="p-4 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-800 dark:text-blue-300">Benefícios:</p>
                        <ul className="list-disc list-inside text-blue-700 dark:text-blue-400">
                            <li><strong>Padronização:</strong> Garante que as mesmas tarefas críticas sejam sempre executadas.</li>
                            <li><strong>Automação:</strong> Facilita a geração de cronogramas anuais com um clique.</li>
                            <li><strong>Confiabilidade:</strong> Aumenta a vida útil e a disponibilidade dos equipamentos.</li>
                            <li><strong>Rastreabilidade:</strong> Mantém um histórico claro das manutenções planejadas.</li>
                        </ul>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6 mb-2">Tipos de Manutenção</h3>
                    
                    <Definition term="Manutenção Preventiva">
                        É a manutenção realizada em intervalos predeterminados para reduzir a probabilidade de falha. É baseada no tempo de uso ou em um calendário. Ex: Trocar o óleo a cada 3 meses.
                    </Definition>
                    <Definition term="Manutenção Preditiva">
                        É baseada na condição real do equipamento. Utiliza monitoramento (como análise de vibração, termografia) para prever quando uma falha está prestes a ocorrer. Ex: Substituir um rolamento após detectar um aumento na vibração.
                    </Definition>
                    <Definition term="Manutenção Corretiva">
                        É a manutenção realizada após a ocorrência de uma falha. O objetivo é restaurar o equipamento à sua condição operacional. Ex: Substituir uma correia que arrebentou.
                    </Definition>
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