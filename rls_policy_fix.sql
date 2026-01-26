-- SCRIPT FINAL PARA CORRIGIR AS POLÍTICAS DE SEGURANÇA (RLS) - v2
-- Motivo: As regras atuais estão bloqueando o acesso aos dados, causando o erro "violated row-level security policy"
-- e impedindo que o cronograma seja exibido e que as O.S. sejam deletadas.
-- Correção: Ajustado o nome da coluna de 'polname' para 'policyname' para compatibilidade com a versão do PostgreSQL.

BEGIN; -- Inicia uma transação segura.

-- --- Tabela Principal: work_orders ---

-- Passo 1: Remover TODAS as políticas existentes na tabela 'work_orders' para limpar o ambiente.
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    -- CORREÇÃO: A coluna correta em pg_policies é 'policyname'.
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'work_orders' AND schemaname = 'public')
    LOOP
        RAISE NOTICE 'Removendo política da tabela work_orders: %', policy_name;
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON public.work_orders;';
    END LOOP;
END;
$$;

-- Passo 2: Habilitar RLS na tabela principal e forçar a sua aplicação.
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders FORCE ROW LEVEL SECURITY;

-- Passo 3: Criar uma política permissiva que permite a todos os usuários autenticados
-- ver e modificar todos os dados. Isso resolve o bloqueio imediamente.
CREATE POLICY "Permitir acesso total para usuários autenticados"
ON public.work_orders
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- --- Tabela de Histórico (se existir): work_orders_history ---
-- Supabase pode criar esta tabela para auditoria. Vamos aplicar as mesmas permissões por segurança.

-- Passo 4: Se a tabela de histórico existir, aplicar as mesmas correções nela.
DO $$
DECLARE
    history_table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'work_orders_history'
    ) INTO history_table_exists;

    IF history_table_exists THEN
        RAISE NOTICE 'Tabela work_orders_history encontrada. Redefinindo políticas...';

        -- Remover políticas existentes
        DO
        $do_inner$
        DECLARE
            policy_name TEXT;
        BEGIN
            -- CORREÇÃO: A coluna correta em pg_policies é 'policyname'.
            FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'work_orders_history' AND schemaname = 'public')
            LOOP
                EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON public.work_orders_history;';
            END LOOP;
        END;
        $do_inner$;

        -- Habilitar RLS
        ALTER TABLE public.work_orders_history ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.work_orders_history FORCE ROW LEVEL SECURITY;

        -- Criar nova política permissiva
        CREATE POLICY "Permitir acesso total para usuários autenticados no histórico"
        ON public.work_orders_history
        FOR ALL
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
    ELSE
        RAISE NOTICE 'Tabela work_orders_history não encontrada. Nenhuma ação necessária para ela.';
    END IF;
END;
$$;

COMMIT; -- Confirma as alterações.

SELECT 'Políticas de segurança foram redefinidas. O cronograma e as operações manuais devem funcionar agora. Por favor, atualize a aplicação.';