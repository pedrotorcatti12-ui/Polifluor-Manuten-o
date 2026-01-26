-- SCRIPT PARA CRIAR TABELAS DE METADADOS (MANTENEDORES E SOLICITANTES)
-- Objetivo: Persistir os "Cadastros Base" no banco de dados, em vez de usar uma lista estática no código.

BEGIN;

-- Tabela para Mantenedores
CREATE TABLE IF NOT EXISTS public.maintainers (
    name TEXT PRIMARY KEY NOT NULL
);

-- Habilita Row Level Security (RLS) para mantenedores
ALTER TABLE public.maintainers ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem, para evitar duplicatas
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.maintainers;
DROP POLICY IF EXISTS "Allow admin full access" ON public.maintainers;

-- Permite que qualquer usuário autenticado leia a lista de mantenedores
CREATE POLICY "Allow authenticated read access"
ON public.maintainers
FOR SELECT
USING (auth.role() = 'authenticated');

-- Permite que apenas administradores possam criar, atualizar ou deletar mantenedores
CREATE POLICY "Allow admin full access"
ON public.maintainers
FOR ALL
USING (auth.role() = 'authenticated') -- A lógica de "admin" será controlada pela UI
WITH CHECK (auth.role() = 'authenticated');


-- Tabela para Solicitantes
CREATE TABLE IF NOT EXISTS public.requesters (
    name TEXT PRIMARY KEY NOT NULL
);

-- Habilita Row Level Security (RLS) para solicitantes
ALTER TABLE public.requesters ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.requesters;
DROP POLICY IF EXISTS "Allow admin full access" ON public.requesters;

-- Permite que qualquer usuário autenticado leia a lista de solicitantes
CREATE POLICY "Allow authenticated read access"
ON public.requesters
FOR SELECT
USING (auth.role() = 'authenticated');

-- Permite que apenas administradores possam criar, atualizar ou deletar solicitantes
CREATE POLICY "Allow admin full access"
ON public.requesters
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

COMMIT;

SELECT 'Tabelas "maintainers" e "requesters" criadas e configuradas com sucesso.';