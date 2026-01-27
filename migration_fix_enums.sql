-- SCRIPT DE MIGRAÇÃO (ESTRATÉGIA DE RENOVAÇÃO DE COLUNA)
-- Motivo do erro anterior: O nome da coluna da chave estrangeira estava incorreto (camelCase vs snake_case).
-- Estratégia: Mantém a abordagem robusta de renovação de coluna, mas com os nomes de coluna e constraint corrigidos.

BEGIN; -- Inicia uma transação.

-- 1. Desabilita RLS e triggers de usuário.
ALTER TABLE public.work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders DISABLE TRIGGER USER;

-- 2. Remove todas as dependências conhecidas (Views, Policies, Foreign Keys).
DROP VIEW IF EXISTS public.vw_schedule_data_2026;
DROP VIEW IF EXISTS public.vw_prioritized_work_orders;

DROP POLICY IF EXISTS "Admin_Full_Access" ON public.work_orders;
DROP POLICY IF EXISTS "Operator_Limited_Access" ON public.work_orders;

-- CORREÇÃO: Usa o nome de constraint e coluna padrão do Supabase (snake_case).
ALTER TABLE public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_work_order_id_fkey;

-- 3. Cria os tipos ENUM, se não existirem (essencial).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_type') THEN
        CREATE TYPE public.maintenance_type AS ENUM ('Preventiva', 'Preditiva', 'Corretiva', 'Revisão Geral', 'Revisão Periódica', 'Prestação de Serviços', 'Predial', 'Melhoria');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_status') THEN
        CREATE TYPE public.maintenance_status AS ENUM ('Programado', 'Em Campo', 'Executado', 'Atrasado', 'Desativado', 'Aguardando Peças', 'Nenhum');
    END IF;
END$$;

-- 4. Adiciona as novas colunas temporárias com o tipo ENUM.
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS type_new public.maintenance_type;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS status_new public.maintenance_status;

-- 5. Copia e converte os dados das colunas antigas para as novas.
UPDATE public.work_orders 
SET 
    type_new = type::text::public.maintenance_type,
    status_new = status::text::public.maintenance_status;

-- 6. Remove as colunas antigas.
ALTER TABLE public.work_orders DROP COLUMN type;
ALTER TABLE public.work_orders DROP COLUMN status;

-- 7. Renomeia as novas colunas para os nomes originais.
ALTER TABLE public.work_orders RENAME COLUMN type_new TO type;
ALTER TABLE public.work_orders RENAME COLUMN status_new TO status;

-- 8. Recria todas as dependências.

-- Chave Estrangeira (CORRIGIDA)
-- Utiliza o nome 'work_order_id' que é o padrão do Supabase para a propriedade 'workOrderId'.
ALTER TABLE public.stock_movements 
ADD CONSTRAINT stock_movements_work_order_id_fkey 
FOREIGN KEY (work_order_id) 
REFERENCES public.work_orders(id) ON DELETE SET NULL;

-- Views
CREATE OR REPLACE VIEW public.vw_schedule_data_2026 AS
SELECT
    wo.id, wo.equipment_id, wo.type, wo.status, wo.scheduled_date, wo.description,
    eq.name as equipment_name, eq.is_critical as equipment_is_critical
FROM public.work_orders wo
JOIN public.equipments eq ON wo.equipment_id = eq.id
WHERE EXTRACT(YEAR FROM wo.scheduled_date) = 2026;

CREATE OR REPLACE VIEW public.vw_prioritized_work_orders AS
SELECT 
    wo.*, eq.name as equipment_name, eq.is_critical as equipment_is_critical
FROM public.work_orders wo
LEFT JOIN public.equipments eq ON wo.equipment_id = eq.id
ORDER BY
    CASE WHEN wo.status = 'Atrasado'::public.maintenance_status THEN 1 ELSE 2 END,
    CASE WHEN eq.is_critical = true THEN 1 ELSE 2 END,
    wo.scheduled_date ASC;

-- Policies
CREATE POLICY "Admin_Full_Access"
ON public.work_orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Operator_Limited_Access"
ON public.work_orders FOR ALL
USING (true)
WITH CHECK (
    status <> 'Executado'::public.maintenance_status
);

-- 9. Reabilita RLS e triggers.
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE TRIGGER USER;

COMMIT; -- Confirma a transação.

SELECT 'MIGRAÇÃO COM ESTRATÉGIA DE RENOVAÇÃO DE COLUNA CONCLUÍDA! O nome da chave estrangeira foi corrigido.';
