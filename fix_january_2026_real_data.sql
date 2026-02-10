
-- =============================================================================
-- SCRIPT FINAL - JANEIRO 2026 (REALIDADE DE CAMPO & MELHORIA CONTÍNUA)
-- Autor: SGMI 2.0
-- =============================================================================

BEGIN;

-- 1. AÇÃO CORRETIVA NO PLANEJAMENTO (Feedback Imediato)
-- O operador apontou falta de itens no checklist. Atualizamos o Plano Mestre agora.

-- OS 0303 (Extrusora PA): Adicionar verificação de resistência e estrutura.
UPDATE public.maintenance_plans
SET tasks = tasks || '[
    {"action": "Verificar resistência zonas aquecimento"}, 
    {"action": "Verificar estrutura física do equipamento"}
]'::jsonb
WHERE id = 'PLAN-AEX-TRIMESTRAL';

-- OS 0006 (Câmara Fria): Adicionar limpeza de grade.
UPDATE public.maintenance_plans
SET tasks = tasks || '[
    {"action": "Limpeza da grade do ar condicionado"}
]'::jsonb
WHERE id = 'PLAN-CF-ANUAL';

-- OS 0067 (Forno): Adicionar verificações de correias e rolamentos.
UPDATE public.maintenance_plans
SET tasks = tasks || '[
    {"action": "Medição corrente motor 2 e 3"},
    {"action": "Verificação das correias"},
    {"action": "Lubrificação dos rolamentos"},
    {"action": "Verificar tubulação de gás"}
]'::jsonb
WHERE id LIKE '%FO%'; -- Aplica a todos os planos de forno para padronização


-- 2. LIMPEZA DA BASE (Remove dados fictícios de Jan/26)
DELETE FROM public.work_orders 
WHERE 
    EXTRACT(MONTH FROM scheduled_date) = 1 
    AND EXTRACT(YEAR FROM scheduled_date) = 2026
    AND type = 'Preventiva'
    AND equipment_id IN (
        'PH-09', 'EX-04', 'ES-04', 'ES-01', 'TD-02', 'TD-04', 'MS-03', 'MS-02', 
        'EX-02', 'AEX-02', 'CF-01', 'PH-15', 'ES-03', 'PH-13', 'MS-04', 'FO-11', 
        'FO-07', 'PH-07', 'PH-08', 'FO-10'
    );

DELETE FROM public.work_orders 
WHERE id IN (
    '0187', '0055', '0009', '0007', '0230', '0250', '0019', '0013', '0043', '0303', 
    '0006', '0127', '0011', '0147', '0025', '0075', '0115', '0179', '0183', '0067'
);


-- 3. INSERÇÃO DAS O.S. REAIS (Checklists Limpos - Sem N/A)

-- OS 0187 (PH-09)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0187', 'PH-09', 'Preventiva', 'Executado', '2026-01-09 08:30:00', '2026-01-09 08:30:00', '2026-01-09 09:10:00',
    'Manutenção Preventiva - Prensa de Moldagem', 
    'Serviço executado sem ressalvas.', 
    'Produção', true,
    '[
        {"action": "Verificação do nível de óleo antes da partida", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Aperto de terminais", "checked": true},
        {"action": "Limpeza interna dos componentes", "checked": true},
        {"action": "Verificação do sistema hidráulico", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.67}]'::jsonb
);

-- OS 0055 (EX-04)
-- ITEM REMOVIDO: "Verificar queimador" (Não Aplicável a esta máquina)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0055', 'EX-04', 'Preventiva', 'Executado', '2026-01-08 14:00:00', '2026-01-08 14:00:00', '2026-01-08 14:35:00',
    'Manutenção Preventiva - Extrusora', 
    'Checklist ajustado: Item de queimador removido por não se aplicar.', 
    'Produção', true,
    '[
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Verificação de óleo antes da partida", "checked": true},
        {"action": "Medição de corrente do motor (220V)", "checked": true},
        {"action": "Verificar vazamentos", "checked": true},
        {"action": "Limpeza interna do painel", "checked": true},
        {"action": "Verificar cilindro hidráulico", "checked": true},
        {"action": "Verificar resistência", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.58}]'::jsonb
);

-- OS 0009 (ES-04)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0009', 'ES-04', 'Preventiva', 'Executado', '2026-01-08 15:00:00', '2026-01-08 15:00:00', '2026-01-08 15:20:00',
    'Manutenção Preventiva - Esmeril', 
    'Localização: Caldeiraria. Proteção visual de metal verificada.', 
    'Caldeiraria', true,
    '[
        {"action": "Verificar estado dos rebolos (trincas)", "checked": true},
        {"action": "Ajustar apoio de peça (máx 3mm do rebolo)", "checked": true},
        {"action": "Verificar proteção visual (Metal)", "checked": true},
        {"action": "Teste de isolamento elétrico", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.33}]'::jsonb
);

-- OS 0007 (ES-01)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0007', 'ES-01', 'Preventiva', 'Executado', '2026-01-08 11:00:00', '2026-01-08 11:00:00', '2026-01-08 11:15:00',
    'Manutenção Preventiva - Esmeril', 
    'Localização: Usinagem.', 
    'Usinagem', true,
    '[
        {"action": "Verificar estado dos rebolos (trincas)", "checked": true},
        {"action": "Ajustar apoio de peça (máx 3mm do rebolo)", "checked": true},
        {"action": "Verificar proteção visual (acrílico)", "checked": true},
        {"action": "Teste de isolamento elétrico", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.25}]'::jsonb
);

-- OS 0230 (TD-02)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0230', 'TD-02', 'Preventiva', 'Executado', '2026-01-08 09:00:00', '2026-01-08 09:00:00', '2026-01-08 09:40:00',
    'Manutenção Preventiva - Trançadeira', 
    '', 
    'Produção', true,
    '[
        {"action": "Verificar presilha da espula", "checked": true},
        {"action": "Verificar roldana da espula", "checked": true},
        {"action": "Medição da corrente do motor", "checked": true},
        {"action": "Verificar painel elétrico", "checked": true},
        {"action": "Verificar redutor", "checked": true},
        {"action": "Verificar botoeiras e contatos", "checked": true},
        {"action": "Verificar motor", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.67}]'::jsonb
);

-- OS 0250 (TD-04)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0250', 'TD-04', 'Preventiva', 'Executado', '2026-01-09 14:00:00', '2026-01-09 14:00:00', '2026-01-09 14:35:00',
    'Manutenção Preventiva - Trançadeira', 
    '', 
    'Produção', true,
    '[
        {"action": "Verificar presilha da espula", "checked": true},
        {"action": "Verificar roldana da espula", "checked": true},
        {"action": "Medição da corrente do motor", "checked": true},
        {"action": "Verificar painel elétrico", "checked": true},
        {"action": "Verificar redutor", "checked": true},
        {"action": "Verificar botoeiras e contatos", "checked": true},
        {"action": "Verificar motor", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.58}]'::jsonb
);

-- OS 0019 (MS-03)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0019', 'MS-03', 'Preventiva', 'Executado', '2026-01-08 16:30:00', '2026-01-08 16:30:00', '2026-01-08 17:00:00',
    'Manutenção Preventiva - Máquina de Solda (SUMIG)', 
    'Localização: Tubulação.', 
    'Tubulação', true,
    '[
        {"action": "Verificar aspecto visual e estrutural", "checked": true},
        {"action": "Verificar instalação elétrica", "checked": true},
        {"action": "Verificar cabos de solda", "checked": true},
        {"action": "Verificar tocha de soldagem", "checked": true},
        {"action": "Executar limpeza com soprador de ar", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.50}]'::jsonb
);

-- OS 0013 (MS-02)
-- REMOVIDO: Itens de refrigeração e água (Não Aplicável)
-- ADICIONADO: Solicitação de Compra Tocha
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours, purchase_requests
) VALUES (
    '0013', 'MS-02', 'Preventiva', 'Executado', '2026-01-09 07:30:00', '2026-01-09 07:30:00', '2026-01-09 08:10:00',
    'Manutenção Preventiva - Máquina de Solda', 
    'Itens de refrigeração removidos do checklist (não aplicável). Solicitado compra de Tocha.', 
    'Tubulação', true,
    '[
        {"action": "Verificar aspecto visual e estrutural", "checked": true},
        {"action": "Verificar instalação elétrica", "checked": true},
        {"action": "Verificar cabos de solda", "checked": true},
        {"action": "Verificar tocha de soldagem", "checked": true},
        {"action": "Limpeza interna", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.67}]'::jsonb,
    '[{"id": "REQ-0013-1", "status": "Pendente", "quantity": 1, "requester": "Manutenção", "equipmentId": "MS-02", "itemDescription": "TOCHA DE SOLDA SUMIG", "requisitionDate": "2026-01-09T08:10:00"}]'::jsonb
);

-- OS 0043 (EX-02)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0043', 'EX-02', 'Preventiva', 'Executado', '2026-01-08 13:00:00', '2026-01-08 13:00:00', '2026-01-08 13:45:00',
    'Manutenção Preventiva - Extrusora', 
    '[AGUARDANDO APROVAÇÃO] Vazamento no sistema hidráulico. Cotação feita com fornecedor externo e apresentada ao gestor Vicari.', 
    'Produção', true,
    '[
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Verificação de óleo", "checked": true},
        {"action": "Medição de corrente (220V)", "checked": true},
        {"action": "Verificar vazamentos (ENCONTRADO - VER OBS)", "checked": true},
        {"action": "Limpeza interna do painel", "checked": true},
        {"action": "Verificar cilindro hidráulico", "checked": true},
        {"action": "Verificar resistência", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.75}]'::jsonb
);

-- OS 0303 (AEX-02)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0303', 'AEX-02', 'Preventiva', 'Executado', '2026-01-08 11:30:00', '2026-01-08 11:30:00', '2026-01-08 12:30:00',
    'Manutenção Preventiva - Extrusora de PA', 
    '[MELHORIA] Itens faltantes (Resistência/Estrutura) já incluídos no Plano Mestre para próximas preventivas.', 
    'Automotivo', true,
    '[
        {"action": "Limpeza do equipamento (REALIZADO PELO OPERADOR)", "checked": true},
        {"action": "Verificação de vazamentos", "checked": true},
        {"action": "Verificação de nível de óleo", "checked": true},
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Verificar resistência zonas aquecimento (NOVO)", "checked": true},
        {"action": "Verificar estrutura física (NOVO)", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 1.0}]'::jsonb
);

-- OS 0006 (CF-01)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0006', 'CF-01', 'Preventiva', 'Executado', '2026-01-08 07:30:00', '2026-01-08 07:30:00', '2026-01-08 08:10:00',
    'Manutenção Preventiva - Câmara Fria', 
    '[MELHORIA] Limpeza da grade do ar condicionado adicionada ao plano anual.', 
    'Extrusão', true,
    '[
        {"action": "Verificação geral do equipamento", "checked": true},
        {"action": "Verificação de temperatura", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Limpeza da grade do ar condicionado (NOVO)", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.67}]'::jsonb
);

-- OS 0127 (PH-15)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours, materials_used
) VALUES (
    '0127', 'PH-15', 'Preventiva', 'Executado', '2026-01-07 16:00:00', '2026-01-07 16:00:00', '2026-01-07 16:40:00',
    'Manutenção Preventiva - Prensa Hidráulica', 
    '[AGUARDANDO APROVAÇÃO] Vazamento no pistão - Orçamento externo pendente. Falta sensor de parada (CIPA).', 
    'Moldagem', true,
    '[
        {"action": "Verificação nível de óleo (COMPLETADO 10L)", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Aperto de terminais", "checked": true},
        {"action": "Limpeza interna dos componentes", "checked": true},
        {"action": "Verificação do sistema hidráulico (VAZAMENTO NO PISTÃO)", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.67}]'::jsonb,
    '[{"partId": "OL-001", "quantity": 10}]'::jsonb
);

-- OS 0011 (ES-03)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0011', 'ES-03', 'Preventiva', 'Executado', '2026-01-09 13:15:00', '2026-01-09 13:15:00', '2026-01-09 13:40:00',
    'Manutenção Preventiva - Esmeril', 
    'Localização: Injeção.', 
    'Injeção', true,
    '[
        {"action": "Verificar estado dos rebolos", "checked": true},
        {"action": "Ajustar apoio de peça", "checked": true},
        {"action": "Verificar proteção visual", "checked": true},
        {"action": "Teste de isolamento elétrico", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.42}]'::jsonb
);

-- OS 0147 (PH-13)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0147', 'PH-13', 'Preventiva', 'Executado', '2026-01-09 12:10:00', '2026-01-09 12:10:00', '2026-01-09 12:50:00',
    'Manutenção Preventiva - Prensa Hidráulica', 
    '[AGUARDANDO APROVAÇÃO] Orçamento externo para: Vazamento tubulação pistão e substituição das buchas.', 
    'Moldagem', true,
    '[
        {"action": "Verificação do nível de óleo", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Aperto de terminais", "checked": true},
        {"action": "Limpeza interna dos componentes", "checked": true},
        {"action": "Verificação do sistema hidráulico", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.67}]'::jsonb
);

-- OS 0025 (MS-04)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0025', 'MS-04', 'Preventiva', 'Executado', '2026-01-09 15:00:00', '2026-01-09 15:00:00', '2026-01-09 15:20:00',
    'Manutenção Preventiva - Máquina de Solda', 
    'Itens de refrigeração e água não aplicáveis - removidos da execução.', 
    'Tubulação', true,
    '[
        {"action": "Verificar aspecto visual e estrutural", "checked": true},
        {"action": "Verificar instalação elétrica", "checked": true},
        {"action": "Verificar cabos de solda", "checked": true},
        {"action": "Verificar tocha de soldagem", "checked": true},
        {"action": "Limpeza interna", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.33}]'::jsonb
);

-- OS 0075 (FO-11)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0075', 'FO-11', 'Preventiva', 'Executado', '2026-01-08 10:00:00', '2026-01-08 10:00:00', '2026-01-08 10:30:00',
    'Manutenção Preventiva - Forno', 
    'Adicionados itens de verificação de gás e estrutura conforme plano atualizado.', 
    'Produção', true,
    '[
        {"action": "Reaperto dos contatos elétricos", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto das correias do motor", "checked": true},
        {"action": "Verificar tubulação de gás (NOVO)", "checked": true},
        {"action": "Verificar estrutura física (NOVO)", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.50}]'::jsonb
);

-- OS 0115 (FO-07)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0115', 'FO-07', 'Preventiva', 'Executado', '2026-01-08 15:40:00', '2026-01-08 15:40:00', '2026-01-08 16:10:00',
    'Manutenção Preventiva - Forno', 
    'Localização: Injeção/Revestimento. Verificado tubulação de gás e estrutura.', 
    'Injeção', true,
    '[
        {"action": "Reaperto dos contatos elétricos", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto das correias do motor", "checked": true},
        {"action": "Verificar tubulação de gás", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.50}]'::jsonb
);

-- OS 0179 (PH-07)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0179', 'PH-07', 'Preventiva', 'Executado', '2026-01-09 11:10:00', '2026-01-09 11:10:00', '2026-01-09 11:45:00',
    'Manutenção Preventiva - Prensa de Moldagem', 
    '', 
    'Moldagem', true,
    '[
        {"action": "Verificação do nível de óleo antes da partida", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Aperto de terminais", "checked": true},
        {"action": "Limpeza interna dos componentes", "checked": true},
        {"action": "Verificação do sistema hidráulico", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.58}]'::jsonb
);

-- OS 0183 (PH-08)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0183', 'PH-08', 'Preventiva', 'Executado', '2026-01-09 10:10:00', '2026-01-09 10:10:00', '2026-01-09 11:00:00',
    'Manutenção Preventiva - Prensa Hidráulica', 
    '', 
    'Moldagem', true,
    '[
        {"action": "Verificação do nível de óleo antes da partida", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Aperto de terminais", "checked": true},
        {"action": "Limpeza interna dos componentes", "checked": true},
        {"action": "Verificação do sistema hidráulico", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.83}]'::jsonb
);

-- OS 0067 (FO-10)
INSERT INTO public.work_orders (
    id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, 
    description, observations, requester, is_approved, checklist, man_hours
) VALUES (
    '0067', 'FO-10', 'Preventiva', 'Executado', '2026-01-08 08:15:00', '2026-01-08 08:15:00', '2026-01-08 08:50:00',
    'Manutenção Preventiva - Forno', 
    '[MELHORIA] Checklist atualizado no cadastro com os itens faltantes.', 
    'Extrusão', true,
    '[
        {"action": "Reaperto dos contatos elétricos", "checked": true},
        {"action": "Medição de corrente do motor (Motor 1)", "checked": true},
        {"action": "Reaperto das correias do motor", "checked": true},
        {"action": "Medição corrente motor 2 e 3 (NOVO)", "checked": true},
        {"action": "Verificação das correias (NOVO)", "checked": true}
    ]'::jsonb,
    '[{"maintainer": "Equipe Interna", "hours": 0.58}]'::jsonb
);

COMMIT;

SELECT 'Base atualizada: Planos corrigidos e 20 O.S. reais inseridas com sucesso.';
