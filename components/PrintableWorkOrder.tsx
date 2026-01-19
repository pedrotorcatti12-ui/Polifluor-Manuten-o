import React from 'react';
import { FlatTask, MaintenanceType } from '../types';

interface PrintableWorkOrderProps {
  taskData: FlatTask;
  editedOsNumber: string;
  partReplaced?: 'Sim' | 'Não' | '';
  purchasingInvolved?: 'Sim' | 'Não' | '';
  logoUrl?: string;
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined; colSpan?: number }> = ({ label, value, colSpan = 1 }) => (
    <div style={{ gridColumn: `span ${colSpan}` }}>
        <div className="text-xs font-bold uppercase">{label}</div>
        <div className="border-b border-black text-sm pb-1">{value || '\u00A0'}</div>
    </div>
);

const CheckboxDisplay: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
            {checked && <span className="text-xs font-bold -mt-0.5">X</span>}
        </div> 
        {label}
    </div>
);

const CheckboxQuestion: React.FC<{ question: string; value: 'Sim' | 'Não' | '' }> = ({ question, value }) => (
    <div className="flex items-center gap-4 text-sm">
        <span>{question}</span>
        <CheckboxDisplay label="Sim" checked={value === 'Sim'} />
        <CheckboxDisplay label="Não" checked={value === 'Não'} />
    </div>
);

const PredictiveChecklist = [
    "Temperatura",
    "Vibração",
    "Ultrassom",
    "Análise de óleo",
    "Termografia"
];

export const PrintableWorkOrder: React.FC<PrintableWorkOrderProps> = ({ taskData, editedOsNumber, partReplaced, purchasingInvolved, logoUrl }) => {
  const { equipment, task } = taskData;
  const isPredictive = task.type === MaintenanceType.Predictive;
  
  const logoContent = logoUrl
    ? <img src={logoUrl} alt="Logo Polifluor" className="h-12" />
    : (
        <div className="w-48 h-12 bg-red-600 flex items-center justify-center p-1">
            <span className="text-white font-bold text-lg" style={{ letterSpacing: '0.15em' }}>POLIFLUOR</span>
        </div>
      );

  return (
    <div className="p-8 bg-white text-black font-sans" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
        <header className="flex items-start justify-between pb-4">
            {logoContent}
            <div className="text-center">
                <h1 className="text-2xl font-bold">Ordem de Serviço de Manutenção</h1>
                <p className="text-sm">Documento para preenchimento em campo</p>
            </div>
            <div className="w-48"></div>
        </header>

        <section className="border-2 border-black p-1">
            <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                <InfoRow label="N° O.S.:" value={editedOsNumber} />
                <InfoRow label="Data Programada:" value={`${task.month}/${task.year}`} colSpan={3}/>
                <InfoRow label="Tipo de Manutenção:" value={task.type || 'N/A'} colSpan={4} />
                <InfoRow label="Equipamento (ID):" value={equipment.id} />
                <InfoRow label="Nome:" value={equipment.name} colSpan={3} />
                <InfoRow label="Localização:" value={equipment.location} colSpan={4}/>
            </div>
        </section>

        <section className="mt-4">
            <h2 className="text-md font-bold mb-1">Checklist de Verificação</h2>
            <table className="w-full border-collapse border-2 border-black">
                <thead>
                    <tr className="bg-blue-800 text-white text-sm">
                        <th className="border border-black p-1 w-12">Item</th>
                        <th className="border border-black p-1 text-left">Tarefa / Verificação</th>
                        <th className="border border-black p-1 w-12">OK</th>
                        <th className="border border-black p-1 w-12">NOK</th>
                        <th className="border border-black p-1 text-left">Observações da Tarefa</th>
                    </tr>
                </thead>
                <tbody>
                    {(isPredictive ? PredictiveChecklist.map(action => ({ action, materials: '' })) : task.details && task.details.length > 0 ? task.details : [{ action: 'Nenhuma tarefa de checklist definida.', materials: '' }]).map((detail, index) => (
                         <tr key={index} className="text-sm">
                            <td className="border border-black p-1 text-center">{index + 1}</td>
                            <td className="border border-black p-1">{detail.action}</td>
                            <td className="border border-black p-1 text-center"><div className="w-4 h-4 border border-black mx-auto"></div></td>
                            <td className="border border-black p-1 text-center"><div className="w-4 h-4 border border-black mx-auto"></div></td>
                            <td className="border border-black p-1 h-8"></td>
                        </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - (isPredictive ? PredictiveChecklist.length : task.details?.length || 0)) }).map((_, i) => (
                        <tr key={`empty-${i}`} className="text-sm">
                            <td className="border border-black p-1 text-center h-8"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1 text-center"></td>
                            <td className="border border-black p-1 text-center"></td>
                            <td className="border border-black p-1"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        <section className="mt-4">
            <div className="font-bold text-md">Observações Gerais:</div>
            <div className="border-2 border-black h-32 mt-1"></div>
        </section>

        {!isPredictive && (
            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">Necessidade de Substituição de Componentes:</h2>
                <table className="w-full border-collapse border-2 border-black">
                     <thead>
                        <tr className="bg-teal-600 text-white text-sm">
                            <th className="border border-black p-1 text-left">Componente</th>
                            <th className="border border-black p-1 text-left w-24">Qtd.</th>
                            <th className="border border-black p-1 text-left">Justificativa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(3)].map((_, i) => (
                            <tr key={i} className="h-8">
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <div className="space-y-2 mt-2">
                  <CheckboxQuestion question="Houve substituição de produto/peça?" value={partReplaced || ''} />
                  <CheckboxQuestion question="Houve interação com o setor de compras para substituição?" value={purchasingInvolved || ''} />
                </div>
            </section>
        )}

        <footer className="mt-12 text-sm">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                <div>
                    <p>Início: &nbsp; ____/____/________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ____:____</p>
                    <p className="mt-2">Término: ____/____/________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ____:____</p>
                </div>
                 <div className="flex items-center gap-4">
                    <span>Aprovado:</span>
                    <CheckboxDisplay label="Sim" checked={false} />
                    <CheckboxDisplay label="Não" checked={false} />
                </div>
                 <div className="text-center">
                    <div className="border-t border-black pt-1">Executado por (Nome e Assinatura)</div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-1">Aprovação da Gestão (Assinatura e Data)</div>
                </div>
            </div>
        </footer>
    </div>
  );
};