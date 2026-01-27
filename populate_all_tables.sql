-- =============================================================================
-- SCRIPT DE CARGA MESTRE E CORREÇÃO ESTRUTURAL - SGMI 2.0
-- Autor: Arquiteto de Software
-- Objetivo: Popular banco, corrigir erro de loop e blindar integridade de dados.
-- =============================================================================

BEGIN;

-- 1. ESTRUTURA DE SEGURANÇA (SOFT DELETE & INTEGRIDADE)
-- Adiciona coluna de exclusão lógica para evitar perda de histórico
DO $$
BEGIN
    -- Equipamentos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='equipments' AND column_name='deleted_at') THEN
        ALTER TABLE public.equipments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Ordens de Serviço
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='work_orders' AND column_name='deleted_at') THEN
        ALTER TABLE public.work_orders ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Planos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='maintenance_plans' AND column_name='deleted_at') THEN
        ALTER TABLE public.maintenance_plans ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. CORREÇÃO DA CONSTRAINT PERIGOSA (Remover CASCADE)
-- Impede que deletar um equipamento apague seu histórico de manutenção
ALTER TABLE public.work_orders DROP CONSTRAINT IF EXISTS work_orders_equipment_id_fkey;

ALTER TABLE public.work_orders 
ADD CONSTRAINT work_orders_equipment_id_fkey 
FOREIGN KEY (equipment_id) 
REFERENCES public.equipments(id) 
ON DELETE RESTRICT; -- Bloqueia exclusão física se houver histórico (obriga usar Soft Delete)


-- 3. POPULAR DADOS DE DOMÍNIO (Tipos, Mantenedores, etc.)

-- Tipos de Equipamento
INSERT INTO public.equipment_types (id, description) VALUES
('PRENSA_HIDRAULICA', 'Prensa Hidráulica'),
('PRENSA_MOLDAGEM', 'Prensa de Moldagem'),
('PRENSA_EIXO_EXCENTRICO', 'Prensa de Eixo Excêntrico'),
('PRENSA', 'Prensa Genérica'),
('EXTRUSORA', 'Extrusora'),
('EXTRUSORA_PA', 'Extrusora de PA'),
('FORNO', 'Forno'),
('FORNO_ELETRICO', 'Forno Elétrico'),
('ESTUFA_ELETRICA', 'Estufa Elétrica'),
('ESTUFA_FUNIL', 'Estufa de Funil'),
('TRANCADEIRA', 'Trançadeira'),
('ESPULADEIRA', 'Espuladeira'),
('ENROLADOR_FITA', 'Enrolador de Fita'),
('TREFILA', 'Trefila'),
('TESTE_TREFILA', 'Teste de Trefila'),
('COMPRESSOR_PARAFUSO', 'Compressor de Parafuso'),
('COMPRESSOR_PISTAO', 'Compressor Pistão'),
('COMPRESSOR', 'Compressor Genérico'),
('GERADOR', 'Gerador'),
('MISTURADOR', 'Misturador'),
('ESMERIL', 'Esmeril'),
('RETIFICA', 'Retífica'),
('MAQUINA_SOLDA', 'Máquina de Solda'),
('SOLDA_INDUCAO', 'Solda por Indução'),
('CENTRO_USINAGEM', 'Centro de Usinagem'),
('TORNO_CNC', 'Torno CNC'),
('TORNO_MECANICO', 'Torno Mecânico'),
('TORNO_AUTOMATICO', 'Torno Automático'),
('TORNO_REVOLVER', 'Torno Revólver'),
('FRESADORA', 'Fresadora'),
('MAQUINA_CORRUGAR', 'Máquina de Corrugar'),
('MAQUINA_VIROLA', 'Máquina de Virola'),
('MAQUINA_TESTE', 'Máquina de Teste'),
('MAQUINA_LASER', 'Máquina a Laser'),
('TORRE_RESFRIAMENTO', 'Torre de Resfriamento'),
('CHILLER', 'Chiller'),
('CAMARA_FRIA', 'Câmara Fria'),
('AR_CONDICIONADO', 'Ar Condicionado'),
('MOLDAGEM_GLICERINA', 'Moldagem com Glicerina'),
('JATO_GRANALHA', 'Jato de Granalha'),
('CAVALETE_AR', 'Cavalete de Ar Respiratório'),
('PRE_MOLDE', 'Pré-Molde'),
('CABINE_PINTURA', 'Cabine de Pintura'),
('CABINE_PRIMARIA', 'Cabine Primária'),
('CABINE_SECUNDARIA', 'Cabine Secundária'),
('SERRA_CIRCULAR', 'Serra Circular'),
('SERRA_FITA', 'Serra de Fita'),
('CURVADORA', 'Curvadora'),
('CONFORMADORA', 'Conformadora'),
('RECRAVADEIRA', 'Recravadeira'),
('TAMBOREADOR', 'Tamboreador'),
('AUTOFRETAGEM', 'Autofretagem'),
('POLICORTE', 'Policorte'),
('CALANDRA', 'Calandra'),
('PLAINA', 'Plaina'),
('GUILHOTINA', 'Guilhotina'),
('PUXADOR', 'Puxador'),
('ROUTER', 'Router CNC'),
('GENERICO', 'Genérico / Outros')
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

-- Mantenedores
INSERT INTO public.maintainers (name) VALUES
('Manutenção Interna'), ('Serviço Externo'), ('Eletricista'), ('Mecânico'), ('Operador'),
('DARCI'), ('ERIC'), ('MARCUS AMATO'), ('SERGIO'), ('Torgeiro')
ON CONFLICT (name) DO NOTHING;

-- Solicitantes
INSERT INTO public.requesters (name) VALUES
('Produção'), ('Qualidade'), ('Engenharia'), ('Logística'), ('Diretoria'), ('Segurança do Trabalho'), ('PCP'), ('Ferramentaria')
ON CONFLICT (name) DO NOTHING;

-- Estoque
INSERT INTO public.spare_parts (id, name, min_stock, current_stock, location, unit, cost) VALUES
('RE-001', 'Rolamento de encosto - 51106', 12, 13, 'P2B1', 'PÇ', 25.5),
('RO-001', 'Rolamento 6201ZZ', 10, 10, 'P2B1', 'PÇ', 12),
('BF-001', 'Base de freio do carretel', 12, 12, 'P3C4', 'PÇ', 75),
('PE-001', 'Pino elástico 4x20', 20, 20, 'P2B1', 'PÇ', 0.5),
('RO-002', 'Rolamento UC207', 2, 2, 'P2B1', 'PÇ', 45),
('CO-001', 'Contatora WEG CWM09/10E', 1, 1, 'P3C3', 'PÇ', 89.9),
('COR-001', 'Correia AXS40', 3, 3, 'P1A3', 'PÇ', 22),
('COR-002', 'Correia AXS35', 2, 2, 'P1A3', 'PÇ', 19.5),
('COR-003', 'Correia A63', 2, 2, 'P1A1', 'PÇ', 35),
('CO-002', 'Contatora CWM25', 1, 1, 'P3C3', 'PÇ', 150),
('OL-001', 'Óleo Hidráulico 68', 200, 150, 'TAMBOR', 'L', 15.75),
('DJ-001', 'Disjuntor Tripolar 50A', 2, 2, 'P3C1', 'PÇ', 65),
('FO-001', 'Filtro de Óleo Hidráulico PSH486', 1, 1, 'P2B4', 'PÇ', 120),
('CO-003', 'Contatora Siemens 3TS35', 1, 1, 'P3C3', 'PÇ', 130),
('RO-003', 'Rolamento UC206', 2, 2, 'P2B3', 'PÇ', 42),
('RO-004', 'Rolamento 6206ZZ', 2, 2, 'P2B3', 'PÇ', 28),
('DJ-002', 'Disjuntor Tripolar 15A', 1, 1, 'P3C1', 'PÇ', 45),
('DJ-003', 'Disjuntor Tripolar 20A', 1, 1, 'P3C1', 'PÇ', 48),
('DJ-004', 'Disjuntor Tripolar 25A', 1, 1, 'P3C1', 'PÇ', 52),
('DJ-005', 'Disjuntor Tripolar 30A', 1, 1, 'P3C1', 'PÇ', 55),
('DJ-006', 'Disjuntor Bipolar 25A', 1, 1, 'P3C2', 'PÇ', 35),
('DJ-007', 'Disjuntor Tripolar 100A', 1, 1, 'P3C2', 'PÇ', 180),
('DJB-001', 'Disjuntor Bipolar 6A', 1, 1, 'P3C2', 'PÇ', 25),
('DJB-002', 'Disjuntor Bipolar 16A', 1, 1, 'P3C2', 'PÇ', 28),
('DJB-003', 'Disjuntor Bipolar 40A', 1, 1, 'P3C2', 'PÇ', 40),
('COR-004', 'Correia AXS51', 2, 2, 'P1A4', 'PÇ', 30),
('COR-005', 'Correia AXS58', 2, 2, 'P1A2', 'PÇ', 33),
('COR-006', 'Correia AXS69', 2, 2, 'P1A3', 'PÇ', 40),
('COR-007', 'Correia A50', 2, 2, 'P1A1', 'PÇ', 30),
('COR-008', 'Correia A49', 2, 2, 'P1A2', 'PÇ', 29),
('COR-009', 'Correia A59', 2, 2, 'P1A2', 'PÇ', 34),
('COR-010', 'Correia AXS41', 2, 2, 'P1A3', 'PÇ', 23),
('COR-011', 'Correia AXS43', 2, 2, 'P1A1', 'PÇ', 25),
('COR-012', 'Correia AXS33', 2, 2, 'P1A3', 'PÇ', 18),
('COR-013', 'Correia AXS36', 2, 2, 'P1A2', 'PÇ', 20),
('COR-014', 'Correia AXS38', 2, 2, 'P1A3', 'PÇ', 21),
('COR-015', 'Correia AXS39', 2, 2, 'P1A4', 'PÇ', 22),
('COR-016', 'Correia AXS45', 2, 2, 'P1A3', 'PÇ', 26),
('COR-017', 'Correia AXS47', 2, 2, 'P1A3', 'PÇ', 28),
('COR-018', 'Correia AXS48', 2, 2, 'P1A1', 'PÇ', 29),
('COR-019', 'Correia AXS49', 2, 2, 'P1A1', 'PÇ', 29.5),
('COR-020', 'Correia AXS61', 2, 2, 'P1A1', 'PÇ', 36),
('COR-021', 'Correia A27', 2, 4, 'P1A1', 'PÇ', 15),
('COR-022', 'Correia AXS79', 2, 2, 'P1A4', 'PÇ', 45),
('COR-023', 'Correia B60', 2, 2, 'P1A2', 'PÇ', 50),
('COR-024', 'Correia B58', 2, 2, 'P1A2', 'PÇ', 48),
('COR-025', 'Correia AXS52', 2, 2, 'P1A4', 'PÇ', 31),
('COR-026', 'Correia A60', 2, 2, 'P1A1', 'PÇ', 35),
('RO-05', 'Rolamento UC208', 2, 2, 'P2B2', 'PÇ', 50),
('RO-06', 'Rolamento 6200 ZZ', 2, 2, 'P2B1', 'PÇ', 10),
('RO-07', 'Rolamento 6202 ZZ', 2, 2, 'P2B1', 'PÇ', 15),
('RO-08', 'Rolamento 6207 ZZ', 2, 2, 'P2B1', 'PÇ', 30),
('RO-09', 'Rolamento 6205 ZZ', 2, 2, 'P2B3', 'PÇ', 25),
('RO-10', 'Rolamento 6006 ZZ', 2, 2, 'P2B3', 'PÇ', 28),
('RO-11', 'Rolamento 6004 ZZ', 2, 2, 'P2B3', 'PÇ', 22),
('DJ-008', 'Disjuntor Tripolar 10A', 1, 1, 'P3C2', 'PÇ', 40),
('DJB-004', 'Disjuntor Bipolar 10A', 1, 1, 'P3C2', 'PÇ', 25),
('DJB-005', 'Disjuntor Bipolar 32A', 1, 1, 'P3C2', 'PÇ', 38),
('BGR-001', 'Base guia do robo', 2, 2, 'P3C4', 'PÇ', 120),
('OL-002', 'Óleo para redutor 320', 1, 1, 'P2B4', 'L', 25),
('CO-004', 'Contatora CJX2-12', 1, 1, 'P3C3', 'PÇ', 95),
('CO-005', 'Contatora Schneider LC1D18M7', 1, 1, 'P3C2', 'PÇ', 180),
('SPC-001', 'Sensor de Pressão do Compressor', 1, 1, 'P3C4', 'PÇ', 350)
ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock;

-- Equipamentos
INSERT INTO public.equipments (id, name, status, category) VALUES
('PH-15', 'PRENSA HIDRÁULICA', 'Ativo', 'Industrial'),
('FO-10', 'FORNO', 'Ativo', 'Industrial'),
('FO-09', 'FORNO ELÉTRICO', 'Ativo', 'Industrial'),
('TD-02', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('FO-11', 'FORNO', 'Ativo', 'Industrial'),
('FO-12', 'FORNO', 'Ativo', 'Industrial'),
('EX-01', 'EXTRUSORA', 'Ativo', 'Industrial'),
('AEX-01', 'EXTRUSORA DE PA', 'Ativo', 'Industrial'),
('AEX-02', 'EXTRUSORA DE PA', 'Ativo', 'Industrial'),
('EX-02', 'EXTRUSORA', 'Ativo', 'Industrial'),
('EX-03', 'EXTRUSORA', 'Ativo', 'Industrial'),
('FO-13', 'FORNO', 'Ativo', 'Industrial'),
('FO-08', 'FORNO', 'Ativo', 'Industrial'),
('EX-05', 'EXTRUSORA', 'Ativo', 'Industrial'),
('FO-01', 'ESTUFA ELETRICA', 'Ativo', 'Industrial'),
('FO-02', 'ESTUFA ELETRICA', 'Ativo', 'Industrial'),
('FO-03', 'FORNO', 'Ativo', 'Industrial'),
('FO-04', 'FORNO', 'Ativo', 'Industrial'),
('FO-05', 'FORNO', 'Ativo', 'Industrial'),
('FO-06', 'FORNO', 'Ativo', 'Industrial'),
('FO-07', 'FORNO', 'Ativo', 'Industrial'),
('PH-01', 'PRENSA HIDRÁULICA', 'Ativo', 'Industrial'),
('PH-03', 'PRENSA HIDRÁULICA', 'Ativo', 'Industrial'),
('PH-02', 'PRENSA DE MOLDAGEM', 'Ativo', 'Industrial'),
('PH-04', 'PRENSA HIDRÁULICA', 'Ativo', 'Industrial'),
('PH-13', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('PH-14', 'PRENSA', 'Ativo', 'Industrial'),
('PH-16', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('PH-18', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('PH-19', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('TD-01', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('EX-04', 'EXTRUSORA', 'Ativo', 'Industrial'),
('PH-20', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('PH-05', 'PRENSA DE EIXO EXCENTRICO', 'Ativo', 'Industrial'),
('PH-06', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('PH-07', 'PRENSA DE MOLDAGEM', 'Ativo', 'Industrial'),
('PH-08', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('PH-09', 'PRENSA DE MOLDAGEM', 'Ativo', 'Industrial'),
('PH-10', 'PRENSA DE MOLDAGEM', 'Ativo', 'Industrial'),
('PH-17', 'PRENSA DE MOLDAGEM', 'Ativo', 'Industrial'),
('TD-05', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('CO-01', 'COMPRESSOR CHICAGO CPCm 40BD', 'Ativo', 'Industrial'),
('TD-06', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('CS-01', 'CABINE SECUNDARIA', 'Ativo', 'Industrial'),
('CPR-01', 'CABINE PRIMARIA', 'Ativo', 'Industrial'),
('TD-04', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('TD-07', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('TD-08', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('CO-02', 'COMPRESSOR DE PARAFUSO', 'Ativo', 'Industrial'),
('CO-03', 'COMPRESSOR PISTÃO SCHULZ', 'Ativo', 'Industrial'),
('TD-09', 'TRANÇADEIRA', 'Ativo', 'Industrial'),
('PH-11', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('PH-12', 'PRENSA HIDRAULICA', 'Ativo', 'Industrial'),
('FO-14', 'FORNO', 'Ativo', 'Industrial'),
('ET-01', 'ESTUFA DE FUNIL', 'Ativo', 'Industrial'),
('GE-01', 'GERADOR', 'Ativo', 'Industrial'),
('EX-06', 'EXTRUSORA', 'Ativo', 'Industrial'),
('EX-07', 'EXTRUSORA', 'Ativo', 'Industrial'),
('MI-01', 'MISTURADOR', 'Ativo', 'Industrial'),
('MI-02', 'MISTURADOR', 'Ativo', 'Industrial'),
('MI-03', 'MISTURADOR', 'Ativo', 'Industrial'),
('MI-04', 'MISTURADOR', 'Ativo', 'Industrial'),
('ES-01', 'ESMERIL', 'Ativo', 'Industrial'),
('ES-03', 'ESMERIL', 'Ativo', 'Industrial'),
('ES-04', 'ESMERIL', 'Ativo', 'Industrial'),
('MS-01', 'MAQUINA DE SOLDA', 'Ativo', 'Industrial'),
('MS-02', 'MAQUINA DE SOLDA', 'Ativo', 'Industrial'),
('MS-03', 'MAQUINA DE SOLDA', 'Ativo', 'Industrial'),
('MS-04', 'MAQUINA DE SOLDA', 'Ativo', 'Industrial'),
('CT-01', 'CENTRO DE USINAGEM', 'Ativo', 'Industrial'),
('CT-02', 'CENTRO DE USINAGEM', 'Ativo', 'Industrial'),
('TC-01', 'TORNO CNC', 'Ativo', 'Industrial'),
('TC-02', 'TORNO CNC', 'Ativo', 'Industrial'),
('TC-03', 'TORNO CNC', 'Ativo', 'Industrial'),
('TC-04', 'TORNO CNC', 'Ativo', 'Industrial'),
('TC-05', 'TORNO CNC', 'Ativo', 'Industrial'),
('TC-06', 'TORNO CNC', 'Ativo', 'Industrial'),
('TC-07', 'TORNO CNC', 'Ativo', 'Industrial'),
('TC-08', 'TORNO CNC', 'Ativo', 'Industrial'),
('TM-01', 'TORNO MECANICO', 'Ativo', 'Industrial'),
('TM-02', 'TORNO MECANICO', 'Ativo', 'Industrial'),
('TM-03', 'TORNO MECANICO', 'Ativo', 'Industrial'),
('TM-04', 'TORNO MECANICO', 'Ativo', 'Industrial'),
('TM-05', 'TORNO MECANICO', 'Ativo', 'Industrial'),
('TM-06', 'TORNO MECANICO', 'Ativo', 'Industrial'),
('TM-07', 'TORNO MECANICO', 'Ativo', 'Industrial'),
('EP-01', 'ESPULADEIRA', 'Ativo', 'Industrial'),
('EP-02', 'ESPULADEIRA', 'Ativo', 'Industrial'),
('EP-03', 'ESPULADEIRA', 'Ativo', 'Industrial'),
('CR-01', 'MAQUINA DE CORRUGAR', 'Ativo', 'Industrial'),
('CR-02', 'MAQUINA DE CORRUGAR', 'Ativo', 'Industrial'),
('CR-03', 'MAQUINA DE CORRUGAR', 'Ativo', 'Industrial'),
('TRA-01', 'TORRE DE RESFRIAMENTO', 'Ativo', 'Industrial'),
('MG-01', 'MOLDAGEM COM GLICERINA', 'Ativo', 'Industrial'),
('CF-01', 'CÂMARA FRIA', 'Ativo', 'Industrial'),
('JT-01', 'JATO DE GRANALHA', 'Ativo', 'Industrial'),
('JT-02', 'JATO DE GRANALHA', 'Ativo', 'Industrial'),
('PM-01', 'PRÉ-MOLDE', 'Ativo', 'Industrial'),
('CP-01', 'CABINE DE PINTURA', 'Ativo', 'Industrial'),
('CP-02', 'CABINE DE PINTURA', 'Ativo', 'Industrial'),
('SI-01', 'SOLDA POR INDUÇÃO', 'Ativo', 'Industrial'),
('SC-01', 'SERRA CIRCULAR', 'Ativo', 'Industrial'),
('CV-01', 'CURVADORA', 'Ativo', 'Industrial'),
('EF-01', 'CONFORMADORA', 'Ativo', 'Industrial'),
('RM-01', 'RECRAVADEIRA DE MANGUEIRAS', 'Ativo', 'Industrial'),
('CH-01', 'CHILLER', 'Ativo', 'Industrial'),
('EN-01', 'ENROLADOR DE FITA', 'Ativo', 'Industrial'),
('TB-01', 'TAMBOREADOR', 'Ativo', 'Industrial'),
('AF-01', 'AUTOFRETAGEM', 'Ativo', 'Industrial'),
('RE-01', 'RETIFICA', 'Ativo', 'Industrial'),
('PO-01', 'POLICORTE', 'Ativo', 'Industrial'),
('TS-01', 'MAQUINA DE TESTE', 'Ativo', 'Industrial'),
('CA-01', 'CALANDRA', 'Ativo', 'Industrial'),
('TR-01', 'TORNO REVOLVER', 'Ativo', 'Industrial'),
('PL-01', 'PLAINA', 'Ativo', 'Industrial'),
('MV-01', 'MAQUINA DE VIROLA', 'Ativo', 'Industrial'),
('GUI-01', 'GUILHOTINA', 'Ativo', 'Industrial'),
('TA-01', 'TORNO AUTOMÁTICO', 'Ativo', 'Industrial'),
('TA-02', 'TORNO AUTOMÁTICO', 'Ativo', 'Industrial'),
('TA-03', 'TORNO AUTOMÁTICO', 'Ativo', 'Industrial'),
('TA-04', 'TORNO AUTOMÁTICO', 'Ativo', 'Industrial'),
('TA-05', 'TORNO AUTOMÁTICO', 'Ativo', 'Industrial'),
('TA-06', 'TORNO AUTOMÁTICO', 'Ativo', 'Industrial'),
('TF-01', 'TREFILA', 'Ativo', 'Industrial'),
('TF-02', 'TREFILA', 'Ativo', 'Industrial'),
('TF-03', 'TREFILA', 'Ativo', 'Industrial'),
('TF-04', 'TREFILA', 'Ativo', 'Industrial'),
('SF-01', 'SERRA DE FITA', 'Ativo', 'Industrial'),
('SF-02', 'SERRA DE FITA', 'Ativo', 'Industrial'),
('SF-03', 'SERRA DE FITA', 'Ativo', 'Industrial'),
('SF-04', 'SERRA DE FITA', 'Ativo', 'Industrial'),
('FR-01', 'FRESADORA', 'Ativo', 'Industrial'),
('FR-02', 'FRESADORA', 'Ativo', 'Industrial'),
('ML-01', 'MAQUINA A LASER', 'Ativo', 'Industrial'),
('ML-02', 'MAQUINA A LASER', 'Ativo', 'Industrial'),
('RO-01', 'ROUTER', 'Ativo', 'Industrial'),
('RO-02', 'ROUTER', 'Ativo', 'Industrial'),
('PX-01', 'PUXADOR', 'Ativo', 'Industrial'),
('TES-01', 'TESTE TREFILA', 'Ativo', 'Industrial'),
('CL-01', 'CAVALETE AR RESPIRATORIO', 'Ativo', 'Industrial'),
('TRID-01', 'TRIDIMENSIONAL', 'Ativo', 'Industrial'),
('QI-01', 'QUADRO DE ILUMINAÇÃO', 'Ativo', 'Predial/Utilitário'),
('QDF-05', 'QUADRO DE FORÇA', 'Ativo', 'Predial/Utilitário'),
('QGC-01', 'QUADRO GERAL AR COND.', 'Ativo', 'Predial/Utilitário'),
('QDF-04', 'QUADRO DE FORÇA', 'Ativo', 'Predial/Utilitário'),
('QDF-02', 'QUADRO DE FORÇA', 'Ativo', 'Predial/Utilitário'),
('QDF-01', 'QUADRO DE FORÇA', 'Ativo', 'Predial/Utilitário'),
('QDF-06', 'QUADRO DE FORÇA', 'Ativo', 'Predial/Utilitário'),
('VR-01', 'LAVADOR DE PEÇAS', 'Ativo', 'Industrial')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;

-- 4. CLASSIFICAÇÃO AUTOMÁTICA
UPDATE public.equipments SET type_id = 'PRENSA_HIDRAULICA' WHERE name LIKE '%PRENSA HIDR%';
UPDATE public.equipments SET type_id = 'PRENSA_MOLDAGEM' WHERE name LIKE '%PRENSA DE MOLDAGEM%';
UPDATE public.equipments SET type_id = 'PRENSA_EIXO_EXCENTRICO' WHERE name LIKE '%PRENSA DE EIXO%';
UPDATE public.equipments SET type_id = 'PRENSA' WHERE name = 'PRENSA';
UPDATE public.equipments SET type_id = 'EXTRUSORA' WHERE name = 'EXTRUSORA';
UPDATE public.equipments SET type_id = 'EXTRUSORA_PA' WHERE name = 'EXTRUSORA DE PA';
UPDATE public.equipments SET type_id = 'FORNO' WHERE name = 'FORNO';
UPDATE public.equipments SET type_id = 'FORNO_ELETRICO' WHERE name = 'FORNO ELÉTRICO';
UPDATE public.equipments SET type_id = 'ESTUFA_ELETRICA' WHERE name = 'ESTUFA ELETRICA';
UPDATE public.equipments SET type_id = 'ESTUFA_FUNIL' WHERE name = 'ESTUFA DE FUNIL';
UPDATE public.equipments SET type_id = 'TRANCADEIRA' WHERE name = 'TRANÇADEIRA';
UPDATE public.equipments SET type_id = 'ESPULADEIRA' WHERE name = 'ESPULADEIRA';
UPDATE public.equipments SET type_id = 'COMPRESSOR_PARAFUSO' WHERE name LIKE '%PARAFUSO%' OR name LIKE '%CHICAGO%';
UPDATE public.equipments SET type_id = 'COMPRESSOR_PISTAO' WHERE name LIKE '%PIST%';
UPDATE public.equipments SET type_id = 'GERADOR' WHERE name = 'GERADOR';
UPDATE public.equipments SET type_id = 'MISTURADOR' WHERE name = 'MISTURADOR';
UPDATE public.equipments SET type_id = 'ESMERIL' WHERE name = 'ESMERIL';
UPDATE public.equipments SET type_id = 'MAQUINA_SOLDA' WHERE name = 'MAQUINA DE SOLDA';
UPDATE public.equipments SET type_id = 'CENTRO_USINAGEM' WHERE name = 'CENTRO DE USINAGEM';
UPDATE public.equipments SET type_id = 'TORNO_CNC' WHERE name = 'TORNO CNC';
UPDATE public.equipments SET type_id = 'TORNO_MECANICO' WHERE name LIKE '%TORNO MEC%';
UPDATE public.equipments SET type_id = 'MAQUINA_CORRUGAR' WHERE name = 'MAQUINA DE CORRUGAR';
UPDATE public.equipments SET type_id = 'TORRE_RESFRIAMENTO' WHERE name = 'TORRE DE RESFRIAMENTO';
UPDATE public.equipments SET type_id = 'MOLDAGEM_GLICERINA' WHERE name = 'MOLDAGEM COM GLICERINA';
UPDATE public.equipments SET type_id = 'CAMARA_FRIA' WHERE name = 'CÂMARA FRIA';
UPDATE public.equipments SET type_id = 'JATO_GRANALHA' WHERE name LIKE '%JATO%';
UPDATE public.equipments SET type_id = 'PRE_MOLDE' WHERE name = 'PRÉ-MOLDE';
UPDATE public.equipments SET type_id = 'CABINE_PINTURA' WHERE name LIKE '%CABINE DE PINTURA%';
UPDATE public.equipments SET type_id = 'SOLDA_INDUCAO' WHERE name = 'SOLDA POR INDUÇÃO';
UPDATE public.equipments SET type_id = 'SERRA_CIRCULAR' WHERE name = 'SERRA CIRCULAR';
UPDATE public.equipments SET type_id = 'CURVADORA' WHERE name = 'CURVADORA';
UPDATE public.equipments SET type_id = 'CONFORMADORA' WHERE name = 'CONFORMADORA';
UPDATE public.equipments SET type_id = 'RECRAVADEIRA' WHERE name = 'RECRAVADEIRA DE MANGUEIRAS';
UPDATE public.equipments SET type_id = 'CHILLER' WHERE name = 'CHILLER';
UPDATE public.equipments SET type_id = 'ENROLADOR_FITA' WHERE name = 'ENROLADOR DE FITA';
UPDATE public.equipments SET type_id = 'TAMBOREADOR' WHERE name = 'TAMBOREADOR';
UPDATE public.equipments SET type_id = 'AUTOFRETAGEM' WHERE name = 'AUTOFRETAGEM';
UPDATE public.equipments SET type_id = 'RETIFICA' WHERE name LIKE '%RETIFICA%';
UPDATE public.equipments SET type_id = 'POLICORTE' WHERE name = 'POLICORTE';
UPDATE public.equipments SET type_id = 'MAQUINA_TESTE' WHERE name = 'MAQUINA DE TESTE';
UPDATE public.equipments SET type_id = 'CALANDRA' WHERE name = 'CALANDRA';
UPDATE public.equipments SET type_id = 'TORNO_REVOLVER' WHERE name = 'TORNO REVOLVER';
UPDATE public.equipments SET type_id = 'PLAINA' WHERE name = 'PLAINA';
UPDATE public.equipments SET type_id = 'MAQUINA_VIROLA' WHERE name = 'MAQUINA DE VIROLA';
UPDATE public.equipments SET type_id = 'GUILHOTINA' WHERE name = 'GUILHOTINA';
UPDATE public.equipments SET type_id = 'TORNO_AUTOMATICO' WHERE name LIKE '%TORNO AUTOM%';
UPDATE public.equipments SET type_id = 'TREFILA' WHERE name = 'TREFILA';
UPDATE public.equipments SET type_id = 'SERRA_FITA' WHERE name LIKE '%SERRA%FITA%';
UPDATE public.equipments SET type_id = 'FRESADORA' WHERE name LIKE '%FRESADORA%';
UPDATE public.equipments SET type_id = 'MAQUINA_LASER' WHERE name = 'MAQUINA A LASER';
UPDATE public.equipments SET type_id = 'ROUTER' WHERE name = 'ROUTER';
UPDATE public.equipments SET type_id = 'PUXADOR' WHERE name = 'PUXADOR';
UPDATE public.equipments SET type_id = 'TESTE_TREFILA' WHERE name = 'TESTE TREFILA';
UPDATE public.equipments SET type_id = 'CAVALETE_AR' WHERE name LIKE '%CAVALETE%';
UPDATE public.equipments SET type_id = 'GENERICO' WHERE type_id IS NULL;

-- 5. PLANOS DE MANUTENÇÃO (Checklists e Estratégia)
INSERT INTO public.maintenance_plans (id, description, equipment_type_id, target_equipment_ids, frequency, maintenance_type, start_month, tasks) VALUES
('PLAN-PH-TRIMESTRAL', 'Preventiva Trimestral - Prensas Hidráulicas', 'PRENSA_HIDRAULICA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAÇÃO DO NIVEL DE OLEO ANTES DA PARTIDA"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS"}, {"action": "APERTO DE TERMINAIS"}, {"action": "LIMPEZA INTERNA DOS COMPONENTES"}, {"action": "VERIFICAÇÃO DO SISTEMA HIDRÁULICO"}]'::jsonb),

('PLAN-EX-TRIMESTRAL', 'Preventiva Trimestral - Extrusoras', 'EXTRUSORA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "REAPERTO DE CONTATOS ELÉTRICOS"}, {"action": "VERIFICAÇÃO DE ÓLEO ANTES DA PARTIDA"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "VERIFICAR VAZAMENTOS"}, {"action": "LIMPEZA INTERNA DO PAINEL"}, {"action": "VERIFICAR CILINDRO HIDRÁULICO"}, {"action": "VERIFICAR RESISTENCIA"}]'::jsonb),

('PLAN-AEX-TRIMESTRAL', 'Preventiva Trimestral - Extrusora de PA', 'EXTRUSORA_PA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAÇÃO DE VAZAMENTOS"}, {"action": "VERIFICAÇÃO DE NIVEL DE ÓLEO ANTES DA PARTIDA"}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "VERIFICAR RESISTENCIAS DAS ZONAS DE AQUECIMENTO"}, {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO"}]'::jsonb),

('PLAN-FO-GENERICO', 'Preventiva Trimestral - Fornos e Estufas', 'FORNO', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Reaperto contatos"}, {"action": "Corrente resistências"}, {"action": "Vedação porta"}, {"action": "Calibração temp."}]'::jsonb),

('PLAN-GE-ANUAL', 'Preventiva Anual - Gerador (Serviço Externo)', 'GERADOR', NULL, 12, 'Preventiva', 'Agosto', 
'[{"action": "AGENDAR SERVIÇO EXTERNO (VENCIMENTO EM 27/08/2026)"}, {"action": "Serviços de substituição de óleo"}, {"action": "filtro do óleo"}, {"action": "Filtro 1518512"}, {"action": "Filtro de combustível"}, {"action": "Filtro separador"}, {"action": "Abastecimento (150L)"}]'::jsonb),

('PLAN-MI-ANUAL', 'Preventiva Anual - Misturadores', 'MISTURADOR', NULL, 12, 'Preventiva', 'Janeiro', 
'[{"action": "Nível óleo 320"}, {"action": "Desgaste das pás"}, {"action": "Reaperto da base do motor"}]'::jsonb),

('PLAN-CO-ANUAL', 'Preventiva Anual - Compressores', 'COMPRESSOR_PARAFUSO', NULL, 12, 'Preventiva', 'Janeiro', 
'[{"action": "Drenar condensado"}, {"action": "Temperatura"}, {"action": "Nível óleo compressor"}, {"action": "Limpeza radiador"}]'::jsonb),

('PLAN-ES-ANUAL', 'Preventiva Anual - Esmeril', 'ESMERIL', NULL, 12, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAR ESTADO DOS REBOLOS"}, {"action": "AJUSTAR APOIO"}, {"action": "VERIFICAR PROTEÇÃO VISUAL"}, {"action": "TESTE DE ISOLAMENTO ELÉTRICO"}]'::jsonb),

('PLAN-MS-BIMESTRAL', 'Preventiva Bimestral - Máquinas de Solda', 'MAQUINA_SOLDA', NULL, 2, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAR ASPECTO VISUAL E ESTRUTURA"}, {"action": "VERIFICAR INSTALAÇÃO ELÉTRICA"}, {"action": "VERIFICAR CABOS DE SOLDA"}, {"action": "VERIFICAR MANGUEIRA"}, {"action": "VERIFICAR TOCHA DE SOLDAGEM"}, {"action": "VERIFICAR MOTOR E BOMBA D AGUA"}, {"action": "EXECUTAR LIMPEZA COM SOPRADOR DE AR"}]'::jsonb),

('PLAN-CT-SEMESTRAL', 'Preventiva Semestral - Centro de Usinagem', 'CENTRO_USINAGEM', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Alinhamento ATC"}, {"action": "Concentração fluido corte"}, {"action": "Limpeza tanque"}, {"action": "Nivelamento"}]'::jsonb),

('PLAN-TC-SEMESTRAL', 'Preventiva Semestral - Torno CNC', 'TORNO_CNC', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Nível óleo barramento"}, {"action": "Limpar filtros ar painel"}, {"action": "Correias Spindle"}, {"action": "Cooler do drive"}, {"action": "Nivelamento"}, {"action": "Geometria."}]'::jsonb),

('PLAN-TM-TRIMESTRAL', 'Preventiva Trimestral - Torno Mecânico', 'TORNO_MECANICO', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Folga carro transversal"}, {"action": "Lubrificar barramentos/fusos"}, {"action": "Ajustar freio motor"}, {"action": "Óleo caixa Norton"}]'::jsonb),

('PLAN-EP-QUADRIMESTRAL', 'Preventiva Quadrimestral - Espuladeira', 'ESPULADEIRA', NULL, 4, 'Preventiva', 'Janeiro', 
'[{"action": "Sistema tencionamento"}, {"action": "Guias cerâmica"}, {"action": "Correias V-Belt"}, {"action": "Lubrificar mancais"}]'::jsonb),

('PLAN-TD-TRIMESTRAL', 'Preventiva Trimestral - Trançadeiras', 'TRANCADEIRA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAR PRESILHA DA ESPULHA"}, {"action": "VERIFICAR ROLDANA DA ESPULHA"}, {"action": "MEDIÇÃO DA CORRENTE DO MOTOR"}, {"action": "VERIFICAR PAINEL ELÉTRICO"}, {"action": "VERIFICAR REDUTOR"}, {"action": "VERIFICAR BOTOEIRAS E CONTATOS"}, {"action": "VERIFICAR MOTOR"}]'::jsonb),

('PLAN-CR-BIMESTRAL', 'Preventiva Bimestral - Máquina de Corrugar', 'MAQUINA_CORRUGAR', NULL, 2, 'Preventiva', 'Janeiro', 
'[{"action": "Alinhamento moldes"}, {"action": "Lubrificação automática"}, {"action": "Bicos arrefecimento"}]'::jsonb),

('PLAN-TRA-MENSAL', 'Preventiva Mensal - Torre de Resfriamento', 'TORRE_RESFRIAMENTO', NULL, 1, 'Preventiva', 'Janeiro', 
'[{"action": "Qualidade água"}, {"action": "Filtros bomba"}, {"action": "Vibração ventilador"}, {"action": "Boia de nível"}]'::jsonb),

('PLAN-MG-TRIMESTRAL', 'Preventiva Trimestral - Moldagem Glicerina', 'MOLDAGEM_GLICERINA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Condições gerais"}, {"action": "Reaperto contatos"}, {"action": "Nível de Glicerina"}]'::jsonb),

('PLAN-CF-ANUAL', 'Preventiva Anual - Câmara Fria', 'CAMARA_FRIA', NULL, 12, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAÇÃO GERAL DO EQUIPAMENTO"}, {"action": "VERIFICAÇÃO DE TEMPERATURA"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "LIMPEZA DA GRADE DO AR CONDICIONADO"}]'::jsonb),

('PLAN-JATOS-TRIMESTRAL', 'Preventiva Trimestral - Jatos de Abrasão', 'JATO_GRANALHA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado das palhetas da turbina"}, {"action": "Inspecionar chapas de proteção interna"}, {"action": "Verificar bico de jateamento"}, {"action": "Limpeza"}, {"action": "inspeção dos coletores de pó"}, {"action": "Troca obrigatória do cartucho do filtro do capacete"}, {"action": "Verificar vedação das portas da cabine"}, {"action": "Lubrificação dos mancais principais"}]'::jsonb),

('PLAN-PM-TRIMESTRAL', 'Preventiva Trimestral - Pré-Molde', 'PRE_MOLDE', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Nível óleo"}, {"action": "Limpeza sistema hidráulico"}, {"action": "Reaperto conexões"}]'::jsonb),

('PLAN-CP-BIMESTRAL', 'Preventiva Bimestral - Cabine de Pintura', 'CABINE_PINTURA', NULL, 2, 'Preventiva', 'Janeiro', 
'[{"action": "Instalação elétrica"}, {"action": "Filtros secos"}, {"action": "Motor/Exaustão"}, {"action": "Vidros teto"}, {"action": "Estrutura metálica"}]'::jsonb),

('PLAN-SI-TRIMESTRAL', 'Preventiva Trimestral - Solda por Indução', 'SOLDA_INDUCAO', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar instalação"}, {"action": "cabos de indução"}]'::jsonb),

('PLAN-SC-TRIMESTRAL', 'Preventiva Trimestral - Serra Circular', 'SERRA_CIRCULAR', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar fixação da lâmina"}, {"action": "motor"}]'::jsonb),

('PLAN-CV-TRIMESTRAL', 'Preventiva Trimestral - Curvadora', 'CURVADORA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar pistões"}, {"action": "vazamentos"}]'::jsonb),

('PLAN-EF-TRIMESTRAL', 'Preventiva Trimestral - Conformadora', 'CONFORMADORA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Plano vinculado à RM - verificar moldes"}]'::jsonb),

('PLAN-RM-TRIMESTRAL', 'Preventiva Trimestral - Recravadeira', 'RECRAVADEIRA', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar sistema de prensagem"}, {"action": "vazamentos"}]'::jsonb),

('PLAN-CH-TRIMESTRAL', 'Preventiva Trimestral - Chiller', 'CHILLER', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar pressões de alta"}, {"action": "baixa do fluido refrigerante"}, {"action": "Inspecionar vazamentos de óleo/gás"}, {"action": "Verificar nível de água/aditivo no reservatório"}, {"action": "Limpar filtros de linha de água"}, {"action": "Inspecionar bomba de circulação"}, {"action": "Limpeza das colmeias/condensador"}, {"action": "Verificar ventiladores do condensador"}, {"action": "Reaperto de bornes"}, {"action": "contatores"}, {"action": "Conferir setpoint de temperatura"}, {"action": "Medição de corrente do compressor"}]'::jsonb),

('PLAN-EN-QUADRIMESTRAL', 'Preventiva Quadrimestral - Enrolador de Fita', 'ENROLADOR_FITA', NULL, 4, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado do eixo expansível/mandril"}, {"action": "Inspecionar alinhamento das guias de fita"}, {"action": "Verificar a tensão da fita"}, {"action": "Verificar correias ou correntes de transmissão"}, {"action": "Lubrificar mancais"}, {"action": "rolamentos"}, {"action": "Verificar ruídos no motor"}, {"action": "Verificar botão de emergência"}, {"action": "Inspecionar cabos de alimentação"}, {"action": "Limpeza geral de resíduos"}]'::jsonb),

('PLAN-TB-ANUAL', 'Preventiva Anual - Tamboreador', 'TAMBOREADOR', NULL, 12, 'Preventiva', 'Janeiro', 
'[{"action": "Inspecionar rolamentos do eixo excêntrico"}, {"action": "Verificar fixação das massas excêntricas"}, {"action": "Verificar molas de suspensão ou coxins"}, {"action": "Verificar tensão da correia"}, {"action": "Inspecionar revestimento interno"}, {"action": "Verificar vedação da tampa"}, {"action": "Reaperto de terminais no painel"}, {"action": "Verificar fixação da base"}, {"action": "Limpeza externa"}]'::jsonb),

('PLAN-AF-TRIMESTRAL', 'Preventiva Trimestral - Autofretagem (Serviço Externo)', 'AUTOFRETAGEM', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "AGENDAR SERVIÇO EXTERNO (30 DIAS ANTES)"}, {"action": "Inspecionar conexões de alta pressão"}, {"action": "Verificar vedações"}, {"action": "Testar válvulas de alívio"}, {"action": "Verificar óleo hidráulico"}, {"action": "Limpeza de filtros"}, {"action": "Inspecionar multiplicador de pressão"}, {"action": "Calibração de manômetros"}, {"action": "Testar intertravamentos de segurança"}]'::jsonb),

('PLAN-RE-SEMESTRAL', 'Preventiva Semestral - Retífica', 'RETIFICA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado"}, {"action": "balanceamento do rebolo"}, {"action": "Limpar"}, {"action": "lubrificar barramentos"}, {"action": "fusos"}, {"action": "Verificar nível do fluido de refrigeração"}, {"action": "filtros"}, {"action": "Inspecionar diamantador"}, {"action": "Verificar folgas no cabeçote"}, {"action": "mesa"}, {"action": "Reaperto de contatos elétricos"}, {"action": "teste de isolamento"}]'::jsonb),

('PLAN-PO-ANUAL', 'Preventiva Anual - Policorte', 'POLICORTE', NULL, 12, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado do disco de corte"}, {"action": "Inspecionar a mola de retorno do cabeçote"}, {"action": "Verificar fixação"}, {"action": "alinhamento da morsa"}, {"action": "Inspecionar cabos elétricos"}, {"action": "Verificar integridade da coifa de proteção"}, {"action": "Lubrificar o eixo de articulação"}]'::jsonb),

('PLAN-TS-SEMESTRAL', 'Preventiva Semestral - Máquina de Teste', 'MAQUINA_TESTE', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Calibração de sensores/manômetros"}, {"action": "Verificação de estanqueidade"}, {"action": "Teste de intertravamento de segurança"}, {"action": "Inspeção de mangueiras de alta pressão"}]'::jsonb),

('PLAN-CA-SEMESTRAL', 'Preventiva Semestral - Calandra', 'CALANDRA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Lubrificação dos rolos"}, {"action": "engrenagens"}, {"action": "Verificar paralelismo dos rolos"}, {"action": "Reaperto da base"}, {"action": "Inspeção de correias de transmissão"}]'::jsonb),

('PLAN-TR-TRIMESTRAL', 'Preventiva Trimestral - Torno Revólver', 'TORNO_REVOLVER', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza"}, {"action": "lubrificação do cabeçote revólver"}, {"action": "Ajuste de folga dos carros"}, {"action": "Verificar fim de curso mecânico"}, {"action": "Óleo da caixa de engrenagens"}]'::jsonb),

('PLAN-PL-SEMESTRAL', 'Preventiva Semestral - Plaina', 'PLAINA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Nivelamento da mesa"}, {"action": "Lubrificação das guias (barramento)"}, {"action": "Verificar curso do braço (shaper)"}, {"action": "Inspeção do sistema de lubrificação automática"}]'::jsonb),

('PLAN-ET-TRIMESTRAL', 'Preventiva Trimestral - Estufa de Funil', 'ESTUFA_FUNIL', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza interna do funil"}, {"action": "Verificar resistências de aquecimento"}, {"action": "Calibração do termostato"}, {"action": "Limpeza de filtros de ar"}]'::jsonb),

('PLAN-MV-SEMESTRAL', 'Preventiva Semestral - Máquina de Virola', 'MAQUINA_VIROLA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Inspeção das matrizes de dobra/virola"}, {"action": "Lubrificação de eixos"}, {"action": "articulações"}, {"action": "Verificar pressão pneumática/hidráulica"}]'::jsonb),

('PLAN-GUI-SEMESTRAL', 'Preventiva Semestral - Guilhotina', 'GUILHOTINA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Afiação"}, {"action": "folga das facas"}, {"action": "Lubrificação das guias de descida"}, {"action": "Verificar sistema de proteção"}, {"action": "Troca de óleo hidráulico"}]'::jsonb),

('PLAN-TA-ANUAL', 'Preventiva Anual - Tornos Automáticos', 'TORNO_AUTOMATICO', NULL, 12, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar cames"}, {"action": "alavancas"}, {"action": "Lubrificar barramentos"}, {"action": "Ajustar mandril/pinças"}, {"action": "Nível de óleo de corte"}, {"action": "Rolamentos (6202 ZZ/32005)"}]'::jsonb),

('PLAN-TF-SEMESTRAL', 'Preventiva Semestral - Trefilas', 'TREFILA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Inspecionar fieiras"}, {"action": "Lubrificação do sistema de tração"}, {"action": "Verificar alinhamento dos cones"}, {"action": "Tensão das correias"}]'::jsonb),

('PLAN-SF-SEMESTRAL', 'Preventiva Semestral - Serras de Fita', 'SERRA_FITA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Tensão da fita"}, {"action": "Alinhamento das guias (rolamentos)"}, {"action": "Nível de fluido refrigerante"}, {"action": "Limpeza de cavacos"}, {"action": "Verificação da mola de retorno"}]'::jsonb),

('PLAN-FR-SEMESTRAL', 'Preventiva Semestral - Fresadoras', 'FRESADORA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Lubrificação de fusos"}, {"action": "barramentos"}, {"action": "Verificar folga no cabeçote"}, {"action": "Limpeza do sistema de refrigeração"}, {"action": "Reaperto elétrico"}]'::jsonb),

('PLAN-ML-SEMESTRAL', 'Preventiva Semestral - Máquinas a Laser', 'MAQUINA_LASER', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza de óticas/lentes"}, {"action": "Verificar sistema de refrigeração (Chiller interno)"}, {"action": "Alinhamento do feixe"}, {"action": "Exaustão de fumos"}]'::jsonb),

('PLAN-RO-SEMESTRAL', 'Preventiva Semestral - Routers CNC', 'ROUTER', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza de cremalheiras/fusos"}, {"action": "Verificar vácuo da mesa"}, {"action": "Lubrificação do Spindle"}, {"action": "Troca de filtros de ar"}]'::jsonb),

('PLAN-PX-TRIMESTRAL', 'Preventiva Trimestral - Puxador (Extrusão)', 'PUXADOR', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Alinhamento das esteiras/lagartas"}, {"action": "Tensão pneumática"}, {"action": "Sincronismo com a extrusora"}, {"action": "Lubrificação de eixos"}]'::jsonb),

('PLAN-TES-SEMESTRAL', 'Preventiva Semestral - Teste de Trefila', 'TESTE_TREFILA', NULL, 6, 'Preventiva', 'Janeiro', 
'[{"action": "Aferição de células de carga"}, {"action": "Verificação de garras de tração"}, {"action": "Backup de software de teste"}, {"action": "Limpeza de guias"}]'::jsonb),

('PLAN-CL-TRIMESTRAL', 'Preventiva Trimestral - Cavalete de Ar Respiratório', 'CAVALETE_AR', NULL, 3, 'Preventiva', 'Janeiro', 
'[{"action": "Substituição de elementos filtrantes (Coalescente/Carvão)"}, {"action": "Drenagem automática"}, {"action": "Teste de alarmes de CO/CO2"}]'::jsonb),

('PLAN-PADRAO-CONFORMIDADE', 'Preventiva Trimestral (Padrão de Conformidade)', 'GENERICO', '{TRID-01,CS-01,CPR-01,QI-01,QDF-05,QGC-01,QDF-04,QDF-02,QDF-01,QDF-06,VR-01}', 3, 'Preventiva', 'Janeiro', '[]'::jsonb)

ON CONFLICT (id) DO UPDATE SET 
    description = EXCLUDED.description,
    tasks = EXCLUDED.tasks;

-- 6. INTELIGÊNCIA: VINCULAÇÃO E GERAÇÃO DE O.S.

-- Função de Vinculação (Refresh Targets)
CREATE OR REPLACE FUNCTION refresh_plan_targets()
RETURNS text AS $$
BEGIN
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
        WHERE e.deleted_at IS NULL -- Apenas equipamentos ativos
        GROUP BY 
            mp.id
    ) AS sub
    WHERE p.id = sub.plan_id;
    RETURN 'Plan targets refreshed.';
END;
$$ LANGUAGE plpgsql;

SELECT refresh_plan_targets();

-- Função Geradora (Generate 2026) - Versão com Loop TEXT corrigido
CREATE OR REPLACE FUNCTION generate_preventive_orders_for_2026()
RETURNS text AS $$
DECLARE
    plan_record RECORD;
    equipment_id_iter TEXT;
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

    FOR plan_record IN SELECT * FROM public.maintenance_plans WHERE deleted_at IS NULL LOOP
        SELECT array_position(month_map, plan_record.start_month) - 1 INTO start_month_index;
        IF start_month_index IS NULL THEN CONTINUE; END IF;

        FOR month_index IN start_month_index..11 BY plan_record.frequency LOOP
            schedule_date := make_timestamp(2026, month_index + 1, 15, 8, 0, 0);

            IF plan_record.target_equipment_ids IS NOT NULL THEN
                FOREACH equipment_id_iter IN ARRAY plan_record.target_equipment_ids LOOP
                    IF EXISTS (SELECT 1 FROM public.equipments WHERE id = equipment_id_iter AND deleted_at IS NULL) THEN
                        INSERT INTO public.work_orders (
                            id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id, machine_stopped
                        ) VALUES (
                            to_char(next_os_number, 'FM0000'),
                            equipment_id_iter,
                            'Preventiva',
                            'Programado',
                            schedule_date,
                            plan_record.description,
                            plan_record.tasks,
                            'Cronograma Automático',
                            plan_record.id,
                            false
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

SELECT generate_preventive_orders_for_2026();

COMMIT;

SELECT 'Carga completa e estruturação segura finalizadas.';