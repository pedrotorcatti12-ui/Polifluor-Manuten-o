
import React, { useState, useRef } from 'react';
import { Header } from '../components/Header';
import { 
    ChartIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    SecurityIcon, 
    TargetIcon,
    DocumentTextIcon,
    DownloadIcon,
    WrenchIcon,
    PackageIcon,
    ClipboardListIcon,
    ArrowPathIcon
} from '../components/icons';

declare const window: any;
declare const html2canvas: any;

const ROICard: React.FC<{ label: string; value: string; description: string; color: string }> = ({ label, value, description, color }) => (
    <div className={`p-5 rounded-2xl border-l-8 ${color} bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 h-full`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white my-1">{value}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight font-medium uppercase">{description}</p>
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mt-8 mb-4 border-b border-slate-200 pb-2">
        {children}
    </h3>
);

const StepCard: React.FC<{ step: string; title: string; description: string; icon: React.ReactNode }> = ({ step, title, description, icon }) => (
    <div className="flex gap-4 p-4 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-100 dark:border-gray-700">
        <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-8 h-8 bg-slate-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-300">
                {step}
            </div>
            <div className="h-full w-0.5 bg-slate-200 dark:bg-gray-700 my-2"></div>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {icon} {title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
        </div>
    </div>
);

// --- CONTEÚDOS ---

const ITSection = () => (
    <div className="font-sans text-slate-800 dark:text-slate-200">
        <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Instrução de Trabalho</h1>
                <p className="text-sm font-bold text-slate-500 uppercase">IT-MAN-001 • Rev. 02</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold uppercase text-slate-400">Assunto</p>
                <p className="text-lg font-black uppercase">Gestão de Fluxo de Manutenção (SGMI 2.0)</p>
            </div>
        </div>

        <SectionTitle>1. Objetivo</SectionTitle>
        <p className="mb-6 text-sm leading-relaxed text-justify">
            Padronizar o processo de abertura, execução e encerramento de Ordens de Serviço (O.S.) corretivas, garantindo a rastreabilidade exigida pela norma IATF 16949 e a integridade dos dados para cálculo de MTBF/MTTR.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
                <div className="bg-slate-100 p-4 rounded-t-xl border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-black uppercase text-slate-700 text-sm">Cenário A: Processo Atual (Híbrido)</h3>
                    <span className="px-2 py-1 bg-white text-xs font-bold rounded text-slate-500 border border-slate-200">Fluxo Vigente</span>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-b-xl space-y-4">
                    <StepCard step="1" title="Solicitação Física" description="Operador preenche formulário de papel e entrega na Qualidade/PCM." icon={<DocumentTextIcon className="w-4 h-4 text-slate-400"/>} />
                    <StepCard step="2" title="Digitação & Protocolo" description="Analista insere dados no SGMI, gera o ID (#0127) e anota no canhoto de papel." icon={<ClipboardListIcon className="w-4 h-4 text-blue-600"/>} />
                    <StepCard step="3" title="Execução Técnica" description="Técnico realiza reparo e preenche peças/horas no verso da folha." icon={<WrenchIcon className="w-4 h-4 text-slate-400"/>} />
                    <StepCard step="4" title="Baixa no Sistema" description="Analista transcreve dados do papel para o sistema e finaliza a O.S." icon={<CheckCircleIcon className="w-4 h-4 text-emerald-600"/>} />
                </div>
            </div>

            <div>
                <div className="bg-blue-600 p-4 rounded-t-xl border-b border-blue-700 flex justify-between items-center text-white">
                    <h3 className="font-black uppercase text-sm">Sugestão: Processo Digital (Futuro)</h3>
                    <span className="px-2 py-1 bg-white/20 text-xs font-bold rounded text-white border border-white/20">Sem Papel</span>
                </div>
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-b-xl space-y-4">
                    <StepCard step="1" title="Totem na Linha" description="Operador abre chamado via Tablet na produção. O.S. criada instantaneamente." icon={<TargetIcon className="w-4 h-4 text-blue-600"/>} />
                    <StepCard step="2" title="Notificação Push" description="Técnico recebe alerta no celular. Gestor prioriza via 'Centro de Trabalho'." icon={<ClockIcon className="w-4 h-4 text-blue-600"/>} />
                    <StepCard step="3" title="Apontamento Real" description="Técnico inicia e finaliza a O.S. no local via app." icon={<WrenchIcon className="w-4 h-4 text-blue-600"/>} />
                    <StepCard step="4" title="Validação Automática" description="KPIs atualizados em tempo real. Estoque baixado. Sem digitação posterior." icon={<CheckCircleIcon className="w-4 h-4 text-emerald-600"/>} />
                </div>
            </div>
        </div>

        <SectionTitle>Estimativa de Otimização</SectionTitle>
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="px-6 py-3 text-left font-bold uppercase text-slate-500">Indicador</th>
                        <th className="px-6 py-3 text-left font-bold uppercase text-slate-500">Processo Atual</th>
                        <th className="px-6 py-3 text-left font-bold uppercase text-blue-600">Sugestão Digital</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr><td className="px-6 py-3 font-bold">Tempo Adm.</td><td className="px-6 py-3">~15 min/OS</td><td className="px-6 py-3 font-bold text-emerald-600">~2 min/OS</td></tr>
                    <tr><td className="px-6 py-3 font-bold">Risco de Erro</td><td className="px-6 py-3">Alto (Transcodificação)</td><td className="px-6 py-3 font-bold text-emerald-600">Nulo (Fonte Única)</td></tr>
                    <tr><td className="px-6 py-3 font-bold">Custo Material</td><td className="px-6 py-3">Papel, Toner, Pastas</td><td className="px-6 py-3 font-bold text-emerald-600">Zero</td></tr>
                </tbody>
            </table>
        </div>
    </div>
);

const ManualSection = () => (
    <div className="font-sans text-slate-800 dark:text-slate-200">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Manual do Usuário</h1>
            <p className="text-lg font-medium text-slate-500 mt-2">SGMI 2.0 - Sistema de Gestão de Manutenção Inteligente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-black text-lg text-blue-600 uppercase mb-4 flex items-center gap-2"><SecurityIcon className="w-5 h-5"/> 1. Acesso</h3>
                    <ul className="space-y-2 text-sm">
                        <li><strong>URL:</strong> Acesso via navegador (Chrome/Edge).</li>
                        <li><strong>Credenciais:</strong> Admin / Admin (Padrão).</li>
                        <li><strong>Conformidade:</strong> Verifique o selo IATF na tela de login.</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-black text-lg text-blue-600 uppercase mb-4 flex items-center gap-2"><ClipboardListIcon className="w-5 h-5"/> 2. Ordens de Serviço</h3>
                    <p className="text-sm mb-2">Central operacional do dia a dia.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                        <li><strong>Nova O.S.:</strong> Botão azul no topo. Obrigatório: Equipamento e Descrição.</li>
                        <li><strong>Impressão:</strong> Ícone de documento na lista gera PDF para prancheta.</li>
                        <li><strong>Baixa:</strong> Botão verde "Concluir". Exige apontamento de horas e peças.</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-black text-lg text-blue-600 uppercase mb-4 flex items-center gap-2"><PackageIcon className="w-5 h-5"/> 3. Estoque (Almoxarifado)</h3>
                    <p className="text-sm mb-2">Controle integrado com automação.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                        <li><strong>Baixa Automática:</strong> Ocorre ao fechar a O.S. (Gatilho).</li>
                        <li><strong>Inventário Rápido:</strong> Use para ajustes manuais de auditoria.</li>
                        <li><strong>Críticos:</strong> Itens vermelhos estão abaixo do mínimo definido.</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-black text-lg text-blue-600 uppercase mb-4 flex items-center gap-2"><ChartIcon className="w-5 h-5"/> 4. Dashboard & KPI</h3>
                    <p className="text-sm mb-2">Gestão à vista para engenharia.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                        <li><strong>MTBF:</strong> Tempo Médio Entre Falhas (Confiabilidade).</li>
                        <li><strong>MTTR:</strong> Tempo Médio de Reparo (Agilidade).</li>
                        <li><strong>Filtros:</strong> Use "Classe A" para focar em máquinas gargalo.</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-black text-lg text-blue-600 uppercase mb-4 flex items-center gap-2"><ClockIcon className="w-5 h-5"/> 5. Cronograma Mestre</h3>
                    <p className="text-sm mb-2">Planejamento anual preventivo.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                        <li><strong>Cores:</strong> Azul (Programado), Verde (Feito), Vermelho (Atrasado).</li>
                        <li><strong>Gerar Auto:</strong> Botão mágico que preenche lacunas de 90 dias.</li>
                        <li><strong>Arrastar:</strong> Em breve (Drag & Drop para nivelamento).</li>
                    </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-black text-sm uppercase text-slate-500 mb-2">Suporte Técnico</h3>
                    <p className="text-xs text-slate-400">Em caso de "Offline", use o botão "Sincronização Forçada" no menu de Busca Mestra.</p>
                </div>
            </div>
        </div>
    </div>
);

const ROISection = () => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Eficiência Operacional</h2>
                    <p className="text-gray-500 text-sm font-bold uppercase mt-1">Impactos qualitativos da digitalização.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <ROICard label="Economia Adm/Mês Estimada" value="24 Horas" description="Eliminação da dupla digitação (Papel -> Excel) e busca física de arquivos." color="border-blue-500" />
                <ROICard label="Exatidão de KPI" value="100% Confiável" description="MTBF/MTTR gerados diretamente da fonte, sem risco de erro de fórmula em planilhas." color="border-indigo-500" />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Vantagens Estratégicas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="flex gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300"><strong>Auditoria IATF:</strong> Rastreabilidade total de quem fez, quando e o que usou.</p>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300"><strong>Propriedade de Dados:</strong> O banco de dados pertence à Polifluor (sem vendor lock-in).</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const InformationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'it' | 'manual' | 'roi'>('it');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const getPrintLabel = () => {
        switch(activeTab) {
            case 'it': return 'Exportar Instrução (PDF)';
            case 'manual': return 'Exportar Manual (PDF)';
            case 'roi': return 'Exportar Indicadores (PDF)';
            default: return 'Exportar';
        }
    };

    const handleExportPdf = async () => {
        if (!contentRef.current) return;
        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('Aguarde o carregamento das bibliotecas de PDF e tente novamente.');
            return;
        }

        setIsGeneratingPdf(true);

        try {
            const canvas = await html2canvas(contentRef.current, { 
                scale: 2, // Melhor qualidade
                useCORS: true,
                backgroundColor: '#ffffff' // Força fundo branco
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Primeira página
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Páginas subsequentes se a imagem for maior que uma página
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `SGMI_Documentacao_${activeTab}_${new Date().getTime()}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o documento.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

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
        <div className="max-w-6xl mx-auto pb-12 relative">
            <div>
                <Header
                    title="Central de Conhecimento & Documentação"
                    subtitle="Manuais, Procedimentos (IT) e Dados Estratégicos."
                    actions={
                        <button 
                            onClick={handleExportPdf}
                            disabled={isGeneratingPdf}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isGeneratingPdf ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <DownloadIcon className="w-4 h-4" />}
                            {isGeneratingPdf ? 'Gerando PDF...' : getPrintLabel()}
                        </button>
                    }
                />

                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar mb-8 bg-white dark:bg-gray-800 rounded-t-2xl">
                    <TabButton id="it" label="Instrução de Trabalho (IT-MAN-001)" icon={<ClipboardListIcon className="w-4 h-4"/>} />
                    <TabButton id="manual" label="Manual do Usuário" icon={<DocumentTextIcon className="w-4 h-4"/>} />
                    <TabButton id="roi" label="Indicadores de Ganho (Estimativa)" icon={<ChartIcon className="w-4 h-4"/>} />
                </div>
            </div>

            {/* CONTEÚDO VISUALIZAÇÃO EM TELA - CAPTURADO PELO PDF */}
            <div ref={contentRef} className="bg-white dark:bg-gray-800 p-8 rounded-b-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in print-target">
                {activeTab === 'it' && <ITSection />}
                {activeTab === 'manual' && <ManualSection />}
                {activeTab === 'roi' && <ROISection />}
            </div>
        </div>
    );
};
