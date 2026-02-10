
-- =============================================================================
-- SCRIPT: REGRA AUTOMOTIVA EXTERNA & RESGATE DE ITENS "S/N"
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. REGRA: AUTOMOTIVOS = MANUTENÇÃO EXTERNA (JULHO)
-- -----------------------------------------------------------------------------

-- Lista de ativos automotivos
-- Inclui: Extrusoras de PA (AEX), Laser (ML), Curvadora (CV), Conformadora (EF), etc.
-- Removemos preventivas internas atuais desses itens para 2026
DELETE FROM public.work_orders 
WHERE 
    status = 'Programado'
    AND EXTRACT(YEAR FROM scheduled_date) = 2026
    AND equipment_id IN (
        SELECT id FROM public.equipments 
        WHERE location LIKE '%AUTOMOTIVO%' 
        OR id IN ('AEX-01', 'AEX-02', 'AF-01', 'CV-01', 'EF-01', 'ML-01', 'ML-02', 'RM-01', 'SI-01', 'GUI-01', 'SC-01', 'ET-01', 'CH-01')
    );

-- Criar Plano de Alerta Externo (Anual - Julho)
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
        {"action": "Validar calibração se aplicável", "checked": false},
        {"action": "Arquivar relatório técnico", "checked": false}
    ]'::jsonb,
    ARRAY(SELECT id FROM public.equipments WHERE 
        (location LIKE '%AUTOMOTIVO%' OR id IN ('AEX-01', 'AEX-02', 'AF-01', 'CV-01', 'EF-01', 'ML-01', 'ML-02', 'RM-01', 'SI-01', 'GUI-01', 'SC-01', 'ET-01', 'CH-01'))
        AND status = 'Ativo'
        AND category = 'Industrial'
    )
)
ON CONFLICT (id) DO UPDATE SET
    target_equipment_ids = EXCLUDED.target_equipment_ids;

-- Gerar as O.S. de Alerta para Julho 2026
DO $$
DECLARE
    target_id TEXT;
    plan_data RECORD;
    next_os INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os FROM public.work_orders;
    SELECT * INTO plan_data FROM public.maintenance_plans WHERE id = 'PLAN-AUTO-EXTERNO';

    IF plan_data.target_equipment_ids IS NOT NULL THEN
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
    END IF;
END $$;


-- -----------------------------------------------------------------------------
-- 2. REGRA: ITENS "SEM NÚMERO" E AUXILIARES (TORNOS S/N, FURADEIRAS)
-- Criamos um plano simples para que não fiquem "invisíveis" no sistema.
-- -----------------------------------------------------------------------------

INSERT INTO public.maintenance_plans (
    id, description, frequency, start_month, maintenance_type, tasks, target_equipment_ids
) VALUES (
    'PLAN-AUXILIARES-DEZ',
    'Inspeção Anual de Ativos Auxiliares/Genéricos',
    12,
    'Dezembro', -- Mês mais tranquilo
    'Preventiva',
    '[
        {"action": "Limpeza geral do equipamento", "checked": false},
        {"action": "Verificação de cabos elétricos", "checked": false},
        {"action": "Lubrificação de partes móveis", "checked": false},
        {"action": "Teste de funcionamento e segurança", "checked": false}
    ]'::jsonb,
    -- Lista dos itens que identificamos como "Sem Plano"
    '{TO-SEM,SF-SEM,ES-SEM,FU-01,FU-02,FU-03,LX-01,LX-02,EXT-01}'
)
ON CONFLICT (id) DO UPDATE SET target_equipment_ids = EXCLUDED.target_equipment_ids;

-- Gerar as O.S. para esses auxiliares em Dezembro/2026
DO $$
DECLARE
    target_id TEXT;
    plan_data RECORD;
    next_os INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os FROM public.work_orders;
    SELECT * INTO plan_data FROM public.maintenance_plans WHERE id = 'PLAN-AUXILIARES-DEZ';

    FOREACH target_id IN ARRAY plan_data.target_equipment_ids LOOP
        -- Remove duplicidade se já houver O.S. para esse cara em Dezembro
        DELETE FROM public.work_orders WHERE equipment_id = target_id AND EXTRACT(YEAR FROM scheduled_date) = 2026;

        INSERT INTO public.work_orders (
            id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id, machine_stopped
        ) VALUES (
            to_char(next_os, 'FM0000'),
            target_id,
            'Preventiva',
            'Programado',
            '2026-12-15 08:00:00',
            'Manutenção Básica: ' || plan_data.description,
            plan_data.tasks,
            'Manutenção',
            'PLAN-AUXILIARES-DEZ',
            false
        );
        next_os := next_os + 1;
    END LOOP;
    
    PERFORM setval('work_orders_id_seq', next_os);
END $$;

COMMIT;

SELECT 'Regras aplicadas: Automotivos externos em Julho. Tornos S/N e Furadeiras com plano básico em Dezembro.';
