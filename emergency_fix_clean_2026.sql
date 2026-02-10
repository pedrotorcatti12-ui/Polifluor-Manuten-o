
-- =============================================================================
-- SCRIPT "NUCLEAR" DE LIMPEZA E CORREÇÃO 2026 - VERSÃO FINAL (CORRIGIDO)
-- =============================================================================

BEGIN;

-- 1. LIMPEZA TOTAL DE O.S. FUTURAS E "LIXO"
-- IMPORTANTE: Esta etapa foi movida para o início para remover referências aos planos antes de tentar deletá-los.
DELETE FROM public.work_orders 
WHERE 
    scheduled_date >= '2026-01-01'
    OR id::numeric > 600; -- Remove O.S. 1907, 1217, etc. (Lixo)

-- 2. DESVINCULAR PLANOS QUE SERÃO EXCLUÍDOS (SEGURANÇA DE FK)
-- Se houver O.S. antigas (histórico) apontando para planos preditivos que vamos excluir,
-- removemos o vínculo (plan_id = NULL) para evitar o erro "violates foreign key constraint".
UPDATE public.work_orders
SET plan_id = NULL
WHERE plan_id IN (
    SELECT id FROM public.maintenance_plans 
    WHERE description ILIKE '%Preditiva%' OR maintenance_type = 'Preditiva'
);

-- 3. REMOVER PLANOS "FANTASMAS" E PREDITIVOS DA TABELA DE PLANOS
-- Agora que as O.S. foram limpas ou desvinculadas, podemos deletar os planos sem erro.
DELETE FROM public.maintenance_plans 
WHERE 
    description ILIKE '%Preditiva%' 
    OR maintenance_type = 'Preditiva';

-- 4. RESET DE SEQUÊNCIA DE ID (FORCE PARA VALOR BAIXO)
DO $$
DECLARE
    max_id INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) INTO max_id FROM public.work_orders;
    -- Se estiver vazio, começa do 1. Se tiver histórico antigo, continua dele.
    PERFORM setval('work_orders_id_seq', max_id);
    RAISE NOTICE 'Sequência resetada para: %', max_id;
END $$;


-- 5. REAPLICAÇÃO DOS CHECKLISTS CORRETOS (A BÍBLIA)
UPDATE public.maintenance_plans SET tasks = '[{"action": "VERIFICAÇÃO DO NÍVEL DE OLEO ANTES DA PARTIDA", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false}, {"action": "APERTO DE TERMINAIS", "checked": false}, {"action": "LIMPEZA INTERNA DOS COMPONENTES", "checked": false}, {"action": "VERIFICAÇÃO DO SISTEMA HIDRÁULICO", "checked": false}]'::jsonb WHERE id = 'PLAN-PH-TRIMESTRAL';
UPDATE public.maintenance_plans SET tasks = '[{"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false}, {"action": "VERIFICAÇÃO DE OLEO ANTES DA PARTIDA", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "VERIFICAR VAZAMENTOS", "checked": false}, {"action": "LIMPEZA INTERNA DO PAINEL", "checked": false}, {"action": "VERIFICAR CILINDRO HIDRÁULICO", "checked": false}, {"action": "VERIFICAR RESISTÊNCIA", "checked": false}]'::jsonb WHERE id = 'PLAN-EX-TRIMESTRAL';
UPDATE public.maintenance_plans SET tasks = '[{"action": "VERIFICAÇÃO DE VAZAMENTOS", "checked": false}, {"action": "VERIFICAÇÃO DE NIVEL DE OLEO ANTES DA PARTIDA", "checked": false}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "VERIFICAR RESISTENCIAS DAS ZONAS DE AQUECIMENTO", "checked": false}, {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO", "checked": false}]'::jsonb WHERE id = 'PLAN-AEX-TRIMESTRAL';
UPDATE public.maintenance_plans SET tasks = '[{"action": "REAPERTO DOS CONTATOS ELÉTRICOS", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR (Ventilação)", "checked": false}, {"action": "VERIFICAÇÃO DA VEDAÇÃO DA PORTA", "checked": false}, {"action": "CALIBRAÇÃO DE TEMPERATURA", "checked": false}, {"action": "VERIFICAR TUBULAÇÃO DE GÁS", "checked": false}, {"action": "VERIFICAR ESTRUTURA FÍSICA", "checked": false}]'::jsonb WHERE id LIKE 'PLAN-FO%';


-- 6. REGENERAÇÃO PREVENTIVAS 2026 (SOMENTE PREVENTIVAS, BASEADO EM PLANOS)
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
            -- Pula Janeiro pois já passou
            IF month_index = 0 THEN CONTINUE; END IF;

            -- Data: Dia 15, Meio-dia (Evita problema de fuso horário)
            schedule_date := make_timestamp(2026, month_index + 1, 15, 12, 0, 0);

            IF plan_record.target_equipment_ids IS NOT NULL THEN
                FOREACH equipment_id_iter IN ARRAY plan_record.target_equipment_ids LOOP
                    -- Filtra para não criar O.S. para ativos inexistentes ou deletados
                    IF EXISTS (SELECT 1 FROM public.equipments WHERE id = equipment_id_iter AND deleted_at IS NULL AND category != 'Predial/Utilitário') THEN
                        INSERT INTO public.work_orders (
                            id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id, machine_stopped
                        ) VALUES (
                            to_char(nextval('work_orders_id_seq'), 'FM0000'),
                            equipment_id_iter,
                            'Preventiva', -- TIPO CORRETO E FORÇADO
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


-- 7. REGENERAÇÃO PREDITIVA (SOMENTE NOVEMBRO - SAMPRED)
-- Garante que não haja duplicatas e que seja apenas UMA vez ao ano.
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
    -- DATA FIXA: 20 de Novembro de 2026, 09:00
    target_date := make_timestamp(2026, 11, 20, 09, 00, 00);

    FOR eq_record IN 
        SELECT id FROM public.equipments 
        WHERE category = 'Industrial' AND status = 'Ativo' 
    LOOP
        INSERT INTO public.work_orders (
            id, equipment_id, type, status, scheduled_date, description, checklist, requester, machine_stopped
        ) VALUES (
            to_char(nextval('work_orders_id_seq'), 'FM0000'),
            eq_record.id,
            'Preditiva', -- TIPO CORRETO
            'Programado',
            target_date,
            'Preditiva Anual 2026 - SAMPRED (Vibração e Termografia)',
            checklist_json,
            'SAMPRED',
            false
        );
    END LOOP;
END $$;


-- 8. REINSERIR ITENS ESPECÍFICOS (DATA CORRETA)
-- Cavalete
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id)
VALUES (
    to_char(nextval('work_orders_id_seq'), 'FM0000'),
    'CL-01', 'Preventiva', 'Programado', '2026-03-10 08:00:00',
    'Manutenção Preventiva Cavalete de Ar (Segurança)',
    (SELECT tasks FROM public.maintenance_plans WHERE id = 'PLAN-CL01-QUINTIMESTRAL'),
    'Segurança do Trabalho', 'PLAN-CL01-QUINTIMESTRAL'
);

-- Torre
INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester)
VALUES (
    to_char(nextval('work_orders_id_seq'), 'FM0000'),
    'TRA-01', 'Preventiva', 'Programado', '2026-12-10 08:00:00',
    '[ALERTA: TERCEIRO] Manutenção Torre de Resfriamento',
    '[{"action": "AGENDAR COM TERCEIRO", "checked": false}, {"action": "Limpeza química/mecânica", "checked": false}, {"action": "Análise da água", "checked": false}]'::jsonb,
    'Utilidades'
);

COMMIT;

SELECT 'BASE LIMPA E RECRIADA COM SUCESSO. IDs Reiniciados. Preditivas Apenas em Novembro. Checklists Aplicados.';
