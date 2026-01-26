-- SCRIPT PARA CORRIGIR ERRO AO SALVAR EQUIPAMENTOS
-- Causa: A aplicação tenta salvar o campo 'customerSpecificRequirements',
-- mas a coluna correspondente 'customer_specific_requirements' não existe na tabela 'equipments'.

-- Ação: Adicionar a coluna que está faltando.
-- O "IF NOT EXISTS" garante que o comando seja seguro de executar múltiplas vezes.

ALTER TABLE public.equipments
ADD COLUMN IF NOT EXISTS customer_specific_requirements TEXT;

SELECT 'Coluna "customer_specific_requirements" adicionada com sucesso. O salvamento de Ativos agora deve funcionar corretamente.';