
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // Busca o valor inicial do LocalStorage ou usa o fornecido
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler LocalStorage para chave "${key}":`, error);
      return initialValue;
    }
  });

  // Sempre que o estado mudar, persiste no LocalStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Erro ao salvar no LocalStorage para chave "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export { useLocalStorage };
