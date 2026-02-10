
-- =============================================================================
-- ATUALIZAÇÃO DE REGRAS ESPECÍFICAS DE MANUTENÇÃO (REVISÃO DO USUÁRIO)
-- =============================================================================

BEGIN;

-- 1. LIMPEZA: REMOVER AGENDAMENTOS INDESEJADOS DE 2026
-- Removemos O.S. de ativos que são de terceiro (sem gestão interna), sob demanda ou corretiva pura.
DELETE FROM public.work_orders 
WHERE 
    EXTRACT(YEAR FROM scheduled_date) = 2026
    AND status = 'Programado'
    AND (
        equipment_id IN ('CH-01', 'LP-02', 'VR-01', 'TRID-01') -- Chiller e Maq. Específicas
        OR equipment_id LIKE 'BEB-%' -- Bebedouros
        OR equipment_id LIKE 'BA-%'  -- Balanças (já tratadas, mas garantindo limpeza de preventivas internas)
        -- Limpa também os equipamentos que vamos recriar agora para não duplicar
        OR equipment_id IN ('SC-01', 'SF-04', 'CS-01', 'CPR-01', 'TM-06', 'TM-07', 'TR-01')
    );

-- 2. CRIAÇÃO/ATUALIZAÇÃO DE PLANOS ESPECÍFICOS E GERAÇÃO DE O.S.

-- A) SERRA CIRCULAR (SC-01): Anual - Julho (Mês tranquilo) - Terceiro
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped)
VALUES (
    to_char(nextval('work_orders_id_seq'), 'FM0000'),
    'SC-01', 'Preventiva', 'Programado', '2026-07-15 08:00:00',
    '[ALERTA: TERCEIRO] Manutenção Anual Serra Circular',
    '[{"action": "CHAMAR TERCEIRO ESPECIALIZADO", "checked": false}]'::jsonb,
    'Manutenção', false
);

-- B) SERRA FITA (SF-04): Semestral - Abril e Outubro
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped)
VALUES 
(to_char(nextval('work_orders_id_seq'), 'FM0000'), 'SF-04', 'Preventiva', 'Programado', '2026-04-15 08:00:00', 'Preventiva Semestral Serra Fita', '[{"action": "Verificar tensão da fita", "checked": false}, {"action": "Verificar guias", "checked": false}]'::jsonb, 'Manutenção', false),
(to_char(nextval('work_orders_id_seq'), 'FM0000'), 'SF-04', 'Preventiva', 'Programado', '2026-10-15 08:00:00', 'Preventiva Semestral Serra Fita', '[{"action": "Verificar tensão da fita", "checked": false}, {"action": "Verificar guias", "checked": false}]'::jsonb, 'Manutenção', false);

-- C) CABINES ELÉTRICAS (CS-01, CPR-01): Anual - Agosto (Definido como padrão) - Alerta Terceiro
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped)
VALUES 
(to_char(nextval('work_orders_id_seq'), 'FM0000'), 'CS-01', 'Preventiva', 'Programado', '2026-08-10 08:00:00', '[ALERTA: TERCEIRO] Manutenção Cabine Secundária', '[{"action": "ACIONAR TERCEIRO ESPECIALIZADO", "checked": false}]'::jsonb, 'Engenharia', false),
(to_char(nextval('work_orders_id_seq'), 'FM0000'), 'CPR-01', 'Preventiva', 'Programado', '2026-08-10 08:00:00', '[ALERTA: TERCEIRO] Manutenção Cabine Primária', '[{"action": "ACIONAR TERCEIRO ESPECIALIZADO", "checked": false}]'::jsonb, 'Engenharia', false);

-- D) TORNOS MECÂNICOS
-- TM-06: Junho
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped)
VALUES (to_char(nextval('work_orders_id_seq'), 'FM0000'), 'TM-06', 'Preventiva', 'Programado', '2026-06-15 08:00:00', 'Preventiva Anual Torno Mecânico', '[{"action": "Ajuste de freio", "checked": false}, {"action": "Troca de óleo", "checked": false}]'::jsonb, 'Manutenção', false);

-- TM-07: Abril
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped)
VALUES (to_char(nextval('work_orders_id_seq'), 'FM0000'), 'TM-07', 'Preventiva', 'Programado', '2026-04-15 08:00:00', 'Preventiva Anual Torno Mecânico', '[{"action": "Ajuste de freio", "checked": false}, {"action": "Troca de óleo", "checked": false}]'::jsonb, 'Manutenção', false);

-- E) TORNO REVOLVER (TR-01): Terceiro - Maio (Definido como padrão)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped)
VALUES (to_char(nextval('work_orders_id_seq'), 'FM0000'), 'TR-01', 'Preventiva', 'Programado', '2026-05-15 08:00:00', '[ALERTA: TERCEIRO] Manutenção Torno Revolver', '[{"action": "ACIONAR TERCEIRO", "checked": false}]'::jsonb, 'Manutenção', false);


-- 3. QUADROS ELÉTRICOS (PREDITIVA TERMOGRAFIA - NOVEMBRO)
-- Removemos preventivas antigas desses quadros e inserimos a Preditiva
DELETE FROM public.work_orders 
WHERE EXTRACT(YEAR FROM scheduled_date) = 2026 
  AND (equipment_id LIKE 'QDF-%' OR equipment_id LIKE 'QI-%' OR equipment_id LIKE 'QGC-%' OR equipment_id LIKE 'QE-%' OR equipment_id LIKE 'QGBT-%' OR equipment_id LIKE 'QOF-%');

DO $$
DECLARE
    quadro_rec RECORD;
    next_os INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os FROM public.work_orders;

    FOR quadro_rec IN 
        SELECT id FROM public.equipments 
        WHERE id LIKE 'QDF-%' OR id LIKE 'QI-%' OR id LIKE 'QGC-%' OR id LIKE 'QE-%' OR id LIKE 'QGBT-%' OR id LIKE 'QOF-%'
    LOOP
        INSERT INTO public.work_orders (
            id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped
        ) VALUES (
            to_char(next_os, 'FM0000'),
            quadro_rec.id,
            'Preditiva',
            'Programado',
            '2026-11-20 09:00:00',
            'Termografia de Quadros Elétricos (Terceiro)',
            '[{"action": "Acompanhar medição termográfica", "checked": false}, {"action": "Receber laudo técnico", "checked": false}]'::jsonb,
            'Segurança/Manutenção',
            false
        );
        next_os := next_os + 1;
    END LOOP;
    
    -- Atualiza a sequence para o próximo valor correto
    PERFORM setval('work_orders_id_seq', next_os);
END $$;

COMMIT;

SELECT 'Cronograma atualizado! Chiller/Bebedouros limpos. Serras, Cabines e Quadros agendados conforme regras.';
