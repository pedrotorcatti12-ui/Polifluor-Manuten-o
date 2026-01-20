
import { Equipment, MaintenanceStatus, MaintenanceType, AssetCategory, WorkOrder } from '../types';

export const getInitialEquipmentData = (): Equipment[] => {
    const rawList = [
        // PÁGINA 1
        { id: 'PH-15', name: 'PRENSA HIDRÁULICA', local: 'MOLDAGEM', critical: true },
        { id: 'CF-01', name: 'CÂMARA FRIA', local: 'EXTRUSÃO', critical: false },
        { id: 'TB-01', name: 'TAMBOREADOR', local: 'USINAGEM', critical: false },
        { id: 'FO-10', name: 'FORNO', local: 'GERAL', critical: true },
        { id: 'TA-01', name: 'TORNO AUTOMÁTICO', local: 'USINAGEM', critical: false },
        { id: 'TA-02', name: 'TORNO AUTOMÁTICO', local: 'USINAGEM', critical: false },
        { id: 'AF-01', name: 'AUTOFRETAGEM', local: 'AUTOMOTIVO', critical: false },
        { id: 'FO-09', name: 'FORNO ELÉTRICO', local: 'GERAL', critical: true },
        { id: 'TD-02', name: 'TRANÇADEIRA', local: 'TRANÇADEIRA', critical: true },
        { id: 'FO-11', name: 'FORNO', local: 'GERAL', critical: true },
        { id: 'FO-12', name: 'FORNO', local: 'GERAL', critical: true },
        { id: 'TRID-01', name: 'TRIDIMENSIONAL', local: 'SALA QUALIDADE', critical: false },
        { id: 'TF-01', name: 'TREFILA', local: 'TREFILA', critical: false },
        { id: 'ES-01', name: 'ESMERIL', local: 'GERAL', critical: false },
        { id: 'SF-03', name: 'SERRA DE FITA', local: 'GERAL', critical: false },
        { id: 'EX-01', name: 'EXTRUSORA', local: 'EXTRUSÃO', critical: true },
        { id: 'AEX-01', name: 'EXTRUSORA DE PA', local: 'AUTOMOTIVO', critical: true },
        { id: 'AEX-02', name: 'EXTRUSORA DE PA', local: 'AUTOMOTIVO', critical: true },
        { id: 'MI-04', name: 'MISTURADOR', local: 'GERAL', critical: false },
        { id: 'EX-02', name: 'EXTRUSORA', local: 'EXTRUSÃO', critical: true },
        { id: 'EX-03', name: 'EXTRUSORA', local: 'EXTRUSÃO', critical: true },
        { id: 'TA-03', name: 'TORNO AUTOMÁTICO', local: 'USINAGEM', critical: false },
        { id: 'FO-13', name: 'FORNO', local: 'GERAL', critical: true },
        { id: 'TF-02', name: 'TREFILA', local: 'TREFILA', critical: false },
        { id: 'FO-08', name: 'FORNO', local: 'GERAL', critical: true },
        { id: 'ES-04', name: 'ESMERIL', local: 'GERAL', critical: false },
        { id: 'TC-01', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'TC-02', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'TC-03', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'TC-04', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'JT-01', name: 'JATO DE GRANALHA', local: 'TUBULAÇÃO', critical: false },
        { id: 'TC-05', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'TC-06', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'TC-07', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'TC-08', name: 'TORNO CNC', local: 'USINAGEM', critical: false },
        { id: 'JT-02', name: 'JATO DE OXIDO DE ALUMINIO', local: 'TUBULAÇÃO', critical: false },
        { id: 'EX-05', name: 'EXTRUSORA', local: 'EXTRUSÃO', critical: true },
        { id: 'EP-02', name: 'ESPULADEIRA', local: 'TRANÇADEIRA', critical: false },
        { id: 'FO-01', name: 'ESTUFA ELETRICA', local: 'GERAL', critical: true },
        { id: 'FO-02', name: 'ESTUFA ELETRICA', local: 'GERAL', critical: true },
        { id: 'FO-03', name: 'FORNO', local: 'GERAL', critical: true },
        { id: 'PH-01', name: 'PRENSA HIDRÁULICA', local: 'MOLDAGEM', critical: true },
        { id: 'PH-02', name: 'PRENSA DE MOLDAGEM', local: 'MOLDAGEM', critical: true },
        { id: 'TD-01', name: 'TRANÇADEIRA', local: 'TRANÇADEIRA', critical: false },
        { id: 'SF-01', name: 'SERRA', local: 'GERAL', critical: false },
        // PÁGINA 2
        { id: 'EX-04', name: 'EXTRUSORA', local: 'EXTRUSÃO', critical: true },
        { id: 'PH-20', name: 'PRENSA HIDRAULICA', local: 'MOLDAGEM', critical: true },
        { id: 'PH-05', name: 'PRENSA DE EIXO EXCENTRICO', local: 'MOLDAGEM', critical: true },
        { id: 'CT-01', name: 'CENTRO DE USINAGEM', local: 'USINAGEM', critical: false },
        { id: 'CO-01', name: 'COMPRESSOR CHICAGO', local: 'SALA DE MAQUINA', critical: true },
        { id: 'CS-01', name: 'CABINE SECUNDARIA', local: 'SALA DE MAQUINA', critical: true },
        { id: 'CPR-01', name: 'CABINE PRIMARIA', local: 'SALA DE MAQUINA', critical: true },
        { id: 'QDF-01', name: 'QUADRO DE FORÇA', local: 'GERAL', critical: false },
        { id: 'SI-01', name: 'SOLDA POR INDUÇÃO', local: 'AUTOMOTIVO', critical: false },
        { id: 'CH01', name: 'CHILLER', local: 'AUTOMOTIVO', critical: false },
        { id: 'CO-02', name: 'COMPRESSOR DE PARAFUSO', local: 'SALA DE MAQUINA', critical: true },
        { id: 'CO-03', name: 'COMPRESSOR PISTÃO SCHULZ', local: 'SALA DE MAQUINA', critical: true },
        // PÁGINA 3
        { id: 'GE-01', name: 'GERADOR', local: 'SALA DE MAQUINA', critical: true },
        { id: 'TRA-01', name: 'TORRE DE RESFRIAMENTO', local: 'EXTRUSÃO', critical: false },
        { id: 'EX-06', name: 'EXTRUSORA RAM', local: 'EXTRUSÃO', critical: true },
        { id: 'EX-07', name: 'EXTRUSORA RAM', local: 'EXTRUSÃO', critical: true },
        { id: 'GUI-01', name: 'GUILHOTINA', local: 'AUTOMOTIVO', critical: false },
        { id: 'SF-04', name: 'SERRA DE FITA', local: 'SOLDA', critical: false },
    ];

    return rawList.map(item => ({
        id: item.id,
        name: item.name,
        location: item.local,
        category: item.id.startsWith('QE') || item.id.startsWith('BEB') || item.id.startsWith('QI') ? AssetCategory.Facility : AssetCategory.Industrial,
        status: 'Ativo',
        is_critical: item.critical,
        schedule: []
    }));
};

export const getReservedIATFOrders = (): WorkOrder[] => {
    const ids = ['0127', '0006', '0067', '0230', '0075', '0007', '0303', '0043', '0009', '0115', '0147', '0011', '0055', '0179', '0013', '0019', '0025', '0183', '0187', '0250', '0001'];
    return ids.map(id => ({
        id,
        equipmentId: 'VÁRIOS (LOTE)',
        type: MaintenanceType.Preventive,
        status: MaintenanceStatus.Executed,
        scheduledDate: '2026-01-07T13:25:00Z',
        endDate: '2026-01-07T17:00:00Z',
        description: 'Lote Retornado de Campo - Protocolo IATF 16949',
        requester: 'Gestão Manutenção',
        machineStopped: false,
        manHours: [{ maintainer: 'Equipe Interna', hours: 2 }],
        materialsUsed: [],
        observations: 'Protocolo digital de rastreabilidade do lote de 21 unidades.'
    }));
};
