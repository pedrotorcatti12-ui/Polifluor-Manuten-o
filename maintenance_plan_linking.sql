-- SCRIPT CORRIGIDO E ROBUSTO PARA VINCULAR TIPOS DE EQUIPAMENTO AOS ATIVOS
-- Objetivo: Atualizar a coluna 'type_id' na tabela 'equipments' com o ID do tipo de equipamento correto (sem acentos e padronizado).

-- Prensas (ID: PRENSA_HIDRULICA)
UPDATE public.equipments SET type_id = 'PRENSA_HIDRULICA' WHERE name LIKE '%PRENSA%';

-- Extrusoras
UPDATE public.equipments SET type_id = 'EXTRUSORA' WHERE name = 'EXTRUSORA';
UPDATE public.equipments SET type_id = 'EXTRUSORA_DE_PA' WHERE name = 'EXTRUSORA DE PA';

-- Fornos e Estufas (agrupados em 'FORNO' para simplificar os planos)
UPDATE public.equipments SET type_id = 'FORNO' WHERE name LIKE '%FORNO%' OR name LIKE '%ESTUFA%';

-- Tornos
UPDATE public.equipments SET type_id = 'TORNO_AUTOMTICO' WHERE name LIKE '%TORNO AUTOMÁTICO%';
UPDATE public.equipments SET type_id = 'TORNO_CNC' WHERE name = 'TORNO CNC';
UPDATE public.equipments SET type_id = 'TORNO_MECANICO' WHERE name = 'TORNO MECANICO';
UPDATE public.equipments SET type_id = 'TORNO_REVOLVER' WHERE name = 'TORNO REVOLVER';

-- Trançadeiras e Espuladeiras
UPDATE public.equipments SET type_id = 'TRANADEIRA' WHERE name = 'TRANÇADEIRA';
UPDATE public.equipments SET type_id = 'ESPULADEIRA' WHERE name = 'ESPULADEIRA';

-- Serras e Policorte
UPDATE public.equipments SET type_id = 'SERRA_DE_FITA' WHERE name LIKE '%SERRA DE FITA%';
UPDATE public.equipments SET type_id = 'SERRA' WHERE name = 'SERRA';
UPDATE public.equipments SET type_id = 'SERRA_CIRCULAR' WHERE name = 'SERRA CIRCULAR';
UPDATE public.equipments SET type_id = 'POLICORTE' WHERE name = 'POLICORTE';

-- Compressores (agrupando todos sob o tipo 'COMPRESSOR_DE_PARAFUSO')
UPDATE public.equipments SET type_id = 'COMPRESSOR_DE_PARAFUSO' WHERE name LIKE '%COMPRESSOR%';

-- Máquinas de Solda e Indução
UPDATE public.equipments SET type_id = 'MAQUINA_DE_SOLDA' WHERE name = 'MAQUINA DE SOLDA';
UPDATE public.equipments SET type_id = 'SOLDA_POR_INDUO' WHERE name = 'SOLDA POR INDUÇÃO';

-- Usinagem Diversa
UPDATE public.equipments SET type_id = 'CENTRO_DE_USINAGEM' WHERE name = 'CENTRO DE USINAGEM';
UPDATE public.equipments SET type_id = 'FRESADORA_FERRAMENTARIA' WHERE name LIKE '%FRESADORA%';
UPDATE public.equipments SET type_id = 'ROUTER' WHERE name = 'ROUTER';
UPDATE public.equipments SET type_id = 'PLAINA' WHERE name = 'PLAINA';
UPDATE public.equipments SET type_id = 'ESMERIL' WHERE name = 'ESMERIL';
UPDATE public.equipments SET type_id = 'RETIFICA_DEWALT' WHERE name = 'RETIFICA DEWALT';

-- Trefilação
UPDATE public.equipments SET type_id = 'TREFILA' WHERE name = 'TREFILA';
UPDATE public.equipments SET type_id = 'ENROLADOR_DE_FITA' WHERE name = 'ENROLADOR DE FITA';
UPDATE public.equipments SET type_id = 'TESTE_TREFILA' WHERE name = 'TESTE TREFILA';

-- Setor Automotivo
UPDATE public.equipments SET type_id = 'AUTOFRETAGEM' WHERE name = 'AUTOFRETAGEM';
UPDATE public.equipments SET type_id = 'CONFORMADORA' WHERE name = 'CONFORMADORA';
UPDATE public.equipments SET type_id = 'CURVADORA' WHERE name = 'CURVADORA';
UPDATE public.equipments SET type_id = 'RECRAVADEIRA_DE_MANGUEIRAS' WHERE name = 'RECRAVADEIRA DE MANGUEIRAS';
UPDATE public.equipments SET type_id = 'MAQUINA_A_LASER' WHERE name = 'MAQUINA A LASER';

-- Utilidades e Predial
UPDATE public.equipments SET type_id = 'GERADOR' WHERE name = 'GERADOR';
UPDATE public.equipments SET type_id = 'CHILLER' WHERE name = 'CHILLER';
UPDATE public.equipments SET type_id = 'TORRE_DE_RESFRIAMENTO' WHERE name = 'TORRE DE RESFRIAMENTO';
UPDATE public.equipments SET type_id = 'CMARA_FRIA' WHERE name = 'CÂMARA FRIA';
UPDATE public.equipments SET type_id = 'BEBEDOURO_DIRETORIA' WHERE name LIKE '%BEBEDOURO%'; -- Agrupando
UPDATE public.equipments SET type_id = 'CABINE_PRIMARIA' WHERE name = 'CABINE PRIMARIA';
UPDATE public.equipments SET type_id = 'CABINE_SECUNDARIA' WHERE name = 'CABINE SECUNDARIA';
UPDATE public.equipments SET type_id = 'QUADRO_DE_FORA' WHERE name LIKE '%QUADRO DE FORÇA%';
UPDATE public.equipments SET type_id = 'QUADRO_DE_ILUMINAO' WHERE name = 'QUADRO DE ILUMINAÇÃO';
UPDATE public.equipments SET type_id = 'QUADRO_GERAL_DO_AR_CONDICIONADO' WHERE name = 'QUADRO GERAL DO AR CONDICIONADO';
UPDATE public.equipments SET type_id = 'QUADRO_ELETRICO_COMANDO_DA_PORTARIA' WHERE name LIKE '%QUADRO ELETRICO%'; -- Agrupando Quadros Elétricos genéricos

-- Outros
UPDATE public.equipments SET type_id = 'MISTURADOR' WHERE name = 'MISTURADOR';
UPDATE public.equipments SET type_id = 'JATO_DE_GRANALHA' WHERE name LIKE '%JATO%';
UPDATE public.equipments SET type_id = 'TRIDIMENSIONAL' WHERE name = 'TRIDIMENSIONAL';
UPDATE public.equipments SET type_id = 'MAQUINA_DE_CORRUGAR' WHERE name = 'MAQUINA DE CORRUGAR';
UPDATE public.equipments SET type_id = 'PRMOLDE' WHERE name = 'PRÉ-MOLDE';
UPDATE public.equipments SET type_id = 'CABINE_DE_PINTURA' WHERE name LIKE '%CABINE DE PINTURA%';
UPDATE public.equipments SET type_id = 'BALANA' WHERE name LIKE '%BALANÇA%';
UPDATE public.equipments SET type_id = 'GUILHOTINA' WHERE name = 'GUILHOTINA';
UPDATE public.equipments SET type_id = 'CALANDRA' WHERE name = 'CALANDRA';
UPDATE public.equipments SET type_id = 'TAMBOREADOR' WHERE name = 'TAMBOREADOR';
UPDATE public.equipments SET type_id = 'MAQUINA_DE_TESTE' WHERE name = 'MAQUINA DE TESTE';
UPDATE public.equipments SET type_id = 'MAQUINA_DE_VIROLA' WHERE name = 'MAQUINA DE VIROLA';
UPDATE public.equipments SET type_id = 'CAVALETE_AR_RESPIRATORIO_JATO_DE_GRANALHA' WHERE name LIKE '%CAVALETE AR RESPIRATORIO%';
UPDATE public.equipments SET type_id = 'ESTUFA_DE_FUNIL' WHERE name = 'ESTUFA DE FUNIL';

SELECT 'VINCULAÇÃO DE TIPOS AOS ATIVOS CORRIGIDA E CONCLUÍDA!';