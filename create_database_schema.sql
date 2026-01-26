-- =============================================================================
-- SCRIPT MESTRE DE CRIAÇÃO DO BANCO DE DADOS - SGMI 2.0
-- Autor: Auditoria de Software
-- Versão: 2.3 (IDs TEXT para Planos e Tipos)
-- =============================================================================

-- Habilita extensão para gerar UUIDs (ainda útil para outras tabelas)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LIMPEZA SEGURA (TEARDOWN)
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.work_orders CASCADE;
DROP TABLE IF EXISTS public.equipments CASCADE;
DROP TABLE IF EXISTS public.maintenance_plans CASCADE;
DROP TABLE IF EXISTS public.spare_parts CASCADE;
DROP TABLE IF EXISTS public.maintainers CASCADE;
DROP TABLE IF EXISTS public.requesters CASCADE;
DROP TABLE IF EXISTS public.equipment_types CASCADE;

-- Remove funções residuais
DROP FUNCTION IF EXISTS handle_stock_deduction_on_wo_completion();
DROP FUNCTION IF EXISTS generate_preventive_orders_for_2026();
DROP FUNCTION IF EXISTS truncate_table(text);
DROP FUNCTION IF EXISTS auto_classify_equipments();
DROP FUNCTION IF EXISTS refresh_plan_targets();

-- Remove tipos (enums)
DROP TYPE IF EXISTS public.maintenance_status CASCADE;
DROP TYPE IF EXISTS public.maintenance_type CASCADE;
DROP TYPE IF EXISTS public.asset_category CASCADE;

-- 2. CRIAÇÃO DE TIPOS (ENUMS)
CREATE TYPE public.maintenance_status AS ENUM (
    'Programado', 
    'Executado', 
    'Atrasado', 
    'Em Campo', 
    'Aguardando Peças', 
    'Desativado', 
    'Nenhum'
);

CREATE TYPE public.maintenance_type AS ENUM (
    'Preventiva', 
    'Corretiva', 
    'Preditiva', 
    'Revisão Periódica', 
    'Predial', 
    'Melhoria', 
    'Overhaul'
);

CREATE TYPE public.asset_category AS ENUM (
    'Industrial', 
    'Predial/Utilitário'
);

-- 3. CRIAÇÃO DAS TABELAS

-- 3.1 Tipos de Equipamento
CREATE TABLE public.equipment_types (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL
);

-- 3.2 Mantenedores
CREATE TABLE public.maintainers (
    name TEXT PRIMARY KEY
);

-- 3.3 Solicitantes
CREATE TABLE public.requesters (
    name TEXT PRIMARY KEY
);

-- 3.4 Peças de Reposição
CREATE TABLE public.spare_parts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    unit TEXT,
    cost NUMERIC DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0
);

-- 3.5 Planos de Manutenção
-- ID Text para suportar códigos personalizados. Checklist está dentro de 'tasks' (JSONB).
CREATE TABLE public.maintenance_plans (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    equipment_type_id TEXT REFERENCES public.equipment_types(id) ON UPDATE CASCADE,
    frequency INTEGER NOT NULL,
    tasks JSONB DEFAULT '[]'::jsonb, -- AQUI ESTÁ O CHECKLIST DE MANUTENÇÃO
    target_equipment_ids TEXT[] DEFAULT '{}',
    maintenance_type TEXT,
    start_month TEXT
);

-- 3.6 Equipamentos
CREATE TABLE public.equipments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type_id TEXT REFERENCES public.equipment_types(id) ON UPDATE CASCADE,
    location TEXT,
    category public.asset_category DEFAULT 'Industrial',
    status TEXT DEFAULT 'Ativo',
    model TEXT,
    manufacturer TEXT,
    year_of_manufacture TEXT,
    is_critical BOOLEAN DEFAULT false,
    preservation_notes TEXT,
    customer_specific_requirements TEXT,
    custom_plan_id TEXT REFERENCES public.maintenance_plans(id)
);

-- 3.7 Ordens de Serviço
CREATE TABLE public.work_orders (
    id TEXT PRIMARY KEY,
    equipment_id TEXT REFERENCES public.equipments(id) ON UPDATE CASCADE ON DELETE CASCADE,
    type public.maintenance_type NOT NULL,
    status public.maintenance_status DEFAULT 'Programado',
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    observations TEXT,
    plan_id TEXT REFERENCES public.maintenance_plans(id),
    requester TEXT,
    root_cause TEXT,
    corrective_category TEXT,
    machine_stopped BOOLEAN DEFAULT false,
    man_hours JSONB DEFAULT '[]'::jsonb,
    materials_used JSONB DEFAULT '[]'::jsonb,
    purchase_requests JSONB DEFAULT '[]'::jsonb,
    misc_notes TEXT,
    report_pdf_base64 TEXT,
    is_prepared BOOLEAN DEFAULT false
);

-- 3.8 Movimentações de Estoque
CREATE TABLE public.stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    part_id TEXT REFERENCES public.spare_parts(id) ON UPDATE CASCADE,
    part_name TEXT,
    type TEXT CHECK (type IN ('Entrada', 'Saída', 'Ajuste')),
    quantity INTEGER NOT NULL,
    reason TEXT,
    "user" TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    work_order_id TEXT REFERENCES public.work_orders(id) ON DELETE SET NULL
);

-- 4. SEGURANÇA (RLS)
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access Types" ON public.equipment_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Maintainers" ON public.maintainers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Requesters" ON public.requesters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Parts" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Plans" ON public.maintenance_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Equipments" ON public.equipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access WorkOrders" ON public.work_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Movements" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);

-- 5. AUTOMAÇÃO (FUNÇÕES E TRIGGERS)

-- 5.1 Trigger: Baixa de Estoque
CREATE OR REPLACE FUNCTION handle_stock_deduction_on_wo_completion()
RETURNS TRIGGER AS $$
DECLARE
    material RECORD;
    part_name_var TEXT;
BEGIN
    IF NEW.status = 'Executado' AND (OLD.status IS DISTINCT FROM 'Executado') THEN
        IF NEW.materials_used IS NOT NULL AND jsonb_array_length(NEW.materials_used) > 0 THEN
            FOR material IN SELECT * FROM jsonb_to_recordset(NEW.materials_used) AS x(partId text, quantity int)
            LOOP
                UPDATE public.spare_parts
                SET current_stock = current_stock - material.quantity
                WHERE id = material.partId
                RETURNING name INTO part_name_var;

                IF part_name_var IS NOT NULL THEN
                    INSERT INTO public.stock_movements (part_id, part_name, type, quantity, reason, "user", work_order_id)
                    VALUES (material.partId, part_name_var, 'Saída', material.quantity, 'Consumo O.S. #' || NEW.id, 'Sistema', NEW.id);
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_deduct_stock_on_completion
AFTER UPDATE ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION handle_stock_deduction_on_wo_completion();

-- 5.2 Função: Gerar Cronograma 2026
CREATE OR REPLACE FUNCTION generate_preventive_orders_for_2026()
RETURNS text AS $$
DECLARE
    plan_record RECORD;
    equipment_record RECORD;
    month_index INT;
    start_month_index INT;
    next_os_number INT;
    schedule_date TIMESTAMP;
    month_map TEXT[] := ARRAY['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
BEGIN
    DELETE FROM public.work_orders 
    WHERE type = 'Preventiva' 
      AND EXTRACT(YEAR FROM scheduled_date) = 2026
      AND status = 'Programado';

    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_os_number FROM public.work_orders;

    FOR plan_record IN SELECT * FROM public.maintenance_plans LOOP
        SELECT array_position(month_map, plan_record.start_month) - 1 INTO start_month_index;
        IF start_month_index IS NULL THEN CONTINUE; END IF;

        FOR month_index IN start_month_index..11 BY plan_record.frequency LOOP
            schedule_date := make_timestamp(2026, month_index + 1, 15, 8, 0, 0);

            IF plan_record.target_equipment_ids IS NOT NULL THEN
                FOREACH equipment_record IN ARRAY plan_record.target_equipment_ids LOOP
                    -- Verifica se o equipamento existe antes de criar a OS
                    IF EXISTS (SELECT 1 FROM public.equipments WHERE id = equipment_record) THEN
                        INSERT INTO public.work_orders (
                            id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id
                        ) VALUES (
                            to_char(next_os_number, 'FM0000'),
                            equipment_record,
                            'Preventiva',
                            'Programado',
                            schedule_date,
                            plan_record.description,
                            plan_record.tasks,
                            'Cronograma Automático',
                            plan_record.id
                        );
                        next_os_number := next_os_number + 1;
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
    RETURN 'Cronograma 2026 gerado com sucesso.';
END;
$$ LANGUAGE plpgsql;

-- 5.3 Função: Limpar Tabela
CREATE OR REPLACE FUNCTION truncate_table(table_name text)
RETURNS void AS $$
BEGIN
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name) || ' CASCADE';
END;
$$ LANGUAGE plpgsql;

-- 6. DADOS MÍNIMOS
INSERT INTO public.maintainers (name) VALUES ('Admin') ON CONFLICT DO NOTHING;
INSERT INTO public.requesters (name) VALUES ('Manutenção') ON CONFLICT DO NOTHING;

SELECT 'Schema (v2.3) recriado com sucesso! IDs ajustados para TEXT. Tabelas prontas para carga.';