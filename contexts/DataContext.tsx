
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Equipment, WorkOrder, MaintenanceStatus, MaintenanceType, SparePart, StatusConfig, EquipmentType, MaintenancePlan, StockMovement, AssetCategory } from '../types';
import { INITIAL_INTERNAL_MAINTAINERS, INITIAL_REQUESTERS, INITIAL_PREDEFINED_ACTIONS, INITIAL_PREDEFINED_MATERIALS } from '../constants';
import { initialStatusConfig } from '../data/dataService';
import { supabase, fetchFromCloud, upsertToCloud } from '../services/supabase';

interface DataContextType {
    equipmentData: Equipment[];
    setEquipmentData: React.Dispatch<React.SetStateAction<Equipment[]>>;
    workOrders: WorkOrder[];
    setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
    inventoryData: SparePart[];
    maintainers: string[];
    setMaintainers: React.Dispatch<React.SetStateAction<string[]>>;
    requesters: string[];
    setRequesters: React.Dispatch<React.SetStateAction<string[]>>;
    statusConfig: StatusConfig[];
    equipmentTypes: EquipmentType[];
    setEquipmentTypes: React.Dispatch<React.SetStateAction<EquipmentType[]>>;
    maintenancePlans: MaintenancePlan[];
    stockMovements: StockMovement[];
    standardTasks: string[];
    standardMaterials: string[];
    isSyncing: boolean;
    isInitialLoading: boolean;
    cloudConnected: boolean;
    lastSyncTime: string | null;
    excludedIds: string[];
    
    generateFullPlanning2026: () => void;
    handleUnifiedSave: (order: WorkOrder) => Promise<boolean>;
    handleEquipmentSave: (eq: Equipment) => Promise<boolean>;
    handlePartSave: (part: SparePart) => Promise<boolean>;
    handleInventoryAdjustment: (partId: string, qty: number, reason: string, user: string) => Promise<boolean>;
    reprogramTask: (equipmentId: string, taskId: string, newMonth: string, newYear: number) => void;
    syncData: () => Promise<void>;
    logActivity: (activity: { action_type: string; description: string }) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    
    handleEquipmentTypeSave: (type: EquipmentType) => Promise<boolean>;
    handleEquipmentTypeDelete: (id: string) => Promise<boolean>;
    handlePlanSave: (plan: MaintenancePlan) => Promise<boolean>;
    handlePlanDelete: (id: string) => Promise<boolean>;
    forceFullDatabaseRefresh: () => Promise<void>;
    markTasksAsPrepared: (keys: string[]) => void;
    revertTasksPreparation: (keys: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [inventoryData, setInventoryData] = useState<SparePart[]>([]);
    const [maintainers, setMaintainers] = useState<string[]>(INITIAL_INTERNAL_MAINTAINERS);
    const [requesters, setRequesters] = useState<string[]>(INITIAL_REQUESTERS);
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
    const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [cloudConnected, setCloudConnected] = useState(true);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

    const showToast = useCallback((message: string) => console.log("TOAST:", message), []);
    const logActivity = useCallback((activity: any) => console.log("LOG:", activity), []);

    const loadAllData = useCallback(async () => {
        setIsInitialLoading(true);
        try {
            // Fetch sequencial para capturar erros específicos por tabela
            const eq = await fetchFromCloud('equipment');
            const wo = await fetchFromCloud('work_orders');
            const parts = await fetchFromCloud('spare_parts');
            const types = await fetchFromCloud('equipment_types');
            const plans = await fetchFromCloud('maintenance_plans');
            const moves = await fetchFromCloud('stock_movements');

            setEquipmentData(eq || []);
            setWorkOrders(wo || []);
            setInventoryData(parts || []);
            setEquipmentTypes(types || []);
            setMaintenancePlans(plans || []);
            setStockMovements(moves || []);
            
            setCloudConnected(true);
            setLastSyncTime(new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Erro crítico de conexão:", error);
            setCloudConnected(false);
        } finally {
            setIsInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const handleUnifiedSave = async (order: WorkOrder) => {
        setIsSyncing(true);
        const { success } = await upsertToCloud('work_orders', order);
        if (success) {
            setWorkOrders(prev => {
                const exists = prev.findIndex(o => o.id === order.id);
                if (exists >= 0) return prev.map(o => o.id === order.id ? order : o);
                return [...prev, order];
            });
        }
        setIsSyncing(false);
        return success;
    };

    const handlePartSave = async (part: SparePart) => {
        setIsSyncing(true);
        const { success } = await upsertToCloud('spare_parts', part);
        if (success) {
            setInventoryData(prev => {
                const exists = prev.findIndex(p => p.id === part.id);
                if (exists >= 0) return prev.map(p => p.id === part.id ? part : p);
                return [...prev, part];
            });
        }
        setIsSyncing(false);
        return success;
    };

    const handleEquipmentSave = async (eq: Equipment) => {
        setIsSyncing(true);
        const { success } = await upsertToCloud('equipment', eq);
        if (success) {
            setEquipmentData(prev => {
                const exists = prev.findIndex(e => e.id === eq.id);
                if (exists >= 0) return prev.map(e => e.id === eq.id ? eq : e);
                return [...prev, eq];
            });
        }
        setIsSyncing(false);
        return success;
    };

    const handleEquipmentTypeSave = async (type: EquipmentType) => {
        const { success } = await upsertToCloud('equipment_types', type);
        if (success) setEquipmentTypes(prev => [...prev.filter(t => t.id !== type.id), type]);
        return success;
    };

    const handleEquipmentTypeDelete = async (id: string) => {
        const { error } = await supabase.from('equipment_types').delete().eq('id', id);
        if (!error) setEquipmentTypes(prev => prev.filter(t => t.id !== id));
        return !error;
    };

    const handlePlanSave = async (plan: MaintenancePlan) => {
        const { success } = await upsertToCloud('maintenance_plans', plan);
        if (success) setMaintenancePlans(prev => [...prev.filter(p => p.id !== plan.id), plan]);
        return success;
    };

    const handlePlanDelete = async (id: string) => {
        const { error } = await supabase.from('maintenance_plans').delete().eq('id', id);
        if (!error) setMaintenancePlans(prev => prev.filter(p => p.id !== id));
        return !error;
    };

    const handleInventoryAdjustment = async (partId: string, qty: number, reason: string, user: string) => {
        const part = inventoryData.find(p => p.id === partId);
        if (!part) return false;
        const updatedPart = { ...part, currentStock: qty };
        const { success } = await upsertToCloud('spare_parts', updatedPart);
        if (success) {
            await upsertToCloud('stock_movements', {
                part_id: partId,
                quantity: Math.abs(qty - part.currentStock),
                type: 'Ajuste',
                reason,
                user_name: user,
                date: new Date().toISOString()
            });
            loadAllData();
        }
        return success;
    };

    const generateFullPlanning2026 = () => console.log("Geração via Script SQL recomendada para estabilidade.");
    const reprogramTask = () => {};
    const syncData = async () => await loadAllData();
    const forceFullDatabaseRefresh = async () => await loadAllData();
    const markTasksAsPrepared = () => {};
    const revertTasksPreparation = () => {};

    return (
        <DataContext.Provider value={{ 
            equipmentData, setEquipmentData, workOrders, setWorkOrders, inventoryData, maintainers, setMaintainers, requesters, setRequesters,
            statusConfig: initialStatusConfig, equipmentTypes, setEquipmentTypes, maintenancePlans, stockMovements,
            standardTasks: INITIAL_PREDEFINED_ACTIONS, standardMaterials: INITIAL_PREDEFINED_MATERIALS,
            isSyncing, isInitialLoading, cloudConnected, lastSyncTime, excludedIds: [],
            generateFullPlanning2026, handleUnifiedSave, handleEquipmentSave, handlePartSave, 
            handleInventoryAdjustment, reprogramTask, syncData, logActivity, showToast,
            handleEquipmentTypeSave, handleEquipmentTypeDelete, handlePlanSave, handlePlanDelete,
            forceFullDatabaseRefresh, markTasksAsPrepared, revertTasksPreparation
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('DataContext must be used within DataProvider');
    return context;
};
