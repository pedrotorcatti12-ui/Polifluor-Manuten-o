
-- =============================================================================
-- SCRIPT DE RESGATE: HISTÓRICO DE JANEIRO 2026
-- Recria as manutenções de Janeiro baseadas na sua lista e já dá baixa nelas.
-- =============================================================================

BEGIN;

DO $$
DECLARE
    next_id INT;
    -- Lista de máquinas que tinham manutenção em JANEIRO conforme sua tabela
    jan_machines TEXT[] := ARRAY[
        'AEX-02', 'CF-01', 'EX-02', 'EX-04', 'FO-07', 'FO-10', 'FO-11', 
        'GE-01', 'MS-02', 'MS-03', 'MS-04', 'PH-07', 'PH-08', 'PH-09', 
        'PH-13', 'PH-15', 'TD-02', 'ES-01', 'ES-03', 'ES-04'
    ];
    machine_id TEXT;
    plan_data RECORD;
BEGIN
    -- Pega o próximo ID
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_id FROM public.work_orders;

    FOREACH machine_id IN ARRAY jan_machines LOOP
        
        -- Tenta pegar o plano e checklist vinculado a essa máquina
        SELECT id, description, tasks INTO plan_data 
        FROM public.maintenance_plans 
        WHERE target_equipment_ids @> ARRAY[machine_id] 
        LIMIT 1;

        -- Se não achar plano, usa genérico
        IF plan_data.id IS NULL THEN
            plan_data.description := 'Manutenção Preventiva Janeiro (Recuperada)';
            plan_data.tasks := '[]'::jsonb;
        END IF;

        INSERT INTO public.work_orders (
            id,
            equipment_id,
            type,
            status,
            scheduled_date,
            end_date, -- Data de finalização
            description,
            checklist,
            requester,
            is_prepared,
            is_approved,
            observations
        ) VALUES (
            to_char(next_id, 'FM0000'),
            machine_id,
            'Preventiva',
            'Executado', -- Já nasce executada
            '2026-01-15 08:00:00', -- Data programada retroativa
            '2026-01-15 10:00:00', -- Data de execução retroativa
            plan_data.description,
            plan_data.tasks,
            'Sistema (Histórico)',
            true,
            true,
            'Registro recuperado automaticamente via script de Sinterização.'
        );

        next_id := next_id + 1;
    END LOOP;
END $$;

COMMIT;

SELECT 'Histórico de Janeiro restaurado! 20 Ordens de Serviço criadas como Executadas.';
