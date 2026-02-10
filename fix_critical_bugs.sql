
-- =============================================================================
-- SCRIPT DE CORREÇÃO CRÍTICA (ESTOQUE, IDs e DATAS) - SGMI 2.0
-- =============================================================================

BEGIN;

-- 1. CORREÇÃO DA GUERRA DE IDS (SEQUENCE)
-- Cria uma sequência para gerenciar os IDs de forma atômica e segura
CREATE SEQUENCE IF NOT EXISTS work_orders_id_seq;

-- Sincroniza a sequência com o maior ID numérico existente atual
-- Usa regex para ignorar IDs alfanuméricos antigos ou de teste
DO $$
DECLARE
    max_id INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) INTO max_id FROM public.work_orders;
    PERFORM setval('work_orders_id_seq', max_id);
END $$;

-- Define o valor padrão da coluna ID para usar a sequência formatada (ex: '0150')
ALTER TABLE public.work_orders 
ALTER COLUMN id SET DEFAULT to_char(nextval('work_orders_id_seq'), 'FM0000');


-- 2. CORREÇÃO DO "BURACO NEGRO DO ESTOQUE" (TRIGGER COM ESTORNO)
-- Remove o trigger antigo que causava duplicação de baixa
DROP TRIGGER IF EXISTS tr_deduct_stock_on_completion ON public.work_orders;
DROP FUNCTION IF EXISTS handle_stock_deduction_on_wo_completion();

-- Cria a nova função inteligente
CREATE OR REPLACE FUNCTION handle_stock_sync_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
    material RECORD;
    part_name_var TEXT;
BEGIN
    -- CENÁRIO A: O.S. FINALIZADA (BAIXA NO ESTOQUE)
    -- Se mudou PARA 'Executado' e antes NÃO era 'Executado'
    IF NEW.status = 'Executado' AND (OLD.status IS DISTINCT FROM 'Executado') THEN
        IF NEW.materials_used IS NOT NULL AND jsonb_array_length(NEW.materials_used) > 0 THEN
            FOR material IN SELECT * FROM jsonb_to_recordset(NEW.materials_used) AS x(partId text, quantity int)
            LOOP
                -- Baixa o estoque
                UPDATE public.spare_parts
                SET current_stock = current_stock - material.quantity
                WHERE id = material.partId
                RETURNING name INTO part_name_var;

                -- Registra o movimento de SAÍDA
                IF part_name_var IS NOT NULL THEN
                    INSERT INTO public.stock_movements (part_id, part_name, type, quantity, reason, "user", work_order_id)
                    VALUES (material.partId, part_name_var, 'Saída', material.quantity, 'Consumo O.S. #' || NEW.id, 'Sistema', NEW.id);
                END IF;
            END LOOP;
        END IF;
    END IF;

    -- CENÁRIO B: O.S. REABERTA (ESTORNO AO ESTOQUE)
    -- Se saiu DE 'Executado' para qualquer outra coisa (ex: 'Programado')
    IF OLD.status = 'Executado' AND NEW.status IS DISTINCT FROM 'Executado' THEN
        -- Usa os materiais da versão ANTIGA (OLD) para garantir que devolvemos o que foi tirado
        IF OLD.materials_used IS NOT NULL AND jsonb_array_length(OLD.materials_used) > 0 THEN
            FOR material IN SELECT * FROM jsonb_to_recordset(OLD.materials_used) AS x(partId text, quantity int)
            LOOP
                -- Devolve ao estoque (Estorno)
                UPDATE public.spare_parts
                SET current_stock = current_stock + material.quantity
                WHERE id = material.partId
                RETURNING name INTO part_name_var;

                -- Registra o movimento de ENTRADA (Ajuste/Estorno)
                IF part_name_var IS NOT NULL THEN
                    INSERT INTO public.stock_movements (part_id, part_name, type, quantity, reason, "user", work_order_id)
                    VALUES (material.partId, part_name_var, 'Entrada', material.quantity, 'Estorno Reabertura O.S. #' || NEW.id, 'Sistema', NEW.id);
                END IF;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reaplica o trigger (Garanta que remove o anterior antes de criar para evitar erro 42710)
DROP TRIGGER IF EXISTS tr_sync_stock_on_status ON public.work_orders;

CREATE TRIGGER tr_sync_stock_on_status
AFTER UPDATE OF status ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION handle_stock_sync_on_status_change();


-- 3. CORREÇÃO DO CRONOGRAMA (GERAÇÃO SEGURA DE DATAS)
-- Atualiza a função de geração para usar 12:00 (meio-dia) em vez de 08:00
-- Isso evita que o fuso horário -3h jogue a data para o dia anterior (21:00 do dia D-1)
CREATE OR REPLACE FUNCTION generate_preventive_orders_for_2026()
RETURNS text AS $$
DECLARE
    plan_record RECORD;
    equipment_id_iter TEXT;
    month_index INT;
    start_month_index INT;
    schedule_date TIMESTAMP;
    month_map TEXT[] := ARRAY['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
BEGIN
    -- Limpa preventivas futuras de 2026 programadas para evitar duplicatas
    DELETE FROM public.work_orders 
    WHERE type = 'Preventiva' 
      AND EXTRACT(YEAR FROM scheduled_date) = 2026
      AND status = 'Programado';

    -- Itera sobre os planos
    FOR plan_record IN SELECT * FROM public.maintenance_plans WHERE deleted_at IS NULL LOOP
        SELECT array_position(month_map, plan_record.start_month) - 1 INTO start_month_index;
        IF start_month_index IS NULL THEN CONTINUE; END IF;

        FOR month_index IN start_month_index..11 BY plan_record.frequency LOOP
            -- DEFINIÇÃO SEGURA DE DATA: Dia 15, às 12:00:00 (Meio-dia)
            schedule_date := make_timestamp(2026, month_index + 1, 15, 12, 0, 0);

            IF plan_record.target_equipment_ids IS NOT NULL THEN
                FOREACH equipment_id_iter IN ARRAY plan_record.target_equipment_ids LOOP
                    IF EXISTS (SELECT 1 FROM public.equipments WHERE id = equipment_id_iter AND deleted_at IS NULL) THEN
                        -- Inserção SEM passar o ID (deixa o DEFAULT da SEQUENCE cuidar disso)
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
    RETURN 'Cronograma 2026 gerado com sucesso (IDs sequenciais e datas seguras).';
END;
$$ LANGUAGE plpgsql;

COMMIT;

SELECT 'Correções críticas aplicadas com sucesso: Sequence IDs, Trigger de Estorno e Datas Seguras.';
