
-- =============================================================================
-- MIGRAÇÃO PASSO 2: EVOLUÇÃO PARA TIPO 'DATE' (FIM DOS PROBLEMAS DE FUSO)
-- =============================================================================

BEGIN;

-- 1. Remoção de dependências (Views que usam a coluna scheduled_date)
DROP VIEW IF EXISTS public.vw_schedule_data_2026;
DROP VIEW IF EXISTS public.vw_prioritized_work_orders;

-- 2. Conversão da Coluna (Timestamp -> Date)
-- O PostgreSQL trunca a hora, mantendo apenas a data.
ALTER TABLE public.work_orders 
ALTER COLUMN scheduled_date TYPE DATE USING scheduled_date::DATE;

-- 3. Recriação das Views (Atualizadas)
CREATE OR REPLACE VIEW public.vw_schedule_data_2026 AS
SELECT
    wo.id, wo.equipment_id, wo.type, wo.status, wo.scheduled_date, wo.description,
    eq.name as equipment_name, eq.is_critical as equipment_is_critical
FROM public.work_orders wo
JOIN public.equipments eq ON wo.equipment_id = eq.id
WHERE EXTRACT(YEAR FROM wo.scheduled_date) = 2026;

CREATE OR REPLACE VIEW public.vw_prioritized_work_orders AS
SELECT 
    wo.*, eq.name as equipment_name, eq.is_critical as equipment_is_critical
FROM public.work_orders wo
LEFT JOIN public.equipments eq ON wo.equipment_id = eq.id
ORDER BY
    CASE WHEN wo.status = 'Atrasado'::public.maintenance_status THEN 1 ELSE 2 END,
    CASE WHEN eq.is_critical = true THEN 1 ELSE 2 END,
    wo.scheduled_date ASC;

-- 4. Atualização da Função Geradora (Usar make_date ao invés de make_timestamp)
CREATE OR REPLACE FUNCTION generate_preventive_orders_for_2026()
RETURNS text AS $$
DECLARE
    plan_record RECORD;
    equipment_id_iter TEXT;
    month_index INT;
    start_month_index INT;
    schedule_date DATE; -- Agora é DATE puro
    month_map TEXT[] := ARRAY['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
BEGIN
    -- Limpa preventivas futuras de 2026
    DELETE FROM public.work_orders 
    WHERE type = 'Preventiva' 
      AND EXTRACT(YEAR FROM scheduled_date) = 2026
      AND status = 'Programado';

    -- Itera sobre os planos
    FOR plan_record IN SELECT * FROM public.maintenance_plans WHERE deleted_at IS NULL LOOP
        SELECT array_position(month_map, plan_record.start_month) - 1 INTO start_month_index;
        IF start_month_index IS NULL THEN CONTINUE; END IF;

        FOR month_index IN start_month_index..11 BY plan_record.frequency LOOP
            -- NOVA LÓGICA: Cria data pura (sem hora)
            schedule_date := make_date(2026, month_index + 1, 15);

            IF plan_record.target_equipment_ids IS NOT NULL THEN
                FOREACH equipment_id_iter IN ARRAY plan_record.target_equipment_ids LOOP
                    IF EXISTS (SELECT 1 FROM public.equipments WHERE id = equipment_id_iter AND deleted_at IS NULL) THEN
                        -- Inserção sem ID (deixa a Sequence gerar)
                        INSERT INTO public.work_orders (
                            equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id, machine_stopped
                        ) VALUES (
                            equipment_id_iter,
                            'Preventiva',
                            'Programado',
                            schedule_date,
                            plan_record.description,
                            plan_record.tasks,
                            'Cronograma Automático',
                            plan_record.id,
                            false
                        );
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
    RETURN 'Cronograma 2026 (DATE) gerado com sucesso.';
END;
$$ LANGUAGE plpgsql;

COMMIT;

SELECT 'Migração para DATE concluída com sucesso. O sistema agora é imune a fusos horários no agendamento.';
