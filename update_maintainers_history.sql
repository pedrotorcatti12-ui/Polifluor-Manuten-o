
-- =============================================================================
-- HIGIENIZAÇÃO DE HISTÓRICO DE MANTENEDORES
-- Objetivo: Remover "N/A" e padronizar registros antigos para "Equipe Interna".
-- =============================================================================

BEGIN;

-- 1. Atualiza registros onde o campo JSON man_hours possui "N/A" ou está vazio
-- Nota: Como man_hours é um JSONB array, atualizamos a estrutura para garantir integridade.

UPDATE public.work_orders
SET man_hours = jsonb_build_array(
    jsonb_build_object('maintainer', 'Equipe Interna', 'hours', COALESCE((man_hours->0->>'hours')::numeric, 0))
)
WHERE 
    status = 'Executado' 
    AND (
        man_hours IS NULL 
        OR jsonb_array_length(man_hours) = 0 
        OR man_hours->0->>'maintainer' = 'N/A'
        OR man_hours->0->>'maintainer' IS NULL
    );

-- 2. Garantir que os novos mantenedores existam na tabela de lookup
INSERT INTO public.maintainers (name) VALUES 
('DARCI'), 
('SERGIO LACERDA'), 
('Equipe Interna') 
ON CONFLICT (name) DO NOTHING;

COMMIT;

SELECT 'Histórico de mantenedores higienizado. "N/A" substituído por "Equipe Interna".';
