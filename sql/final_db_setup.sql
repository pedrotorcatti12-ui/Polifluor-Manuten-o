
-- ============================================================================
-- SGMI 2.0 - SCRIPT DE ESTRUTURAÇÃO TOTAL (SUPABASE)
-- Execute este script no SQL Editor para garantir compatibilidade total.
-- ============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CRIAÇÃO DE TABELAS NOVAS (MÓDULOS NOVOS)

-- Tabela de Tipos de Equipamento (Para padronização)
CREATE TABLE IF NOT EXISTS equipment_types (
    id TEXT PRIMARY KEY, -- Ex: 'TORNO_CNC', 'PRENSA'
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Planos de Manutenção (Estratégias em Massa)
CREATE TABLE IF NOT EXISTS maintenance_plans (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL, -- Ex: 'Preventiva Trimestral Prensas'
    equipment_type_id TEXT REFERENCES equipment_types(id),
    target_equipment_ids TEXT[], -- Array de IDs dos equipamentos vinculados
    frequency INTEGER, -- Em meses
    maintenance_type TEXT, -- Preventiva, Preditiva, etc.
    default_maintainer TEXT,
    start_month TEXT,
    tasks JSONB DEFAULT '[]'::jsonb, -- Lista de tarefas (checklist padrão)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATUALIZAÇÃO/CRIAÇÃO DAS TABELAS PRINCIPAIS

-- Equipamentos (Garantindo colunas JSONB para o Cronograma)
CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    category TEXT DEFAULT 'Industrial',
    is_critical BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Ativo',
    manufacturer TEXT,
    model TEXT,
    year_of_manufacture TEXT,
    schedule JSONB DEFAULT '[]'::jsonb, -- Cache visual
    custom_plan_id TEXT REFERENCES maintenance_plans(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estoque (Padronizado como spare_parts)
CREATE TABLE IF NOT EXISTS spare_parts (
    id TEXT PRIMARY KEY, -- Código da peça
    name TEXT NOT NULL,
    location TEXT,
    unit TEXT DEFAULT 'UN',
    cost DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    current_stock DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ordens de Serviço (Coração do Sistema)
CREATE TABLE IF NOT EXISTS work_orders (
    id TEXT PRIMARY KEY,
    equipment_id TEXT REFERENCES equipment(id),
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT DEFAULT 'Média',
    scheduled_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    description TEXT,
    requester TEXT,
    machine_stopped BOOLEAN DEFAULT false,
    
    -- Campos JSONB Críticos para o Frontend
    checklist JSONB DEFAULT '[]'::jsonb,
    materials_used JSONB DEFAULT '[]'::jsonb, -- [{"partId": "X", "quantity": 1}]
    man_hours JSONB DEFAULT '[]'::jsonb,
    purchase_requests JSONB DEFAULT '[]'::jsonb,
    
    observations TEXT,
    root_cause TEXT,
    corrective_category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de Movimentação (Log de Estoque)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id TEXT REFERENCES spare_parts(id),
    quantity DECIMAL(10,2),
    type TEXT CHECK (type IN ('Entrada', 'Saída', 'Ajuste')),
    reason TEXT,
    user_name TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    work_order_id TEXT REFERENCES work_orders(id)
);

-- 4. AUTOMAÇÃO: TRIGGER DE BAIXA DE ESTOQUE
-- Desconta peças automaticamente quando a O.S. vai para 'Executado'

CREATE OR REPLACE FUNCTION fn_baixa_estoque_automatica()
RETURNS TRIGGER AS $$
DECLARE
    item jsonb;
    qtd numeric;
    peca_id text;
BEGIN
    -- Só executa se mudou para 'Executado' e antes não estava
    IF NEW.status = 'Executado' AND OLD.status != 'Executado' THEN
        
        -- Loop pelos materiais usados
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.materials_used)
        LOOP
            peca_id := item->>'partId';
            qtd := (item->>'quantity')::numeric;

            -- 1. Baixa no Saldo
            UPDATE spare_parts 
            SET current_stock = current_stock - qtd 
            WHERE id = peca_id;

            -- 2. Gera Log
            INSERT INTO stock_movements (part_id, quantity, type, reason, user_name, work_order_id)
            VALUES (peca_id, qtd, 'Saída', 'Consumo Automático via O.S.', NEW.requester, NEW.id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove trigger antigo se existir para recriar
DROP TRIGGER IF EXISTS tr_baixa_estoque ON work_orders;

CREATE TRIGGER tr_baixa_estoque
AFTER UPDATE ON work_orders
FOR EACH ROW
EXECUTE FUNCTION fn_baixa_estoque_automatica();

-- 5. SEGURANÇA (RLS - Opcional, libera acesso total para facilitar uso inicial)
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Equipamentos" ON equipment FOR ALL USING (true);

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total OS" ON work_orders FOR ALL USING (true);

ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Estoque" ON spare_parts FOR ALL USING (true);
