-- ATENÇÃO: COPIE APENAS O CÓDIGO ABAIXO PARA O EDITOR SQL DO SUPABASE
-- NÃO COPIE TEXTOS DESCRITIVOS FORA DESTE BLOCO

BEGIN;

-- 1. Atualizar OS #0187 (PH-09)
UPDATE public.work_orders SET
    status = 'Executado',
    start_date_execution = '2026-01-09 08:30:00',
    end_date = '2026-01-09 09:10:00',
    description = 'Manutenção Preventiva PH-09 - Executada',
    observations = 'Verificação do nível de OLEO antes da partida; Medição de corrente do motor; Reaperto dos contatos elétricos; aperto de terminais; limpeza interna de componentes; verificação do sistema hidráulico.',
    checklist = '[
        {"action": "Verificação do nível de OLEO antes da partida", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto dos contatos elétricos", "checked": true},
        {"action": "Aperto de terminais", "checked": true},
        {"action": "Limpeza interna de componentes", "checked": true},
        {"action": "Verificação do sistema hidráulico", "checked": true}
    ]'::jsonb,
    is_approved = true,
    man_hours = '[{"maintainer": "Darci", "hours": 0.67}]'::jsonb
WHERE id = '0187';

-- 2. Atualizar OS #0067 (FO-10)
UPDATE public.work_orders SET
    status = 'Executado',
    start_date_execution = '2026-01-08 08:15:00',
    end_date = '2026-01-08 08:50:00',
    description = '[PRIORIDADE ALTA] Manutenção Preventiva FO-10 - Executada',
    observations = 'Localização: Extrusão. Reaperto dos Contatos Elétricos; Medição de Correntes do Motor 1, 2 e 3; Reaperto das correias do motor; verificar correias; verificar lubrificante dos rolamentos; verificar tubulação de gás; verificar estrutura física.',
    checklist = '[
        {"action": "Reaperto dos Contatos Elétricos", "checked": true},
        {"action": "Medição de Correntes do Motor 1, 2 e 3", "checked": true},
        {"action": "Reaperto das correias do motor", "checked": true},
        {"action": "Verificar correias", "checked": true},
        {"action": "Verificar lubrificante dos rolamentos", "checked": true},
        {"action": "Verificar tubulação de gás", "checked": true},
        {"action": "Verificar estrutura física do equipamento", "checked": true}
    ]'::jsonb,
    is_approved = true,
    man_hours = '[{"maintainer": "Darci", "hours": 0.58}]'::jsonb
WHERE id = '0067';

-- 3. Atualizar OS #0183 (PH-08)
UPDATE public.work_orders SET
    status = 'Executado',
    start_date_execution = '2026-01-07 10:10:00',
    end_date = '2026-01-07 11:00:00',
    description = 'Manutenção Preventiva PH-08 - Executada',
    observations = 'Sem apontamentos adicionais.',
    checklist = '[
        {"action": "Verificação do nivel de oleo antes da partida", "checked": true},
        {"action": "Medição de corrente do motor", "checked": true},
        {"action": "Reaperto de contatos elétricos", "checked": true},
        {"action": "Aperto de terminais", "checked": true},
        {"action": "Limpeza interna dos componentes", "checked": true},
        {"action": "Verificação do sistema hidraulico", "checked": true}
    ]'::jsonb,
    is_approved = true,
    man_hours = '[{"maintainer": "Darci", "hours": 0.83}]'::jsonb
WHERE id = '0183';

-- 4. Atualizar OS #0179 (PH-07)
UPDATE public.work_orders SET
    status = 'Executado',
    start_date_execution = '2026-01-09 11:10:00',
    end_date = '2026-01-09 11:45:00',
    description = 'Manutenção Preventiva PH-07 - Executada',
    observations = 'Sem apontamentos adicionais.',
    checklist = '[]'::jsonb, 
    is_approved = true,
    man_hours = '[{"maintainer": "Darci", "hours": 0.58}]'::jsonb
WHERE id = '0179';

COMMIT;

SELECT '4 Ordens de Serviço atualizadas com sucesso!';
