
-- =============================================================================
-- REGRA DE NEGÓCIO: SETOR AUTOMOTIVO = MANUTENÇÃO EXTERNA
-- =============================================================================

BEGIN;

-- 1. LIMPEZA: Remove preventivas internas atuais de máquinas automotivas para 2026
-- Lista baseada na localização 'AUTOMOTIVO' e prefixos conhecidos
DELETE FROM public.work_orders 
WHERE 
    status = 'Programado'
    AND EXTRACT(YEAR FROM scheduled_date) = 2026
    AND equipment_id IN (
        SELECT id FROM public.equipments 
        WHERE location LIKE '%AUTOMOTIVO%' 
        OR id IN ('AEX-01', 'AEX-02', 'AF-01', 'CV-01', 'EF-01', 'ML-01', 'ML-02', 'RM-01', 'SI-01', 'GUI-01', 'SC-01', 'ET-01')
    );

-- 2. CRIAR PLANO DE ALERTA EXTERNO (ANUAL - JULHO)
INSERT INTO public.maintenance_plans (
    id, description, frequency, start_month, maintenance_type, tasks, target_equipment_ids
) VALUES (
    'PLAN-AUTO-EXTERNO',
    'Manutenção Especializada Automotiva (Terceiro)',
    12, -- Anual
    'Julho',
    'Preventiva',
    '[
        {"action": "AGENDAR TÉCNICO DO FABRICANTE/ESPECIALISTA", "checked": false},
        {"action": "Acompanhar serviço externo", "checked": false},
        {"action": "Arquivar relatório técnico", "checked": false}
    ]'::jsonb,
    ARRAY(SELECT id FROM public.equipments WHERE 
        (location LIKE '%AUTOMOTIVO%' OR id IN ('AEX-01', 'AEX-02', 'AF-01', 'CV-01', 'EF-01', 'ML-01', 'ML-02', 'RM-01', 'SI-01', 'GUI-01', 'SC-01', 'ET-01'))
        AND status = 'Ativo'
        AND category = 'Industrial' -- Não pega bebedouros
    )
)
ON CONFLICT (id) DO UPDATE SET
    target_equipment_ids = EXCLUDED.target_equipment_ids;

-- 3. GERAR AS O.S. DE ALERTA PARA JULHO 2026
DO $$
DECLARE
    target_id TEXT;
    plan_data RECORD;
    next_os INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os FROM public.work_orders;
    SELECT * INTO plan_data FROM public.maintenance_plans WHERE id = 'PLAN-AUTO-EXTERNO';

    FOREACH target_id IN ARRAY plan_data.target_equipment_ids LOOP
        INSERT INTO public.work_orders (
            id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id, machine_stopped
        ) VALUES (
            to_char(next_os, 'FM0000'),
            target_id,
            'Preventiva',
            'Programado',
            '2026-07-15 08:00:00', -- Data fixa em Julho
            '[ALERTA: TERCEIRO] ' || plan_data.description,
            plan_data.tasks,
            'Engenharia Automotiva',
            'PLAN-AUTO-EXTERNO',
            false
        );
        next_os := next_os + 1;
    END LOOP;
    
    PERFORM setval('work_orders_id_seq', next_os);
END $$;

COMMIT;

SELECT 'Automotivos configurados para manutenção externa em Julho/2026.';
