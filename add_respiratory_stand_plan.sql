
-- =============================================================================
-- CADASTRO E PROGRAMAÇÃO: CAVALETE DE AR RESPIRATÓRIO (CL-01)
-- CORREÇÃO: Sincronização de IDs para evitar erro "duplicate key value"
-- Data Alvo: 10/03/2026 | Frequência: 5 Meses | Tipo: Preventiva/Externa
-- =============================================================================

BEGIN;

-- 1. CORREÇÃO DA SEQUÊNCIA DE IDs (CRÍTICO)
-- Sincroniza a sequência com o maior ID existente na tabela para evitar colisão.
DO $$
DECLARE
    max_id INT;
BEGIN
    -- Busca o maior ID numérico atual (ignorando sufixos não numéricos se houver)
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) 
    INTO max_id 
    FROM public.work_orders;
    
    -- Ajusta a sequência para o próximo valor ser max_id + 1
    -- Se a sequência não existir, cria (segurança)
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'work_orders_id_seq') THEN
        CREATE SEQUENCE work_orders_id_seq;
    END IF;
    
    PERFORM setval('work_orders_id_seq', max_id);
END $$;

-- 2. GARANTIR CADASTRO DO TIPO E EQUIPAMENTO
-- Insere o tipo se não existir
INSERT INTO public.equipment_types (id, description) 
VALUES ('CAVALETE_AR', 'Cavalete de Ar Respiratório') 
ON CONFLICT (id) DO NOTHING;

-- Insere/Atualiza o equipamento
INSERT INTO public.equipments (id, name, type_id, category, location, status, is_critical)
VALUES (
    'CL-01', 
    'CAVALETE DE AR RESPIRATÓRIO (JATISTA)', 
    'CAVALETE_AR', 
    'Industrial', 
    'TUBULAÇÃO / JATO', 
    'Ativo', 
    true -- Crítico pois envolve segurança do trabalho (EPI)
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    is_critical = EXCLUDED.is_critical;

-- 3. CRIAR PLANO DE MANUTENÇÃO ESPECÍFICO (5 MESES)
-- ID: PLAN-CL01-QUINTIMESTRAL
INSERT INTO public.maintenance_plans (
    id, 
    description, 
    equipment_type_id, 
    target_equipment_ids, 
    frequency, 
    maintenance_type, 
    start_month, 
    tasks
) VALUES (
    'PLAN-CL01-QUINTIMESTRAL',
    'Manutenção Cavalete de Ar (Segurança do Trabalho) - 5 Meses',
    'CAVALETE_AR',
    '{CL-01}',
    5, -- Frequência específica solicitada
    'Preventiva',
    'Março',
    '[
        {"action": "Verificar Filtro separador preliminar", "checked": false},
        {"action": "Verificar unidade de filtragem metálico secundário", "checked": false},
        {"action": "Verificar recipiente de água umidificador", "checked": false},
        {"action": "Verificar nível de água no umidificador", "checked": false},
        {"action": "Verificar mangueiras de entradas e saídas do cavalete", "checked": false},
        {"action": "Limpeza filtro de linha do jato (pré-cavalete) - Lavagem/Substituição", "checked": false},
        {"action": "ACIONAR COMPRAS: Enviar para manutenção externa (Laudo Obrigatório)", "checked": false}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    tasks = EXCLUDED.tasks,
    frequency = EXCLUDED.frequency,
    description = EXCLUDED.description;

-- 4. GERAR A ORDEM DE SERVIÇO ESPECÍFICA PARA 10/03/2026
-- Removemos qualquer agendamento anterior para essa data/equipamento para evitar duplicidade
DELETE FROM public.work_orders 
WHERE equipment_id = 'CL-01' AND scheduled_date::DATE = '2026-03-10';

INSERT INTO public.work_orders (
    id,
    equipment_id,
    type,
    status,
    scheduled_date,
    description,
    checklist,
    requester,
    observations,
    plan_id,
    machine_stopped
) VALUES (
    to_char(nextval('work_orders_id_seq'), 'FM0000'), -- Gera próximo ID sequencial seguro
    'CL-01',
    'Preventiva',
    'Programado',
    '2026-03-10 08:00:00', -- Data exata solicitada
    'Manutenção Preventiva e Envio Externo - Cavalete de Ar',
    (SELECT tasks FROM public.maintenance_plans WHERE id = 'PLAN-CL01-QUINTIMESTRAL'),
    'Segurança do Trabalho',
    'OBSERVAÇÃO CRÍTICA: O RH deverá efetuar todos os registros deste equipamento na listagem de EPI após a manutenção.',
    'PLAN-CL01-QUINTIMESTRAL',
    false
);

COMMIT;

-- 5. VALIDAÇÃO
SELECT 
    id as "OS Gerada", 
    equipment_id, 
    TO_CHAR(scheduled_date, 'DD/MM/YYYY') as "Data", 
    description 
FROM public.work_orders 
WHERE equipment_id = 'CL-01' AND EXTRACT(YEAR FROM scheduled_date) = 2026;
