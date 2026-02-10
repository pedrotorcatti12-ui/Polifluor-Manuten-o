
-- =============================================================================
-- RELATÓRIO DE AUDITORIA: STATUS DOS CHECKLISTS (O QUE FALTA FAZER?)
-- =============================================================================

-- PARTE 1: MÁQUINAS SEM CHECKLIST (PRIORIDADE ALTA)
-- Estas máquinas não têm plano vinculado ou o plano está vazio.
SELECT 
    e.id AS "Cód. Ativo",
    e.name AS "Nome do Equipamento",
    e.type_id AS "Família/Tipo",
    '🔴 SEM PLANO/CHECKLIST' AS "Status"
FROM public.equipments e
WHERE e.status = 'Ativo'
AND NOT EXISTS (
    SELECT 1 FROM public.maintenance_plans mp 
    WHERE e.id = ANY(mp.target_equipment_ids)
    AND jsonb_array_length(mp.tasks) > 0
)
ORDER BY e.type_id, e.id;


-- PARTE 2: A BÍBLIA DOS CHECKLISTS (O QUE O SISTEMA JÁ SABE)
-- Lista detalhada de cada tarefa para cada máquina configurada.
SELECT 
    e.id AS "Ativo",
    mp.description AS "Plano Vinculado",
    task.value->>'action' AS "Tarefa do Checklist"
FROM public.equipments e
JOIN public.maintenance_plans mp ON e.id = ANY(mp.target_equipment_ids)
CROSS JOIN jsonb_array_elements(mp.tasks) AS task
WHERE e.status = 'Ativo'
ORDER BY e.id, mp.id;
