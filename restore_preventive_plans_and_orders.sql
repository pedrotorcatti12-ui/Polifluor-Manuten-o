
-- =============================================================================
-- SCRIPT DE RESTAURAÇÃO DE INTEGRIDADE - PREVENTIVAS 2026 (EMERGÊNCIA)
-- Objetivo: Corrigir "Desinformação" no Dashboard (O.S. sem checklist, tipo errado)
-- =============================================================================

BEGIN;

-- 1. RESTAURAR CHECKLISTS NOS PLANOS MESTRES
-- Reinsere as tarefas JSON que podem ter se perdido.

-- Planos de Prensas
UPDATE public.maintenance_plans SET tasks = '[{"action": "VERIFICAÇÃO DO NIVEL DE OLEO"}, {"action": "MEDIÇÃO DE CORRENTE MOTOR"}, {"action": "REAPERTO DE CONTATOS"}, {"action": "APERTO DE TERMINAIS"}, {"action": "LIMPEZA INTERNA"}, {"action": "VERIFICAÇÃO HIDRÁULICA"}]'::jsonb 
WHERE id = 'PLAN-PH-TRIMESTRAL';

-- Planos de Extrusoras
UPDATE public.maintenance_plans SET tasks = '[{"action": "REAPERTO CONTATOS"}, {"action": "VERIFICAÇÃO OLEO"}, {"action": "CORRENTE MOTOR"}, {"action": "VAZAMENTOS"}, {"action": "LIMPEZA PAINEL"}, {"action": "CILINDRO HIDRÁULICO"}, {"action": "RESISTÊNCIA"}]'::jsonb 
WHERE id = 'PLAN-EX-TRIMESTRAL';

-- Planos de Extrusora PA (Específico)
UPDATE public.maintenance_plans SET tasks = '[{"action": "VAZAMENTOS"}, {"action": "NIVEL DE OLEO"}, {"action": "REAPERTO CONTATOS"}, {"action": "CORRENTE MOTOR"}, {"action": "RESISTENCIAS ZONA AQUECIMENTO"}, {"action": "ESTRUTURA FÍSICA"}]'::jsonb 
WHERE id = 'PLAN-AEX-TRIMESTRAL';

-- Planos de Fornos
UPDATE public.maintenance_plans SET tasks = '[{"action": "REAPERTO CONTATOS"}, {"action": "CORRENTE MOTOR"}, {"action": "VEDAÇÃO PORTA"}, {"action": "CALIBRAÇÃO TEMP"}, {"action": "TUBULAÇÃO GÁS"}]'::jsonb 
WHERE id LIKE '%FO%'; -- Aplica a todos os fornos para garantir cobertura

-- Planos de Tornos
UPDATE public.maintenance_plans SET tasks = '[{"action": "FOLGA CARRO"}, {"action": "LUBRIFICAÇÃO BARRAMENTOS"}, {"action": "AJUSTE FREIO"}, {"action": "ÓLEO CAIXA NORTON"}]'::jsonb 
WHERE id LIKE '%TM%' OR id LIKE '%TA%';

-- 2. LIMPEZA CIRÚRGICA DE DADOS CORROMPIDOS (PREVENTIVAS 2026)
-- Removemos APENAS as preventivas programadas de 2026 para recriá-las corretamente.
-- Removemos também preventivas que foram "contaminadas" com descrições de Preditiva.
DELETE FROM public.work_orders 
WHERE 
    EXTRACT(YEAR FROM scheduled_date) = 2026
    AND type = 'Preventiva' 
    AND status != 'Executado'
    AND (
        description ILIKE '%Preditiva%' 
        OR description ILIKE '%Anual%' -- Descrição de Preditiva em Preventiva
    );

-- Atualiza Checklists de O.S. existentes e válidas que perderam o conteúdo
UPDATE public.work_orders wo
SET checklist = mp.tasks
FROM public.maintenance_plans mp
WHERE wo.plan_id = mp.id
  AND wo.status = 'Programado'
  AND (wo.checklist IS NULL OR jsonb_array_length(wo.checklist) = 0);


-- 3. REGENERAÇÃO DO CRONOGRAMA PREVENTIVO
-- Usando a função corrigida que agora lê os checklists restaurados acima.

DO $$
DECLARE
    plan_record RECORD;
    equipment_id_iter TEXT;
    month_index INT;
    start_month_index INT;
    schedule_date TIMESTAMP;
    next_os_number INT;
    month_map TEXT[] := ARRAY['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
BEGIN
    -- Sincroniza ID Sequence
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os_number FROM public.work_orders;
    PERFORM setval('work_orders_id_seq', next_os_number);

    -- Loop de Planos
    FOR plan_record IN SELECT * FROM public.maintenance_plans WHERE deleted_at IS NULL LOOP
        SELECT array_position(month_map, plan_record.start_month) - 1 INTO start_month_index;
        IF start_month_index IS NULL THEN CONTINUE; END IF;

        FOR month_index IN start_month_index..11 BY plan_record.frequency LOOP
            -- Data: Dia 15, meio-dia
            schedule_date := make_timestamp(2026, month_index + 1, 15, 12, 0, 0);

            IF plan_record.target_equipment_ids IS NOT NULL THEN
                FOREACH equipment_id_iter IN ARRAY plan_record.target_equipment_ids LOOP
                    IF EXISTS (SELECT 1 FROM public.equipments WHERE id = equipment_id_iter AND deleted_at IS NULL) THEN
                        
                        -- Verifica se já existe O.S. para este ativo/mês para não duplicar
                        IF NOT EXISTS (
                            SELECT 1 FROM public.work_orders 
                            WHERE equipment_id = equipment_id_iter 
                            AND EXTRACT(MONTH FROM scheduled_date) = (month_index + 1)
                            AND EXTRACT(YEAR FROM scheduled_date) = 2026
                            AND type = 'Preventiva'
                        ) THEN
                            INSERT INTO public.work_orders (
                                id, 
                                equipment_id, 
                                type, -- Força tipo correto vindo do plano
                                status, 
                                scheduled_date, 
                                description, 
                                checklist, -- Agora populado corretamente
                                requester, 
                                plan_id, 
                                machine_stopped
                            ) VALUES (
                                to_char(next_os_number, 'FM0000'),
                                equipment_id_iter,
                                'Preventiva', -- Hardcode para garantir que não vire "Preditiva" acidentalmente
                                'Programado',
                                schedule_date,
                                plan_record.description,
                                plan_record.tasks, -- Checklist restaurado
                                'Cronograma Automático',
                                plan_record.id,
                                false
                            );
                            
                            next_os_number := next_os_number + 1;
                        END IF;
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;

COMMIT;

SELECT 'Base de dados saneada. Checklists restaurados e cronograma preventivo 2026 regenerado corretamente.';
