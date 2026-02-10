
-- =============================================================================
-- AUDITORIA DE GAPS DE PLANEJAMENTO 2026
-- Lista ativos INDUSTRIAIS ATIVOS que não possuem nenhuma O.S. futura em 2026.
-- =============================================================================

SELECT 
    e.id AS "Ativo",
    e.name AS "Descrição",
    e.location AS "Localização",
    e.type_id AS "Tipo Cadastrado"
FROM public.equipments e
LEFT JOIN public.work_orders wo 
    ON e.id = wo.equipment_id 
    AND EXTRACT(YEAR FROM wo.scheduled_date) = 2026
    AND wo.status != 'Cancelado'
WHERE 
    e.status = 'Ativo' 
    AND e.category = 'Industrial'
    AND wo.id IS NULL -- Onde não encontrou OS
ORDER BY e.type_id, e.id;
