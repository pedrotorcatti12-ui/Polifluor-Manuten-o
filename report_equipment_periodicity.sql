
-- =============================================================================
-- RELATÓRIO DE CONFERÊNCIA: PERIODICIDADE DE MANUTENÇÃO POR MÁQUINA
-- Objetivo: Listar a frequência Preventiva (do plano vinculado) e Preditiva (regra fixa).
-- =============================================================================

SELECT
    e.id AS "Código Ativo",
    e.name AS "Nome do Equipamento",
    e.location AS "Localização",
    
    -- 1. Frequência Preventiva (Busca dinâmica no Plano vinculado)
    COALESCE(
        (SELECT
            CASE
                WHEN mp.frequency = 1 THEN 'Mensal (12x/ano)'
                WHEN mp.frequency = 2 THEN 'Bimestral (6x/ano)'
                WHEN mp.frequency = 3 THEN 'Trimestral (4x/ano)'
                WHEN mp.frequency = 4 THEN 'Quadrimestral (3x/ano)'
                WHEN mp.frequency = 6 THEN 'Semestral (2x/ano)'
                WHEN mp.frequency = 12 THEN 'Anual (1x/ano)'
                ELSE mp.frequency || ' Meses'
            END
         FROM public.maintenance_plans mp
         WHERE e.id = ANY(mp.target_equipment_ids)
         AND mp.maintenance_type = 'Preventiva'
         LIMIT 1
        ),
        '⚠️ SEM PLANO PREVENTIVO'
    ) AS "Preventiva (Interna)",

    -- 2. Frequência Preditiva (Regra Fixa: Industrial = Anual Nov)
    CASE
        WHEN e.category = 'Industrial'::public.asset_category AND e.status = 'Ativo' THEN '✅ Anual (Novembro - SAMPRED)'
        ELSE '--- N/A (Predial/Inativo) ---'
    END AS "Preditiva (Externa)"

FROM public.equipments e
WHERE e.status = 'Ativo'
ORDER BY e.id ASC;
