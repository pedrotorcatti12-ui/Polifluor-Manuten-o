-- SCRIPT PARA CORRIGIR O ERRO: "Could not find the 'downtimeNotes' column"
-- Causa: O frontend envia o campo "downtimeNotes", mas a coluna correspondente
-- ("downtime_notes") não existe na tabela "work_orders".

-- Ação: Adicionar a coluna que está faltando.
-- O "IF NOT EXISTS" garante que o comando seja seguro de executar múltiplas vezes.

ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS downtime_notes TEXT;

SELECT 'Coluna "downtime_notes" adicionada com sucesso. A criação de O.S. Corretivas está liberada.';