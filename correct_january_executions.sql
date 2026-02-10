-- =============================================================================
-- SCRIPT DE INSERÇÃO DE HISTÓRICO REAL - JANEIRO 2026
-- =============================================================================

BEGIN;

-- 1. LIMPEZA PRÉVIA: Remove O.S. existentes com os mesmos IDs para evitar conflitos de chave primária.
DELETE FROM public.work_orders 
WHERE id IN (
    '0187', '0055', '0009', '0007', '0230', '0250', '0019', '0013', '0043', '0303', 
    '0006', '0127', '0011', '0147', '0025', '0075', '0179', '0183', '0067', '0115'
);

-- 2. INSERÇÃO DOS DADOS REAIS

-- OS 0187 (PH-09)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, checklist, man_hours)
VALUES ('0187', 'PH-09', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 08:30:00', '2026-01-09 09:10:00', 'Manutenção Preventiva PH-09', 'Executado.', 'Darci', true, '[{"action": "Nível de óleo", "checked": true}, {"action": "Corrente do motor", "checked": true}, {"action": "Reaperto elétrico", "checked": true}, {"action": "Terminais", "checked": true}, {"action": "Limpeza interna", "checked": true}, {"action": "Sistema hidráulico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb);

-- OS 0055 (EX-04)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0055', 'EX-04', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 14:00:00', '2026-01-08 14:35:00', 'Manutenção Preventiva EX-04', 'Darci', true, '[{"action": "Reaperto elétrico", "checked": true}, {"action": "Nível de óleo", "checked": true}, {"action": "Corrente do motor", "checked": true}, {"action": "Vazamentos", "checked": true}, {"action": "Limpeza de painel", "checked": true}, {"action": "Cilindro hidráulico", "checked": true}, {"action": "Resistência", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.58}]'::jsonb);

-- OS 0009 (ES-04)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0009', 'ES-04', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 15:00:00', '2026-01-08 15:20:00', 'Manutenção Preventiva Esmeril', 'Darci', true, '[{"action": "Estado dos rebolos", "checked": true}, {"action": "Apoio de peça", "checked": true}, {"action": "Proteção visual", "checked": true}, {"action": "Isolamento elétrico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.33}]'::jsonb);

-- OS 0007 (ES-01)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0007', 'ES-01', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 11:00:00', '2026-01-08 11:15:00', 'Manutenção Preventiva Esmeril', 'Darci', true, '[{"action": "Rebolos", "checked": true}, {"action": "Apoio de peça", "checked": true}, {"action": "Proteção visual", "checked": true}, {"action": "Isolamento elétrico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.25}]'::jsonb);

-- OS 0230 (TD-02)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, checklist, man_hours)
VALUES ('0230', 'TD-02', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 09:00:00', '2026-01-08 09:40:00', 'Manutenção Preventiva Trançadeira', 'Não foi necessário substituição de componentes.', 'Darci', true, '[{"action": "Presilha", "checked": true}, {"action": "Roldana", "checked": true}, {"action": "Corrente", "checked": true}, {"action": "Painel", "checked": true}, {"action": "Redutor", "checked": true}, {"action": "Botoeiras", "checked": true}, {"action": "Motor", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb);

-- OS 0250 (TD-04)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, man_hours)
VALUES ('0250', 'TD-04', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 14:00:00', '2026-01-09 14:35:00', 'Manutenção Preventiva Trançadeira', 'Equipamento está passando por corretiva.', 'Darci', true, '[{"maintainer": "Darci", "hours": 0.58}]'::jsonb);

-- OS 0019 (MS-03)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, checklist, man_hours, purchase_requests)
VALUES ('0019', 'MS-03', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 16:30:00', '2026-01-08 17:00:00', 'Manutenção Preventiva Máquina de Solda SUMIG', '#Solicitado comprar tocha Sumig.', 'Darci', true, '[{"action": "Aspecto visual e estrutural", "checked": true}, {"action": "Instalação elétrica", "checked": true}, {"action": "Cabos de solda", "checked": true}, {"action": "Tocha de soldagem", "checked": true}, {"action": "Limpeza interna", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.5}]'::jsonb, '[{"id": "REQ-0019-1", "itemDescription": "Tocha de Solda SUMIG", "quantity": 1, "requester": "Darci", "status": "Pendente", "requisitionDate": "2026-01-08T17:00:00Z"}]'::jsonb);

-- OS 0013 (MS-02)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0013', 'MS-02', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 07:30:00', '2026-01-09 08:10:00', 'Manutenção Preventiva Máquina de Solda', 'Darci', true, '[{"action": "Aspecto visual", "checked": true}, {"action": "Instalação elétrica", "checked": true}, {"action": "Refrigeração", "checked": true}, {"action": "Motor e Bomba", "checked": true}, {"action": "Cabos de solda", "checked": true}, {"action": "Tocha", "checked": true}, {"action": "Mangueira de água", "checked": true}, {"action": "Limpeza interna", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb);

-- OS 0043 (EX-02)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, checklist, man_hours)
VALUES ('0043', 'EX-02', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 13:00:00', '2026-01-08 13:45:00', 'Manutenção Preventiva Extrusora', 'Está com vazamento no sistema hidráulico, cotação feita fornecedor externo - apresentado ao gestor VICARI.', 'Darci', true, '[{"action": "Reaperto contatos", "checked": true}, {"action": "Verificação óleo", "checked": true}, {"action": "Medição corrente", "checked": true}, {"action": "Verificar vazamentos", "checked": true}, {"action": "Limpeza painel", "checked": true}, {"action": "Verificar cilindro", "checked": true}, {"action": "Verificar resistência", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.75}]'::jsonb);

-- OS 0303 (AEX-02)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0303', 'AEX-02', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 11:30:00', '2026-01-08 12:30:00', 'Manutenção Preventiva Extrusora de PA', 'Darci', true, '[{"action": "Vazamentos", "checked": true}, {"action": "Óleo", "checked": true}, {"action": "Reaperto elétrico", "checked": true}, {"action": "Corrente", "checked": true}, {"action": "Resistências aquecimento", "checked": true}, {"action": "Estrutura física", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 1.0}]'::jsonb);

-- OS 0006 (CF-01)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0006', 'CF-01', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 07:30:00', '2026-01-08 08:10:00', 'Manutenção Preventiva Câmara Fria', 'Darci', true, '[{"action": "Verificação geral", "checked": true}, {"action": "Temperatura", "checked": true}, {"action": "Medição de corrente", "checked": true}, {"action": "Limpeza grade ar", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb);

-- OS 0127 (PH-15)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, checklist, man_hours, materials_used)
VALUES ('0127', 'PH-15', 'Preventiva', 'Executado', '2026-01-07', '2026-01-07 16:00:00', '2026-01-07 16:40:00', 'Manutenção Preventiva Prensa Hidráulica', 'Falta instalação do sensor limite de parada do pistão. Ação RECOMENDADA PELA CIPA - Resp. Laercio. Vazamento no pistão aguardando aprovação do orçamento externo.', 'Darci', true, '[{"action": "Nível de óleo", "checked": true}, {"action": "Corrente", "checked": true}, {"action": "Reaperto elétrico", "checked": true}, {"action": "Terminais", "checked": true}, {"action": "Limpeza", "checked": true}, {"action": "Sistema hidráulico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb, '[{"partId": "OL-001", "quantity": 10}]'::jsonb);

-- OS 0011 (ES-03)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0011', 'ES-03', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 13:15:00', '2026-01-09 13:40:00', 'Manutenção Preventiva Esmeril', 'Darci', true, '[{"action": "Estado dos rebolos", "checked": true}, {"action": "Apoio de peça", "checked": true}, {"action": "Proteção visual (metálica)", "checked": true}, {"action": "Isolamento elétrico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.42}]'::jsonb);

-- OS 0147 (PH-13)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, checklist, man_hours)
VALUES ('0147', 'PH-13', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 12:10:00', '2026-01-09 12:50:00', 'Manutenção Preventiva Prensa Hidráulica', 'Executado orçamento externo aguardando aprovação diretoria. Tubulação pistão. Substituição das buchas colunas hidráulicas.', 'Darci', true, '[{"action": "Nível de óleo", "checked": true}, {"action": "Corrente", "checked": true}, {"action": "Reaperto elétrico", "checked": true}, {"action": "Terminais", "checked": true}, {"action": "Limpeza", "checked": true}, {"action": "Sistema hidráulico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb);

-- OS 0025 (MS-04)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0025', 'MS-04', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 15:00:00', '2026-01-09 15:40:00', 'Manutenção Preventiva Máquina de Solda', 'Darci', true, '[{"action": "Aspecto visual", "checked": true}, {"action": "Instalação elétrica", "checked": true}, {"action": "Cabos de solda", "checked": true}, {"action": "Tocha", "checked": true}, {"action": "Limpeza interna", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb);

-- OS 0075 (FO-11)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, observations, requester, is_approved, checklist, man_hours)
VALUES ('0075', 'FO-11', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 10:00:00', '2026-01-08 10:30:00', 'Manutenção Preventiva Forno', 'Verificar lubrificação rolamento, notificar tubulação de gás, verificar estrutura física do equipamento.', 'Darci', true, '[{"action": "Reaperto elétrico", "checked": true}, {"action": "Corrente do motor", "checked": true}, {"action": "Reaperto de correias", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.5}]'::jsonb);

-- OS 0179 (PH-07)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0179', 'PH-07', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 11:10:00', '2026-01-09 11:45:00', 'Manutenção Preventiva Prensa de Moldagem', 'Darci', true, '[{"action": "Nível de óleo", "checked": true}, {"action": "Corrente", "checked": true}, {"action": "Reaperto elétrico", "checked": true}, {"action": "Terminais", "checked": true}, {"action": "Limpeza", "checked": true}, {"action": "Sistema hidráulico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.58}]'::jsonb);

-- OS 0183 (PH-08)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0183', 'PH-08', 'Preventiva', 'Executado', '2026-01-09', '2026-01-09 10:10:00', '2026-01-09 11:00:00', 'Manutenção Preventiva Prensa Hidráulica', 'Darci', true, '[{"action": "Nível de óleo", "checked": true}, {"action": "Corrente", "checked": true}, {"action": "Reaperto elétrico", "checked": true}, {"action": "Terminais", "checked": true}, {"action": "Limpeza", "checked": true}, {"action": "Sistema hidráulico", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.83}]'::jsonb);

-- OS 0067 (FO-10)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0067', 'FO-10', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 08:15:00', '2026-01-08 08:50:00', 'Manutenção Preventiva Forno Elétrico', 'Darci', true, '[{"action": "Reaperto elétrico", "checked": true}, {"action": "Verificar correias", "checked": true}, {"action": "Medição corrente motor 1,2,3", "checked": true}, {"action": "Lubrificação rolamento", "checked": true}, {"action": "Verificar tubulação gás", "checked": true}, {"action": "Verificar estrutura física", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.58}]'::jsonb);

-- OS 0115 (FO-07)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, start_date_execution, end_date, description, requester, is_approved, checklist, man_hours)
VALUES ('0115', 'FO-07', 'Preventiva', 'Executado', '2026-01-08', '2026-01-08 15:40:00', '2026-01-08 16:10:00', 'Manutenção Preventiva Forno', 'Darci', true, '[{"action": "Reaperto contatos", "checked": true}, {"action": "Medição corrente", "checked": true}, {"action": "Reaperto correias", "checked": true}, {"action": "Verificar tubulação gás", "checked": true}, {"action": "Verificar estrutura", "checked": true}]'::jsonb, '[{"maintainer": "Darci", "hours": 0.5}]'::jsonb);


COMMIT;

SELECT 'Dados históricos de Janeiro de 2026 inseridos com sucesso!';
