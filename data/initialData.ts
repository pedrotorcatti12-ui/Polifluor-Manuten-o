import { Equipment, EquipmentType } from '../types';

// ATENÇÃO: Os dados agora são carregados diretamente do banco de dados Supabase.
// Estes arrays estão vazios e não são mais a fonte de dados principal.
// Eles são mantidos para evitar erros de importação em componentes que ainda não foram refatorados.

export const getInitialEquipmentTypes = (): EquipmentType[] => [];

export const getInitialEquipmentData = (): Equipment[] => [];
