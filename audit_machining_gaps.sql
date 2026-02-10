
-- =============================================================================
-- AUDITORIA USINAGEM: QUEM ESTÁ SEM PLANO EM 2026?
-- Foco: Tornos, Fresadoras, Centros de Usinagem, Retíficas, Serras.
-- =============================================================================

SELECT 
    e.id AS "Código",
    e.name AS "Máquina",
    e.location AS "Localização",
    e.status AS "Status Atual"
FROM public.equipments e
LEFT JOIN public.work_orders wo 
    ON e.id = wo.equipment_id 
    AND EXTRACT(YEAR FROM wo.scheduled_date) = 2026
WHERE 
    e.status = 'Ativo' -- Só queremos saber das ativas
    AND (
        e.name LIKE '%TORNO%' OR 
        e.name LIKE '%FRESADORA%' OR 
        e.name LIKE '%ROUTER%' OR 
        e.name LIKE '%CENTRO%' OR
        e.name LIKE '%RETÍFICA%' OR
        e.name LIKE '%RETIFICA%' OR
        e.name LIKE '%SERRA%' OR
        e.name LIKE '%PLAINA%'
    )
    AND wo.id IS NULL -- Onde NÃO existe O.S. vinculada
ORDER BY e.name, e.id;
