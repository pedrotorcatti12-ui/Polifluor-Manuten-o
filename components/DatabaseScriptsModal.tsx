
import React, { useState } from 'react';
import { CloseIcon, ClipboardListIcon, CheckCircleIcon } from './icons';

interface DatabaseScriptsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DatabaseScriptsModal: React.FC<DatabaseScriptsModalProps> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    const FINAL_SQL = `-- ============================================================================
-- SGMI 2.0 - SCRIPT DE COMPATIBILIDADE E INTEGRIDADE (SUPABASE)
-- ============================================================================

-- 1. GARANTIR EXTENSÃO
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CRIAÇÃO DE TABELAS (Caso não existam)
CREATE TABLE IF NOT EXISTS equipment_types (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_plans (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    equipment_type_id TEXT REFERENCES equipment_types(id) ON DELETE SET NULL,
    target_equipment_ids TEXT[], 
    frequency INTEGER DEFAULT 1,
    maintenance_type TEXT,
    default_maintainer TEXT,
    start_month TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    category TEXT,
    is_critical BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Ativo',
    manufacturer TEXT,
    model TEXT,
    year_of_manufacture TEXT,
    schedule JSONB DEFAULT '[]'::jsonb,
    custom_plan_id TEXT REFERENCES maintenance_plans(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spare_parts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    unit TEXT DEFAULT 'UN',
    cost DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    current_stock DECIMAL(10,2) DEFAULT 0,
    avg_consumption DECIMAL(10,2) DEFAULT 0,
    lead_time INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
    id TEXT PRIMARY KEY,
    equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    description TEXT,
    requester TEXT,
    machine_stopped BOOLEAN DEFAULT false,
    checklist JSONB DEFAULT '[]'::jsonb,
    materials_used JSONB DEFAULT '[]'::jsonb,
    man_hours JSONB DEFAULT '[]'::jsonb,
    purchase_requests JSONB DEFAULT '[]'::jsonb,
    observations TEXT,
    misc_notes TEXT,
    root_cause TEXT,
    corrective_category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id TEXT REFERENCES spare_parts(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2),
    type TEXT CHECK (type IN ('Entrada', 'Saída', 'Ajuste')),
    reason TEXT,
    user_name TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    work_order_id TEXT REFERENCES work_orders(id) ON DELETE SET NULL
);

-- 3. TRIGGER DE AUTOMAÇÃO (Dedução automática ao finalizar O.S.)
CREATE OR REPLACE FUNCTION fn_baixa_estoque_automatica()
RETURNS TRIGGER AS $$
DECLARE
    item jsonb;
    qtd numeric;
    peca_id text;
BEGIN
    IF NEW.status = 'Executado' AND OLD.status != 'Executado' THEN
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.materials_used)
        LOOP
            peca_id := item->>'partId';
            qtd := (item->>'quantity')::numeric;
            
            -- Atualiza saldo se a peça existir
            UPDATE spare_parts SET current_stock = current_stock - qtd WHERE id = peca_id;
            
            -- Registra movimento
            INSERT INTO stock_movements (part_id, quantity, type, reason, user_name, work_order_id)
            VALUES (peca_id, qtd, 'Saída', 'Consumo via O.S. #' || NEW.id, NEW.requester, NEW.id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_baixa_estoque ON work_orders;
CREATE TRIGGER tr_baixa_estoque
AFTER UPDATE ON work_orders
FOR EACH ROW
EXECUTE FUNCTION fn_baixa_estoque_automatica();

-- 4. INSERT DO GERADOR (Se não existir)
INSERT INTO equipment (id, name, location, category, is_critical, model) 
VALUES ('GE-01', 'GERADOR INDUSTRIAL', 'SALA DE MAQUINAS', 'Industrial', true, 'GERADOR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO spare_parts (id, name, unit, current_stock, min_stock)
VALUES ('DIESEL-L', 'Óleo Diesel S10', 'L', 500, 100)
ON CONFLICT (id) DO NOTHING;
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(FINAL_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                <div className="px-8 py-6 bg-slate-800 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl">
                            <ClipboardListIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Sync Supabase</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 relative bg-slate-950 p-6 overflow-hidden">
                    <textarea readOnly value={FINAL_SQL} className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs p-4 resize-none focus:outline-none custom-scrollbar" />
                    <div className="absolute top-6 right-8">
                        <button onClick={handleCopy} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase shadow-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}>
                            {copied ? <CheckCircleIcon className="w-4 h-4"/> : <ClipboardListIcon className="w-4 h-4"/>}
                            {copied ? 'Copiado!' : 'Copiar Script'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
