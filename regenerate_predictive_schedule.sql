
-- =============================================================================
-- REGENERAÇÃO DO CRONOGRAMA PREDITIVO 2026 (CORREÇÃO)
-- Objetivo: Restaurar as O.S. Preditivas para todo o parque industrial.
-- =============================================================================

BEGIN;

-- 1. LIMPEZA DE SEGURANÇA
-- Remove apenas Preditivas programadas de 2026 para evitar duplicidade ao rodar este script.
DELETE FROM public.work_orders 
WHERE type = 'Preditiva'
  AND status = 'Programado'
  AND EXTRACT(YEAR FROM scheduled_date) = 2026;

-- 2. GERAÇÃO EM MASSA (Industrial - Trimestral)
DO $$
DECLARE
    eq_record RECORD;
    month_val INT;
    next_os_number INT;
    -- Agenda: Fev, Mai, Ago, Nov (Descasado das Preventivas de Jan)
    months INT[] := ARRAY[2, 5, 8, 11]; 
    target_date TIMESTAMP;
    checklist_json JSONB := '[
        {"action": "Análise de Vibração (Mancais/Rolamentos)", "checked": false},
        {"action": "Termografia (Painéis Elétricos/Motores)", "checked": false},
        {"action": "Medição de Ruído Anormal", "checked": false},
        {"action": "Coleta de Óleo (se sistema hidráulico)", "checked": false}
    ]'::jsonb;
BEGIN
    -- Obter próximo número de O.S.
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os_number FROM public.work_orders;

    -- Seleciona TODOS os ativos industriais ativos (Exclui Predial/Utilitário)
    FOR eq_record IN 
        SELECT id FROM public.equipments 
        WHERE category = 'Industrial'::public.asset_category 
        AND status = 'Ativo' 
    LOOP
        
        FOREACH month_val IN ARRAY months LOOP
            -- Define data: Dia 20, às 09:00
            target_date := make_timestamp(2026, month_val, 20, 9, 0, 0);

            INSERT INTO public.work_orders (
                id, 
                equipment_id, 
                type, 
                status, 
                scheduled_date, 
                description, 
                checklist, 
                requester, 
                machine_stopped,
                plan_id
            ) VALUES (
                to_char(next_os_number, 'FM0000'),
                eq_record.id,
                'Preditiva',
                'Programado',
                target_date,
                'Monitoramento de Condição (Vibração/Termografia)',
                checklist_json,
                'Engenharia de Confiabilidade',
                false,
                NULL -- Sem plano específico vinculado, é uma rotina geral
            );

            next_os_number := next_os_number + 1;
        END LOOP;

    END LOOP;
END $$;

COMMIT;

SELECT 'Cronograma Preditivo 2026 restaurado com sucesso para todo o parque industrial!';
