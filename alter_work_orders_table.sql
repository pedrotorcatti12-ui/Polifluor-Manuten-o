-- SCRIPT PARA CORRIGIR O BANCO DE DADOS E PERMITIR O CADASTRO DE O.S. CORRETIVAS
-- Motivo: A aplicação tenta salvar a categoria da falha (Mecânica, Elétrica, etc.),
-- mas a coluna para armazenar essa informação não existe na tabela 'work_orders'.

-- Instrução: Copie e execute este comando no seu "SQL Editor" dentro do Supabase.

ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS corrective_category TEXT;

-- O "IF NOT EXISTS" garante que o comando não dará erro se a coluna já tiver sido criada.
-- O tipo TEXT é usado para armazenar os valores do Enum ('Mecânica', 'Elétrica', ...).

SELECT 'Coluna "corrective_category" adicionada com sucesso à tabela work_orders. A aplicação agora pode salvar as O.S. Corretivas.';