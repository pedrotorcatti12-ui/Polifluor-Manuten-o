
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Page, WorkOrder, MaintenancePlan, UserRole, User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    
    isOSModalOpen: boolean;
    setIsOSModalOpen: (isOpen: boolean) => void;
    editingOrder: WorkOrder | null;
    setEditingOrder: (order: WorkOrder | null) => void;
    
    isPlanModalOpen: boolean;
    setIsPlanModalOpen: (isOpen: boolean) => void;
    editingPlan: MaintenancePlan | null;
    setEditingPlan: (plan: MaintenancePlan | null) => void;

    userRole: UserRole | null;
    currentUser: User | null; // Adicionado para saber QUEM é o usuário (Darci, Sergio, Marcos)
    handleLogin: (user: User) => void;
    handleLogout: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    requestAdminPassword: (callback: () => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    
    const [isOSModalOpen, setIsOSModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);

    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('sgmi-theme', 'light');

    const handleLogin = (user: User) => {
        setUserRole(user.role);
        setCurrentUser(user);
        setCurrentPage('home');
    };

    const handleLogout = () => {
        setUserRole(null); 
        setCurrentUser(null);
    };

    const requestAdminPassword = (callback: () => void) => {
        // Em uma aplicação real, isso abriria um modal de senha.
        // Para este ambiente, vamos assumir que a senha está correta e executar o callback.
        callback();
    };

    return (
        <AppContext.Provider value={{
            currentPage, setCurrentPage,
            isOSModalOpen, setIsOSModalOpen,
            editingOrder, setEditingOrder,
            isPlanModalOpen, setIsPlanModalOpen,
            editingPlan, setEditingPlan,
            userRole,
            currentUser,
            handleLogin,
            handleLogout,
            theme,
            setTheme,
            requestAdminPassword
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
