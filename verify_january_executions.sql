
-- Verifica se sobrou alguma O.S. Executada em Janeiro/2026
SELECT id, equipment_id, status, scheduled_date 
FROM public.work_orders 
WHERE status = 'Executado' 
AND scheduled_date BETWEEN '2026-01-01' AND '2026-01-31';
