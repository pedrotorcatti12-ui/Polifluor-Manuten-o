-- SCRIPT PARA POPULAR OS ALVOS DOS PLANOS DE MANUTENÇÃO
-- Objetivo: Atualizar a tabela 'maintenance_plans' para que cada plano contenha
-- a lista de equipamentos aos quais ele se aplica.

-- Passo 1: Limpar a lista de alvos existente para garantir que não haja duplicatas.
UPDATE public.maintenance_plans
SET target_equipment_ids = '{}';

-- Passo 2: Para cada plano, encontrar todos os equipamentos do tipo correspondente
-- e agregar seus IDs em um array, salvando no campo 'target_equipment_ids'.
UPDATE public.maintenance_plans p
SET target_equipment_ids = sub.equipment_ids
FROM (
    SELECT 
        mp.id AS plan_id,
        array_agg(e.id) AS equipment_ids
    FROM 
        public.maintenance_plans mp
    JOIN 
        public.equipments e ON e.type_id = mp.equipment_type_id
    GROUP BY 
        mp.id
) AS sub
WHERE p.id = sub.plan_id;

SELECT 'Alvos dos planos de manutenção populados com sucesso! Execute o script de geração de O.S. novamente.';