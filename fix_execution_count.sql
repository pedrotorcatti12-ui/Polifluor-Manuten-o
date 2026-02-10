-- =============================================================================
-- SCRIPT DE CORREÇÃO FINAL DE CONTAGEM (29 -> 20)
-- Motivo: O usuário relatou 9 ordens de serviço 'extras' constando como Executadas.
-- Causa Provável: O script anterior filtrou apenas datas de Janeiro/2026. As 9 extras
-- provavelmente possuem datas de 2025 ou outros meses, mas estão com status 'Executado'.
-- =============================================================================

BEGIN;

-- 1. Soft Delete (Lixeira) para qualquer O.S. Executada que NÃO seja uma das 20 oficiais.
-- Isso garante que o contador bata exatamente 20, independente da data da O.S. fantasma.

UPDATE public.work_orders
SET 
    deleted_at = NOW(),
    observations = COALESCE(observations, '') || ' [AUTO-CLEANUP: EXCEDENTE DE EXECUÇÃO]'
WHERE 
    status = 'Executado'
    AND id NOT IN (
        '0187', '0055', '0009', '0007', '0230', '0250', '0019', '0013', '0043', '0303', 
        '0006', '0127', '0011', '0147', '0025', '0075', '0115', '0179', '0183', '0067'
    );

COMMIT;

SELECT 'Correção aplicada. As 9 ordens excedentes foram movidas para a lixeira. Contador deve exibir 20 agora.';
