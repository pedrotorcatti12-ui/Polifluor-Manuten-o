
import React from 'react';
import { FlatTask, MaintenanceType, PurchaseRequest } from '../types';

interface PrintableWorkOrderProps {
  taskData: FlatTask;
  editedOsNumber: string;
  partReplaced?: 'Sim' | 'Não' | '';
  purchasingInvolved?: 'Sim' | 'Não' | '';
  logoUrl?: string;
  observations?: string;
  purchaseRequests?: PurchaseRequest[];
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined; colSpan?: number }> = ({ label, value, colSpan = 1 }) => (
    <div style={{ gridColumn: `span ${colSpan}` }}>
        <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
        <div className="border-b border-slate-300 text-sm font-bold text-slate-800 pb-1 truncate">{value || '\u00A0'}</div>
    </div>
);

const CheckboxDisplay: React.FC<{ label?: string; checked: boolean }> = ({ label, checked }) => (
    <div className="flex items-center justify-center gap-2">
        <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
            {checked && <span className="text-xs font-bold -mt-0.5">X</span>}
        </div> 
        {label && <span className="text-xs">{label}</span>}
    </div>
);

const CheckboxQuestion: React.FC<{ question: string; value: 'Sim' | 'Não' | '' }> = ({ question, value }) => (
    <div className="flex items-center gap-4 text-xs font-bold">
        <span>{question}</span>
        <CheckboxDisplay label="Sim" checked={value === 'Sim'} />
        <CheckboxDisplay label="Não" checked={value === 'Não'} />
    </div>
);

const PredictiveChecklist = [
    "Temperatura (Termografia)",
    "Análise de Vibração",
    "Ruído / Ultrassom",
    "Análise de Óleo",
    "Verificação de Folgas"
];

export const PrintableWorkOrder: React.FC<PrintableWorkOrderProps> = ({ taskData, editedOsNumber, partReplaced, purchasingInvolved, logoUrl, observations, purchaseRequests }) => {
  const { equipment, task } = taskData;
  const isPredictive = task.type === MaintenanceType.Predictive;
  
  // Prioriza as observações passadas via prop (do modal de edição) ou usa as da tarefa
  const finalObs = observations !== undefined ? observations : task.description; 
  
  // Se houver requests passados via props, usa-os. Senão tenta ver se existe no objeto task (embora FlatTask padrão não tenha, é bom garantir)
  const finalRequests = purchaseRequests || [];

  const logoContent = logoUrl
    ? <img src={logoUrl} alt="Logo" className="h-10" />
    : (
        <div className="bg-[#D32F2F] text-white px-4 py-2 skew-x-[-10deg] inline-block">
            <span className="font-black italic text-xl tracking-tighter skew-x-[10deg] block">POLIFLUOR</span>
        </div>
      );

  // Lógica de Seleção do Checklist:
  // 1. Se houver checklist vindo do banco (task.details), usa ele (A BÍBLIA).
  // 2. Se for Preditiva e não tiver checklist no banco, usa o fallback genérico.
  // 3. Se não for Preditiva e não tiver checklist, mostra mensagem vazia.
  const checklistItems = (task.details && task.details.length > 0) 
    ? task.details 
    : (isPredictive ? PredictiveChecklist.map(action => ({ action, checked: false })) : [{ action: 'Nenhuma tarefa definida no plano.', checked: false }]);

  return (
    <div className="p-8 bg-white text-black font-sans box-border flex flex-col justify-between" style={{ width: '210mm', minHeight: '297mm' }}>
        <div>
            {/* Header */}
            <header className="flex items-center justify-between pb-6 border-b-2 border-slate-800 mb-6">
                {logoContent}
                <div className="text-right">
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">Ordem de Serviço</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manutenção Industrial</p>
                    <div className="mt-2 text-2xl font-black text-slate-900">#{editedOsNumber}</div>
                </div>
            </header>

            {/* Equipamento e Dados Gerais */}
            <section className="mb-6">
                <h2 className="text-xs font-black uppercase bg-slate-100 p-1 mb-2 border-l-4 border-slate-800 pl-2">Dados do Equipamento e Planejamento</h2>
                <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                    <InfoRow label="Equipamento" value={equipment.name} colSpan={2} />
                    <InfoRow label="Código (Tag)" value={equipment.id} />
                    <InfoRow label="Localização" value={equipment.location} />
                    
                    <InfoRow label="Tipo de Manutenção" value={task.type || 'N/A'} colSpan={2} />
                    <InfoRow label="Data Programada" value={`${task.month}/${task.year}`} />
                    <InfoRow label="Status Atual" value={task.status} />
                </div>
            </section>

            {/* Checklist */}
            <section className="mb-6">
                <h2 className="text-xs font-black uppercase bg-slate-100 p-1 mb-2 border-l-4 border-blue-600 pl-2">
                    Checklist de Verificação ({isPredictive ? 'Preditiva' : 'Preventiva'})
                </h2>
                <table className="w-full border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-800 text-white text-[10px] uppercase font-bold">
                            <th className="p-1 border border-slate-600 w-10 text-center">#</th>
                            <th className="p-1 border border-slate-600 text-left">Ação / Verificação</th>
                            <th className="p-1 border border-slate-600 w-10 text-center">OK</th>
                            <th className="p-1 border border-slate-600 w-10 text-center">NOK</th>
                            <th className="p-1 border border-slate-600 text-left w-1/3">Observação Técnica</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checklistItems.map((detail, index) => (
                             <tr key={index} className="text-xs border-b border-slate-200">
                                <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">{index + 1}</td>
                                <td className="p-2 border-r border-slate-300 font-medium">
                                    {detail.action}
                                    {detail.action.toUpperCase().includes('TERCEIRO') && <span className="font-bold ml-2 text-purple-600">[EXTERNO]</span>}
                                    {detail.action.toUpperCase().includes('NÃO APLICÁVEL') && <span className="font-bold ml-2 text-slate-400">[N/A]</span>}
                                </td>
                                <td className="p-2 border-r border-slate-300 text-center">
                                    <CheckboxDisplay checked={detail.checked === true} />
                                </td>
                                <td className="p-2 border-r border-slate-300 text-center">
                                    <CheckboxDisplay checked={false} />
                                </td>
                                <td className="p-2"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Observações */}
            <section className="mb-6">
                <h2 className="text-xs font-black uppercase bg-slate-100 p-1 mb-2 border-l-4 border-amber-500 pl-2">Observações / Pendências</h2>
                <div className="border border-slate-300 rounded p-2 min-h-[4rem] text-sm text-slate-700 bg-slate-50 italic">
                    {finalObs || "Sem observações registradas."}
                </div>
            </section>

            {/* Materiais e Compras */}
            {!isPredictive && (
                <section className="mb-6">
                    <h2 className="text-xs font-black uppercase bg-slate-100 p-1 mb-2 border-l-4 border-emerald-600 pl-2">Materiais e Insumos</h2>
                    <table className="w-full border-collapse border border-slate-300 mb-2">
                         <thead>
                            <tr className="bg-slate-200 text-slate-700 text-[9px] uppercase font-bold">
                                <th className="p-1 border border-slate-300 text-left">Item / Peça</th>
                                <th className="p-1 border border-slate-300 w-16 text-center">Qtd.</th>
                                <th className="p-1 border border-slate-300 w-24 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(finalRequests && finalRequests.length > 0) 
                                ? finalRequests.map((req, i) => (
                                    <tr key={i} className="text-xs border-b border-slate-100">
                                        <td className="p-1 border-r border-slate-300">{req.itemDescription}</td>
                                        <td className="p-1 border-r border-slate-300 text-center font-bold">{req.quantity}</td>
                                        <td className="p-1 text-center">{req.status}</td>
                                    </tr>
                                ))
                                : (
                                    <tr className="text-xs">
                                        <td colSpan={3} className="p-2 text-center text-slate-400 italic">Nenhum material registrado.</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                     <div className="flex gap-8 border-t border-slate-200 pt-2">
                        <CheckboxQuestion question="Houve substituição de peças?" value={partReplaced || ''} />
                        <CheckboxQuestion question="Necessário compra externa?" value={purchasingInvolved || ''} />
                    </div>
                </section>
            )}
        </div>

        {/* Footer */}
        <footer className="mt-4 pt-4 border-t-2 border-slate-800">
            <div className="grid grid-cols-2 gap-12">
                <div>
                    <InfoRow label="Início da Execução" value={task.startDate ? new Date(task.startDate).toLocaleString('pt-BR') : ''} />
                    <div className="mt-8 border-t border-black pt-1 text-center text-xs font-bold uppercase">Técnico Responsável</div>
                </div>
                <div>
                    <InfoRow label="Término da Execução" value={task.endDate ? new Date(task.endDate).toLocaleString('pt-BR') : ''} />
                    <div className="mt-8 border-t border-black pt-1 text-center text-xs font-bold uppercase">Gestor / Aprovação</div>
                </div>
            </div>
            <div className="mt-4 text-[9px] text-slate-400 text-center uppercase font-bold tracking-widest">
                SGMI 2.0 • Sistema de Gestão de Manutenção Inteligente • Documento Gerado em {new Date().toLocaleDateString()}
            </div>
        </footer>
    </div>
  );
};
