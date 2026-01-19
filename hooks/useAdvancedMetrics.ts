
import { useCallback } from 'react';
import { Equipment, MaintenanceStatus, MaintenanceType, WorkOrder, ReliabilityMetrics } from '../types';
import { MONTHS } from '../constants';

const DAILY_OPERATIONAL_HOURS = 10; 
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
}

export const useAdvancedMetrics = () => {
    const countBusinessDays = (start: Date, end: Date) => {
        let count = 0;
        const cur = new Date(start.getTime());
        while (cur <= end) {
            const day = cur.getDay();
            if (day !== 0 && day !== 6) count++;
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    };

    const calculateMetrics = useCallback((
        equipmentData: Equipment[], 
        workOrders: WorkOrder[], 
        selectedIds: string[], 
        startDateStr: string, 
        endDateStr: string,
        filterCriticidade: 'Todos' | 'Criticos' | 'Nao-Criticos' = 'Todos'
    ): AdvancedReportData[] => {
        
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

        return equipmentData
            .filter(eq => {
                if (!selectedIds.includes(eq.id)) return false;
                if (filterCriticidade === 'Criticos') return eq.is_critical;
                if (filterCriticidade === 'Nao-Criticos') return !eq.is_critical;
                return true;
            })
            .map(equipment => {
                const monthlyData = Array(12).fill(null).map(() => ({ 
                    failures: 0, 
                    correctiveDowntime: 0 
                }));

                workOrders
                    .filter(wo => wo.equipmentId === equipment.id && wo.status === MaintenanceStatus.Executed)
                    .forEach(wo => {
                        const date = new Date(wo.scheduledDate);
                        const mIdx = date.getMonth();
                        const duration = wo.endDate && wo.scheduledDate
                            ? (new Date(wo.endDate).getTime() - new Date(wo.scheduledDate).getTime()) / 3600000
                            : 0;
                        
                        if (wo.type === MaintenanceType.Corrective) {
                            monthlyData[mIdx].failures += 1;
                            monthlyData[mIdx].correctiveDowntime += duration;
                        }
                    });

                const monthlyHistory = MONTHS.map((name, idx) => {
                    const stats = monthlyData[idx];
                    const lastDay = new Date(start.getFullYear(), idx + 1, 0);
                    const bDays = countBusinessDays(new Date(start.getFullYear(), idx, 1), lastDay);
                    const grossHours = bDays * DAILY_OPERATIONAL_HOURS;
                    
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
                const totalBDays = countBusinessDays(start, end);
                const totalGross = totalBDays * DAILY_OPERATIONAL_HOURS;

                return {
                    equipmentId: equipment.id,
                    equipmentName: equipment.name,
                    isCritical: equipment.is_critical,
                    mttr: totalFailures > 0 ? totalCorrectiveHours / totalFailures : 0,
                    mtbf: totalFailures > 0 ? (totalGross - totalCorrectiveHours) / totalFailures : null,
                    availability: totalGross > 0 ? ((totalGross - totalCorrectiveHours) / totalGross) * 100 : 100,
                    totalFailures,
                    totalCorrectiveHours,
                    monthlyHistory,
                    complianceStatus: (totalFailures > 0 ? totalCorrectiveHours / totalFailures : 0) <= MTTR_CRITICAL_TARGET ? 'Aprovado' : 'Reprovado'
                };
            });
    }, []);

    return calculateMetrics;
};
