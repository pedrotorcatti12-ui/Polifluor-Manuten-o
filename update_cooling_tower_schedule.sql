
-- =============================================================================
-- ATUALIZAÇÃO: TORRE DE RESFRIAMENTO (TRA-01) & ALERTAS
-- =============================================================================

BEGIN;

-- 1. LIMPEZA: Remover agendamentos anteriores da Torre de Resfriamento em 2026
DELETE FROM public.work_orders 
WHERE equipment_id = 'TRA-01' AND EXTRACT(YEAR FROM scheduled_date) = 2026;

-- 2. AGENDAMENTO: Torre de Resfriamento - Anual - Dezembro (Preparação para Verão) - Terceiro
INSERT INTO public.work_orders (
    id, 
    equipment_id, 
    type, 
    status, 
    scheduled_date, 
    description, 
    checklist, 
    requester, 
    machine_stopped
) VALUES (
    to_char(nextval('work_orders_id_seq'), 'FM0000'),
    'TRA-01', 
    'Preventiva', 
    'Programado', 
    '2026-12-10 08:00:00',
    '[ALERTA: TERCEIRO] Manutenção Anual Torre de Resfriamento',
    '[
        {"action": "AGENDAR COM TERCEIRO ESPECIALIZADO", "checked": false},
        {"action": "Limpeza química e mecânica", "checked": false},
        {"action": "Análise da qualidade da água", "checked": false},
        {"action": "Verificação de bicos aspersores e enchimento", "checked": false}
    ]'::jsonb,
    'Manutenção/Utilidades', 
    false
);

COMMIT;

SELECT 'Torre de Resfriamento agendada para Dezembro/2026 (Terceiro).';
