import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useToast } from './ToastContext';
import { Equipment, WorkOrder, MaintenanceStatus, MaintenanceType, EquipmentType, MaintenancePlan, SparePart, StockMovement, AssetCategory, CorrectiveCategory } from '../types';
import { supabase } from '../supabaseClient';

// --- MAPPERS (ADAPTADORES DE DADOS) ---
// Convertem o formato do Banco (snake_case) para a Aplicação (camelCase)

const mapEquipmentFromDB = (data: any): Equipment => ({
    id: data.id,
    name: data.name,
    typeId: data.type_id, // DB: type_id -> App: typeId
    location: data.location,
    category: data.category as AssetCategory,
    status: data.status,
    model: data.model,
    yearOfManufacture: data.year_of_manufacture, // DB: year_of_manufacture
    isCritical: data.is_critical, // DB: is_critical
    preservationNotes: data.preservation_notes,
    customerSpecificRequirements: data.customer_specific_requirements,
    customPlanId: data.custom_plan_id,
    manufacturer: data.manufacturer,
    deleted_at: data.deleted_at
});

const mapEquipmentToDB = (data: Equipment) => ({
    id: data.id,
    name: data.name,
    type_id: data.typeId,
    location: data.location,
    category: data.category,
    status: data.status,
    model: data.model,
    year_of_manufacture: data.yearOfManufacture,
    is_critical: data.isCritical,
    preservation_notes: data.preservationNotes,
    customer_specific_requirements: data.customerSpecificRequirements,
    custom_plan_id: data.customPlanId,
    manufacturer: data.manufacturer,
    deleted_at: data.deleted_at
});

const mapPartFromDB = (data: any): SparePart => ({
    id: data.id,
    name: data.name,
    location: data.location,
    unit: data.unit,
    cost: data.cost,
    minStock: data.min_stock, // DB: min_stock
    currentStock: data.current_stock // DB: current_stock
});

const mapPartToDB = (data: SparePart) => ({
    id: data.id,
    name: data.name,
    location: data.location,
    unit: data.unit,
    cost: data.cost,
    min_stock: data.minStock,
    current_stock: data.currentStock
});

const mapWorkOrderFromDB = (data: any): WorkOrder => ({
    id: data.id,
    equipmentId: data.equipment_id,
    type: data.type as MaintenanceType,
    status: data.status as MaintenanceStatus,
    scheduledDate: data.scheduled_date,
    endDate: data.end_date,
    description: data.description,
    checklist: data.checklist,
    observations: data.observations,
    planId: data.plan_id,
    requester: data.requester,
    rootCause: data.root_cause,
    correctiveCategory: data.corrective_category as CorrectiveCategory,
    machineStopped: data.machine_stopped,
    manHours: data.man_hours,
    materialsUsed: data.materials_used,
    purchaseRequests: data.purchase_requests,
    miscNotes: data.misc_notes,
    reportPdfBase64: data.report_pdf_base64,
    isPrepared: data.is_prepared,
    deleted_at: data.deleted_at,
    // Se vier join, mapeia o equipamento também
    equipments: data.equipments ? mapEquipmentFromDB(data.equipments) : null
});

const mapWorkOrderToDB = (data: WorkOrder) => {
    // Remove propriedades de join ou UI-only antes de enviar
    const { equipments, ...rest } = data; 
    return {
        id: rest.id,
        equipment_id: rest.equipmentId,
        type: rest.type,
        status: rest.status,
        scheduled_date: rest.scheduledDate,
        end_date: rest.endDate,
        description: rest.description,
        checklist: rest.checklist,
        observations: rest.observations,
        plan_id: rest.planId,
        requester: rest.requester,
        root_cause: rest.rootCause,
        corrective_category: rest.correctiveCategory,
        machine_stopped: rest.machineStopped,
        man_hours: rest.manHours,
        materials_used: rest.materialsUsed,
        purchase_requests: rest.purchaseRequests,
        misc_notes: rest.miscNotes,
        report_pdf_base64: rest.reportPdfBase64,
        is_prepared: rest.isPrepared,
        deleted_at: rest.deleted_at
    };
};

const mapPlanFromDB = (data: any): MaintenancePlan => ({
    id: data.id,
    description: data.description,
    equipmentTypeId: data.equipment_type_id,
    frequency: data.frequency,
    tasks: data.tasks,
    targetEquipmentIds: data.target_equipment_ids,
    maintenanceType: data.maintenance_type,
    startMonth: data.start_month,
    deleted_at: data.deleted_at
});

const mapPlanToDB = (data: MaintenancePlan) => ({
    id: data.id,
    description: data.description,
    equipment_type_id: data.equipmentTypeId,
    frequency: data.frequency,
    tasks: data.tasks,
    target_equipment_ids: data.targetEquipmentIds,
    maintenance_type: data.maintenanceType,
    start_month: data.startMonth,
    deleted_at: data.deleted_at
});

// --- FIM DOS MAPPERS ---

interface DataContextType {
    equipmentData: Equipment[];
    workOrders: WorkOrder[];
    equipmentTypes: EquipmentType[];
    maintenancePlans: MaintenancePlan[];
    inventoryData: SparePart[];
    maintainers: string[];
    requesters: string[];
    stockMovements: StockMovement[];
    isSyncing: boolean;
    cloudConnected: boolean;

    handleSaveWorkOrder: (order: WorkOrder) => Promise<boolean>;
    handlePlanSave: (plan: MaintenancePlan, applyToAll?: boolean) => Promise<boolean>;
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', options?: any) => void;
    handleUnifiedSave: (entity: any) => Promise<boolean>;
    handlePartSave: (part: SparePart) => Promise<boolean>;
    handleInventoryAdjustment: (partId: string, newQuantity: number, reason: string, user: string) => Promise<boolean>;
    handleMaintainerSave: (name: string, oldName?: string) => Promise<boolean>;
    handleMaintainerDelete: (name: string) => Promise<boolean>;
    handleRequesterSave: (name: string, oldName?: string) => Promise<boolean>;
    handleRequesterDelete: (name: string) => Promise<boolean>;
    handleWorkOrderDelete: (id: string) => Promise<boolean>;
    handleBulkDeleteWorkOrders: () => Promise<boolean>;
    handleEquipmentTypeSave: (type: EquipmentType) => Promise<boolean>;
    handleEquipmentTypeDelete: (id: string) => Promise<boolean>;
    handleEquipmentSave: (equipment: Equipment) => Promise<boolean>;
    handleEquipmentDelete: (id: string) => Promise<boolean>;
    handlePlanDelete: (id: string) => Promise<boolean>;
    forceFullDatabaseRefresh: () => void;
    logActivity: (activity: any) => void;
    revertTasksPreparation: (keys: string[]) => Promise<void>;
    markTasksAsPrepared: (keys: string[]) => Promise<void>;
    handleBulkReprogramPlans: (fromMonth: string, toMonth: string, typeId: string) => Promise<void>;
    generateFullPlanning2026: () => Promise<boolean>;
    runAutoClassification: () => Promise<boolean>;
    refreshPlanTargets: () => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
    const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [inventoryData, setInventoryData] = useState<SparePart[]>([]);
    const [maintainers, setMaintainers] = useState<string[]>([]);
    const [requesters, setRequesters] = useState<string[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [isSyncing, setIsSyncing] = useState(true);
    const [cloudConnected, setCloudConnected] = useState(true);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsSyncing(true);
        console.log("🔄 Iniciando sincronização com Supabase (Soft Delete Active)...");
        try {
            const [
                { data: equipment, error: equipmentError },
                { data: types, error: typesError },
                { data: plans, error: plansError },
                { data: orders, error: ordersError },
                { data: inventory, error: inventoryError },
                { data: maintainerList, error: maintainerError },
                { data: requesterList, error: requesterError },
                { data: movements, error: movementsError },
            ] = await Promise.all([
                // Filtra registros que não foram "deletados" (Soft Delete)
                supabase.from('equipments').select('*').is('deleted_at', null),
                supabase.from('equipment_types').select('*'),
                supabase.from('maintenance_plans').select('*').is('deleted_at', null),
                supabase.from('work_orders').select('*, equipments(*)').is('deleted_at', null), 
                supabase.from('spare_parts').select('*'),
                supabase.from('maintainers').select('name'),
                supabase.from('requesters').select('name'),
                supabase.from('stock_movements').select('*'),
            ]);

            if (equipmentError) throw equipmentError;
            if (typesError) throw typesError;
            if (plansError) throw plansError;
            if (ordersError) throw ordersError;
            if (inventoryError) throw inventoryError;
            if (maintainerError) throw maintainerError;
            if (requesterError) throw requesterError;
            if (movementsError) throw movementsError;
            
            // APLICAÇÃO DOS MAPPERS
            setEquipmentData((equipment || []).map(mapEquipmentFromDB));
            setEquipmentTypes(types || []);
            setMaintenancePlans((plans || []).map(mapPlanFromDB));
            setWorkOrders((orders || []).map(mapWorkOrderFromDB));
            setInventoryData((inventory || []).map(mapPartFromDB));
            
            setMaintainers((maintainerList || []).map(m => m.name));
            setRequesters((requesterList || []).map(r => r.name));
            setStockMovements(movements || []);
            
            setCloudConnected(true);
            console.log("✅ Dados carregados com sucesso.");
        } catch (error: any) {
            console.error("❌ Erro no fetch:", error);
            showToast(`Erro de conexão: ${error.message}`, 'error');
            setCloudConnected(false);
        } finally {
            setIsSyncing(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveWorkOrder = async (order: WorkOrder): Promise<boolean> => {
        setIsSyncing(true);
        const dbOrder = mapWorkOrderToDB(order);
        const { error } = await supabase.from('work_orders').upsert([dbOrder]);
        if (error) {
            showToast(`Erro: ${error.message}`, 'error');
            setIsSyncing(false);
            return false;
        }
        await fetchData();
        return true;
    };

    const handlePlanSave = async (plan: MaintenancePlan): Promise<boolean> => {
        const dbPlan = mapPlanToDB(plan);
        const { error } = await supabase.from('maintenance_plans').upsert([dbPlan]);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        
        // Após salvar um plano, atualiza os alvos automaticamente
        await refreshPlanTargets();
        await fetchData();
        return true;
    };

    const handleUnifiedSave = async (entity: any): Promise<boolean> => {
        if ('equipmentId' in entity) {
            return handleSaveWorkOrder(entity as WorkOrder);
        }
        showToast("Salvo com sucesso!", "success");
        return true;
    };

    const handlePartSave = async (part: SparePart): Promise<boolean> => {
        const dbPart = mapPartToDB(part);
        const { error } = await supabase.from('spare_parts').upsert([dbPart]);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };

    const handleInventoryAdjustment = async (partId: string, newQuantity: number, reason: string, user: string): Promise<boolean> => {
        // Mapeamento manual aqui pois é um update parcial
        const { error } = await supabase.from('spare_parts').update({ current_stock: newQuantity }).eq('id', partId);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        const partName = inventoryData.find(p => p.id === partId)?.name || 'N/A';
        const movement = { part_id: partId, part_name: partName, type: 'Ajuste', quantity: newQuantity, reason, user };
        await supabase.from('stock_movements').insert([movement]);
        await fetchData();
        return true;
    };
    
    const handleMaintainerSave = async (name: string, oldName?: string): Promise<boolean> => {
        const { error } = await supabase.from('maintainers').upsert({ name });
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };
    
    const handleMaintainerDelete = async (name: string): Promise<boolean> => {
        const { error } = await supabase.from('maintainers').delete().eq('name', name);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };
    
    const handleRequesterSave = async (name: string, oldName?: string): Promise<boolean> => {
        const { error } = await supabase.from('requesters').upsert({ name });
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };
    
    const handleRequesterDelete = async (name: string): Promise<boolean> => {
        const { error } = await supabase.from('requesters').delete().eq('name', name);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };

    const handleWorkOrderDelete = async (id: string): Promise<boolean> => {
        // Implementação de Soft Delete
        const { error } = await supabase.from('work_orders').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        showToast(`Ordem de serviço #${id} movida para lixeira.`, 'info');
        await fetchData();
        return true;
    };
    
    const handleEquipmentSave = async (equipment: Equipment): Promise<boolean> => {
        const dbEq = mapEquipmentToDB(equipment);
        const { error } = await supabase.from('equipments').upsert([dbEq]);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        
        // Após salvar um equipamento, roda a classificação e vinculação
        await runAutoClassification();
        await refreshPlanTargets();
        
        await fetchData();
        return true;
    };
    
    const handleEquipmentDelete = async (id: string): Promise<boolean> => {
        // Implementação de Soft Delete para Equipamento
        const { error } = await supabase.from('equipments').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };

    const handlePlanDelete = async (id: string): Promise<boolean> => {
        // Implementação de Soft Delete para Planos
        const { error } = await supabase.from('maintenance_plans').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };

    const handleEquipmentTypeSave = async (type: EquipmentType): Promise<boolean> => {
         const { error } = await supabase.from('equipment_types').upsert([type]);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };
    
    const handleEquipmentTypeDelete = async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('equipment_types').delete().eq('id', id);
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        await fetchData();
        return true;
    };

    const handleBulkDeleteWorkOrders = async (): Promise<boolean> => {
        showToast("Iniciando exclusão em lote...", "warning");
        // Update all to deleted_at = NOW()
        const { error } = await supabase.from('work_orders').update({ deleted_at: new Date().toISOString() }).neq('id', '0');
        if (error) { showToast(`Erro: ${error.message}`, 'error'); return false; }
        showToast('Todas as Ordens de Serviço foram movidas para lixeira.', 'success');
        await fetchData();
        return true;
    };

    // --- FUNÇÕES DE INTELIGÊNCIA (RPC) ---

    const runAutoClassification = async (): Promise<boolean> => {
        const { error } = await supabase.rpc('auto_classify_equipments');
        if (error) {
            console.error("Auto Classify Error", error);
            return false;
        }
        return true;
    };

    const refreshPlanTargets = async (): Promise<boolean> => {
        const { error } = await supabase.rpc('refresh_plan_targets');
        if (error) {
            console.error("Refresh Targets Error", error);
            return false;
        }
        return true;
    };

    const generateFullPlanning2026 = async (): Promise<boolean> => { 
        showToast("Otimizando base de dados...", "info");
        
        // 1. Garante que os tipos dos equipamentos estejam corretos
        await runAutoClassification();
        
        // 2. Garante que os planos estejam ligados aos equipamentos corretos
        await refreshPlanTargets();

        showToast("Gerando cronograma inteligente...", "info");
        
        // 3. Gera as O.S.
        const { error } = await supabase.rpc('generate_preventive_orders_for_2026');
        if (error) {
             showToast(`Erro na geração: ${error.message}`, 'error');
             return false;
        }
        showToast("Cronograma 2026 gerado com sucesso!", "success");
        await fetchData();
        return true;
    };

    const logActivity = (activity: any) => console.log("Activity:", activity);

    const markTasksAsPrepared = async (keys: string[]) => {
        if (keys.length === 0) return;
        setIsSyncing(true);
        const ids = keys.map(k => k.replace('wo-', ''));
        
        const { error } = await supabase
            .from('work_orders')
            .update({ status: MaintenanceStatus.InField, is_prepared: true })
            .in('id', ids);

        if (error) {
            showToast(`Erro ao mover para campo: ${error.message}`, 'error');
        } else {
            showToast(`${ids.length} O.S. movidas para 'Em Campo'.`, 'success');
            await fetchData();
        }
        setIsSyncing(false);
    };

    const revertTasksPreparation = async (keys: string[]) => {
        if (keys.length === 0) return;
        setIsSyncing(true);
        const ids = keys.map(k => k.replace('wo-', ''));
        
        const { error } = await supabase
            .from('work_orders')
            .update({ status: MaintenanceStatus.Scheduled, is_prepared: false })
            .in('id', ids);

        if (error) {
            showToast(`Erro ao reverter: ${error.message}`, 'error');
        } else {
            showToast(`${ids.length} O.S. retornadas para 'Impressão'.`, 'success');
            await fetchData();
        }
        setIsSyncing(false);
    };

    const handleBulkReprogramPlans = async (fromMonth: string, toMonth: string, typeId: string) => {
        setIsSyncing(true);
        let query = supabase.from('maintenance_plans').update({ start_month: toMonth }).eq('start_month', fromMonth);
        if (typeId !== 'Todos') {
            query = query.eq('equipment_type_id', typeId);
        }
        const { error } = await query.select();
        if (error) {
            showToast(`Erro ao reprogramar: ${error.message}`, 'error');
        } else {
            showToast(`Planos reprogramados com sucesso!`, 'success');
            await fetchData();
        }
        setIsSyncing(false);
    };

    return (
        <DataContext.Provider value={{
            equipmentData, workOrders, equipmentTypes, maintenancePlans, inventoryData, maintainers, requesters, stockMovements, isSyncing, cloudConnected,
            handleSaveWorkOrder, handlePlanSave, showToast, handleUnifiedSave, handlePartSave, handleInventoryAdjustment,
            handleMaintainerSave, handleMaintainerDelete, handleRequesterSave, handleRequesterDelete, handleWorkOrderDelete, handleBulkDeleteWorkOrders,
            handleEquipmentTypeSave, handleEquipmentTypeDelete, handleEquipmentSave, handleEquipmentDelete, handlePlanDelete,
            forceFullDatabaseRefresh: fetchData, logActivity, revertTasksPreparation, markTasksAsPrepared, handleBulkReprogramPlans, 
            generateFullPlanning2026, runAutoClassification, refreshPlanTargets
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useDataContext must be used within a DataProvider');
    return context;
};