import React, { useState, useMemo } from 'react';
import { useAppContext } from './contexts/AppContext';
import { useDataContext } from './contexts/DataContext';
import { Page, WorkOrder, MaintenanceStatus, MaintenanceType } from './types';

// Import Pages
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { PlanningPage } from './pages/PlanningPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { EquipmentTypesPage } from './pages/EquipmentTypesPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasingPage } from './pages/PurchasingPage';
import { InventoryLogsPage } from './pages/InventoryLogsPage';
import { QualityPage } from './pages/QualityPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { InformationPage } from './pages/InformationPage';
import { PermissionDenied } from './components/PermissionDenied';
import { SchedulePage } from './pages/SchedulePage';

// Import Components
import { Sidebar } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import { MaintenancePlanModal } from './components/MaintenancePlanModal';
import { CorrectiveRequestModal } from './components/CorrectiveRequestModal';
import { getNextOSNumber } from './utils/osGenerator';
import { WorkOrderControlModal } from './components/WorkOrderControlModal';

const AppContent: React.FC = () => {
    const { 
        currentPage, userRole, handleLogin,
        isOSModalOpen, setIsOSModalOpen, editingOrder,
        isPlanModalOpen, setIsPlanModalOpen, editingPlan
    } = useAppContext();
    
    const { 
        equipmentData, workOrders, handleSaveWorkOrder,
        equipmentTypes, handlePlanSave, showToast, requesters,
        inventoryData, maintainers,
    } = useDataContext();
    
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCorrectiveModalOpen, setIsCorrectiveModalOpen] = useState(false);

    const nextOSNumber = useMemo(() => getNextOSNumber(equipmentData, workOrders), [workOrders, equipmentData]);

    if (!userRole) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const isAdmin = userRole === 'admin';

    const pagesWithAdminAccess: Page[] = [
        'dashboard', 'planning', 'equipment', 'equipment_types', 'inventory', 
        'purchasing', 'quality', 'reports', 'settings', 'inventory_logs'
    ];

    const renderPage = () => {
        if (!isAdmin && pagesWithAdminAccess.includes(currentPage)) {
            return <PermissionDenied />;
        }
        
        switch (currentPage) {
            case 'home': return <HomePage />;
            case 'dashboard': return <DashboardPage />;
            case 'work_orders': return <WorkOrdersPage />;
            case 'planning': return <PlanningPage />;
            case 'schedule': return <SchedulePage />;
            case 'equipment': return <EquipmentPage />;
            case 'equipment_types': return <EquipmentTypesPage />;
            case 'inventory': return <InventoryPage />;
            case 'inventory_logs': return <InventoryLogsPage />;
            case 'purchasing': return <PurchasingPage />;
            case 'quality': return <QualityPage />;
            case 'history': return <HistoryPage />;
            case 'reports': return <ReportsPage />;
            case 'settings': return <SettingsPage />;
            case 'documentation': return <DocumentationPage />;
            case 'information': return <InformationPage />;
            default: return <HomePage />;
        }
    };
    
    const handleSaveOS = async (order: WorkOrder) => {
        const success = await handleSaveWorkOrder(order);
        if (success) {
            showToast(`Ordem de Serviço #${order.id} salva.`, 'success');
        }
    }
    
    const handleCreateCorrective = async (equipmentId: string, description: string, requester: string, priority: string, osNumber: string, category?: any, failureDateTime?: string, type?: any) => {
        const nextId = getNextOSNumber(equipmentData, workOrders);
        const newOrder: WorkOrder = {
            id: nextId,
            equipmentId,
            description,
            requester,
            type: type || MaintenanceType.Corrective,
            status: MaintenanceStatus.Scheduled,
            scheduledDate: failureDateTime || new Date().toISOString(),
            correctiveCategory: category,
            machineStopped: priority === 'Alta',
        };
        await handleSaveWorkOrder(newOrder);
        setIsCorrectiveModalOpen(false);
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans dark:bg-gray-900">
            <Sidebar 
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(prev => !prev)}
              onCloseMobile={() => {
                  if (window.innerWidth < 768) setIsSidebarCollapsed(true);
              }}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                <AppHeader 
                    onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)} 
                    onOpenCorrectiveRequest={() => setIsCorrectiveModalOpen(true)}
                />
                <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-gray-950">
                    {renderPage()}
                </div>
            </main>

            {isOSModalOpen && (
                <WorkOrderControlModal
                    isOpen={isOSModalOpen}
                    onClose={() => setIsOSModalOpen(false)}
                    onSave={handleSaveOS} // onSave is passed but the modal uses context directly
                    existingOrder={editingOrder}
                    equipmentData={equipmentData}
                    inventoryData={inventoryData}
                    nextOSNumber={nextOSNumber}
                    maintainers={maintainers}
                    requesters={requesters}
                />
            )}

            {isPlanModalOpen && (
                <MaintenancePlanModal
                    isOpen={isPlanModalOpen}
                    onClose={() => setIsPlanModalOpen(false)}
                    onSave={async (plan) => {
                        const success = await handlePlanSave(plan);
                        if (success) {
                            setIsPlanModalOpen(false);
                            showToast('Plano de Manutenção salvo!', 'success');
                        }
                    }}
                    existingPlan={editingPlan}
                    equipmentTypes={equipmentTypes}
                />
            )}
            
            {isCorrectiveModalOpen && (
                <CorrectiveRequestModal 
                    isOpen={isCorrectiveModalOpen}
                    onClose={() => setIsCorrectiveModalOpen(false)}
                    onCreate={handleCreateCorrective}
                    equipmentList={equipmentData}
                    requesters={requesters}
                />
            )}
        </div>
    );
};

const App: React.FC = () => <AppContent />;
export default App;