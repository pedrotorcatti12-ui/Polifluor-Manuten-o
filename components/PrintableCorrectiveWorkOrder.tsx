// components/PrintableCorrectiveWorkOrder.tsx
import React from 'react';
import { FlatTask, MaintenanceType } from '../types';

interface PrintableCorrectiveWorkOrderProps {
  taskData: FlatTask;
  osNumber: string;
  logoUrl?: string;
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined; colSpan?: number }> = ({ label, value, colSpan = 1 }) => (
    <div style={{ gridColumn: `span ${colSpan}` }}>
        <div className="text-xs font-bold uppercase text-gray-700">{label}</div>
        <div className="border-b border-black text-sm pb-1 h-6">{value || '\u00A0'}</div>
    </div>
);

const CheckboxDisplay: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
            {checked && <span className="text-xs font-bold -mt-0.5">X</span>}
        </div> 
        <span className="text-sm">{label}</span>
    </div>
);

export const PrintableCorrectiveWorkOrder: React.FC<PrintableCorrectiveWorkOrderProps> = ({ taskData, osNumber, logoUrl }) => {
    const { equipment, task } = taskData;
    const printDate = new Date(); // Always use current date and time for printing

    const logoContent = logoUrl
    ? <img src={logoUrl} alt="Logo Polifluor" className="h-12" />
    : (
        <div className="w-48 h-12 bg-red-600 flex items-center justify-center p-1">
            <span className="text-white font-bold text-lg" style={{ letterSpacing: '0.15em' }}>POLIFLUOR</span>
        </div>
      );
      
    const maintenanceTypesCheckboxes = (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <CheckboxDisplay label="Mecânica" checked={task.correctiveCategory === 'Mecânica'} />
            <CheckboxDisplay label="Elétrica" checked={task.correctiveCategory === 'Elétrica'} />
            <CheckboxDisplay label="Predial" checked={false} />
            <CheckboxDisplay label="Serralheria" checked={false} />
        </div>
    );

  return (
    <div className="p-8 bg-white text-black font-sans" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
            <header className="flex items-start justify-between pb-4">
                {logoContent}
                <div className="text-center">
                    <h1 className="text-xl font-bold">ORDEM DE SERVIÇO - MANUTENÇÃO CORRETIVA</h1>
                    <p className="text-sm">Documento para preenchimento em campo</p>
                </div>
                <div className="w-48 text-right">
                    <div className="text-xs font-bold uppercase">Nº O.S.</div>
                    <div className="border-b-2 border-black text-lg pb-1 font-semibold">{osNumber || '\u00A0'}</div>
                </div>
            </header>

            {/* Informações da Solicitação */}
            <section className="border-2 border-black p-2">
                 <div className="grid grid-cols-4 gap-x-4 gap-y-3 mb-2">
                    <div className="col-span-4 font-bold text-sm">TIPO DE MANUTENÇÃO:</div>
                    <div className="col-span-4">{maintenanceTypesCheckboxes}</div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-300 pt-2">
                    <InfoRow label="Data Solicitação:" value={printDate.toLocaleDateString('pt-BR')} />
                    <InfoRow label="Hora Solicitação:" value={printDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} />
                    <InfoRow label="Solicitante:" value={task.requester} />
                    <InfoRow label="Setor/Área:" value={equipment.location} />
                    <InfoRow label="Equipamento (ID):" value={equipment.id} />
                    <InfoRow label="Nome:" value={equipment.name} />
                </div>
                 <div className="flex items-center gap-4 mt-3">
                    <span className="font-bold text-sm">Equipamento parado?</span>
                    <CheckboxDisplay label="Sim" checked={false} />
                    <CheckboxDisplay label="Não" checked={false} />
                </div>
            </section>

            {/* Ocorrência e Execução */}
            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">Descrição da Ocorrência</h2>
                <div className="border-2 border-black p-2 min-h-[80px] text-sm">{task.description}</div>
            </section>

            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">Execução do Serviço</h2>
                <div className="border-2 border-black p-2">
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-2">
                         <InfoRow label="Executante:" value={task.maintainer?.name} />
                         <InfoRow label="Data / Hora Início:" value={''} />
                         <InfoRow label="Data / Hora Término:" value={''} />
                    </div>
                    <div className="text-xs font-bold uppercase text-gray-700">Serviço executado:</div>
                    <div className="border border-black bg-gray-50 h-24 mt-1"></div>
                </div>
            </section>
            
            {/* Peças e Compras */}
            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">Peças / Materiais Substituídos ou Utilizados</h2>
                <div className="border-2 border-black h-24"></div>
            </section>

            <section className="mt-4">
                <h2 className="text-md font-bold mb-1">Solicitação de Compras (se necessário)</h2>
                <table className="w-full border-collapse border-2 border-black">
                    <thead>
                        <tr className="bg-gray-200 text-sm">
                            <th className="border border-black p-1 text-left">Item / Descrição</th>
                            <th className="border border-black p-1 w-20 text-center">Qtd.</th>
                            <th className="border border-black p-1 w-24 text-center">Aprovado?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(2)].map((_, i) => (
                            <tr key={i} className="h-8">
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckboxDisplay label="S" checked={false} />
                                        <CheckboxDisplay label="N" checked={false} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Aprovação */}
            <footer className="mt-8 text-sm">
                <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                    <div className="text-center">
                        <div className="border-t-2 border-black pt-1">Executado por (Nome e Assinatura)</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t-2 border-black pt-1">Visto (Manutenção)</div>
                    </div>
                    <div className="col-span-2 text-center">
                         <div className="border-t-2 border-black pt-1">Aprovação do Serviço (Responsável da Área e Data)</div>
                    </div>
                </div>
            </footer>

            <div className="text-right text-xs mt-4 pr-1">FO 005 Rev.1</div>
        </div>

        {/* Canhoto Destacável */}
        <div className="flex-shrink-0">
            <hr className="border-dashed border-black my-4" />
            <div className="p-2 border border-black">
                 <header className="flex items-center justify-between pb-2">
                    {logoContent}
                    <div className="text-center">
                        <h1 className="text-md font-bold">ORDEM DE SERVIÇO MANUTENÇÃO</h1>
                    </div>
                    <div className="w-32 text-right">
                        <div className="text-xs font-bold">Nº</div>
                        <div className="border-b border-black text-sm pb-1 font-semibold">{osNumber || '\u00A0'}</div>
                    </div>
                </header>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                    <InfoRow label="Equipamento / Máquina:" value={equipment.name} />
                    <InfoRow label="Data Solicitada:" value={printDate.toLocaleDateString('pt-BR')} />
                    <div className="col-span-2">{maintenanceTypesCheckboxes}</div>
                </div>
            </div>
            <div className="text-right text-xs mt-1 pr-1">FO 005 Rev.1</div>
        </div>

    </div>
  );
};