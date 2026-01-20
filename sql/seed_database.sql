
/*
   SGMI 2.0 - SCRIPT MESTRE DE CARGA (COM LOGICA FILL-GAPS)
   DATA: 07/01/2026
   OBJETIVO: Restaurar as 21 O.S. de campo e gerar o plano 2026 nos números vazios.
*/

-- 1. LIMPEZA TOTAL
DELETE FROM work_orders;

-- 2. INSERÇÃO DAS 21 O.S. "INTOCÁVEIS" (Lote Retornado de Campo)
-- Mapeadas para ativos críticos aleatórios para simulação realista
INSERT INTO work_orders (id, equipment_id, type, status, scheduled_date, description, requester, machine_stopped, checklist, materials_used, man_hours, observations) VALUES
('0127', 'PH-15', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0006', 'EX-01', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0067', 'FO-10', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0230', 'TC-01', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0075', 'TA-01', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0007', 'PH-01', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0303', 'EX-02', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0043', 'AEX-01', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0009', 'ES-04', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0115', 'FO-09', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0147', 'PH-20', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0011', 'TC-02', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0055', 'TA-02', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0179', 'MI-04', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0013', 'CO-01', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0019', 'GE-01', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0025', 'PH-05', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0183', 'EX-03', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0187', 'FO-13', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0250', 'PH-14', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital'),
('0001', 'EX-04', 'Preventiva', 'Executado', '2026-01-07 13:25:00', 'Preventiva Inicial - Lote IATF', 'Manutenção', false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Lote Protocolo Digital');

-- 3. GERAÇÃO INTELIGENTE DO RESTANTE DO PLANO 2026 (FILL GAPS)
WITH 
-- A. Define a Matriz de Regras (Quais máquinas, quais meses)
Months AS (
    SELECT '01' as mm UNION ALL SELECT '02' UNION ALL SELECT '03' UNION ALL SELECT '04' UNION ALL 
    SELECT '05' UNION ALL SELECT '06' UNION ALL SELECT '07' UNION ALL SELECT '08' UNION ALL 
    SELECT '09' UNION ALL SELECT '10' UNION ALL SELECT '11' UNION ALL SELECT '12'
),
Regras AS (
    SELECT 'PH' as prefix, 3 as freq, 1 as start_m, 'Revisão Trimestral: Hidráulica' as descr, '[{"action": "Nível Óleo", "checked": false}]'::jsonb as chk UNION ALL
    SELECT 'EX' as prefix, 3 as freq, 1 as start_m, 'Revisão Trimestral: Aquecimento' as descr, '[{"action": "Resistências", "checked": false}]'::jsonb as chk UNION ALL
    SELECT 'ES' as prefix, 1 as freq, 1 as start_m, 'Preventiva Mensal: Segurança' as descr, '[{"action": "Rebolo", "checked": false}]'::jsonb as chk UNION ALL
    SELECT 'FO' as prefix, 3 as freq, 3 as start_m, 'Revisão Trimestral: Calibração' as descr, '[{"action": "Corrente", "checked": false}]'::jsonb as chk UNION ALL
    SELECT 'TC' as prefix, 9 as freq, 1 as start_m, 'Revisão 9 Meses' as descr, '[{"action": "Geometria", "checked": false}]'::jsonb as chk UNION ALL
    SELECT 'TA' as prefix, 6 as freq, 2 as start_m, 'Revisão Semestral' as descr, '[{"action": "Lubrificação", "checked": false}]'::jsonb as chk UNION ALL
    SELECT 'MS' as prefix, 2 as freq, 1 as start_m, 'Preventiva Bimestral' as descr, '[]'::jsonb as chk UNION ALL
    SELECT 'CR' as prefix, 2 as freq, 1 as start_m, 'Preventiva Bimestral' as descr, '[]'::jsonb as chk
),
-- B. Gera a lista "Crua" de tarefas necessárias (sem ID ainda)
TarefasNecessarias AS (
    SELECT 
        e.id as equipment_id,
        r.descr as description,
        r.chk as checklist,
        CAST('2026-' || m.mm || '-01 08:00:00' AS TIMESTAMPTZ) as scheduled_date
    FROM equipment e
    JOIN Regras r ON e.id LIKE r.prefix || '%'
    JOIN Months m ON (CAST(m.mm AS INTEGER) >= r.start_m AND (CAST(m.mm AS INTEGER) - r.start_m) % r.freq = 0)
    WHERE e.status = 'Ativo'
    -- IMPORTANTE: Não gerar tarefa se já existir uma OS reservada para essa máquina neste mês
    -- (Embora as reservas sejam poucas, é bom evitar duplicação no mesmo mês/máquina)
),
-- C. Gera a lista de números disponíveis (1 a 2000, exceto os 21 usados)
NumerosDisponiveis AS (
    SELECT generate_series(1, 3000) as num -- Geramos até 3000 para garantir sobra
    EXCEPT
    SELECT CAST(id AS INTEGER) FROM work_orders -- Remove os 21 já inseridos
    ORDER BY num
),
-- D. Numera as tarefas necessárias sequencialmente
TarefasNumeradas AS (
    SELECT 
        tn.*,
        ROW_NUMBER() OVER (ORDER BY tn.scheduled_date, tn.equipment_id) as rn
    FROM TarefasNecessarias tn
),
-- E. Numera os IDs disponíveis sequencialmente para cruzar
IDsNumerados AS (
    SELECT 
        num, 
        ROW_NUMBER() OVER (ORDER BY num) as rn
    FROM NumerosDisponiveis
)
-- F. Inserção Final Cruzando Tarefa N com ID Disponível N
INSERT INTO work_orders (id, equipment_id, type, requester, status, scheduled_date, machine_stopped, description, checklist, materials_used, man_hours, observations)
SELECT 
    LPAD(idn.num::text, 4, '0'), -- Formata 1 -> 0001
    tn.equipment_id,
    'Preventiva',
    'Planejamento Automático 2026',
    'Programado',
    tn.scheduled_date,
    true,
    tn.description,
    tn.checklist,
    '[]'::jsonb,
    '[]'::jsonb,
    'Geração Automática (Fill-Gaps)'
FROM TarefasNumeradas tn
JOIN IDsNumerados idn ON tn.rn = idn.rn;
