
-- =============================================================================
-- MASTER SCRIPT: SINTERIZAÇÃO 2026 (A BÍBLIA DA MANUTENÇÃO - REV. FINAL)
-- Autor: SGMI 2.0
-- Objetivo: Alinhar 100% o sistema com as regras de negócio, checklists e frequências reais.
-- =============================================================================

BEGIN;

-- 1. LIMPEZA DE SEGURANÇA DO FUTURO (PRESERVA HISTÓRICO)
DELETE FROM public.work_orders 
WHERE status != 'Executado' 
AND scheduled_date >= '2026-01-01';

-- 2. GARANTIA DE STATUS DE ATIVOS
UPDATE public.equipments SET status = 'Ativo' WHERE id IN ('CL-01', 'TRA-01', 'GE-01');

-- 3. DEFINIÇÃO DOS CHECKLISTS DETALHADOS (JSONB)
DO $$
DECLARE
    -- FAMÍLIAS PADRÃO (Sem alterações, já estavam corretas)
    chk_prensas JSONB := '[{"action": "VERIFICAÇÃO DO NÍVEL DE ÓLEO (Antes da partida)", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS (Painel)", "checked": false}, {"action": "APERTO DE TERMINAIS", "checked": false}, {"action": "LIMPEZA INTERNA (Componentes)", "checked": false}, {"action": "VERIFICAÇÃO DO SISTEMA HIDRÁULICO (Vazamentos/Pressão)", "checked": false}]';
    chk_extrusoras JSONB := '[{"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false}, {"action": "VERIFICAÇÃO DE ÓLEO (Antes da partida)", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "VERIFICAR VAZAMENTOS", "checked": false}, {"action": "LIMPEZA INTERNA DO PAINEL", "checked": false}, {"action": "VERIFICAR CILINDRO HIDRÁULICO", "checked": false}, {"action": "VERIFICAR RESISTÊNCIAS", "checked": false}]';
    chk_extrusora_pa JSONB := '[{"action": "VERIFICAÇÃO DE VAZAMENTOS", "checked": false}, {"action": "VERIFICAÇÃO DE NÍVEL DE ÓLEO (Antes da partida)", "checked": false}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR", "checked": false}, {"action": "VERIFICAR RESISTÊNCIAS DAS ZONAS DE AQUECIMENTO", "checked": false}, {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO", "checked": false}]';
    chk_fornos JSONB := '[{"action": "REAPERTO DOS CONTATOS ELÉTRICOS", "checked": false}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR (Ventilação)", "checked": false}, {"action": "VERIFICAÇÃO DA VEDAÇÃO DA PORTA", "checked": false}, {"action": "CALIBRAÇÃO DE TEMPERATURA", "checked": false}, {"action": "VERIFICAR TUBULAÇÃO DE GÁS (Segurança)", "checked": false}, {"action": "VERIFICAR ESTRUTURA FÍSICA", "checked": false}]';
    chk_tornos_mec JSONB := '[{"action": "VERIFICAR FOLGA DO CARRO TRANSVERSAL", "checked": false}, {"action": "LUBRIFICAÇÃO DE BARRAMENTOS E FUSOS", "checked": false}, {"action": "AJUSTE DO FREIO DO MOTOR", "checked": false}, {"action": "VERIFICAR/TROCAR ÓLEO DA CAIXA NORTON", "checked": false}]';
    chk_tornos_cnc JSONB := '[{"action": "NÍVEL DE ÓLEO DO BARRAMENTO", "checked": false}, {"action": "LIMPAR FILTROS DE AR DO PAINEL", "checked": false}, {"action": "VERIFICAR CORREIAS DO SPINDLE", "checked": false}, {"action": "VERIFICAR COOLER DO DRIVE", "checked": false}, {"action": "VERIFICAR NIVELAMENTO", "checked": false}, {"action": "VERIFICAR GEOMETRIA", "checked": false}]';
    chk_tornos_aut JSONB := '[{"action": "VERIFICAR CAMES E ALAVANCAS", "checked": false}, {"action": "LUBRIFICAÇÃO DE BARRAMENTOS", "checked": false}, {"action": "AJUSTE MANDRIL/PINÇAS", "checked": false}, {"action": "NÍVEL DE ÓLEO DE CORTE", "checked": false}, {"action": "VERIFICAR ROLAMENTOS (6202 ZZ/32005)", "checked": false}]';
    chk_trancadeiras JSONB := '[{"action": "VERIFICAR PRESILHA DA ESPULHA"}, {"action": "VERIFICAR ROLDANA DA ESPULHA"}, {"action": "MEDIÇÃO DA CORRENTE DO MOTOR"}, {"action": "VERIFICAR PAINEL ELÉTRICO"}, {"action": "VERIFICAR REDUTOR"}, {"action": "VERIFICAR BOTOEIRAS E CONTATOS"}, {"action": "VERIFICAR MOTOR"}]';
    chk_espuladeiras JSONB := '[{"action": "SISTEMA DE TENSIONAMENTO"}, {"action": "GUIAS DE CERÂMICA"}, {"action": "CORREIAS V-BELT"}, {"action": "LUBRIFICAR MANCAIS"}]';
    chk_corrugar JSONB := '[{"action": "ALINHAMENTO DE MOLDES"}, {"action": "LUBRIFICAÇÃO AUTOMÁTICA"}, {"action": "BICOS DE ARREFECIMENTO"}]';
    chk_compressores JSONB := '[{"action": "DRENAR CONDENSADO"}, {"action": "VERIFICAR TEMPERATURA"}, {"action": "NÍVEL DE ÓLEO DO COMPRESSOR"}, {"action": "LIMPEZA DO RADIADOR"}]';
    chk_solda JSONB := '[{"action": "VERIFICAR ASPECTO VISUAL E ESTRUTURA"}, {"action": "VERIFICAR INSTALAÇÃO ELÉTRICA"}, {"action": "VERIFICAR CABOS DE SOLDA"}, {"action": "VERIFICAR TOCHA DE SOLDAGEM"}, {"action": "VERIFICAR MOTOR E BOMBA D AGUA (Se houver)"}, {"action": "EXECUTAR LIMPEZA COM SOPRADOR DE AR"}]';
    chk_serras JSONB := '[{"action": "TENSÃO DA FITA"}, {"action": "ALINHAMENTO DAS GUIAS (ROLAMENTOS)"}, {"action": "NÍVEL DE FLUIDO REFRIGERANTE"}, {"action": "LIMPEZA DE CAVACOS"}, {"action": "VERIFICAÇÃO DA MOLA DE RETORNO"}]';
    chk_trefilas JSONB := '[{"action": "INSPECIONAR FIEIRAS"}, {"action": "LUBRIFICAÇÃO DO SISTEMA DE TRAÇÃO"}, {"action": "VERIFICAR ALINHAMENTO DOS CONES"}, {"action": "TENSÃO DAS CORREIAS"}]';
    chk_jatos JSONB := '[{"action": "VERIFICAR ESTADO DAS PALHETAS DA TURBINA"}, {"action": "INSPECIONAR CHAPAS DE PROTEÇÃO INTERNA"}, {"action": "VERIFICAR BICO DE JATEAMENTO"}, {"action": "LIMPEZA E INSPEÇÃO DOS COLETORES DE PÓ"}, {"action": "TROCA OBRIGATÓRIA DO CARTUCHO DO FILTRO DO CAPACETE"}, {"action": "VERIFICAR VEDAÇÃO DAS PORTAS DA CABINE"}, {"action": "LUBRIFICAÇÃO DOS MANCAIS PRINCIPAIS"}]';
    chk_centro_usinagem JSONB := '[{"action": "ALINHAMENTO ATC"}, {"action": "CONCENTRAÇÃO FLUIDO DE CORTE"}, {"action": "LIMPEZA TANQUE"}, {"action": "NIVELAMENTO"}]';
    
    -- CHECKLISTS ESPECÍFICOS E CRÍTICOS (COM TAGS VISUAIS)
    chk_cavalete JSONB := '[
        {"action": "[ALERTA: SEGURANÇA] Item Crítico - Laudo Obrigatório", "checked": false},
        {"action": "Verificar Filtro separador preliminar", "checked": false},
        {"action": "Verificar unidade de filtragem metálico secundário", "checked": false},
        {"action": "Verificar recipiente de água (umidificador)", "checked": false},
        {"action": "Verificar nível de água no umidificador", "checked": false},
        {"action": "Verificar mangueiras de entradas e saídas", "checked": false},
        {"action": "Limpeza do filtro de linha do jato (pré-cavalete) – lavagem/substituição", "checked": false},
        {"action": "ACIONAR COMPRAS: Enviar para manutenção externa", "checked": false}
    ]';
    
    chk_torre JSONB := '[
        {"action": "[ALERTA: TERCEIRO] AGENDAR COM ESPECIALISTA", "checked": false},
        {"action": "Limpeza química e mecânica", "checked": false},
        {"action": "Análise da qualidade da água", "checked": false},
        {"action": "Verificação de bicos aspersores e enchimento", "checked": false}
    ]';
    
    chk_preditiva JSONB := '[
        {"action": "[ALERTA: TERCEIRO] SAMPRED - Vibração/Termografia", "checked": false},
        {"action": "Coleta de dados de Vibração", "checked": false},
        {"action": "Termografia de Painéis/Motores", "checked": false},
        {"action": "Envio de Relatório Técnico (SAMPRED)", "checked": false}
    ]';

    -- Checklists de Terceiros Específicos
    chk_si JSONB := '[{"action": "[ALERTA: TERCEIRO] Verificação instalação"}, {"action": "Cabos de indução"}]';
    chk_sc JSONB := '[{"action": "[ALERTA: TERCEIRO] Verificar fixação da lâmina"}, {"action": "Motor"}]';
    chk_cv JSONB := '[{"action": "[ALERTA: TERCEIRO] Verificar pistões"}, {"action": "Vazamentos"}]';
    chk_rm JSONB := '[{"action": "[ALERTA: TERCEIRO] Verificar sistema de prensagem"}, {"action": "Vazamentos"}]';
    chk_chiller JSONB := '[{"action": "[ALERTA: TERCEIRO] Verificar pressões alta/baixa"}, {"action": "Vazamentos gás"}, {"action": "Nível água/aditivo"}, {"action": "Filtros"}, {"action": "Bomba"}, {"action": "Colmeias"}, {"action": "Ventiladores"}]';
    chk_af JSONB := '[{"action": "[ALERTA: TERCEIRO] AGENDAR 30 DIAS ANTES"}, {"action": "Conexões alta pressão"}, {"action": "Vedações"}, {"action": "Válvulas"}, {"action": "Óleo"}, {"action": "Filtros"}, {"action": "Multiplicador"}, {"action": "Manômetros"}]';
    chk_laser JSONB := '[{"action": "[ALERTA: TERCEIRO] Limpeza óticas/lentes"}, {"action": "Chiller interno"}, {"action": "Alinhamento feixe"}, {"action": "Exaustão"}]';
    chk_tr JSONB := '[{"action": "[ALERTA: TERCEIRO] Cabeçote"}, {"action": "Folga carros"}, {"action": "Fim de curso"}, {"action": "Óleo caixa"}]';
    chk_et JSONB := '[{"action": "[ALERTA: TERCEIRO] Limpeza funil"}, {"action": "Resistências"}, {"action": "Termostato"}, {"action": "Filtros"}]';
    chk_mv JSONB := '[{"action": "[ALERTA: TERCEIRO] Matrizes"}, {"action": "Eixos"}, {"action": "Pressão"}]';

BEGIN

    DELETE FROM public.maintenance_plans;

    -- =========================================================================
    -- CRIAÇÃO DOS PLANOS MESTRES (SEED)
    -- =========================================================================

    -- FAMÍLIAS PADRÃO (Sem alterações de ID ou lógica, apenas update de checklist se necessário)
    INSERT INTO public.maintenance_plans (id, description, frequency, start_month, maintenance_type, tasks, target_equipment_ids) VALUES
    ('PLAN-PH-TRIMESTRAL', 'Preventiva Trimestral - Prensas Hidráulicas', 3, 'Janeiro', 'Preventiva', chk_prensas, '{PH-01,PH-02,PH-03,PH-04,PH-05,PH-06,PH-07,PH-08,PH-09,PH-10,PH-11,PH-12,PH-13,PH-14,PH-15,PH-16,PH-17,PH-18,PH-19,PH-20}'),
    ('PLAN-EX-TRIMESTRAL', 'Preventiva Trimestral - Extrusoras', 3, 'Janeiro', 'Preventiva', chk_extrusoras, '{EX-01,EX-02,EX-03,EX-04,EX-05,EX-06,EX-07}'),
    ('PLAN-AEX-TRIMESTRAL', 'Preventiva Trimestral - Extrusora PA', 3, 'Janeiro', 'Preventiva', chk_extrusora_pa, '{AEX-01,AEX-02}'),
    ('PLAN-FO-GENERICO', 'Preventiva Trimestral - Fornos', 3, 'Janeiro', 'Preventiva', chk_fornos, '{FO-01,FO-02,FO-03,FO-04,FO-05,FO-06,FO-07,FO-08,FO-09,FO-10,FO-11,FO-12,FO-13,FO-14}'),
    ('PLAN-TM-TRIMESTRAL', 'Preventiva Trimestral - Torno Mecânico', 3, 'Janeiro', 'Preventiva', chk_tornos_mec, '{TM-01,TM-02,TM-03,TM-04,TM-05,TM-06,TM-07}'),
    ('PLAN-TC-SEMESTRAL', 'Preventiva Semestral - Torno CNC', 6, 'Janeiro', 'Preventiva', chk_tornos_cnc, '{TC-01,TC-02,TC-03,TC-04,TC-05,TC-06,TC-07,TC-08}'),
    ('PLAN-TA-ANUAL', 'Preventiva Anual - Torno Automático', 12, 'Janeiro', 'Preventiva', chk_tornos_aut, '{TA-01,TA-02,TA-03,TA-04,TA-05,TA-06}'),
    ('PLAN-MS-BIMESTRAL', 'Preventiva Bimestral - Solda', 2, 'Janeiro', 'Preventiva', chk_solda, '{MS-01,MS-02,MS-03,MS-04,MS-05}'),
    ('PLAN-CO-ANUAL', 'Preventiva Anual - Compressores', 12, 'Setembro', 'Preventiva', chk_compressores, '{CO-01,CO-02,CO-03}'),
    ('PLAN-SF-SEMESTRAL', 'Preventiva Semestral - Serras', 6, 'Abril', 'Preventiva', chk_serras, '{SF-01,SF-02,SF-04}'),
    ('PLAN-TF-SEMESTRAL', 'Preventiva Semestral - Trefilas', 6, 'Abril', 'Preventiva', chk_trefilas, '{TF-01,TF-02,TF-03,TF-04}'),
    ('PLAN-JT-TRIMESTRAL', 'Preventiva Trimestral - Jatos', 3, 'Fevereiro', 'Preventiva', chk_jatos, '{JT-01,JT-02}'),
    ('PLAN-CT-SEMESTRAL', 'Preventiva Semestral - Centro Usinagem', 6, 'Janeiro', 'Preventiva', chk_centro_usinagem, '{CT-01,CT-02}'),
    ('PLAN-TD-TRIMESTRAL', 'Preventiva Trimestral - Trançadeiras', 3, 'Janeiro', 'Preventiva', chk_trancadeiras, '{TD-01,TD-02,TD-03,TD-04,TD-05,TD-06,TD-07,TD-08,TD-09}'),
    ('PLAN-EP-QUADRIMESTRAL', 'Preventiva Quadrimestral - Espuladeiras', 4, 'Janeiro', 'Preventiva', chk_espuladeiras, '{EP-01,EP-02,EP-03}'),
    ('PLAN-CR-BIMESTRAL', 'Preventiva Bimestral - Corrugar', 2, 'Janeiro', 'Preventiva', chk_corrugar, '{CR-01,CR-02,CR-03}');

    -- PLANOS ESPECÍFICOS DE TERCEIROS (COM ALERTAS NO CHECKLIST)
    INSERT INTO public.maintenance_plans (id, description, frequency, start_month, maintenance_type, tasks, target_equipment_ids) VALUES
    ('PLAN-SI-TRIMESTRAL', 'Preventiva Trimestral - Solda Indução (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_si, '{SI-01}'),
    ('PLAN-SC-TRIMESTRAL', 'Preventiva Trimestral - Serra Circular (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_sc, '{SC-01}'),
    ('PLAN-CV-TRIMESTRAL', 'Preventiva Trimestral - Curvadora (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_cv, '{CV-01}'),
    ('PLAN-RM-TRIMESTRAL', 'Preventiva Trimestral - Recravadeira (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_rm, '{RM-01}'),
    ('PLAN-EF-TRIMESTRAL', 'Preventiva Trimestral - Conformadora (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_rm, '{EF-01}'), -- Usa mesmo da RM
    ('PLAN-CH-TRIMESTRAL', 'Preventiva Trimestral - Chiller (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_chiller, '{CH-01}'),
    ('PLAN-AF-TRIMESTRAL', 'Preventiva Trimestral - Autofretagem (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_af, '{AF-01}'),
    ('PLAN-ML-SEMESTRAL', 'Preventiva Semestral - Laser (Terceiro)', 6, 'Janeiro', 'Preventiva', chk_laser, '{ML-01,ML-02}'),
    ('PLAN-TR-TRIMESTRAL', 'Preventiva Trimestral - Torno Revolver (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_tr, '{TR-01}'),
    ('PLAN-ET-TRIMESTRAL', 'Preventiva Trimestral - Estufa Funil (Terceiro)', 3, 'Janeiro', 'Preventiva', chk_et, '{ET-01}'),
    ('PLAN-MV-SEMESTRAL', 'Preventiva Semestral - Virola (Terceiro)', 6, 'Janeiro', 'Preventiva', chk_mv, '{MV-01}');

    -- PLANOS MANUAIS ESPECÍFICOS
    INSERT INTO public.maintenance_plans (id, description, frequency, start_month, maintenance_type, tasks, target_equipment_ids) VALUES
    ('PLAN-CF-ANUAL', 'Preventiva Anual - Câmara Fria', 12, 'Janeiro', 'Preventiva', '[{"action": "Verificação Geral"}, {"action": "Temperatura"}, {"action": "Corrente Motor"}, {"action": "Limpeza grade ar condicionado"}]'::jsonb, '{CF-01}'),
    ('PLAN-PM-TRIMESTRAL', 'Preventiva Trimestral - Pré-Molde', 3, 'Janeiro', 'Preventiva', '[{"action": "Nível óleo"}, {"action": "Limpeza hidráulica"}, {"action": "Conexões"}]'::jsonb, '{PM-01}'),
    ('PLAN-CP-BIMESTRAL', 'Preventiva Bimestral - Cabine Pintura', 2, 'Janeiro', 'Preventiva', '[{"action": "Elétrica"}, {"action": "Filtros secos"}, {"action": "Exaustão"}, {"action": "Vidros"}]'::jsonb, '{CP-01,CP-02}'),
    ('PLAN-EN-QUADRIMESTRAL', 'Preventiva Quadrimestral - Enrolador', 4, 'Janeiro', 'Preventiva', '[{"action": "Eixo expansível"}, {"action": "Guias"}, {"action": "Tensão fita"}, {"action": "Correias"}, {"action": "Ruídos"}]'::jsonb, '{EN-01}'),
    ('PLAN-TB-ANUAL', 'Preventiva Anual - Tamboreador', 12, 'Janeiro', 'Preventiva', '[{"action": "Rolamentos excêntrico"}, {"action": "Fixação"}, {"action": "Molas"}, {"action": "Correia"}, {"action": "Revestimento"}]'::jsonb, '{TB-01}'),
    ('PLAN-RE-SEMESTRAL', 'Preventiva Semestral - Retífica', 6, 'Janeiro', 'Preventiva', '[{"action": "Rebolo"}, {"action": "Barramentos"}, {"action": "Fluido"}, {"action": "Diamantador"}, {"action": "Elétrica"}]'::jsonb, '{RE-01}'),
    ('PLAN-PO-ANUAL', 'Preventiva Anual - Policorte', 12, 'Janeiro', 'Preventiva', '[{"action": "Disco"}, {"action": "Mola retorno"}, {"action": "Morsa"}, {"action": "Cabos"}, {"action": "Coifa"}]'::jsonb, '{PO-01}'),
    ('PLAN-TS-SEMESTRAL', 'Preventiva Semestral - Máq. Teste', 6, 'Janeiro', 'Preventiva', '[{"action": "Calibração"}, {"action": "Estanqueidade"}, {"action": "Segurança"}, {"action": "Mangueiras"}]'::jsonb, '{TS-01}'),
    ('PLAN-CA-SEMESTRAL', 'Preventiva Semestral - Calandra', 6, 'Janeiro', 'Preventiva', '[{"action": "Rolos/Engrenagens"}, {"action": "Paralelismo"}, {"action": "Base"}, {"action": "Correias"}]'::jsonb, '{CA-01}'),
    ('PLAN-PL-SEMESTRAL', 'Preventiva Semestral - Plaina', 6, 'Janeiro', 'Preventiva', '[{"action": "Nivelamento"}, {"action": "Guias"}, {"action": "Curso braço"}, {"action": "Lubrificação"}]'::jsonb, '{PL-01}'),
    ('PLAN-GUI-SEMESTRAL', 'Preventiva Semestral - Guilhotina', 6, 'Janeiro', 'Preventiva', '[{"action": "Afiação"}, {"action": "Guias"}, {"action": "Proteção"}, {"action": "Óleo"}]'::jsonb, '{GUI-01}'),
    ('PLAN-FR-SEMESTRAL', 'Preventiva Semestral - Fresadora', 6, 'Janeiro', 'Preventiva', '[{"action": "Fusos/Barramentos"}, {"action": "Folga cabeçote"}, {"action": "Refrigeração"}, {"action": "Elétrica"}]'::jsonb, '{FR-01,FR-02}'),
    ('PLAN-RO-SEMESTRAL', 'Preventiva Semestral - Router', 6, 'Janeiro', 'Preventiva', '[{"action": "Cremalheiras"}, {"action": "Vácuo"}, {"action": "Spindle"}, {"action": "Filtros"}]'::jsonb, '{RO-01,RO-02}'),
    ('PLAN-PX-TRIMESTRAL', 'Preventiva Trimestral - Puxador', 3, 'Janeiro', 'Preventiva', '[{"action": "Esteiras"}, {"action": "Tensão pneumática"}, {"action": "Sincronismo"}, {"action": "Eixos"}]'::jsonb, '{PX-01}'),
    ('PLAN-TES-SEMESTRAL', 'Preventiva Semestral - Teste Trefila', 6, 'Janeiro', 'Preventiva', '[{"action": "Células carga"}, {"action": "Garras"}, {"action": "Guias"}]'::jsonb, '{TES-01}'),
    ('PLAN-MG-TRIMESTRAL', 'Preventiva Trimestral - Moldagem Glic.', 3, 'Janeiro', 'Preventiva', '[{"action": "Condições gerais"}, {"action": "Contatos"}, {"action": "Nível glicerina"}]'::jsonb, '{MG-01}');

    -- SEGURANÇA E PREDITIVA
    -- Cavalete Ar
    INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester, plan_id) VALUES
    (to_char(nextval('work_orders_id_seq'), 'FM0000'), 'CL-01', 'Preventiva', 'Programado', '2026-03-10 08:00:00', 'Manutenção Cavalete Ar (Segurança)', chk_cavalete, 'Segurança', 'PLAN-CL01-QUINTIMESTRAL');
    
    -- Torre
    INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester) VALUES
    (to_char(nextval('work_orders_id_seq'), 'FM0000'), 'TRA-01', 'Preventiva', 'Programado', '2026-12-10 08:00:00', '[ALERTA: TERCEIRO] Torre de Resfriamento - Verão', chk_torre, 'Utilidades');

    -- Gerador
    INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester) VALUES
    (to_char(nextval('work_orders_id_seq'), 'FM0000'), 'GE-01', 'Preventiva', 'Programado', '2026-08-27 08:00:00', '[ALERTA: TERCEIRO] Manutenção Gerador (Vencimento)', chk_terceiro, 'Manutenção');

    -- Preditiva Geral
    INSERT INTO public.work_orders (id, equipment_id, type, status, scheduled_date, description, checklist, requester)
    SELECT 
        to_char(nextval('work_orders_id_seq'), 'FM0000'),
        id,
        'Preditiva',
        'Programado',
        '2026-11-20 09:00:00',
        'Preditiva Anual (Vibração/Termografia/Elétrica) - SAMPRED',
        chk_preditiva,
        'SAMPRED'
    FROM public.equipments 
    WHERE category = 'Industrial' AND status = 'Ativo' AND id NOT IN ('CL-01', 'TRA-01');

    -- REGENERAÇÃO DO CRONOGRAMA
    PERFORM generate_preventive_orders_for_2026();

END $$;

COMMIT;

SELECT 'Checklists atualizados e cronograma sincronizado!';
