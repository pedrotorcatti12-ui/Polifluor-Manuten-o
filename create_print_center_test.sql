
-- =============================================================================
-- SCRIPT DE TESTE: CENTRAL DE IMPRESSÃO
-- Cria uma O.S. Preventiva no estado "Programado" para aparecer na aba "Para Impressão".
-- =============================================================================

BEGIN;

DO $$
DECLARE
    next_id INT;
BEGIN
    -- Pega o próximo ID
    SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1 INTO next_id FROM public.work_orders;

    INSERT INTO public.work_orders (
        id,
        equipment_id,
        type,
        status,
        scheduled_date,
        description,
        checklist,
        requester,
        is_prepared
    ) VALUES (
        to_char(next_id, 'FM0000'),
        (SELECT id FROM public.equipments WHERE status = 'Ativo' LIMIT 1), -- Pega o primeiro ativo disponível
        'Preventiva',
        'Programado',
        NOW() + INTERVAL '1 day', -- Data futura próxima
        'TESTE DE IMPRESSÃO - CENTRAL DE DOCUMENTAÇÃO',
        '[{"action": "Verificar se esta OS aparece na aba Para Impressão", "checked": false}, {"action": "Imprimir e verificar se move para Em Campo", "checked": false}]'::jsonb,
        'Teste do Sistema',
        false -- is_prepared = false garante que apareça em "Para Impressão"
    );
END $$;

COMMIT;

SELECT 'O.S. de Teste criada! Vá para "Central de Impressão" > Aba "Para Impressão" e verifique.';
