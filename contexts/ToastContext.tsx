import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, CloseIcon, InfoIcon } from '../components/icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => [{ id, message, type }, ...prev]);
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[200] flex flex-col gap-3 w-full max-w-sm">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className="flex items-center p-4 rounded-lg shadow-lg border-l-4 bg-white animate-fade-in"
                    >
                        <div className="flex-shrink-0 mr-3">
                            {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                            {toast.type === 'error' && <ExclamationTriangleIcon className="w-6 h-6 text-rose-500" />}
                            {toast.type === 'warning' && <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />}
                            {toast.type === 'info' && <InfoIcon className="w-6 h-6 text-blue-500" />}
                        </div>
                        <p className="flex-1 text-sm font-semibold text-slate-700">{toast.message}</p>
                        <button onClick={() => removeToast(toast.id)} className="ml-3 text-slate-400 hover:text-slate-600">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
