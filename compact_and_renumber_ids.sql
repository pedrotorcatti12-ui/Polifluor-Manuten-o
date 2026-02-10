
-- =============================================================================
-- FUNÇÃO DE RENUMERAÇÃO TOTAL (ORGANIZAÇÃO CRONOLÓGICA)
-- Nome: compact_work_order_ids
-- Objetivo: Renumerar todas as O.S. de 0001 até N, seguindo a ordem de data.
-- =============================================================================

CREATE OR REPLACE FUNCTION compact_work_order_ids()
RETURNS text AS $$
DECLARE
    max_id INT;
BEGIN
    -- 1. Cria tabela temporária de mapeamento: ID Antigo -> Novo ID
    -- A lógica é: Ordenar por Data Agendada (Antigas primeiro).
    CREATE TEMP TABLE id_map AS
    SELECT
        id AS old_id,
        to_char(ROW_NUMBER() OVER (ORDER BY scheduled_date ASC, id ASC), 'FM0000') AS new_id
    FROM public.work_orders;

    -- 2. Remove temporariamente a trava de segurança (Foreign Key) do estoque
    ALTER TABLE public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_work_order_id_fkey;

    -- 3. Atualiza os filhos (Movimentações de Estoque) com os Novos IDs
    UPDATE public.stock_movements sm
    SET work_order_id = im.new_id
    FROM id_map im
    WHERE sm.work_order_id = im.old_id;

    -- 4. Atualiza os pais (Ordens de Serviço)
    -- Truque para não dar erro de "ID duplicado" durante a troca:
    -- Passo A: Adiciona um prefixo temporário 'TEMP-' em tudo.
    UPDATE public.work_orders SET id = 'TEMP-' || id;

    -- Passo B: Atualiza para o ID final correto usando o mapa.
    UPDATE public.work_orders wo
    SET id = im.new_id
    FROM id_map im
    WHERE wo.id = 'TEMP-' || im.old_id;

    -- 5. Restaura a trava de segurança do estoque
    ALTER TABLE public.stock_movements
    ADD CONSTRAINT stock_movements_work_order_id_fkey
    FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE SET NULL;

    -- 6. Reseta o gerador automático de números para o próximo disponível
    SELECT count(*)::int INTO max_id FROM public.work_orders;
    
    -- Se a sequence não existir, cria.
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'work_orders_id_seq') THEN
        CREATE SEQUENCE work_orders_id_seq;
    END IF;
    
    PERFORM setval('work_orders_id_seq', max_id);

    -- Limpeza
    DROP TABLE id_map;

    RETURN 'Sucesso! Numeração reorganizada de #0001 até #' || to_char(max_id, 'FM0000');
END;
$$ LANGUAGE plpgsql;
