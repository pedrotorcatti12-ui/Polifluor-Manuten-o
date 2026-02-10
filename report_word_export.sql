
-- =============================================================================
-- EXPORTAÇÃO PARA WORD / EXCEL
-- Roda este script e copia o resultado da tabela abaixo.
-- =============================================================================

SELECT 
    UPPER(et.description) AS "FAMÍLIA / TIPO",
    e.name AS "EQUIPAMENTO",
    e.id AS "TAG",
    mp.description AS "NOME DO PLANO",
    (
        SELECT string_agg(CONCAT('[ ] ', task->>'action'), E'\n')
        FROM jsonb_array_elements(mp.tasks) AS task
    ) AS "CHECKLIST DE TAREFAS (COPIAR)"
FROM public.equipments e
JOIN public.maintenance_plans mp ON e.id = ANY(mp.target_equipment_ids)
JOIN public.equipment_types et ON e.type_id = et.id
WHERE e.status = 'Ativo'
ORDER BY et.description, e.name;
