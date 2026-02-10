
-- =============================================================================
-- RELATÓRIO DE VALIDAÇÃO: PREDITIVAS DE NOVEMBRO 2026
-- Objetivo: Confirmar que todas as máquinas industriais têm agendamento para o mês 11.
-- =============================================================================

SELECT 
    wo.id AS "Nº O.S.",
    wo.equipment_id AS "Equipamento",
    eq.name AS "Descrição do Ativo",
    TO_CHAR(wo.scheduled_date, 'DD/MM/YYYY HH24:MI') AS "Data Programada",
    wo.status AS "Status"
FROM public.work_orders wo
JOIN public.equipments eq ON wo.equipment_id = eq.id
WHERE 
    wo.type = 'Preditiva'
    AND EXTRACT(MONTH FROM wo.scheduled_date) = 11 -- Filtra apenas NOVEMBRO
    AND EXTRACT(YEAR FROM wo.scheduled_date) = 2026
ORDER BY 
    wo.equipment_id ASC;

-- RESUMO TOTAL POR MÊS (Para confirmar os 4 ciclos)
SELECT 
    TO_CHAR(scheduled_date, 'Month') as "Mês",
    COUNT(*) as "Total de Máquinas"
FROM public.work_orders
WHERE type = 'Preditiva' AND EXTRACT(YEAR FROM scheduled_date) = 2026
GROUP BY EXTRACT(MONTH FROM scheduled_date), TO_CHAR(scheduled_date, 'Month')
ORDER BY EXTRACT(MONTH FROM scheduled_date);
