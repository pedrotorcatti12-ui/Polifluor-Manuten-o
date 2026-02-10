-- =============================================================================
-- SCRIPT PARA ATUALIZAÇÃO DE CRITICIDADE DE EQUIPAMENTOS
-- Autor: Engenheiro de Manutenção
-- Versão: 1.0
-- Objetivo: Definir os equipamentos críticos (Classe A) para o cálculo de KPIs.
-- =============================================================================

BEGIN;

-- Passo 1: Resetar a criticidade de todos os equipamentos para 'não crítico'.
-- Isso garante que apenas os equipamentos listados abaixo serão considerados críticos.
UPDATE public.equipments
SET is_critical = false;

-- Passo 2: Definir como 'crítico' (is_critical = true) os equipamentos-chave da produção.
UPDATE public.equipments
SET is_critical = true
WHERE id IN (
    -- Prensas Hidráulicas Críticas
    'PH-07', 'PH-08', 'PH-09', 'PH-13', 'PH-15',

    -- Extrusoras Críticas
    'EX-02', 'EX-04',

    -- Trançadeiras Críticas
    'TD-02', 'TD-04',

    -- Fornos Críticos
    'FO-07', 'FO-10', 'FO-11',

    -- Extrusora de PA Crítica
    'AEX-02'
);

COMMIT;

SELECT 'Criticidade dos equipamentos atualizada com sucesso. A classe A foi definida para os ativos chave.';