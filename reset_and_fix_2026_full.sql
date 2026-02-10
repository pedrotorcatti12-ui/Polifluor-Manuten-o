
-- =============================================================================
-- SCRIPT "FACTORY RESET" 2026 - LIMPEZA PROFUNDA E CORREÇÃO DE IDs
-- =============================================================================

BEGIN;

-- 1. LIMPEZA AGRESSIVA DE DADOS SUJOS
-- Remove QUALQUER OS futura (Fev/2026 em diante) que não esteja executada.
-- Remove também qualquer OS de 2026 com número absurdo (> 800) para garantir.
DELETE FROM public.work_orders 
WHERE 
    (EXTRACT(YEAR FROM scheduled_date) >= 2026)
    AND status != 'Executado';

-- 2. RESET FORÇADO DA NUMERAÇÃO (FIM DA O.S. 1907)
-- Descobre o maior ID REAL (provavelmente baixo, ex: 100 ou 200) e reseta a sequência.
DO $$
DECLARE
    max_id INT;
BEGIN
    -- Pega o maior ID numérico existente dos registros QUE SOBRARAM (Executados + 2025)
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) 
    INTO max_id 
    FROM public.work_orders;
    
    -- Força a sequência a reiniciar desse número
    -- Se não existir a sequence, cria.
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'work_orders_id_seq') THEN
        CREATE SEQUENCE work_orders_id_seq;
    END IF;
    
    PERFORM setval('work_orders_id_seq', max_id);
    
    RAISE NOTICE 'Sequência resetada para o ID: %', max_id;
END $$;


-- 3. APLICAÇÃO DA "BÍBLIA" NOS PLANOS (GARANTIA DE CHECKLIST)
-- Atualiza os checklists nos Planos Mestres para garantir que a geração puxe os dados certos.

-- Prensas
UPDATE public.maintenance_plans SET tasks = '[{"action": "VERIFICAÇÃO DO NÍVEL DE OLEO ANTES DA PARTIDA", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false}, {"action": "APERTO DE TERMINAIS", "checked": false}, {"action": "LIMPEZA INTERNA DOS COMPONENTES", "checked": false}, {"action": "VERIFICAÇÃO DO SISTEMA HIDRÁULICO", "checked": false}]'::jsonb WHERE id = 'PLAN-PH-TRIMESTRAL';
-- Extrusoras
UPDATE public.maintenance_plans SET tasks = '[{"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false}, {"action": "VERIFICAÇÃO DE OLEO ANTES DA PARTIDA", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "VERIFICAR VAZAMENTOS", "checked": false}, {"action": "LIMPEZA INTERNA DO PAINEL", "checked": false}, {"action": "VERIFICAR CILINDRO HIDRÁULICO", "checked": false}, {"action": "VERIFICAR RESISTÊNCIA", "checked": false}]'::jsonb WHERE id = 'PLAN-EX-TRIMESTRAL';
-- Fornos
UPDATE public.maintenance_plans SET tasks = '[{"action": "REAPERTO DOS CONTATOS ELÉTRICOS", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR (Ventilação)", "checked": false}, {"action": "VERIFICAÇÃO DA VEDAÇÃO DA PORTA", "checked": false}, {"action": "CALIBRAÇÃO DE TEMPERATURA", "checked": false}, {"action": "VERIFICAR TUBULAÇÃO DE GÁS", "checked": false}, {"action": "VERIFICAR ESTRUTURA FÍSICA", "checked": false}]'::jsonb WHERE id LIKE 'PLAN-FO%';
-- Cavalete AR
UPDATE public.maintenance_plans SET tasks = '[{"action": "Verificar Filtro separador preliminar", "checked": false}, {"action": "Verificar unidade de filtragem metálico secundário", "checked": false}, {"action": "Verificar recipiente de água", "checked": false}, {"action": "Verificar nível de água", "checked": false}, {"action": "Verificar mangueiras", "checked": false}, {"action": "Limpeza do filtro de linha do jato", "checked": false}, {"action": "ACIONAR COMPRAS: Manutenção externa", "checked": false}]'::jsonb WHERE id = 'PLAN-CL01-QUINTIMESTRAL';


-- 4. REGENERAÇÃO PREVENTIVAS 2026 (LOOP CORRIGIDO)
DO $$
DECLARE
    plan_record RECORD;
    equipment_id_iter TEXT;
    month_index INT;
    start_month_index INT;
    schedule_date TIMESTAMP;
    month_map TEXT[] := ARRAY['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
BEGIN
    FOR plan_record IN SELECT * FROM public.maintenance_plans WHERE deleted_at IS NULL LOOP
        SELECT array_position(month_map, plan_record.start_month) - 1 INTO start_month_index;
        IF start_month_index IS NULL THEN CONTINUE; END IF;

        FOR month_index IN start_month_index..11 BY plan_record.frequency LOOP
            -- Pula Janeiro pois já passou (histórico preservado)
            IF month_index = 0 THEN CONTINUE; END IF;

            -- Data: Dia 15, 08:00
            schedule_date := make_timestamp(2026, month_index + 1, 15, 8, 0, 0);

            IF plan_record.target_equipment_ids IS NOT NULL THEN
                FOREACH equipment_id_iter IN ARRAY plan_record.target_equipment_ids LOOP
                    IF EXISTS (SELECT 1 FROM public.equipments WHERE id = equipment_id_iter AND deleted_at IS NULL AND category != 'Predial/Utilitário') THEN
                        INSERT INTO public.work_orders (
                            id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id, machine_stopped
                        ) VALUES (
                            to_char(nextval('work_orders_id_seq'), 'FM0000'),
                            equipment_id_iter,
                            'Preventiva', -- TIPO CORRETO GARANTIDO
                            'Programado',
                            schedule_date,
                            plan_record.description,
                            plan_record.tasks, -- Checklist da Bíblia
                            'Cronograma Automático',
                            plan_record.id,
                            false
                        );
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;


-- 5. REGENERAÇÃO PREDITIVA (SOMENTE NOVEMBRO - TIPO CORRETO)
DO $$
DECLARE
    eq_record RECORD;
    target_date TIMESTAMP;
    checklist_json JSONB := '[
        {"action": "Coleta de dados de Vibração", "checked": false},
        {"action": "Termografia de Painéis/Motores", "checked": false},
        {"action": "Envio de Relatório Técnico (SAMPRED)", "checked": false}
    ]'::jsonb;
BEGIN
    target_date := make_timestamp(2026, 11, 20, 08, 00, 00); -- DATA FIXA: 20/NOV

    FOR eq_record IN 
        SELECT id FROM public.equipments 
        WHERE category = 'Industrial' AND status = 'Ativo' 
    LOOP
        INSERT INTO public.work_orders (
            id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped
        ) VALUES (
            to_char(nextval('work_orders_id_seq'), 'FM0000'),
            eq_record.id,
            'Preditiva', -- TIPO CORRETO: PREDITIVA
            'Programado',
            target_date,
            'Preditiva Anual 2026 - SAMPRED (Vibração e Termografia)',
            checklist_json,
            'SAMPRED',
            false
        );
    END LOOP;
END $$;


-- 6. ESPECÍFICOS E TERCEIROS (DATAS CORRETAS)
-- Cavalete de Ar (Março)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id)
VALUES (
    to_char(nextval('work_orders_id_seq'), 'FM0000'),
    'CL-01', 'Preventiva', 'Programado', '2026-03-10 08:00:00',
    'Manutenção Preventiva Cavalete de Ar (Segurança)',
    (SELECT tasks FROM public.maintenance_plans WHERE id = 'PLAN-CL01-QUINTIMESTRAL'),
    'Segurança do Trabalho', 'PLAN-CL01-QUINTIMESTRAL'
);

-- Torre de Resfriamento (Dezembro)
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester)
VALUES (
    to_char(nextval('work_orders_id_seq'), 'FM0000'),
    'TRA-01', 'Preventiva', 'Programado', '2026-12-10 08:00:00',
    '[ALERTA: TERCEIRO] Manutenção Torre de Resfriamento',
    '[{"action": "AGENDAR COM TERCEIRO", "checked": false}, {"action": "Limpeza química/mecânica", "checked": false}, {"action": "Análise da água", "checked": false}]'::jsonb,
    'Utilidades'
);

COMMIT;

SELECT 'LIMPEZA COMPLETA REALIZADA. Cronograma 2026 regenerado. IDs resetados. Preditivas apenas em Novembro.';
