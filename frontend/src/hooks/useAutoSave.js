import { useEffect, useRef, useState } from 'react';

/**
 * useAutoSave - Hook para auto-save automático com debounce
 *
 * Salva dados automaticamente em localStorage após delay de inatividade.
 * Útil para formulários longos, rascunhos, etc.
 *
 * @param {String} key - Chave para localStorage
 * @param {*} value - Valor a ser salvo (será serializado com JSON.stringify)
 * @param {Number} delay - Delay em ms antes de salvar (padrão: 2000ms)
 * @returns {Object} { lastSaved, clearSaved }
 *
 * Exemplo:
 * ```jsx
 * const [formData, setFormData] = useState({...});
 * const { lastSaved } = useAutoSave('nota-fiscal-rascunho', formData, 2000);
 * ```
 */
export default function useAutoSave(key, value, delay = 2000) {
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);
  const initialValueRef = useRef(null);

  // Carregar valor inicial do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        initialValueRef.current = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar valor salvo:', error);
    }
  }, [key]);

  // Auto-save com debounce
  useEffect(() => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Não salvar se o valor estiver vazio ou for igual ao inicial
    if (!value || value === initialValueRef.current) {
      return;
    }

    // Agendar save
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        setLastSaved(new Date());
        console.log(`[AutoSave] Salvo em ${key} às ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay]);

  // Função para limpar valor salvo
  const clearSaved = () => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
      initialValueRef.current = null;
    } catch (error) {
      console.error('Erro ao limpar valor salvo:', error);
    }
  };

  // Função para restaurar valor salvo
  const restoreSaved = () => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao restaurar valor:', error);
    }
    return null;
  };

  return {
    lastSaved,
    clearSaved,
    restoreSaved,
  };
}
