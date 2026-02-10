
-- =============================================================================
-- CORREÇÃO DE SEQUÊNCIA DE IDs (O "FIM DO MISTÉRIO 470")
-- =============================================================================

BEGIN;

-- 1. Força a sequência 'work_orders_id_seq' a reiniciar baseada no MAIOR ID existente.
-- Isso garante que, se o maior ID é 470, o próximo será 471.
-- Se você quiser "compactar" (fazer a próxima ser 363), isso exigiria reescrever IDs existentes,
-- o que é perigoso para integridade. O melhor é aceitar que "senhas foram rasgadas" e seguir daqui.

DO $$
DECLARE
    max_id INT;
BEGIN
    -- Descobre o maior ID numérico atual na tabela work_orders
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) 
    INTO max_id 
    FROM public.work_orders;
    
    -- Ajusta a sequência para começar de (max_id + 1)
    PERFORM setval('work_orders_id_seq', max_id);
    
    RAISE NOTICE 'Sequência ajustada. Próxima O.S. será a de número: %', (max_id + 1);
END $$;

COMMIT;

SELECT 'Sequência de O.S. sincronizada com o banco de dados.';
