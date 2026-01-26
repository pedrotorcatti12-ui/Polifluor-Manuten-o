import { useCallback } from 'react';
// FIX: Add missing imports
import { Equipment, MaintenanceStatus, MaintenanceType, WorkOrder, ReliabilityMetrics, AssetCategory } from '../types';
import { MONTHS } from '../constants';

const MTTR_CRITICAL_TARGET = 1.0; 

export interface MonthlyMetric extends ReliabilityMetrics {
    monthName: string;
    monthIndex: number;
    status: 'OK' | 'ALERTA';
}

export interface AdvancedReportData extends ReliabilityMetrics {
    equipmentId: string;
    equipmentName: string;
    isCritical: boolean;
    monthlyHistory: MonthlyMetric[];
    complianceStatus: 'Aprovado' | 'Reprovado';
    globalAvailability: number;
    totalPlannedHours: number;
}

export const useAdvancedMetrics = () => {
    const calculateTotalOperationalHours = (start: Date, end: Date): number => {
        let totalHours = 0;
        const current = new Date(start.getTime());
        
        while (current <= end) {
            const dayOfWeek = current.getDay();
            // Seg-Sex (1-5), 10h/dia. Sábado(6) e Domingo(0) não contam.
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                totalHours += 10;
            }
            current.setDate(current.getDate() + 1);
        }
        return totalHours;
    };

    const calculateMetrics = useCallback((
        equipmentData: Equipment[], 
        workOrders: WorkOrder[], 
        selectedIds: string[], 
        startDateStr: string, 
        endDateStr: string,
        filterCriticidade: 'Criticos' | 'Nao-Criticos' = 'Criticos'
    ): AdvancedReportData[] => {
        
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

        return equipmentData
            // FIX: Access category property
            .filter(eq => eq.category !== AssetCategory.Facility) // EXCLUI PREDIAIS/UTILITÁRIOS DOS KPIS
            .filter(eq => {
                if (!selectedIds.includes(eq.id)) return false;
                // FIX: Access isCritical property
                if (filterCriticidade === 'Criticos') return eq.isCritical;
                if (filterCriticidade === 'Nao-Criticos') return !eq.isCritical;
                return true;
            })
            .map(equipment => {
                const monthlyData = Array(12).fill(null).map(() => ({ 
                    failures: 0, 
                    correctiveDowntime: 0,
                    totalDowntime: 0,
                    plannedDowntime: 0
                }));

                workOrders
                    .filter(wo => wo.equipmentId === equipment.id && wo.status === MaintenanceStatus.Executed)
                    .forEach(wo => {
                        const date = new Date(wo.scheduledDate);
                        const mIdx = date.getMonth();
                        const duration = wo.endDate && wo.scheduledDate
                            ? (new Date(wo.endDate).getTime() - new Date(wo.scheduledDate).getTime()) / 3600000
                            : 0;
                        
                        monthlyData[mIdx].totalDowntime += duration;
                        
                        if (wo.type === MaintenanceType.Corrective) {
                            monthlyData[mIdx].failures += 1;
                            monthlyData[mIdx].correctiveDowntime += duration;
                        } else if (
                            // FIX: Add missing MaintenanceType members
                            wo.type === MaintenanceType.Preventive || 
                            wo.type === MaintenanceType.RevisaoPeriodica || 
                            wo.type === MaintenanceType.Predictive || 
                            wo.type === MaintenanceType.Overhaul
                        ) {
                            monthlyData[mIdx].plannedDowntime += duration;
                        }
                    });

                const monthlyHistory = MONTHS.map((name, idx) => {
                    const stats = monthlyData[idx];
                    const firstDayOfMonth = new Date(start.getFullYear(), idx, 1);
                    const lastDayOfMonth = new Date(start.getFullYear(), idx + 1, 0);
                    
                    const grossHours = calculateTotalOperationalHours(firstDayOfMonth, lastDayOfMonth);
                    
                    const mttr = stats.failures > 0 ? stats.correctiveDowntime / stats.failures : 0;
                    const mtbf = stats.failures > 0 ? (grossHours - stats.correctiveDowntime) / stats.failures : null;
                    const availability = grossHours > 0 ? ((grossHours - stats.correctiveDowntime) / grossHours) * 100 : 100;

                    return {
                        monthName: name, monthIndex: idx, mtbf, mttr, availability,
                        totalFailures: stats.failures, totalCorrectiveHours: stats.correctiveDowntime,
                        status: mttr <= MTTR_CRITICAL_TARGET ? 'OK' : 'ALERTA'
                    } as MonthlyMetric;
                });

                const totalFailures = monthlyData.reduce((a, b) => a + b.failures, 0);
                const totalCorrectiveHours = monthlyData.reduce((a, b) => a + b.correctiveDowntime, 0);
                const totalDowntimeHours = monthlyData.reduce((a, b) => a + b.totalDowntime, 0);
                const totalPlannedHours = monthlyData.reduce((a, b) => a + b.plannedDowntime, 0);
                const totalGross = calculateTotalOperationalHours(start, end);

                return {
                    equipmentId: equipment.id,
                    equipmentName: equipment.name,
                    // FIX: Access isCritical property
                    isCritical: !!equipment.isCritical,
                    mttr: totalFailures > 0 ? totalCorrectiveHours / totalFailures : 0,
                    mtbf: totalFailures > 0 ? (totalGross - totalCorrectiveHours) / totalFailures : null,
                    availability: totalGross > 0 ? ((totalGross - totalCorrectiveHours) / totalGross) * 100 : 100,
                    globalAvailability: totalGross > 0 ? ((totalGross - totalDowntimeHours) / totalGross) * 100 : 100,
                    totalFailures,
                    totalCorrectiveHours,
                    totalPlannedHours,
                    monthlyHistory,
                    complianceStatus: (totalFailures > 0 ? totalCorrectiveHours / totalFailures : 0) <= MTTR_CRITICAL_TARGET ? 'Aprovado' : 'Reprovado'
                };
            });
    }, []);

    return calculateMetrics;
};