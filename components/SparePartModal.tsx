import React, { useState, useEffect } from 'react';
import { SparePart } from '../types';
import { CloseIcon } from './icons';

interface SparePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: SparePart) => void;
  existingPart: SparePart | null;
}

export const SparePartModal: React.FC<SparePartModalProps> = ({ isOpen, onClose, onSave, existingPart }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('');
  const [cost, setCost] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);

  useEffect(() => {
    if (existingPart) {
      setId(existingPart.id);
      setName(existingPart.name);
      setLocation(existingPart.location);
      setUnit(existingPart.unit);
      setCost(existingPart.cost);
      setMinStock(existingPart.minStock);
      setCurrentStock(existingPart.currentStock);
    } else {
      setId('');
      setName('');
      setLocation('');
      setUnit('');
      setCost(0);
      setMinStock(0);
      setCurrentStock(0);
    }
  }, [existingPart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id, name, location, unit, cost, minStock, currentStock });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 relative border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <CloseIcon />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {existingPart ? 'Editar Peça' : 'Adicionar Nova Peça'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Preencha os detalhes do item de estoque.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="part-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código (ID)</label>
              <input type="text" id="part-id" value={id} onChange={e => setId(e.target.value)} required disabled={!!existingPart}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700/50" />
            </div>
             <div>
              <label htmlFor="part-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidade</label>
              <input type="text" id="part-unit" placeholder="Ex: PEÇA, LITRO, KG" value={unit} onChange={e => setUnit(e.target.value)} required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="part-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
            <input type="text" id="part-name" value={name} onChange={e => setName(e.target.value)} required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label htmlFor="part-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Localização</label>
              <input type="text" id="part-location" placeholder="Ex: P1-A3" value={location} onChange={e => setLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label htmlFor="part-cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custo (R$)</label>
              <input type="number" id="part-cost" value={cost} onChange={e => setCost(Number(e.target.value))} required min="0" step="0.01"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="part-min-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque Mínimo</label>
              <input type="number" id="part-min-stock" value={minStock} onChange={e => setMinStock(Number(e.target.value))} required min="0"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label htmlFor="part-current-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque Atual</label>
              <input type="number" id="part-current-stock" value={currentStock} onChange={e => setCurrentStock(Number(e.target.value))} required min="0"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};