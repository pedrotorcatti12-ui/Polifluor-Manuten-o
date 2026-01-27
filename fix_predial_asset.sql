-- SCRIPT PARA CORRIGIR ERRO DE 'FOREIGN KEY' AO CRIAR O.S. PREDIAIS
-- Motivo: A aplicação estava criando um ID de equipamento inválido (ex: "PREDIAL: Banheiro")
-- que não existe na tabela 'equipments', violando a integridade do banco de dados.

-- Solução: Criar um único ativo genérico para centralizar todas as O.S. Prediais.

-- Passo 1: Garante que o tipo de equipamento 'PREDIAL' exista.
INSERT INTO public.equipment_types (id, description)
VALUES ('PREDIAL', 'Predial/Utilitário')
ON CONFLICT (id) DO NOTHING;

-- Passo 2: Insere o ativo genérico que será usado como 'placeholder'.
-- Todas as O.S. prediais serão vinculadas a este ID, e a localização específica
-- (ex: Telhado, Banheiro) será informada na descrição da O.S.
INSERT INTO public.equipments (id, name, type_id, category, status, is_critical)
VALUES ('ATIVO_PREDIAL_GENERICO', 'Ativo Predial Genérico', 'PREDIAL', 'Predial/Utilitário', 'Ativo', false)
ON CONFLICT (id) DO NOTHING;

SELECT 'Ativo genérico para manutenção predial criado com sucesso. A aplicação foi corrigida para usá-lo.';