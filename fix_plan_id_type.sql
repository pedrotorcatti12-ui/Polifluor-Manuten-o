-- =============================================================================
-- SCRIPT DE CORREÇÃO DE ESQUEMA (FIX UUID ERROR)
-- Execute este script ANTES de rodar 'seed_detailed_plans.sql' novamente.
-- Este script adapta o banco para aceitar IDs como 'PLAN-PH-TRIMESTRAL'
-- =============================================================================

BEGIN;

-- 1. Remove constraints temporariamente para permitir a alteração de tipo
-- Precisamos soltar as amarras (chaves estrangeiras) antes de mudar o tipo da coluna
ALTER TABLE public.work_orders DROP CONSTRAINT IF EXISTS work_orders_plan_id_fkey;
ALTER TABLE public.equipments DROP CONSTRAINT IF EXISTS equipments_custom_plan_id_fkey;

-- 2. Altera a tabela principal (maintenance_plans) de UUID para TEXT
-- A conversão USING id::text garante que se houver dados antigos, eles não sejam perdidos
ALTER TABLE public.maintenance_plans 
ALTER COLUMN id TYPE TEXT USING id::text;

-- 3. Altera as tabelas que referenciam os planos (Foreign Keys)
-- Work Orders e Equipamentos também precisam aceitar texto no campo de ID do plano
ALTER TABLE public.work_orders 
ALTER COLUMN plan_id TYPE TEXT USING plan_id::text;

ALTER TABLE public.equipments 
ALTER COLUMN custom_plan_id TYPE TEXT USING custom_plan_id::text;

-- 4. Restaura as constraints de chave estrangeira agora com tipos compatíveis
-- Reconectamos as tabelas para manter a integridade do banco
ALTER TABLE public.work_orders 
ADD CONSTRAINT work_orders_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES public.maintenance_plans(id) ON UPDATE CASCADE;

ALTER TABLE public.equipments 
ADD CONSTRAINT equipments_custom_plan_id_fkey 
FOREIGN KEY (custom_plan_id) REFERENCES public.maintenance_plans(id) ON UPDATE CASCADE;

COMMIT;

SELECT 'Esquema corrigido: Coluna ID agora é TEXT. Pode prosseguir com o arquivo seed_detailed_plans.sql.';