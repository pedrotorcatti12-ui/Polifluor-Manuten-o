
-- =============================================================================
-- CRONOGRAMA MESTRE 2026 - DEFINIÇÃO TÁTICA (POLIFLUOR)
-- Versão: 3.1 (Correção de Tipagem Enum)
-- =============================================================================

BEGIN;

-- 1. GARANTIR TIPO GENÉRICO
-- Necessário para cadastrar máquinas que não sabemos o tipo exato ainda.
INSERT INTO public.equipment_types (id, description) VALUES ('GENERICO', 'Cadastrado Automaticamente') ON CONFLICT DO NOTHING;

-- 2. PREPARAR DADOS (CARGA NA MEMÓRIA)
CREATE TEMP TABLE schedule_map (
    eq_id TEXT,
    month_num INT,
    is_alert BOOLEAN,
    custom_desc TEXT
);

INSERT INTO schedule_map (eq_id, month_num, is_alert, custom_desc) VALUES
-- JANEIRO (1)
('AEX-02', 1, false, NULL), ('CF-01', 1, false, NULL), ('EX-02', 1, false, NULL), ('EX-04', 1, false, NULL),
('FO-07', 1, false, NULL), ('FO-10', 1, false, NULL), ('FO-11', 1, false, NULL), ('GE-01', 1, false, NULL),
('MS-02', 1, false, NULL), ('MS-03', 1, false, NULL), ('MS-04', 1, false, NULL), ('PH-07', 1, false, NULL),
('PH-08', 1, false, NULL), ('PH-09', 1, false, NULL), ('PH-13', 1, false, NULL), ('PH-15', 1, false, NULL),
('TD-02', 1, false, NULL),

-- FEVEREIRO (2)
('EN-01', 2, false, NULL), ('FO-05', 2, false, NULL), ('FO-06', 2, false, NULL), ('FO-08', 2, false, NULL),
('FO-09', 2, false, NULL), ('FO-12', 2, false, NULL), ('FO-13', 2, false, NULL), ('FO-14', 2, false, NULL),
('FR-01', 2, false, NULL), ('FR-02', 2, false, NULL), ('JT-01', 2, false, NULL), ('JT-02', 2, false, NULL),
('PH-02', 2, false, NULL), ('TD-04', 2, false, NULL), ('TD-06', 2, false, NULL), ('TD-07', 2, false, NULL),
('TF-02', 2, false, NULL), ('TM-03', 2, false, NULL), ('TM-05', 2, false, NULL),

-- MARÇO (3)
('CA-01', 3, false, NULL), ('CO-01', 3, false, NULL), ('FO-01', 3, false, NULL), ('FO-02', 3, false, NULL),
('FO-03', 3, false, NULL), ('FO-04', 3, false, NULL), ('FO-10', 3, false, NULL), ('MV-01', 3, false, NULL),
('PM-01', 3, false, NULL), ('RO-01', 3, false, NULL), ('TES-01', 3, false, NULL), ('TF-03', 3, false, NULL),
('TF-04', 3, false, NULL),

-- ABRIL (4)
('EP-01', 4, false, NULL), ('EP-02', 4, false, NULL), ('EP-03', 4, false, NULL), ('EX-01', 4, false, NULL),
('EX-05', 4, false, NULL), ('MG-01', 4, false, NULL), ('MI-01', 4, false, NULL), ('MI-03', 4, false, NULL),
('MI-04', 4, false, NULL), ('MS-02', 4, false, NULL), ('MS-05', 4, false, NULL), ('SF-02', 4, false, NULL),
('TD-02', 4, false, NULL), ('TF-01', 4, false, NULL),

-- MAIO (5)
('AEX-02', 5, false, NULL), ('CT-01', 5, false, NULL), ('CT-02', 5, false, NULL), ('FO-10', 5, false, NULL),
('JT-01', 5, false, NULL), ('JT-02', 5, false, NULL), ('MS-06', 5, false, NULL), ('PH-02', 5, false, NULL),
('PH-12', 5, false, NULL), ('SF-01', 5, false, NULL), ('TD-04', 5, false, NULL), ('TD-05', 5, false, NULL),
('TD-06', 5, false, NULL), ('TD-07', 5, false, NULL), ('TF-02', 5, false, NULL),

-- JUNHO (6)
('AEX-01', 6, false, NULL), ('CO-01', 6, false, NULL), ('CR-01', 6, false, NULL), ('CR-02', 6, false, NULL),
('CR-03', 6, false, NULL), ('MS-07', 6, false, NULL), ('PH-14', 6, false, NULL), ('PH-16', 6, false, NULL),
('PH-17', 6, false, NULL), ('PH-18', 6, false, NULL), ('PH-19', 6, false, NULL), ('PH-20', 6, false, NULL),
('TB-01', 6, false, NULL), ('TM-01', 6, false, NULL), ('TM-02', 6, false, NULL), ('TM-04', 6, false, NULL),

-- JULHO (7)
('CL-01', 7, false, NULL), ('EX-02', 7, false, NULL), ('EX-04', 7, false, NULL), ('FO-07', 7, false, NULL),
('FO-10', 7, false, NULL), ('FO-11', 7, false, NULL), ('MS-02', 7, false, NULL), ('PH-07', 7, false, NULL),
('PH-08', 7, false, NULL), ('PH-09', 7, false, NULL), ('PH-15', 7, false, NULL), ('PL-01', 7, false, NULL),
('TA-06', 7, false, NULL), ('TC-01', 7, false, NULL), ('TC-02', 7, false, NULL), ('TC-03', 7, false, NULL),
('TC-04', 7, false, NULL), ('TC-05', 7, false, NULL), ('TC-06', 7, false, NULL), ('TC-07', 7, false, NULL),
('TC-08', 7, false, NULL), ('TD-02', 7, false, NULL),

-- AGOSTO (8) - MÊS DE ALERTAS/TERCEIROS + PREVENTIVAS REGULARES
('FO-05', 8, false, NULL), ('FO-06', 8, false, NULL), ('FO-08', 8, false, NULL), ('FO-09', 8, false, NULL),
('FO-12', 8, false, NULL), ('FO-13', 8, false, NULL), ('FO-14', 8, false, NULL), ('JT-01', 8, false, NULL),
('JT-02', 8, false, NULL), ('PH-02', 8, false, NULL), ('PH-04', 8, false, NULL), ('PH-05', 8, false, NULL),
('RO-02', 8, false, NULL), ('TD-04', 8, false, NULL), ('TD-06', 8, false, NULL), ('TD-07', 8, false, NULL),
('TF-02', 8, false, NULL), ('PX-01', 8, false, NULL),
-- Terceirizados/Alertas
('AF-01', 8, true, '[ALERTA: TERCEIRO] Manutenção Especializada Automotiva'),
('CV-01', 8, true, '[ALERTA: TERCEIRO] Manutenção Curvadora (CRIPPA)'),
('EF-01', 8, true, '[ALERTA: TERCEIRO] Manutenção Conformadora (CRIPPA)'),
('ET-01', 8, true, '[ALERTA: TERCEIRO] Estufa de Funil'),
('ML-01', 8, true, '[ALERTA: TERCEIRO] Manutenção Laser'),
('ML-02', 8, true, '[ALERTA: TERCEIRO] Manutenção Laser'),
('RM-01', 8, true, '[ALERTA: TERCEIRO] Recravadeira'),
('SI-01', 8, true, '[ALERTA: TERCEIRO] Solda por Indução'),

-- SETEMBRO (9)
('CO-01', 9, false, NULL), ('CO-02', 9, false, NULL), ('CO-03', 9, false, NULL), ('FO-01', 9, false, NULL),
('FO-02', 9, false, NULL), ('FO-03', 9, false, NULL), ('FO-04', 9, false, NULL), ('FO-10', 9, false, NULL),
('PH-06', 9, false, NULL), ('PH-10', 9, false, NULL), ('PH-11', 9, false, NULL), ('PM-01', 9, false, NULL),
('RO-01', 9, false, NULL), ('TA-01', 9, false, NULL), ('TA-02', 9, false, NULL), ('TA-03', 9, false, NULL),
('TA-04', 9, false, NULL), ('TA-05', 9, false, NULL),

-- OUTUBRO (10)
('BA-010', 10, true, '[ALERTA: TERCEIRO] Calibração de Balança'), 
('BA-012', 10, true, '[ALERTA: TERCEIRO] Calibração de Balança'),
('EX-01', 10, false, NULL), ('EX-03', 10, false, NULL), ('EX-05', 10, false, NULL), ('EX-06', 10, false, NULL),
('EX-07', 10, false, NULL), ('MG-01', 10, false, NULL), ('MS-02', 10, false, NULL), ('PH-01', 10, false, NULL),
('PO-01', 10, false, NULL), ('SF-02', 10, false, NULL), ('TD-01', 10, false, NULL), ('TD-02', 10, false, NULL),
('TD-03', 10, false, NULL),

-- NOVEMBRO (11)
('CP-01', 11, false, NULL), ('CP-02', 11, false, NULL), ('CT-01', 11, false, NULL), ('CT-02', 11, false, NULL),
('FO-10', 11, false, NULL), ('JT-01', 11, false, NULL), ('JT-02', 11, false, NULL), ('PH-12', 11, false, NULL),
('TD-04', 11, false, NULL), ('TD-05', 11, false, NULL), ('TD-06', 11, false, NULL), ('TD-07', 11, false, NULL),
('TD-08', 11, false, NULL), ('TF-02', 11, false, NULL),

-- DEZEMBRO (12)
('AEX-01', 12, false, NULL), ('CO-01', 12, false, NULL), ('GUI-01', 12, false, NULL), ('MI-01', 12, false, NULL),
('MI-03', 12, false, NULL), ('MI-04', 12, false, NULL), ('PH-03', 12, false, NULL), ('RE-01', 12, false, NULL);


-- 3. AUTO-CADASTRO DE SEGURANÇA (A SOLUÇÃO DEFINITIVA)
-- Verifica quais equipamentos do planejamento NÃO estão na tabela 'equipments'.
-- Insere eles automaticamente para evitar o erro de chave estrangeira (FK).
INSERT INTO public.equipments (id, name, type_id, category, status, location)
SELECT DISTINCT
    sm.eq_id,
    -- Tenta adivinhar o nome pelo código, ou usa genérico
    CASE
        WHEN sm.eq_id LIKE 'TD-%' THEN 'TRANÇADEIRA'
        WHEN sm.eq_id LIKE 'PH-%' THEN 'PRENSA HIDRÁULICA'
        WHEN sm.eq_id LIKE 'MS-%' THEN 'MÁQUINA DE SOLDA'
        WHEN sm.eq_id LIKE 'EX-%' THEN 'EXTRUSORA'
        WHEN sm.eq_id LIKE 'FO-%' THEN 'FORNO'
        ELSE 'Equipamento ' || sm.eq_id
    END,
    'GENERICO', -- Tipo de segurança
    'Industrial'::public.asset_category, -- CORREÇÃO DE CAST PARA ENUM
    'Ativo',
    'AUTO-CADASTRADO (CRONOGRAMA)'
FROM schedule_map sm
WHERE NOT EXISTS (SELECT 1 FROM public.equipments e WHERE e.id = sm.eq_id);


-- 4. ATUALIZAR STATUS DE MÁQUINAS DESATIVADAS (Se estiverem na lista manual)
UPDATE public.equipments SET status = 'Desativado' WHERE id IN ('MI-02', 'SF-03');


-- 5. LIMPEZA SEGURA DO FUTURO
-- Agora que garantimos que todas as máquinas existem, podemos limpar e recriar as O.S.
DELETE FROM public.work_orders 
WHERE 
    EXTRACT(YEAR FROM scheduled_date) = 2026 
    AND status != 'Executado' -- Não apaga o que já foi feito
    AND equipment_id IN (SELECT eq_id FROM schedule_map);


-- 6. PROCESSAMENTO FINAL (GERAÇÃO DAS O.S.)
DO $$
DECLARE
    row_data RECORD;
    plan_info RECORD;
    next_os_number INT;
    schedule_date TIMESTAMP;
BEGIN
    -- Obter próximo número de O.S.
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os_number FROM public.work_orders;

    FOR row_data IN SELECT * FROM schedule_map LOOP
        
        -- Tenta buscar checklist de um plano existente (se houver)
        SELECT id, description, tasks FROM public.maintenance_plans 
        WHERE target_equipment_ids @> ARRAY[row_data.eq_id] 
        LIMIT 1 
        INTO plan_info;

        -- Data: Dia 15, meio-dia
        schedule_date := make_timestamp(2026, row_data.month_num, 15, 12, 0, 0);

        -- Insere a O.S.
        INSERT INTO public.work_orders (
            id, 
            equipment_id, 
            type, 
            status, 
            scheduled_date, 
            description, 
            checklist, 
            requester, 
            plan_id, 
            machine_stopped
        ) VALUES (
            to_char(next_os_number, 'FM0000'),
            row_data.eq_id,
            'Preventiva',
            'Programado',
            schedule_date,
            COALESCE(row_data.custom_desc, plan_info.description, 'Manutenção Preventiva 2026'),
            COALESCE(plan_info.tasks, '[]'::jsonb),
            'Cronograma Tático 2026',
            plan_info.id,
            false
        );

        next_os_number := next_os_number + 1;
        
    END LOOP;
END $$;

DROP TABLE schedule_map;

COMMIT;

SELECT 'Sucesso! Cronograma 2026 gerado. Equipamentos faltantes (como TD-03) foram cadastrados automaticamente.';
