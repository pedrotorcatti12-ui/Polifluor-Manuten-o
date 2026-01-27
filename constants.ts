import { MaintenanceType } from './types';

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MAINTENANCE_TYPE_CONFIG: { [key in MaintenanceType]: { label: string; color: string; textColor: string; hex: string } } = {
    [MaintenanceType.Preventive]: { label: 'Preventiva', color: 'bg-blue-600', textColor: 'text-white', hex: '#2563EB' },
    [MaintenanceType.Corrective]: { label: 'Corretiva', color: 'bg-rose-600', textColor: 'text-white', hex: '#E11D48' },
    [MaintenanceType.Predictive]: { label: 'Preditiva', color: 'bg-teal-600', textColor: 'text-white', hex: '#0D9488' },
    [MaintenanceType.RevisaoPeriodica]: { label: 'Revisão Periódica', color: 'bg-indigo-600', textColor: 'text-white', hex: '#4F46E5' },
    [MaintenanceType.Predial]: { label: 'Corretiva Predial', color: 'bg-green-600', textColor: 'text-white', hex: '#16A34A' },
    [MaintenanceType.Melhoria]: { label: 'Melhoria', color: 'bg-yellow-500', textColor: 'text-gray-800', hex: '#EAB308' },
    [MaintenanceType.Overhaul]: { label: 'Overhaul', color: 'bg-gray-800', textColor: 'text-white', hex: '#1F2937' },
};