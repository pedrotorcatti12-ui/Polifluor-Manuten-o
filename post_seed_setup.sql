-- =============================================================================
-- SCRIPT DE AUTOMAÇÃO E INTELIGÊNCIA - SGMI 2.0
-- Executar APÓS 'seed_initial_data.sql' e 'seed_detailed_plans.sql'
-- =============================================================================

BEGIN;

-- 1. CRIAÇÃO DE FUNÇÃO DE AUTO-CLASSIFICAÇÃO DE ATIVOS
-- Esta função varre a tabela de equipamentos e corrige o 'type_id' baseado no nome.
-- Essencial para garantir que "PRENSA 01" e "PRENSA 02" sejam ambas tratadas como "PRENSA_HIDRULICA".

CREATE OR REPLACE FUNCTION auto_classify_equipments()
RETURNS text AS $$
BEGIN
    -- Prensas
    UPDATE public.equipments SET type_id = 'PRENSA_HIDRULICA' WHERE name LIKE '%PRENSA%';
    
    -- Extrusoras
    UPDATE public.equipments SET type_id = 'EXTRUSORA' WHERE name = 'EXTRUSORA';
    UPDATE public.equipments SET type_id = 'EXTRUSORA_DE_PA' WHERE name = 'EXTRUSORA DE PA';
    
    -- Fornos e Estufas
    UPDATE public.equipments SET type_id = 'FORNO' WHERE name LIKE '%FORNO%' OR name LIKE '%ESTUFA%';
    
    -- Tornos
    UPDATE public.equipments SET type_id = 'TORNO_AUTOMTICO' WHERE name LIKE '%TORNO AUTOMÁTICO%' OR name LIKE '%TORNO AUTOMATICO%';
    UPDATE public.equipments SET type_id = 'TORNO_CNC' WHERE name LIKE '%TORNO CNC%';
    UPDATE public.equipments SET type_id = 'TORNO_MECANICO' WHERE name LIKE '%TORNO MECANICO%' OR name LIKE '%TORNO MECÂNICO%';
    
    -- Serras
    UPDATE public.equipments SET type_id = 'SERRA_DE_FITA' WHERE name LIKE '%SERRA DE FITA%';
    UPDATE public.equipments SET type_id = 'SERRA' WHERE name = 'SERRA';
    
    -- Compressores
    UPDATE public.equipments SET type_id = 'COMPRESSOR_DE_PARAFUSO' WHERE name LIKE '%COMPRESSOR%' AND name NOT LIKE '%PIST%';
    UPDATE public.equipments SET type_id = 'COMPRESSOR_PISTO_SCHULZ' WHERE name LIKE '%COMPRESSOR%PIST%';

    -- Solda
    UPDATE public.equipments SET type_id = 'MAQUINA_DE_SOLDA' WHERE name LIKE '%MAQUINA DE SOLDA%';

    -- Usinagem Geral
    UPDATE public.equipments SET type_id = 'FRESADORA_FERRAMENTARIA' WHERE name LIKE '%FRESADORA%';
    UPDATE public.equipments SET type_id = 'RETFICA_PLANA' WHERE name LIKE '%RETÍFICA%';
    
    -- Utilidades
    UPDATE public.equipments SET type_id = 'EMPILHADEIRA' WHERE name LIKE '%EMPILHADEIRA%';
    UPDATE public.equipments SET type_id = 'PALETEIRA_ELTRICA' WHERE name LIKE '%PALETEIRA%';
    UPDATE public.equipments SET type_id = 'AR_CONDICIONADO' WHERE name LIKE '%AR CONDICIONADO%';

    RETURN 'Equipamentos classificados e padronizados com sucesso.';
END;
$$ LANGUAGE plpgsql;


-- 2. CRIAÇÃO DE FUNÇÃO DE VINCULAÇÃO DE PLANOS
-- Esta função encontra todos os equipamentos de um tipo X e os vincula ao Plano de Manutenção desse tipo.
-- Ex: Se criar um plano para "PRENSA_HIDRULICA", esta função acha todas as prensas e coloca no plano.

CREATE OR REPLACE FUNCTION refresh_plan_targets()
RETURNS text AS $$
BEGIN
    -- Limpa alvos antigos apenas se não houver alvos definidos (para respeitar o seed manual)
    -- UPDATE public.maintenance_plans SET target_equipment_ids = '{}' WHERE target_equipment_ids IS NULL OR cardinality(target_equipment_ids) = 0;

    -- Recalcula alvos APENAS para planos que estão vazios
    UPDATE public.maintenance_plans p
    SET target_equipment_ids = sub.equipment_ids
    FROM (
        SELECT 
            mp.id AS plan_id,
            array_agg(e.id) AS equipment_ids
        FROM 
            public.maintenance_plans mp
        JOIN 
            public.equipments e ON e.type_id = mp.equipment_type_id
        GROUP BY 
            mp.id
    ) AS sub
    WHERE p.id = sub.plan_id AND (p.target_equipment_ids IS NULL OR cardinality(p.target_equipment_ids) = 0);

    RETURN 'Planos de manutenção vinculados aos equipamentos correspondentes (somente novos/vazios).';
END;
$$ LANGUAGE plpgsql;


-- 3. EXECUÇÃO DAS ROTINAS DE AUTOMAÇÃO
-- Agora rodamos tudo em sequência para deixar o banco 100% pronto.

SELECT auto_classify_equipments(); -- 1. Arruma os tipos dos equipamentos
-- SELECT refresh_plan_targets();     -- 2. (OPCIONAL) Desativado para respeitar os alvos fixos do JSON
SELECT generate_preventive_orders_for_2026(); -- 3. Gera as O.S. no calendário

COMMIT;

SELECT 'Sistema configurado e cronograma 2026 gerado com os planos detalhados!';