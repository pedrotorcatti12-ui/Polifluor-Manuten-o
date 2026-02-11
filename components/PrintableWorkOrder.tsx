
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

const InfoField: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="border border-black p-1 bg-white">
        <div className="text-[8px] font-bold uppercase">{label}</div>
        <div className="text-xs font-bold h-4">{value || '\u00A0'}</div>
    </div>
);

const CheckboxDisplay: React.FC<{ label?: string; checked?: boolean }> = ({ label, checked = false }) => (
    <div className="flex items-center justify-center gap-1">
        <div className={`w-3 h-3 border border-black flex items-center justify-center`}>
            {checked && <span className="text-xs font-bold">X</span>}
        </div> 
        {label && <span className="text-[10px]">{label}</span>}
    </div>
);

export const PrintableWorkOrder: React.FC<PrintableWorkOrderProps> = ({ taskData, editedOsNumber }) => {
  const { equipment, task } = taskData;
  const printDate = new Date();

  return (
    <div className="p-4 bg-white text-black font-sans box-border flex flex-col justify-between" style={{ width: '210mm', minHeight: '297mm' }}>
        <div>
            {/* Header */}
            <header className="flex items-start justify-between pb-2 mb-2">
                <div className="w-48 h-12 bg-[#D32F2F] flex items-center justify-center p-1">
                    <span className="text-white font-black text-xl italic" style={{ letterSpacing: '0.1em' }}>POLIFLUOR</span>
                </div>
                <div className="text-center flex-1 mx-4">
                    <h1 className="text-lg font-black uppercase tracking-tight">Ordem de Serviço de Manutenção</h1>
                    <h2 className="text-lg font-black uppercase tracking-tight">Preventiva</h2>
                    <p className="text-xs font-medium mt-1">Documento para preenchimento em campo</p>
                </div>
                <div className="w-48 text-right border border-black p-1">
                    <div className="text-[8px] font-bold uppercase">Código Formulário</div>
                    <div className="text-xs font-bold">FO-091 REV.02</div>
                </div>
            </header>

            {/* Main Info */}
            <section className="grid grid-cols-2 gap-px bg-black border-2 border-black">
                <InfoField label="Nº O.S.:" value={editedOsNumber} />
                <InfoField label="Mês Referência:" value={`${task.month}/${task.year}`} />
                <InfoField label="Tipo de Manutenção:" value={task.type} />
                <InfoField label="Equipamento Crítico:" value={equipment.isCritical ? 'SIM (Prioridade Alta)' : 'NÃO'} />
                <InfoField label="Equipamento (ID):" value={equipment.id} />
                <InfoField label="Nome / Descrição:" value={equipment.name} />
                <InfoField label="Localização da Máquina:" value={equipment.location} />
                <div className="border border-black p-1 bg-white"></div>
            </section>

            {/* Checklist */}
            <section className="mt-2">
                <table className="w-full border-collapse border-2 border-black">
                    <thead className="bg-black text-white">
                        <tr>
                            <th colSpan={5} className="p-1 text-sm font-bold">Checklist de Verificação (Procedimento)</th>
                        </tr>
                        <tr className="text-[10px] font-bold uppercase">
                            <th className="p-1 border border-white w-12">Item</th>
                            <th className="p-1 border border-white text-left">Tarefa / Verificação Técnica</th>
                            <th className="p-1 border border-white w-12">OK</th>
                            <th className="p-1 border border-white w-12">NOK</th>
                            <th className="p-1 border border-white text-left w-1/3">Observações Técnicas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(task.details || []).map((detail, index) => (
                             <tr key={index} className="text-xs border-b border-black h-8">
                                <td className="p-1 border-r border-black text-center font-bold">{index + 1}</td>
                                <td className="p-1 border-r border-black font-medium">{detail.action}</td>
                                <td className="p-1 border-r border-black text-center"><CheckboxDisplay /></td>
                                <td className="p-1 border-r border-black text-center"><CheckboxDisplay /></td>
                                <td className="p-1"></td>
                            </tr>
                        ))}
                        {[...Array(Math.max(0, 10 - (task.details?.length || 0)))].map((_, i) => (
                             <tr key={`empty-${i}`} className="h-8"><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td></tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Observations */}
            <section className="mt-2">
                 <table className="w-full border-collapse border-2 border-black">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-1 text-sm font-bold text-left">Observações Gerais / Relatório de Execução:</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="h-24"><td className="p-1 align-top">{task.description}</td></tr>
                    </tbody>
                 </table>
            </section>
        </div>

        {/* Footer */}
        <footer className="mt-4 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8">
                 <div><InfoField label="Início Real:" value={''} /></div>
                 <div><InfoField label="Término Real:" value={''} /></div>
                 <div><div className="text-right">Aprovado Gestão:</div></div>
                 <div className="flex items-center gap-4"><CheckboxDisplay label="Sim" /><CheckboxDisplay label="Não" /></div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                <div className="text-center">
                    <div className="border-t-2 border-black pt-1 font-bold">EXECUTADO POR (ASSINATURA)</div>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-black pt-1 font-bold">VISTO ENCARREGADO / MANUTENÇÃO</div>
                </div>
            </div>
            <div className="mt-4 text-[8px] text-gray-500 flex justify-between">
                <span>Documento emitido via SGMI 2.0 (Sistema de Gestão de Manutenção Inteligente)</span>
                <span>Impressão: {printDate.toLocaleString('pt-BR')}</span>
            </div>
        </footer>
    </div>
  );
};
