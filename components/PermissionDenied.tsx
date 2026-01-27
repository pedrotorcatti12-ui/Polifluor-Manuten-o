import React from 'react';
import { SecurityIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';

export const PermissionDenied: React.FC = () => {
    const { setCurrentPage } = useAppContext();
    return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-red-200">
            <SecurityIcon className="w-16 h-16 text-red-300 mb-4" />
            <h1 className="text-xl font-bold text-red-600">Acesso Negado</h1>
            <p className="text-gray-500 mt-2">Seu perfil de usuário não tem permissão para acessar esta funcionalidade.</p>
            <button
                onClick={() => setCurrentPage('home')}
                className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
                Voltar para a Página Inicial
            </button>
        </div>
    );
};