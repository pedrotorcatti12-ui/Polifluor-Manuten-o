-- =============================================================================
-- SCRIPT DE CARGA DE PLANOS DETALHADOS (SEED) - SGMI 2.0
-- Inserção dos Planos de Manutenção Baseados no JSON fornecido
-- =============================================================================

BEGIN;

-- Garante que o tipo GENERICO existe para o Plano de Conformidade
INSERT INTO public.equipment_types (id, description) VALUES ('GENERICO', 'GENERICO') ON CONFLICT DO NOTHING;

-- Inserção dos Planos com tratamento de nomes de tipos (remoção de acentos/ajuste para chaves estrangeiras)
INSERT INTO public.maintenance_plans (id, description, equipment_type_id, target_equipment_ids, frequency, maintenance_type, start_month, tasks) VALUES
('PLAN-PH-TRIMESTRAL', 'Preventiva Trimestral - Prensas Hidráulicas', 'PRENSA_HIDRULICA', '{PH-01,PH-02,PH-03,PH-04,PH-05,PH-06,PH-07,PH-08,PH-09,PH-10,PH-11,PH-12,PH-13,PH-14,PH-15,PH-16,PH-17,PH-18,PH-19,PH-20}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAÇÃO DO NIVEL DE OLEO ANTES DA PARTIDA"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS"}, {"action": "APERTO DE TERMINAIS"}, {"action": "LIMPEZA INTERNA DOS COMPONENTES"}, {"action": "VERIFICAÇÃO DO SISTEMA HIDRÁULICO"}]'::jsonb),

('PLAN-EX-TRIMESTRAL', 'Preventiva Trimestral - Extrusoras', 'EXTRUSORA', '{EX-01,EX-02,EX-03,EX-04,EX-05,EX-06,EX-07}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "REAPERTO DE CONTATOS ELÉTRICOS"}, {"action": "VERIFICAÇÃO DE ÓLEO ANTES DA PARTIDA"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "VERIFICAR VAZAMENTOS"}, {"action": "LIMPEZA INTERNA DO PAINEL"}, {"action": "VERIFICAR CILINDRO HIDRÁULICO"}, {"action": "VERIFICAR RESISTENCIA"}]'::jsonb),

('PLAN-AEX-TRIMESTRAL', 'Preventiva Trimestral - Extrusora de PA', 'EXTRUSORA_DE_PA', '{AEX-01,AEX-02}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAÇÃO DE VAZAMENTOS"}, {"action": "VERIFICAÇÃO DE NIVEL DE ÓLEO ANTES DA PARTIDA"}, {"action": "REAPERTO DE CONTATOS ELÉTRICOS"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "VERIFICAR RESISTENCIAS DAS ZONAS DE AQUECIMENTO"}, {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO"}]'::jsonb),

('PLAN-FO-GENERICO', 'Preventiva Trimestral - Fornos e Estufas', 'FORNO', '{FO-01,FO-02,FO-03,FO-04,FO-05,FO-06,FO-08,FO-09,FO-12,FO-13,FO-14}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Reaperto contatos"}, {"action": "Corrente resistências"}, {"action": "Vedação porta"}, {"action": "Calibração temp."}]'::jsonb),

('PLAN-FO07-TRIMESTRAL', 'Preventiva Trimestral - Forno 07', 'FORNO', '{FO-07}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "REAPERTO DOS CONTATOS ELÉTRICOS"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "REAPERTO DAS CORREIAS DO MOTOR"}, {"action": "VERIFICAR TUBULAÇÃO DE GÁS"}, {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO"}]'::jsonb),

('PLAN-FO10-TRIMESTRAL', 'Preventiva Trimestral - Forno 10', 'FORNO', '{FO-10}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "REAPERTO DOS CONTATOS ELÉTRICOS"}, {"action": "REAPERTO DAS CORREIAS DO MOTOR"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR 2"}, {"action": "3 E 1"}, {"action": "VERIRICAR CORREIAS"}, {"action": "VERIFICAR LUBRIFICAÇÃO DOS ROLAMENTOS"}, {"action": "VERIFICAR TUBULAÇÃO DE GÁS"}, {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO"}]'::jsonb),

('PLAN-FO11-TRIMESTRAL', 'Preventiva Trimestral - Forno 11', 'FORNO', '{FO-11}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "REAPERTO DOS CONTATOS ELÉTRICOS"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "REAPERTO DAS CORREIAS DO MOTOR"}, {"action": "VERIFICAR LUBRIFICAÇÃO DO ROLAMENTO"}, {"action": "VERIFICAR TUBULAÇÃO DE GÁS"}, {"action": "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO"}]'::jsonb),

('PLAN-GE-ANUAL', 'Preventiva Anual - Gerador (Serviço Externo)', 'GERADOR', '{GE-01}', 12, 'Preventiva', 'Agosto', 
'[{"action": "AGENDAR SERVIÇO EXTERNO (VENCIMENTO EM 27/08/2026)"}, {"action": "Serviços de substituição de óleo"}, {"action": "filtro do óleo"}, {"action": "Filtro 1518512"}, {"action": "Filtro de combustível"}, {"action": "Filtro separador"}, {"action": "Abastecimento (150L)"}]'::jsonb),

('PLAN-MI-ANUAL', 'Preventiva Anual - Misturadores', 'MISTURADOR', '{MI-01,MI-02,MI-03}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "Nível óleo 320"}, {"action": "Desgaste das pás"}, {"action": "Reaperto da base do motor"}]'::jsonb),

('PLAN-CO-ANUAL', 'Preventiva Anual - Compressores', 'COMPRESSOR_DE_PARAFUSO', '{CO-01,CO-02,CO-03}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "Drenar condensado"}, {"action": "Temperatura"}, {"action": "Nível óleo compressor"}, {"action": "Limpeza radiador"}]'::jsonb),

('PLAN-ES-ANUAL', 'Preventiva Anual - Esmeril', 'ESMERIL', '{ES-01,ES-03,ES-04}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAR ESTADO DOS REBOLOS"}, {"action": "AJUSTAR APOIO"}, {"action": "VERIFICAR PROTEÇÃO VISUAL"}, {"action": "TESTE DE ISOLAMENTO ELÉTRICO"}]'::jsonb),

('PLAN-MS-BIMESTRAL', 'Preventiva Bimestral - Máquinas de Solda (Padrão)', 'MAQUINA_DE_SOLDA', '{MS-01,MS-02,MS-04}', 2, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAR ASPECTO VISUAL E ESTRUTURA"}, {"action": "VERIFICAR INSTALAÇÃO ELÉTRICA"}, {"action": "VERIFICAR CABOS DE SOLDA"}, {"action": "VERIFICAR MANGUEIRA"}, {"action": "VERIFICAR TOCHA DE SOLDAGEM"}, {"action": "VERIFICAR MOTOR E BOMBA D AGUA"}, {"action": "EXECUTAR LIMPEZA COM SOPRADOR DE AR"}]'::jsonb),

('PLAN-MS03-BIMESTRAL', 'Preventiva Bimestral - Máquina de Solda (SUMIG)', 'MAQUINA_DE_SOLDA', '{MS-03}', 2, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAR ASPECTO VISUAL E ESTRUTURA"}, {"action": "VERIFICAR INSTALAÇÃO ELÉTRICA"}, {"action": "VERIFICAR CABOS DE SOLDA"}, {"action": "VERIFICAR TOCHA DE SOLDAGEM"}, {"action": "EXECUTAR LIMPEZA COM SOPRADOR DE AR"}]'::jsonb),

('PLAN-CT-SEMESTRAL', 'Preventiva Semestral - Centro de Usinagem', 'CENTRO_DE_USINAGEM', '{CT-01,CT-02}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Alinhamento ATC"}, {"action": "Concentração fluido corte"}, {"action": "Limpeza tanque"}, {"action": "Nivelamento"}]'::jsonb),

('PLAN-TC-SEMESTRAL', 'Preventiva Semestral - Torno CNC', 'TORNO_CNC', '{TC-01,TC-02,TC-03,TC-04,TC-05,TC-06,TC-07,TC-08}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Nível óleo barramento"}, {"action": "Limpar filtros ar painel"}, {"action": "Correias Spindle"}, {"action": "Cooler do drive"}, {"action": "Nivelamento"}, {"action": "Geometria."}]'::jsonb),

('PLAN-TM-TRIMESTRAL', 'Preventiva Trimestral - Torno Mecânico', 'TORNO_MECANICO', '{TM-01,TM-02,TM-03,TM-04,TM-05,TM-06,TM-07}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Folga carro transversal"}, {"action": "Lubrificar barramentos/fusos"}, {"action": "Ajustar freio motor"}, {"action": "Óleo caixa Norton"}]'::jsonb),

('PLAN-EP-QUADRIMESTRAL', 'Preventiva Quadrimestral - Espuladeira', 'ESPULADEIRA', '{EP-01,EP-02,EP-03}', 4, 'Preventiva', 'Janeiro', 
'[{"action": "Sistema tencionamento"}, {"action": "Guias cerâmica"}, {"action": "Correias V-Belt"}, {"action": "Lubrificar mancais"}]'::jsonb),

('PLAN-TD-TRIMESTRAL', 'Preventiva Trimestral - Trançadeiras', 'TRANADEIRA', '{TD-01,TD-02,TD-03,TD-04,TD-05,TD-06,TD-07,TD-08,TD-09}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAR PRESILHA DA ESPULHA"}, {"action": "VERIFICAR ROLDANA DA ESPULHA"}, {"action": "MEDIÇÃO DA CORRENTE DO MOTOR"}, {"action": "VERIFICAR PAINEL ELÉTRICO"}, {"action": "VERIFICAR REDUTOR"}, {"action": "VERIFICAR BOTOEIRAS E CONTATOS"}, {"action": "VERIFICAR MOTOR"}]'::jsonb),

('PLAN-CR-BIMESTRAL', 'Preventiva Bimestral - Máquina de Corrugar', 'MAQUINA_DE_CORRUGAR', '{CR-01,CR-02,CR-03}', 2, 'Preventiva', 'Janeiro', 
'[{"action": "Alinhamento moldes"}, {"action": "Lubrificação automática"}, {"action": "Bicos arrefecimento"}]'::jsonb),

('PLAN-TRA-MENSAL', 'Preventiva Mensal - Torre de Resfriamento', 'TORRE_DE_RESFRIAMENTO', '{TRA-01}', 1, 'Preventiva', 'Janeiro', 
'[{"action": "Qualidade água"}, {"action": "Filtros bomba"}, {"action": "Vibração ventilador"}, {"action": "Boia de nível"}]'::jsonb),

('PLAN-MG-TRIMESTRAL', 'Preventiva Trimestral - Moldagem Glicerina', 'MOLDAGEM_COM_GLICERINA', '{MG-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Condições gerais"}, {"action": "Reaperto contatos"}, {"action": "Nível de Glicerina"}]'::jsonb),

('PLAN-CF-ANUAL', 'Preventiva Anual - Câmara Fria', 'CMARA_FRIA', '{CF-01}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "VERIFICAÇÃO GERAL DO EQUIPAMENTO"}, {"action": "VERIFICAÇÃO DE TEMPERATURA"}, {"action": "MEDIÇÃO DE CORRENTE DO MOTOR"}, {"action": "LIMPEZA DA GRADE DO AR CONDICIONADO"}]'::jsonb),

('PLAN-JATOS-TRIMESTRAL', 'Preventiva Trimestral - Jatos de Abrasão', 'JATO_DE_GRANALHA', '{JT-01,JT-02}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado das palhetas da turbina"}, {"action": "Inspecionar chapas de proteção interna"}, {"action": "Verificar bico de jateamento"}, {"action": "Limpeza"}, {"action": "inspeção dos coletores de pó"}, {"action": "Troca obrigatória do cartucho do filtro do capacete"}, {"action": "Verificar vedação das portas da cabine"}, {"action": "Lubrificação dos mancais principais"}]'::jsonb),

('PLAN-PM-TRIMESTRAL', 'Preventiva Trimestral - Pré-Molde', 'PRMOLDE', '{PM-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Nível óleo"}, {"action": "Limpeza sistema hidráulico"}, {"action": "Reaperto conexões"}]'::jsonb),

('PLAN-CP-BIMESTRAL', 'Preventiva Bimestral - Cabine de Pintura', 'CABINE_DE_PINTURA', '{CP-01,CP-02}', 2, 'Preventiva', 'Janeiro', 
'[{"action": "Instalação elétrica"}, {"action": "Filtros secos"}, {"action": "Motor/Exaustão"}, {"action": "Vidros teto"}, {"action": "Estrutura metálica"}]'::jsonb),

('PLAN-SI-TRIMESTRAL', 'Preventiva Trimestral - Solda por Indução', 'SOLDA_POR_INDUO', '{SI-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar instalação"}, {"action": "cabos de indução"}]'::jsonb),

('PLAN-SC-TRIMESTRAL', 'Preventiva Trimestral - Serra Circular', 'SERRA_CIRCULAR', '{SC-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar fixação da lâmina"}, {"action": "motor"}]'::jsonb),

('PLAN-CV-TRIMESTRAL', 'Preventiva Trimestral - Curvadora', 'CURVADORA', '{CV-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar pistões"}, {"action": "vazamentos"}]'::jsonb),

('PLAN-EF-TRIMESTRAL', 'Preventiva Trimestral - Conformadora', 'CONFORMADORA', '{EF-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Plano vinculado à RM - verificar moldes"}]'::jsonb),

('PLAN-RM-TRIMESTRAL', 'Preventiva Trimestral - Recravadeira', 'RECRAVADEIRA_DE_MANGUEIRAS', '{RM-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar sistema de prensagem"}, {"action": "vazamentos"}]'::jsonb),

('PLAN-CH-TRIMESTRAL', 'Preventiva Trimestral - Chiller', 'CHILLER', '{CH-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar pressões de alta"}, {"action": "baixa do fluido refrigerante"}, {"action": "Inspecionar vazamentos de óleo/gás"}, {"action": "Verificar nível de água/aditivo no reservatório"}, {"action": "Limpar filtros de linha de água"}, {"action": "Inspecionar bomba de circulação"}, {"action": "Limpeza das colmeias/condensador"}, {"action": "Verificar ventiladores do condensador"}, {"action": "Reaperto de bornes"}, {"action": "contatores"}, {"action": "Conferir setpoint de temperatura"}, {"action": "Medição de corrente do compressor"}]'::jsonb),

('PLAN-EN-QUADRIMESTRAL', 'Preventiva Quadrimestral - Enrolador de Fita', 'ENROLADOR_DE_FITA', '{EN-01}', 4, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado do eixo expansível/mandril"}, {"action": "Inspecionar alinhamento das guias de fita"}, {"action": "Verificar a tensão da fita"}, {"action": "Verificar correias ou correntes de transmissão"}, {"action": "Lubrificar mancais"}, {"action": "rolamentos"}, {"action": "Verificar ruídos no motor"}, {"action": "Verificar botão de emergência"}, {"action": "Inspecionar cabos de alimentação"}, {"action": "Limpeza geral de resíduos"}]'::jsonb),

('PLAN-TB-ANUAL', 'Preventiva Anual - Tamboreador', 'TAMBOREADOR', '{TB-01}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "Inspecionar rolamentos do eixo excêntrico"}, {"action": "Verificar fixação das massas excêntricas"}, {"action": "Verificar molas de suspensão ou coxins"}, {"action": "Verificar tensão da correia"}, {"action": "Inspecionar revestimento interno"}, {"action": "Verificar vedação da tampa"}, {"action": "Reaperto de terminais no painel"}, {"action": "Verificar fixação da base"}, {"action": "Limpeza externa"}]'::jsonb),

('PLAN-AF-TRIMESTRAL', 'Preventiva Trimestral - Autofretagem (Serviço Externo)', 'AUTOFRETAGEM', '{AF-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "AGENDAR SERVIÇO EXTERNO (30 DIAS ANTES)"}, {"action": "Inspecionar conexões de alta pressão"}, {"action": "Verificar vedações"}, {"action": "Testar válvulas de alívio"}, {"action": "Verificar óleo hidráulico"}, {"action": "Limpeza de filtros"}, {"action": "Inspecionar multiplicador de pressão"}, {"action": "Calibração de manômetros"}, {"action": "Testar intertravamentos de segurança"}]'::jsonb),

('PLAN-MI04-ANUAL', 'Preventiva Anual - Misturador (Extrusão)', 'MISTURADOR', '{MI-04}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar nível de óleo do redutor (Óleo 320)"}, {"action": "Verificar pás de mistura (desgaste)"}, {"action": "Reaperto da base do motor"}, {"action": "Limpeza externa"}, {"action": "verificação de ruídos anormais"}]'::jsonb),

('PLAN-RE-SEMESTRAL', 'Preventiva Semestral - Retífica', 'RETIFICA_DEWALT', '{RE-01}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado"}, {"action": "balanceamento do rebolo"}, {"action": "Limpar"}, {"action": "lubrificar barramentos"}, {"action": "fusos"}, {"action": "Verificar nível do fluido de refrigeração"}, {"action": "filtros"}, {"action": "Inspecionar diamantador"}, {"action": "Verificar folgas no cabeçote"}, {"action": "mesa"}, {"action": "Reaperto de contatos elétricos"}, {"action": "teste de isolamento"}]'::jsonb),

('PLAN-PO-ANUAL', 'Preventiva Anual - Policorte', 'POLICORTE', '{PO-01}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar estado do disco de corte"}, {"action": "Inspecionar a mola de retorno do cabeçote"}, {"action": "Verificar fixação"}, {"action": "alinhamento da morsa"}, {"action": "Inspecionar cabos elétricos"}, {"action": "Verificar integridade da coifa de proteção"}, {"action": "Lubrificar o eixo de articulação"}]'::jsonb),

('PLAN-TS-SEMESTRAL', 'Preventiva Semestral - Máquina de Teste', 'MAQUINA_DE_TESTE', '{TS-01}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Calibração de sensores/manômetros"}, {"action": "Verificação de estanqueidade"}, {"action": "Teste de intertravamento de segurança"}, {"action": "Inspeção de mangueiras de alta pressão"}]'::jsonb),

('PLAN-CA-SEMESTRAL', 'Preventiva Semestral - Calandra', 'CALANDRA', '{CA-01}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Lubrificação dos rolos"}, {"action": "engrenagens"}, {"action": "Verificar paralelismo dos rolos"}, {"action": "Reaperto da base"}, {"action": "Inspeção de correias de transmissão"}]'::jsonb),

('PLAN-TR-TRIMESTRAL', 'Preventiva Trimestral - Torno Revólver', 'TORNO_REVOLVER', '{TR-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza"}, {"action": "lubrificação do cabeçote revólver"}, {"action": "Ajuste de folga dos carros"}, {"action": "Verificar fim de curso mecânico"}, {"action": "Óleo da caixa de engrenagens"}]'::jsonb),

('PLAN-PL-SEMESTRAL', 'Preventiva Semestral - Plaina', 'PLAINA', '{PL-01}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Nivelamento da mesa"}, {"action": "Lubrificação das guias (barramento)"}, {"action": "Verificar curso do braço (shaper)"}, {"action": "Inspeção do sistema de lubrificação automática"}]'::jsonb),

('PLAN-ET-TRIMESTRAL', 'Preventiva Trimestral - Estufa de Funil', 'ESTUFA_DE_FUNIL', '{ET-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza interna do funil"}, {"action": "Verificar resistências de aquecimento"}, {"action": "Calibração do termostato"}, {"action": "Limpeza de filtros de ar"}]'::jsonb),

('PLAN-MV-SEMESTRAL', 'Preventiva Semestral - Máquina de Virola', 'MAQUINA_DE_VIROLA', '{MV-01}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Inspeção das matrizes de dobra/virola"}, {"action": "Lubrificação de eixos"}, {"action": "articulações"}, {"action": "Verificar pressão pneumática/hidráulica"}]'::jsonb),

('PLAN-GUI-SEMESTRAL', 'Preventiva Semestral - Guilhotina', 'GUILHOTINA', '{GUI-01}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Afiação"}, {"action": "folga das facas"}, {"action": "Lubrificação das guias de descida"}, {"action": "Verificar sistema de proteção"}, {"action": "Troca de óleo hidráulico"}]'::jsonb),

('PLAN-TA-ANUAL', 'Preventiva Anual - Tornos Automáticos', 'TORNO_AUTOMTICO', '{TA-01,TA-02,TA-03,TA-04,TA-05,TA-06}', 12, 'Preventiva', 'Janeiro', 
'[{"action": "Verificar cames"}, {"action": "alavancas"}, {"action": "Lubrificar barramentos"}, {"action": "Ajustar mandril/pinças"}, {"action": "Nível de óleo de corte"}, {"action": "Rolamentos (6202 ZZ/32005)"}]'::jsonb),

('PLAN-TF-SEMESTRAL', 'Preventiva Semestral - Trefilas', 'TREFILA', '{TF-01,TF-02,TF-03,TF-04}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Inspecionar fieiras"}, {"action": "Lubrificação do sistema de tração"}, {"action": "Verificar alinhamento dos cones"}, {"action": "Tensão das correias"}]'::jsonb),

('PLAN-SF-SEMESTRAL', 'Preventiva Semestral - Serras de Fita', 'SERRA_DE_FITA', '{SF-01,SF-02,SF-03,SF-04}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Tensão da fita"}, {"action": "Alinhamento das guias (rolamentos)"}, {"action": "Nível de fluido refrigerante"}, {"action": "Limpeza de cavacos"}, {"action": "Verificação da mola de retorno"}]'::jsonb),

('PLAN-FR-SEMESTRAL', 'Preventiva Semestral - Fresadoras', 'FRESADORA_FERRAMENTARIA', '{FR-01,FR-02}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Lubrificação de fusos"}, {"action": "barramentos"}, {"action": "Verificar folga no cabeçote"}, {"action": "Limpeza do sistema de refrigeração"}, {"action": "Reaperto elétrico"}]'::jsonb),

('PLAN-ML-SEMESTRAL', 'Preventiva Semestral - Máquinas a Laser', 'MAQUINA_A_LASER', '{ML-01,ML-02}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza de óticas/lentes"}, {"action": "Verificar sistema de refrigeração (Chiller interno)"}, {"action": "Alinhamento do feixe"}, {"action": "Exaustão de fumos"}]'::jsonb),

('PLAN-RO-SEMESTRAL', 'Preventiva Semestral - Routers CNC', 'ROUTER', '{RO-01,RO-02}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Limpeza de cremalheiras/fusos"}, {"action": "Verificar vácuo da mesa"}, {"action": "Lubrificação do Spindle"}, {"action": "Troca de filtros de ar"}]'::jsonb),

('PLAN-PX-TRIMESTRAL', 'Preventiva Trimestral - Puxador (Extrusão)', 'PUXADOR', '{PX-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Alinhamento das esteiras/lagartas"}, {"action": "Tensão pneumática"}, {"action": "Sincronismo com a extrusora"}, {"action": "Lubrificação de eixos"}]'::jsonb),

('PLAN-TES-SEMESTRAL', 'Preventiva Semestral - Teste de Trefila', 'TESTE_TREFILA', '{TES-01}', 6, 'Preventiva', 'Janeiro', 
'[{"action": "Aferição de células de carga"}, {"action": "Verificação de garras de tração"}, {"action": "Backup de software de teste"}, {"action": "Limpeza de guias"}]'::jsonb),

('PLAN-CL-TRIMESTRAL', 'Preventiva Trimestral - Cavalete de Ar Respiratório', 'CAVALETE_AR_RESPIRATORIO_JATO_DE_GRANALHA', '{CL-01}', 3, 'Preventiva', 'Janeiro', 
'[{"action": "Substituição de elementos filtrantes (Coalescente/Carvão)"}, {"action": "Drenagem automática"}, {"action": "Teste de alarmes de CO/CO2"}]'::jsonb),

('PLAN-PADRAO-CONFORMIDADE', 'Preventiva Trimestral (Padrão de Conformidade)', 'GENERICO', '{TRID-01,CS-01,CPR-01,QI-01,QDF-05,QGC-01,QDF-04,QDF-02,QDF-01,QDF-06,VR-01}', 3, 'Preventiva', 'Janeiro', '[]'::jsonb)

ON CONFLICT (id) DO UPDATE SET 
    description = EXCLUDED.description,
    tasks = EXCLUDED.tasks,
    target_equipment_ids = EXCLUDED.target_equipment_ids;

COMMIT;

SELECT 'Planos de manutenção detalhados inseridos com sucesso!';