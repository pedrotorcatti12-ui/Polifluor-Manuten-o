
-- =============================================================================
-- ATUALIZAÇÃO DOS CHECKLISTS - "A BÍBLIA DA MANUTENÇÃO"
-- Objetivo: Inserir as tarefas técnicas detalhadas em cada plano e atualizar as O.S. de 2026.
-- =============================================================================

BEGIN;

-- 1. ATUALIZAÇÃO DOS PLANOS MESTRES (DEFINIÇÃO DAS TAREFAS)

-- FAMÍLIA: PRENSAS HIDRÁULICAS (PH)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "VERIFICAÇÃO DO NÍVEL DE OLEO ANTES DA PARTIDA", "checked": false},
    {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false},
    {"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false},
    {"action": "APERTO DE TERMINAIS", "checked": false},
    {"action": "LIMPEZA INTERNA DOS COMPONENTES", "checked": false},
    {"action": "VERIFICAÇÃO DO SISTEMA HIDRÁULICO", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-PH-TRIMESTRAL';

-- FAMÍLIA: EXTRUSORAS (EX - PADRÃO)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false},
    {"action": "VERIFICAÇÃO DE OLEO ANTES DA PARTIDA", "checked": false},
    {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false},
    {"action": "VERIFICAR VAZAMENTOS", "checked": false},
    {"action": "LIMPEZA INTERNA DO PAINEL", "checked": false},
    {"action": "VERIFICAR CILINDRO HIDRÁULICO", "checked": false},
    {"action": "VERIFICAR RESISTÊNCIA", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-EX-TRIMESTRAL';

-- FAMÍLIA: EXTRUSORAS PA (AEX)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "VERIFICAÇÃO DE VAZAMENTOS", "checked": false},
    {"action": "VERIFICAÇÃO DE NIVEL DE OLEO ANTES DA PARTIDA", "checked": false},
    {"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false},
    {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false},
    {"action": "VERIFICAR RESISTENCIAS DAS ZONAS DE AQUECIMENTO", "checked": false},
    {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-AEX-TRIMESTRAL';

-- FAMÍLIA: FORNOS E ESTUFAS (FO)
-- Atualiza o genérico e os específicos para garantir uniformidade onde não houver especialidade
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "REAPERTO DOS CONTATOS ELÉTRICOS", "checked": false},
    {"action": "MEDIÇÃO DE CORRENTE DO MOTOR (Ventilação)", "checked": false},
    {"action": "VERIFICAÇÃO DA VEDAÇÃO DA PORTA", "checked": false},
    {"action": "CALIBRAÇÃO DE TEMPERATURA", "checked": false},
    {"action": "VERIFICAR TUBULAÇÃO DE GÁS (Se aplicável)", "checked": false},
    {"action": "VERIFICAR ESTRUTURA FÍSICA", "checked": false}
]'::jsonb 
WHERE id LIKE 'PLAN-FO%';

-- FAMÍLIA: TORNOS MECÂNICOS (TM)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "VERIFICAR FOLGA DO CARRO TRANSVERSAL", "checked": false},
    {"action": "LUBRIFICAÇÃO DE BARRAMENTOS E FUSOS", "checked": false},
    {"action": "AJUSTE DO FREIO DO MOTOR", "checked": false},
    {"action": "VERIFICAR/TROCAR OLEO DA CAIXA NORTON", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-TM-TRIMESTRAL';

-- FAMÍLIA: TORNOS CNC (TC)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "NÍVEL DE OLEO DO BARRAMENTO", "checked": false},
    {"action": "LIMPAR FILTROS DE AR DO PAINEL", "checked": false},
    {"action": "VERIFICAR CORREIAS DO SPINDLE", "checked": false},
    {"action": "VERIFICAR COOLER DO DRIVE", "checked": false},
    {"action": "VERIFICAR NIVELAMENTO", "checked": false},
    {"action": "VERIFICAR GEOMETRIA", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-TC-SEMESTRAL';

-- FAMÍLIA: TORNOS AUTOMÁTICOS (TA)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "VERIFICAR CAMES E ALAVANCAS", "checked": false},
    {"action": "LUBRIFICAR BARRAMENTOS", "checked": false},
    {"action": "AJUSTAR MANDRIL/PINÇAS", "checked": false},
    {"action": "NÍVEL DE OLEO DE CORTE", "checked": false},
    {"action": "VERIFICAR ROLAMENTOS (6202 ZZ/32005)", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-TA-ANUAL';

-- FAMÍLIA: TRANÇADEIRAS (TD)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "VERIFICAR PRESILHA DA ESPULHA", "checked": false},
    {"action": "VERIFICAR ROLDANA DA ESPULHA", "checked": false},
    {"action": "MEDIÇÃO DA CORRENTE DO MOTOR", "checked": false},
    {"action": "VERIFICAR PAINEL ELÉTRICO", "checked": false},
    {"action": "VERIFICAR REDUTOR", "checked": false},
    {"action": "VERIFICAR BOTOEIRAS E CONTATOS", "checked": false},
    {"action": "VERIFICAR MOTOR", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-TD-TRIMESTRAL';

-- FAMÍLIA: ESPULADEIRAS (EP)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "SISTEMA DE TENSIONAMENTO", "checked": false},
    {"action": "GUIAS DE CERÂMICA", "checked": false},
    {"action": "CORREIAS V-BELT", "checked": false},
    {"action": "LUBRIFICAR MANCAIS", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-EP-QUADRIMESTRAL';

-- FAMÍLIA: MÁQUINAS DE CORRUGAR (CR)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "ALINHAMENTO DE MOLDES", "checked": false},
    {"action": "LUBRIFICAÇÃO AUTOMÁTICA", "checked": false},
    {"action": "BICOS DE ARREFECIMENTO", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-CR-BIMESTRAL';

-- FAMÍLIA: COMPRESSORES (CO)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "DRENAR CONDENSADO", "checked": false},
    {"action": "VERIFICAR TEMPERATURA", "checked": false},
    {"action": "NÍVEL DE OLEO DO COMPRESSOR", "checked": false},
    {"action": "LIMPEZA DO RADIADOR", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-CO-ANUAL';

-- FAMÍLIA: MÁQUINAS DE SOLDA (MS)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "VERIFICAR ASPECTO VISUAL E ESTRUTURA", "checked": false},
    {"action": "VERIFICAR INSTALAÇÃO ELÉTRICA", "checked": false},
    {"action": "VERIFICAR CABOS DE SOLDA", "checked": false},
    {"action": "VERIFICAR TOCHA DE SOLDAGEM", "checked": false},
    {"action": "VERIFICAR MOTOR E BOMBA D AGUA (Se houver)", "checked": false},
    {"action": "EXECUTAR LIMPEZA COM SOPRADOR DE AR", "checked": false}
]'::jsonb 
WHERE id LIKE 'PLAN-MS%';

-- FAMÍLIA: SERRAS DE FITA (SF)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "TENSÃO DA FITA", "checked": false},
    {"action": "ALINHAMENTO DAS GUIAS (ROLAMENTOS)", "checked": false},
    {"action": "NÍVEL DE FLUIDO REFRIGERANTE", "checked": false},
    {"action": "LIMPEZA DE CAVACOS", "checked": false},
    {"action": "VERIFICAÇÃO DA MOLA DE RETORNO", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-SF-SEMESTRAL';

-- FAMÍLIA: TREFILAS (TF)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "INSPECIONAR FIEIRAS", "checked": false},
    {"action": "LUBRIFICAÇÃO DO SISTEMA DE TRAÇÃO", "checked": false},
    {"action": "VERIFICAR ALINHAMENTO DOS CONES", "checked": false},
    {"action": "TENSÃO DAS CORREIAS", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-TF-SEMESTRAL';

-- FAMÍLIA: JATOS (JT)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "VERIFICAR ESTADO DAS PALHETAS DA TURBINA", "checked": false},
    {"action": "INSPECIONAR CHAPAS DE PROTEÇÃO INTERNA", "checked": false},
    {"action": "VERIFICAR BICO DE JATEAMENTO", "checked": false},
    {"action": "LIMPEZA E INSPEÇÃO DOS COLETORES DE PÓ", "checked": false},
    {"action": "TROCA OBRIGATÓRIA DO CARTUCHO DO FILTRO DO CAPACETE", "checked": false},
    {"action": "VERIFICAR VEDAÇÃO DAS PORTAS DA CABINE", "checked": false},
    {"action": "LUBRIFICAÇÃO DOS MANCAIS PRINCIPAIS", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-JATOS-TRIMESTRAL';

-- FAMÍLIA: CENTRO DE USINAGEM (CT)
UPDATE public.maintenance_plans 
SET tasks = '[
    {"action": "ALINHAMENTO ATC", "checked": false},
    {"action": "CONCENTRAÇÃO FLUIDO DE CORTE", "checked": false},
    {"action": "LIMPEZA TANQUE", "checked": false},
    {"action": "NIVELAMENTO", "checked": false}
]'::jsonb 
WHERE id = 'PLAN-CT-SEMESTRAL';

-- MÁQUINAS ESPECÍFICAS (Geralmente Manuais/Individuais)

-- MISTURADORES (MI)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Nível óleo 320", "checked": false}, {"action": "Desgaste das pás", "checked": false}, {"action": "Reaperto da base do motor", "checked": false}]'::jsonb WHERE id = 'PLAN-MI-ANUAL' OR id = 'PLAN-MI04-ANUAL';

-- ESMERIL (ES)
UPDATE public.maintenance_plans SET tasks = '[{"action": "VERIFICAR ESTADO DOS REBOLOS", "checked": false}, {"action": "AJUSTAR APOIO", "checked": false}, {"action": "VERIFICAR PROTEÇÃO VISUAL", "checked": false}, {"action": "TESTE DE ISOLAMENTO ELÉTRICO", "checked": false}]'::jsonb WHERE id = 'PLAN-ES-ANUAL';

-- CÂMARA FRIA (CF)
UPDATE public.maintenance_plans SET tasks = '[{"action": "VERIFICAÇÃO GERAL DO EQUIPAMENTO", "checked": false}, {"action": "VERIFICAÇÃO DE TEMPERATURA", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "LIMPEZA DA GRADE DO AR CONDICIONADO", "checked": false}]'::jsonb WHERE id = 'PLAN-CF-ANUAL';

-- PRÉ-MOLDE (PM)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Nível óleo", "checked": false}, {"action": "Limpeza sistema hidráulico", "checked": false}, {"action": "Reaperto conexões", "checked": false}]'::jsonb WHERE id = 'PLAN-PM-TRIMESTRAL';

-- CABINE PINTURA (CP)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Instalação elétrica", "checked": false}, {"action": "Filtros secos", "checked": false}, {"action": "Motor/Exaustão", "checked": false}, {"action": "Vidros teto", "checked": false}, {"action": "Estrutura metálica", "checked": false}]'::jsonb WHERE id = 'PLAN-CP-BIMESTRAL';

-- ENROLADOR DE FITA (EN)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Eixo expansível", "checked": false}, {"action": "Guias", "checked": false}, {"action": "Tensão fita", "checked": false}, {"action": "Correias", "checked": false}, {"action": "Mancais", "checked": false}, {"action": "Ruídos", "checked": false}, {"action": "Botão emergência", "checked": false}]'::jsonb WHERE id = 'PLAN-EN-QUADRIMESTRAL';

-- TAMBOREADOR (TB)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Rolamentos eixo excêntrico", "checked": false}, {"action": "Fixação massas", "checked": false}, {"action": "Molas/Coxins", "checked": false}, {"action": "Correia", "checked": false}, {"action": "Revestimento", "checked": false}, {"action": "Vedação", "checked": false}]'::jsonb WHERE id = 'PLAN-TB-ANUAL';

-- RETÍFICA (RE)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Rebolo", "checked": false}, {"action": "Barramentos/Fusos", "checked": false}, {"action": "Fluido", "checked": false}, {"action": "Diamantador", "checked": false}, {"action": "Folgas", "checked": false}, {"action": "Elétrica", "checked": false}]'::jsonb WHERE id = 'PLAN-RE-SEMESTRAL';

-- POLICORTE (PO)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Disco", "checked": false}, {"action": "Mola retorno", "checked": false}, {"action": "Morsa", "checked": false}, {"action": "Cabos", "checked": false}, {"action": "Coifa", "checked": false}, {"action": "Articulação", "checked": false}]'::jsonb WHERE id = 'PLAN-PO-ANUAL';

-- MÁQUINA DE TESTE (TS)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Calibração", "checked": false}, {"action": "Estanqueidade", "checked": false}, {"action": "Segurança", "checked": false}, {"action": "Mangueiras", "checked": false}]'::jsonb WHERE id = 'PLAN-TS-SEMESTRAL';

-- CALANDRA (CA)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Rolos/Engrenagens", "checked": false}, {"action": "Paralelismo", "checked": false}, {"action": "Base", "checked": false}, {"action": "Correias", "checked": false}]'::jsonb WHERE id = 'PLAN-CA-SEMESTRAL';

-- PLAINA (PL)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Nivelamento mesa", "checked": false}, {"action": "Guias", "checked": false}, {"action": "Curso braço", "checked": false}, {"action": "Lubrificação", "checked": false}]'::jsonb WHERE id = 'PLAN-PL-SEMESTRAL';

-- ESTUFA FUNIL (ET)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Limpeza funil", "checked": false}, {"action": "Resistências", "checked": false}, {"action": "Termostato", "checked": false}, {"action": "Filtros", "checked": false}]'::jsonb WHERE id = 'PLAN-ET-TRIMESTRAL';

-- MÁQUINA VIROLA (MV)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Matrizes", "checked": false}, {"action": "Eixos", "checked": false}, {"action": "Pressão", "checked": false}]'::jsonb WHERE id = 'PLAN-MV-SEMESTRAL';

-- GUILHOTINA (GUI)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Afiação/Folga facas", "checked": false}, {"action": "Guias", "checked": false}, {"action": "Proteção", "checked": false}, {"action": "Óleo hidráulico", "checked": false}]'::jsonb WHERE id = 'PLAN-GUI-SEMESTRAL';

-- FRESADORAS (FR)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Fusos/Barramentos", "checked": false}, {"action": "Folga cabeçote", "checked": false}, {"action": "Refrigeração", "checked": false}, {"action": "Elétrica", "checked": false}]'::jsonb WHERE id = 'PLAN-FR-SEMESTRAL';

-- MÁQUINAS LASER (ML)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Óticas/Lentes", "checked": false}, {"action": "Chiller interno", "checked": false}, {"action": "Feixe", "checked": false}, {"action": "Exaustão", "checked": false}]'::jsonb WHERE id = 'PLAN-ML-SEMESTRAL';

-- ROUTERS (RO)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Cremalheiras/Fusos", "checked": false}, {"action": "Vácuo", "checked": false}, {"action": "Spindle", "checked": false}, {"action": "Filtros ar", "checked": false}]'::jsonb WHERE id = 'PLAN-RO-SEMESTRAL';

-- PUXADOR (PX)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Esteiras", "checked": false}, {"action": "Tensão pneumática", "checked": false}, {"action": "Sincronismo", "checked": false}, {"action": "Eixos", "checked": false}]'::jsonb WHERE id = 'PLAN-PX-TRIMESTRAL';

-- MOLDAGEM GLICERINA (MG)
UPDATE public.maintenance_plans SET tasks = '[{"action": "Condições gerais", "checked": false}, {"action": "Contatos", "checked": false}, {"action": "Nível glicerina", "checked": false}]'::jsonb WHERE id = 'PLAN-MG-TRIMESTRAL';


-- 2. SINCRONIZAÇÃO DAS ORDENS DE SERVIÇO (PUSH)
-- Aplica os checklists atualizados dos planos nas Ordens de Serviço "Programadas" de 2026.
-- Isso garante que o cronograma recém-criado já nasça com a "Bíblia" aplicada.

UPDATE public.work_orders wo
SET checklist = mp.tasks
FROM public.maintenance_plans mp
WHERE 
    wo.plan_id = mp.id
    AND wo.status = 'Programado'
    AND EXTRACT(YEAR FROM wo.scheduled_date) = 2026
    AND wo.type = 'Preventiva';

-- 3. AJUSTE PARA O.S. DE TERCEIROS
-- Garante que O.S. com "TERCEIRO" na descrição tenham o checklist de alerta correto, independente do plano.
UPDATE public.work_orders
SET checklist = '[{"action": "ACIONAR TERCEIRO ESPECIALIZADO", "checked": false}]'::jsonb
WHERE 
    (description ILIKE '%TERCEIRO%' OR description ILIKE '%ALERTA%')
    AND status = 'Programado'
    AND EXTRACT(YEAR FROM scheduled_date) = 2026;

COMMIT;

SELECT 'Checklists da Bíblia atualizados nos Planos e Sincronizados com as O.S. de 2026!';
