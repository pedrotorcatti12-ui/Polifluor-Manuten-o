
-- =============================================================================
-- CORREÇÃO DEFINITIVA DO CRONOGRAMA PREDITIVO (SAMPRED - ANUAL)
-- Objetivo: Remover agendamentos trimestrais errados e criar agenda única em Novembro.
-- =============================================================================

BEGIN;

-- 1. LIMPEZA DOS AGENDAMENTOS ERRADOS (TRIMESTRAIS)
-- Remove todas as preditivas de 2026 para recriar do zero com a regra correta.
DELETE FROM public.work_orders 
WHERE type = 'Preditiva'
  AND status = 'Programado'
  AND EXTRACT(YEAR FROM scheduled_date) = 2026;

-- 2. GERAÇÃO DA AGENDA ANUAL (NOVEMBRO - SAMPRED)
DO $$
DECLARE
    eq_record RECORD;
    next_os_number INT;
    target_date TIMESTAMP;
    -- Checklist específico para o serviço da SAMPRED
    checklist_json JSONB := '[
        {"action": "Coleta de dados de Vibração", "checked": false},
        {"action": "Termografia de Painéis/Motores", "checked": false},
        {"action": "Envio de Relatório Técnico (SAMPRED)", "checked": false}
    ]'::jsonb;
BEGIN
    -- Obter próximo número de O.S.
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os_number FROM public.work_orders;

    -- Define data única: 20 de Novembro de 2026
    target_date := make_timestamp(2026, 11, 20, 08, 00, 00);

    -- Loop: Apenas Ativos Industriais Ativos
    FOR eq_record IN 
        SELECT id, name FROM public.equipments 
        WHERE category = 'Industrial'::public.asset_category 
        AND status = 'Ativo' 
    LOOP
        
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
            'Análise Preditiva Anual (Vibração/Termografia) - SAMPRED',
            checklist_json,
            'SAMPRED', -- Define explicitamente o terceiro
            false,
            NULL
        );

        next_os_number := next_os_number + 1;

    END LOOP;
END $$;

COMMIT;

-- 3. VALIDAÇÃO IMEDIATA
-- Exibe a contagem por mês para garantir que só existe Novembro.
SELECT 
    TO_CHAR(scheduled_date, 'Month') as "Mês de Agendamento",
    COUNT(*) as "Qtd. Máquinas (Preditiva)",
    'Deve ser apenas Novembro' as "Validação"
FROM public.work_orders
WHERE type = 'Preditiva' AND EXTRACT(YEAR FROM scheduled_date) = 2026
GROUP BY EXTRACT(MONTH FROM scheduled_date), TO_CHAR(scheduled_date, 'Month');
