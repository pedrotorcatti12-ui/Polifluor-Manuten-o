
-- =============================================================================
-- SCRIPT DE NIVELAMENTO E REPROGRAMAÇÃO - JANEIRO -> FEVEREIRO 2026
-- Objetivo: Mover preventivas não executadas de Jan para Fev, distribuindo a carga.
-- =============================================================================

BEGIN;

-- 1. Cria uma tabela temporária com as O.S. pendentes de Janeiro
CREATE TEMP TABLE temp_backlog AS
SELECT id, ROW_NUMBER() OVER (ORDER BY equipment_id) as row_num
FROM public.work_orders
WHERE 
    type = 'Preventiva' 
    AND status = 'Programado'
    AND scheduled_date >= '2026-01-01' AND scheduled_date <= '2026-01-31';

-- 2. Atualiza as datas distribuindo nas 4 sextas-feiras de Fevereiro (06, 13, 20, 27)
-- A lógica (row_num % 4) divide a carga em 4 grupos iguais.

-- GRUPO 1: Vai para 06/02/2026
UPDATE public.work_orders
SET 
    scheduled_date = '2026-02-06 08:00:00',
    observations = COALESCE(observations, '') || ' [BACKLOG JAN/26 - SEMANA 1]'
WHERE id IN (SELECT id FROM temp_backlog WHERE row_num % 4 = 0);

-- GRUPO 2: Vai para 13/02/2026
UPDATE public.work_orders
SET 
    scheduled_date = '2026-02-13 08:00:00',
    observations = COALESCE(observations, '') || ' [BACKLOG JAN/26 - SEMANA 2]'
WHERE id IN (SELECT id FROM temp_backlog WHERE row_num % 4 = 1);

-- GRUPO 3: Vai para 20/02/2026
UPDATE public.work_orders
SET 
    scheduled_date = '2026-02-20 08:00:00',
    observations = COALESCE(observations, '') || ' [BACKLOG JAN/26 - SEMANA 3]'
WHERE id IN (SELECT id FROM temp_backlog WHERE row_num % 4 = 2);

-- GRUPO 4: Vai para 27/02/2026
UPDATE public.work_orders
SET 
    scheduled_date = '2026-02-27 08:00:00',
    observations = COALESCE(observations, '') || ' [BACKLOG JAN/26 - SEMANA 4]'
WHERE id IN (SELECT id FROM temp_backlog WHERE row_num % 4 = 3);

-- Limpeza
DROP TABLE temp_backlog;

COMMIT;

SELECT 'Backlog de Janeiro reprogramado e nivelado para Fevereiro com sucesso!';
