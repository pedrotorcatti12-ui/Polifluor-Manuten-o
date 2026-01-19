import React from 'react';
import { Header } from '../components/Header';
import { Page } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { 
    ArrowRightIcon, 
    TargetIcon, 
    PackageIcon,
    UsersIcon, 
    ClipboardListIcon,
    ChartIcon,
    ShieldCheckIcon,
    WrenchIcon, 
    LightBulbIcon,
    RefreshIcon,
    InventoryIcon,
    ScheduleIcon,
    InfoIcon
} from '../components/icons';

const RequirementCard: React.FC<{
  id: string;
  title: string;
  description: string;
  appResponse: string;
  icon: React.ReactNode;
  status: { text: string; color: string; };
  action?: { label: string; page: Page };
}> = ({ id, title, description, appResponse, icon, status, action }) => {
  const { setCurrentPage } = useAppContext();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-300">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
              <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requisito {id}</p>
              </div>
               <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  {status.text}
              </span>
          </div>
        </div>
      </div>
       <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{description}"</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Como o Sistema Atende:</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{appResponse}</p>
        {action && (
          <button
            onClick={() => setCurrentPage(action.page)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {action.label}
            <ArrowRightIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export const QualityPage: React.FC = () => {
    const { setCurrentPage } = useAppContext();
    const status = {
        text: 'Atendido',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    };

    const icons: { [key: string]: React.ReactNode } = {
        a: <TargetIcon />,
        b: <InventoryIcon />,
        c: <UsersIcon />,
        d: <PackageIcon />,
        e: <ClipboardListIcon />,
        f: <ChartIcon />,
        g: <ShieldCheckIcon />,
        h: <ScheduleIcon />,
        i: <LightBulbIcon />,
        j: <RefreshIcon />,
        k: <WrenchIcon />,
    };

  const requirements = [
    {
      id: 'a',
      title: 'Identificação de Equipamentos',
      description: 'Identificação dos equipamentos de processo necessários para produzir o produto em conformidade.',
      appResponse: 'O sistema mantém um cadastro completo de todos os equipamentos, que podem ser visualizados, filtrados e gerenciados centralmente.',
      action: { label: 'Ver Lista de Equipamentos', page: 'equipment' as Page },
    },
    {
      id: 'b',
      title: 'Peças de Reposição',
      description: 'Disponibilidade de peças de reposição para os equipamentos identificados.',
      appResponse: 'O módulo de Estoque permite o controle total de peças de reposição, incluindo estoque mínimo, atual e localização, garantindo a disponibilidade.',
      action: { label: 'Acessar Controle de Estoque', page: 'inventory' as Page },
    },
    {
      id: 'c',
      title: 'Provisão de Recursos',
      description: 'Provisão de recursos para a manutenção de máquinas, equipamentos e instalações.',
      appResponse: 'Cada Ordem de Serviço permite a atribuição de um responsável (interno ou terceirizado), e o Dashboard exibe a distribuição de tarefas, evidenciando a alocação de recursos.',
      action: { label: 'Ver Ordens de Serviço', page: 'work_orders' as Page },
    },
    {
      id: 'd',
      title: 'Embalagem e Preservação',
      description: 'Embalagem e preservação de equipamentos, ferramental e dispositivos.',
      appResponse: 'A ficha de cada equipamento possui um campo específico para registrar notas sobre Embalagem e Preservação, garantindo que o conhecimento seja mantido e acessível.',
      action: { label: 'Gerenciar Equipamentos', page: 'equipment' as Page },
    },
    {
      id: 'e',
      title: 'Requisitos do Cliente',
      description: 'Requisitos específicos do cliente aplicáveis.',
      appResponse: 'A ficha de cada equipamento permite a documentação de Requisitos Específicos do Cliente, assegurando que as necessidades sejam consideradas na manutenção.',
      action: { label: 'Gerenciar Equipamentos', page: 'equipment' as Page },
    },
    {
      id: 'f',
      title: 'Objetivos de Manutenção Documentados',
      description: 'Objetivos de manutenção documentados, por exemplo: MTBF e MTTR.',
      appResponse: 'O sistema calcula e documenta automaticamente os indicadores MTBF, MTTR e Disponibilidade para cada equipamento, com as fórmulas e definições explícitas para auditoria.',
      action: { label: 'Analisar Métricas nos Relatórios', page: 'advanced_reports' as Page },
    },
    {
        id: 'g',
        title: 'Análise Crítica e Plano de Ação',
        description: 'Análise crítica regular do plano e objetivos de manutenção e ter um plano de ação documentado.',
        appResponse: 'O Dashboard e o histórico de manutenções fornecem todos os dados necessários para a análise crítica da direção. O sistema serve como a fonte de informação para a criação de planos de ação.',
    },
    {
      id: 'h',
      title: 'Manutenção Preventiva',
      description: 'Uso de métodos de manutenção preventiva.',
      appResponse: 'O núcleo do sistema é o Cronograma de Manutenção, que permite o planejamento, execução e controle de todas as tarefas preventivas.',
      action: { label: 'Ver Cronograma de Preventivas', page: 'schedule' as Page },
    },
    {
        id: 'i',
        title: 'Manutenção Preditiva',
        description: 'Uso de métodos de manutenção preditiva, conforme aplicável.',
        appResponse: 'O sistema suporta a criação e o rastreamento de Ordens de Serviço do tipo Preditiva, permitindo a implementação de estratégias de manutenção baseadas na condição do ativo.',
    },
     {
        id: 'j',
        title: 'Revisão Periódica',
        description: 'Revisão periódica do sistema de manutenção.',
        appResponse: 'A existência e o uso contínuo deste sistema, com seus históricos e relatórios, são a base para a realização de revisões periódicas do processo de manutenção produtiva total.',
    },
    {
        id: 'k',
        title: 'Métricas e Melhoria Contínua',
        description: 'A organização deve acompanhar o desempenho em relação aos objetivos de manutenção e usar esses dados para melhorar continuamente.',
        appResponse: 'Os relatórios exportáveis e as métricas globais no Dashboard (MTBF, MTTR, Disponibilidade) são ferramentas diretas para o monitoramento de desempenho, apoiando ciclos de melhoria contínua.',
        action: { label: 'Ver Relatórios Avançados', page: 'advanced_reports' as Page },
    }
  ];

  return (
    <>
      <Header
        title="Conformidade IATF 8.5.1.5"
        subtitle="Como este sistema atende aos requisitos de Manutenção Produtiva Total."
        actions={
             <button
                onClick={() => setCurrentPage('information')}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <InfoIcon className="w-5 h-5" />
                Saber mais sobre as Normas
              </button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requirements.map((req) => (
          <RequirementCard key={req.id} {...req} icon={icons[req.id]} status={status} />
        ))}
      </div>
    </>
  );
};