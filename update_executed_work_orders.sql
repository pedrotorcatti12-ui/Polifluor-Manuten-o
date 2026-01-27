-- =============================================================================
-- SCRIPT DE BAIXA EM LOTE - PREVENTIVAS JANEIRO 2026
-- Objetivo: Atualizar O.S. com dados reais de execução (Data, HH, Obs)
-- =============================================================================

BEGIN;

-- Função auxiliar para simplificar o update (evita repetição de código)
CREATE OR REPLACE FUNCTION update_os_execution(
    p_id TEXT, 
    p_end_date TIMESTAMP, 
    p_requester TEXT, 
    p_obs TEXT, 
    p_maintainer TEXT, 
    p_hours NUMERIC
) RETURNS VOID AS $$
BEGIN
    UPDATE public.work_orders
    SET 
        status = 'Executado',
        end_date = p_end_date,
        description = 'Manutenção executada conforme registro de campo', -- Padronizado conforme solicitação
        requester = p_requester,
        observations = p_obs,
        man_hours = jsonb_build_array(
            jsonb_build_object('maintainer', p_maintainer, 'hours', p_hours)
        ),
        materials_used = '[]'::jsonb, -- Nenhum material informado
        machine_stopped = false -- Padrão "Não informado" assumido como false para preventivas
    WHERE id = LPAD(p_id, 4, '0'); -- Garante formato 0187, 0017, etc.
END;
$$ LANGUAGE plpgsql;

-- === EXECUÇÃO DAS BAIXAS ===

-- 1. OS 187 (PH-09) - DARCI
SELECT update_os_execution('187', '2026-01-07 09:10:00', 'DARCI', 'Verificação do nível de óleo realizada', 'DARCI', 0.67);

-- 2. OS 17 (MS-01) - Equipe Interna
SELECT update_os_execution('17', '2026-01-07 10:20:00', 'Equipe Interna', '', 'Equipe Interna', 0.58);

-- 3. OS 183 (PH-08) - DARCI
SELECT update_os_execution('183', '2026-01-07 11:00:00', 'DARCI', '', 'DARCI', 0.83);

-- 4. OS 171 (PH-05) - DARCI
SELECT update_os_execution('171', '2026-01-07 14:15:00', 'DARCI', '', 'DARCI', 0.75);

-- 5. OS 13 (MS-02) - Equipe Interna
SELECT update_os_execution('13', '2026-01-07 15:45:00', 'Equipe Interna', '', 'Equipe Interna', 0.75);

-- 6. OS 3 (BA-01) - Equipe Interna
SELECT update_os_execution('3', '2026-01-08 08:45:00', 'Equipe Interna', '', 'Equipe Interna', 0.25);

-- 7. OS 67 (FO-10) - DARCI
SELECT update_os_execution('67', '2026-01-08 08:50:00', 'DARCI', 'Notificação de verificação de gás', 'DARCI', 0.58);

-- 8. OS 5 (BA-02) - Equipe Interna
SELECT update_os_execution('5', '2026-01-08 09:20:00', 'Equipe Interna', '', 'Equipe Interna', 0.33);

-- 9. OS 7 (ES-01) - DARCI
SELECT update_os_execution('7', '2026-01-08 11:15:00', 'DARCI', 'Remoção de limalha de metal', 'DARCI', 0.25);

-- 10. OS 175 (PH-06) - DARCI
SELECT update_os_execution('175', '2026-01-08 12:00:00', 'DARCI', '', 'DARCI', 0.75);

-- 11. OS 59 (FO-08) - DARCI
SELECT update_os_execution('59', '2026-01-08 14:10:00', 'DARCI', '', 'DARCI', 0.50);

-- 12. OS 9 (ES-04) - DARCI
SELECT update_os_execution('9', '2026-01-08 15:00:00', 'DARCI', 'Remoção de limalha de metal', 'DARCI', 0.25);

-- 13. OS 179 (PH-07) - DARCI
SELECT update_os_execution('179', '2026-01-09 09:20:00', 'DARCI', '', 'DARCI', 0.58);

-- 14. OS 51 (FO-06) - DARCI
SELECT update_os_execution('51', '2026-01-09 11:00:00', 'DARCI', '', 'DARCI', 0.50);

-- 15. OS 55 (FO-07) - DARCI
SELECT update_os_execution('55', '2026-01-09 16:30:00', 'DARCI', 'Lubrificação com graxa', 'DARCI', 0.67);

-- 16. OS 147 (PH-13) - DARCI
-- Nota: Mantido como 'Executado' apesar da obs de pendência, conforme instrução do "Status: Executado"
SELECT update_os_execution('147', '2026-01-10 12:50:00', 'DARCI', 'Peças pendentes para conclusão total', 'DARCI', 0.67);

-- 17. OS 21 (MS-03) - Equipe Interna
SELECT update_os_execution('21', '2026-01-10 13:50:00', 'Equipe Interna', '', 'Equipe Interna', 0.50);

-- 18. OS 143 (PH-12) - DARCI
SELECT update_os_execution('143', '2026-01-10 15:00:00', 'DARCI', '', 'DARCI', 0.67);

-- 19. OS 25 (MS-04) - Equipe Interna
SELECT update_os_execution('25', '2026-01-10 15:40:00', 'Equipe Interna', '', 'Equipe Interna', 0.67);

-- 20. OS 139 (PH-11) - DARCI
SELECT update_os_execution('139', '2026-01-12 09:30:00', 'DARCI', '', 'DARCI', 0.67);

-- Limpeza da função auxiliar
DROP FUNCTION update_os_execution(TEXT, TIMESTAMP, TEXT, TEXT, TEXT, NUMERIC);

COMMIT;

SELECT 'Baixa de 20 Ordens de Serviço realizada com sucesso! Atualize o app para ver os indicadores.';