import React, { useState } from 'react';
import { CloseIcon, SecurityIcon } from './icons';

interface PasswordPromptModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ADMIN_PASSWORD = 'admin123';

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({ onConfirm, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onConfirm();
    } else {
      setError('Senha de administrador incorreta.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[200]" onClick={onCancel}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 m-4 relative border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-400">
          <CloseIcon />
        </button>
        <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SecurityIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ação Restrita</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Por favor, insira a senha de administrador para continuar.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="sr-only">Senha</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full text-center form-input"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button type="submit" className="w-full px-4 py-2 rounded-md bg-yellow-500 text-white font-semibold text-sm hover:bg-yellow-600 transition-colors">
            Autorizar
          </button>
           <button type="button" onClick={onCancel} className="w-full text-xs text-gray-500 hover:underline">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};