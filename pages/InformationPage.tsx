
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { 
    ShieldCheckIcon, ChartIcon, WrenchIcon, LightBulbIcon, ClockIcon, 
    CheckCircleIcon, ArrowRightIcon, RefreshIcon, DocumentTextIcon,
    PackageIcon, ShieldCheckIcon as SecurityIcon, TargetIcon
} from '../components/icons';

const ROICard: React.FC<{ label: string; value: string; description: string; color: string }> = ({ label, value, description, color }) => (
    <div className={`p-5 rounded-2xl border-l-8 ${color} bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white my-1">{value}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight font-medium uppercase">{description}</p>
    </div>
);

export const InformationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'roi' | 'contract' | 'commercial'>('roi');

    const TabButton: React.FC<{ id: string; label: string; icon: React.ReactNode }> = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-black text-[11px] uppercase tracking-wider transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === id 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <Header
                title="Business Intelligence & Gestão de Ativos"
                subtitle="Documentação técnica, financeira e governança do SGMI 2.0."
            />

            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar mb-8">
                <TabButton id="roi" label="ROI & Produtividade" icon={<ChartIcon className="w-4 h-4"/>} />
                <TabButton id="commercial" label="Modelo de Negócio" icon={<TargetIcon className="w-4 h-4"/>} />
                <TabButton id="contract" label="Proposta de Transferência" icon={<SecurityIcon className="w-4 h-4"/>} />
            </div>

            {activeTab === 'roi' && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Retorno sobre Investimento (Equipe 5 Manut.)</h2>
                                <p className="text-gray-500 text-sm font-bold uppercase mt-1">Estimativa de ganhos em processos IATF 16949.</p>
                            </div>
                            <div className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                Valor Total: R$ 5.000,00
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <ROICard label="Economia Adm/Mês" value="24 Horas" description="Fim da digitação de planilhas. Dados entram direto via sistema." color="border-blue-500" />
                            <ROICard label="Exatidão de KPI" value="100%" description="MTBF/MTTR gerados sem interferência ou erro de fórmula." color="border-indigo-500" />
                            <ROICard label="Custo Mensal (20x)" value="R$ 185,00" description="Parcelamento facilitado via compromisso interno." color="border-emerald-500" />
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Diferenciais Competitivos vs "Software de Prateleira"</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                <div className="flex gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300"><strong>Pagamento Único:</strong> Após 20 meses, custo recorrente é ZERO. Sem aluguel de licença.</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300"><strong>Código Aberto Interno:</strong> A empresa é dona do sistema. Garantia de continuidade.</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300"><strong>Integridade IATF:</strong> Atendimento pleno ao requisito 8.5.1.5 da norma automotiva.</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300"><strong>Desenvolvimento Sob Medida:</strong> Regras específicas para prensas PH e extrusoras EX.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'commercial' && (
                <div className="animate-fade-in bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Condições Especiais de Aquisição</h3>
                        <p className="text-gray-500 text-sm font-bold uppercase">Proposta adaptada ao fluxo de caixa da unidade.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 flex flex-col justify-between">
                            <div>
                                <h4 className="font-black text-blue-800 uppercase text-xs mb-2">Entrada (Go-Live)</h4>
                                <p className="text-3xl font-black text-blue-900">R$ 1.300,00</p>
                                <p className="text-[10px] text-blue-600 mt-4 font-black uppercase leading-tight">Pagamento único após validação técnica de todas as funções básicas.</p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col justify-between">
                            <div>
                                <h4 className="font-black text-slate-800 uppercase text-xs mb-2">Parcelamento Interno</h4>
                                <p className="text-3xl font-black text-slate-900">20x R$ 185,00</p>
                                <p className="text-[10px] text-slate-600 mt-4 font-black uppercase leading-tight">Valor amortizado via sistema interno de consignado. Sem juros ou taxas externas.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <h4 className="text-[11px] font-black text-amber-800 uppercase mb-2 tracking-widest flex items-center gap-2">
                             <ClockIcon className="w-4 h-4" /> Comparativo de Custo-Benefício
                        </h4>
                        <p className="text-sm text-amber-900 font-medium leading-relaxed italic">
                            Enquanto softwares de mercado exigem mensalidades vitalícias de R$ 800+ (R$ 16.000 em 20 meses), o SGMI 2.0 transfere o patrimônio tecnológico para a empresa por menos de 1/3 deste valor total.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'contract' && (
                <div className="animate-fade-in bg-slate-900 text-slate-300 p-10 rounded-3xl border border-slate-700 shadow-2xl space-y-8 font-serif">
                    <div className="text-center">
                        <SecurityIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Cessão de Propriedade Intelectual</h3>
                        <p className="text-xs text-slate-500 uppercase mt-2 font-sans font-bold">Patrimônio Tecnológico - Pagamento 20x</p>
                    </div>

                    <div className="space-y-4 text-sm leading-relaxed text-justify italic">
                        <p>O CEDENTE transfere integralmente à CESSIONÁRIA os direitos de uso e manutenção do software **SGMI 2.0**, vinculando a quitação final ao cumprimento do cronograma de parcelas acordado em 20x.</p>
                        <ul className="list-disc pl-5 space-y-2 font-sans text-xs">
                            <li>Código-fonte (Frontend e Lógica de Negócio);</li>
                            <li>Administração do Banco de Dados em Nuvem;</li>
                            <li>Fórmulas de Disponibilidade e MTBF para IATF;</li>
                            <li>Suporte técnico local imediato (Garantia de 90 dias).</li>
                        </ul>
                        <p>Desta forma, a empresa torna-se proprietária de sua própria ferramenta de gestão, extinguindo riscos de interrupção operacional por dependência de terceiros.</p>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mt-8">
                         <div className="flex justify-between items-end border-b border-slate-600 pb-2 mb-8">
                            <span className="text-[10px] font-black uppercase text-slate-500">Desenvolvedor</span>
                            <span className="text-sm font-bold text-white tracking-widest font-sans">TOTAL: R$ 5.000,00</span>
                         </div>
                         <div className="grid grid-cols-2 gap-8">
                            <div className="h-10 border-b border-slate-600"></div>
                            <div className="h-10 border-b border-slate-600"></div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};
