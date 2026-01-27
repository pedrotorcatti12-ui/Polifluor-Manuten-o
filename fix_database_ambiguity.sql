-- SCRIPT PARA RESOLVER ERRO DE AMBIGUIDADE: "more than one relationship was found"
-- Objetivo: Remover todas as chaves estrangeiras (FKs) entre 'work_orders' e 'equipments'
-- e recriar apenas a correta, eliminando a ambiguidade para o Supabase/PostgREST.

BEGIN; -- Inicia uma transação segura.

-- Passo 1: Remover a FK nomeada padrão (se ela existir).
-- O nome 'work_orders_equipment_id_fkey' é o padrão do Supabase para esta relação.
ALTER TABLE public.work_orders
DROP CONSTRAINT IF EXISTS work_orders_equipment_id_fkey;

-- Passo 2: Procurar e remover QUALQUER OUTRA FK entre essas duas tabelas.
-- Este passo é crucial para eliminar a FK "fantasma" ou com nome inesperado.
-- Usamos uma query dinâmica para encontrar e dropar qualquer constraint que tenha sobrado.
DO $$
DECLARE
    fk_name TEXT;
BEGIN
    FOR fk_name IN (
        SELECT conname
        FROM pg_constraint
        WHERE contype = 'f'
          AND conrelid = 'public.work_orders'::regclass
          AND confrelid = 'public.equipments'::regclass
    )
    LOOP
        RAISE NOTICE 'Removendo constraint ambígua encontrada: %', fk_name;
        EXECUTE 'ALTER TABLE public.work_orders DROP CONSTRAINT ' || quote_ident(fk_name);
    END LOOP;
END;
$$;


-- Passo 3: Recriar a ÚNICA chave estrangeira correta.
-- Isso garante que a relação seja explícita e única.
ALTER TABLE public.work_orders
ADD CONSTRAINT work_orders_equipment_id_fkey
FOREIGN KEY (equipment_id) REFERENCES public.equipments(id);

COMMIT; -- Confirma as alterações.

SELECT 'Correção de ambiguidade concluída. A criação de O.S. deve funcionar agora.';