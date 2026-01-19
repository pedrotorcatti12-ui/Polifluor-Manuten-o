
import {
  MaintenanceStatus,
  StatusConfig
} from '../types';

/**
 * Configurações estáticas do SGMI 2.0.
 * Os dados de negócio (Ativos, Peças, O.S.) vêm exclusivamente do Supabase via DataContext.
 */
export const initialStatusConfig: StatusConfig[] = [
  { id: 'scheduled', label: MaintenanceStatus.Scheduled, color: '#2563eb', symbol: 'P' },
  { id: 'executed', label: MaintenanceStatus.Executed, color: '#10b981', symbol: 'E' },
  { id: 'waiting_parts', label: MaintenanceStatus.WaitingParts, color: '#f59e0b', symbol: 'AP' }, 
  { id: 'delayed', label: MaintenanceStatus.Delayed, color: '#e11d48', symbol: 'A' },
  { id: 'deactivated', label: MaintenanceStatus.Deactivated, color: '#6b7280', symbol: 'D' },
  { id: 'none', label: MaintenanceStatus.None, color: 'transparent', symbol: '' },
];
