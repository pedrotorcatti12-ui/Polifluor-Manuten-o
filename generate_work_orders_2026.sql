-- SCRIPT FINAL E ROBUSTO PARA GERAR AS ORDENS DE SERVIÇO PREVENTIVAS DE 2026

-- Passo 1: Limpar apenas as preventivas de 2026 para evitar duplicatas.
DELETE FROM public.work_orders 
WHERE type = 'Preventiva'::public.maintenance_type AND EXTRACT(YEAR FROM scheduled_date) = 2026;

-- Passo 2: Criar (ou substituir) a função inteligente para gerar as O.S.
CREATE OR REPLACE FUNCTION generate_preventive_orders_for_2026()
RETURNS text AS $$
DECLARE
    plan_record RECORD;
    equipment_record RECORD;
    month_index INT;
    start_month_index INT;
    next_os_number INT;
    schedule_date TIMESTAMP;
    month_map TEXT[] := ARRAY['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
BEGIN
    -- Pega o maior número de OS existente para continuar a sequência
    SELECT COALESCE(MAX(id::int), 0) + 1 INTO next_os_number FROM public.work_orders;

    -- Itera sobre cada plano de manutenção cadastrado
    FOR plan_record IN SELECT * FROM public.maintenance_plans LOOP
        
        -- Encontra o índice do mês de início (0 para Janeiro, 1 para Fevereiro, etc.)
        SELECT array_position(month_map, plan_record.start_month) - 1 INTO start_month_index;
        
        IF start_month_index IS NULL THEN
            RAISE NOTICE 'Mês de início inválido "%" para o plano %', plan_record.start_month, plan_record.id;
            CONTINUE;
        END IF;

        -- Itera sobre os meses do ano, aplicando a frequência do plano
        FOR month_index IN start_month_index..11 BY plan_record.frequency LOOP
            
            -- REGRA ADICIONADA: Ignorar o mês de Janeiro (índice 0) para preservar o histórico real.
            IF month_index = 0 THEN
                CONTINUE;
            END IF;

            -- Define o dia da manutenção como dia 15 do mês calculado
            schedule_date := make_timestamp(2026, month_index + 1, 15, 8, 0, 0);

            -- Itera sobre cada equipamento vinculado ao plano
            FOR equipment_record IN 
                SELECT id, category FROM public.equipments 
                WHERE id = ANY(plan_record.target_equipment_ids)
            LOOP
                -- Regra de Negócio: Ignorar ativos que são da categoria 'Predial' (CORRIGIDO)
                IF equipment_record.category = 'Predial/Utilitário' THEN
                    CONTINUE;
                END IF;

                -- Insere a nova Ordem de Serviço na tabela
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
                    man_hours,
                    materials_used,
                    plan_id
                ) VALUES (
                    to_char(next_os_number, 'FM0000'),
                    equipment_record.id,
                    plan_record.maintenance_type::public.maintenance_type,
                    'Programado'::public.maintenance_status,
                    schedule_date,
                    plan_record.description,
                    plan_record.tasks,
                    'Planejamento Automático',
                    false,
                    '{}',
                    '{}',
                    plan_record.id
                );
                
                -- Incrementa o número da OS para a próxima
                next_os_number := next_os_number + 1;
            END LOOP;
        END LOOP;
    END LOOP;

    RETURN 'Ordens de Serviço preventivas para 2026 (exceto Janeiro) geradas com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- Passo 3: Executar a função que acabamos de criar.
SELECT generate_preventive_orders_for_2026();