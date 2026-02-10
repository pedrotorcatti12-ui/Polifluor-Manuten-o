
-- =============================================================================
-- SCRIPT DE APLICAÇÃO DE REGRAS DE NEGÓCIO (ELÉTRICA & PREDIAL)
-- Objetivo: Limpar cronograma de itens não essenciais e configurar terceiros.
-- =============================================================================

BEGIN;

-- 1. REGRA: PREDIAIS E UTENSÍLIOS NÃO TÊM PREVENTIVA INTERNA
-- Removemos agendamentos futuros de itens Prediais, EXCETO se forem críticos de segurança/qualidade.
-- Mantemos: Balanças (BA), Cavalete (CL), Torre (TRA), Chiller (CH) e Gerador (GE) pois são Utilitários Críticos.
DELETE FROM public.work_orders 
WHERE 
    status = 'Programado'
    AND scheduled_date >= NOW()
    AND equipment_id IN (
        SELECT id FROM public.equipments 
        WHERE category = 'Predial/Utilitário' 
        AND id NOT LIKE 'BA-%'  -- Mantém Balanças (Calibração)
        AND id NOT LIKE 'CL-%'  -- Mantém Cavalete (Segurança)
        AND id NOT LIKE 'TRA-%' -- Mantém Torre (Processo)
        AND id NOT LIKE 'CH-%'  -- Mantém Chiller (Processo)
        AND id NOT LIKE 'GE-%'  -- Mantém Gerador (Processo)
        AND id NOT LIKE 'QDF-%' -- Quadros (Serão tratados abaixo)
        AND id NOT LIKE 'QI-%'
        AND id NOT LIKE 'CS-%'
        AND id NOT LIKE 'CPR-%'
    );

-- 2. REGRA: ELÉTRICA (QUADROS E CABINES) = MANUTENÇÃO EXTERNA
-- Removemos preventivas internas antigas desses itens para recriar como TERCEIRO.
DELETE FROM public.work_orders 
WHERE 
    EXTRACT(YEAR FROM scheduled_date) = 2026
    AND (
        equipment_id LIKE 'QDF-%' OR 
        equipment_id LIKE 'QI-%' OR 
        equipment_id LIKE 'QGC-%' OR 
        equipment_id LIKE 'QE-%' OR 
        equipment_id LIKE 'CS-%' OR 
        equipment_id LIKE 'CPR-%'
    );

-- Criar/Atualizar Plano de Preditiva Elétrica (Terceiro)
INSERT INTO public.maintenance_plans (
    id, description, frequency, start_month, maintenance_type, tasks, target_equipment_ids
) VALUES (
    'PLAN-ELETRICA-EXTERNA',
    'Preditiva Elétrica Anual (Termografia) - TERCEIRO',
    12, -- Anual
    'Novembro',
    'Preditiva',
    '[
        {"action": "ACOMPANHAR TÉCNICO TERCEIRIZADO", "checked": false},
        {"action": "Termografia de Quadros e Cabines", "checked": false},
        {"action": "Reaperto de barramentos (se necessário)", "checked": false},
        {"action": "Recebimento de Laudo Técnico", "checked": false}
    ]'::jsonb,
    ARRAY(SELECT id FROM public.equipments WHERE 
        (id LIKE 'QDF-%' OR id LIKE 'QI-%' OR id LIKE 'QGC-%' OR id LIKE 'QE-%' OR id LIKE 'CS-%' OR id LIKE 'CPR-%')
        AND status = 'Ativo'
    )
)
ON CONFLICT (id) DO UPDATE SET
    target_equipment_ids = EXCLUDED.target_equipment_ids,
    tasks = EXCLUDED.tasks;

-- Gerar as O.S. para Novembro de 2026
DO $$
DECLARE
    target_id TEXT;
    plan_data RECORD;
    next_os INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os FROM public.work_orders;
    SELECT * INTO plan_data FROM public.maintenance_plans WHERE id = 'PLAN-ELETRICA-EXTERNA';

    FOREACH target_id IN ARRAY plan_data.target_equipment_ids LOOP
        INSERT INTO public.work_orders (
            id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id, machine_stopped
        ) VALUES (
            to_char(next_os, 'FM0000'),
            target_id,
            'Preditiva',
            'Programado',
            '2026-11-20 09:00:00', -- Data fixa em Novembro
            plan_data.description,
            plan_data.tasks,
            'Engenharia / Segurança',
            'PLAN-ELETRICA-EXTERNA',
            false
        );
        next_os := next_os + 1;
    END LOOP;
    
    PERFORM setval('work_orders_id_seq', next_os);
END $$;

COMMIT;

SELECT 'Regras aplicadas: Prediais limpos e Elétrica configurada para Terceiro em Novembro.';
