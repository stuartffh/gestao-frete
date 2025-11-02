import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignorar se estiver digitando em input/textarea
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      // Combinar tecla principal com modificadores
      const key = event.key.toLowerCase();
      const ctrlOrCmd = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Mapear atalhos comuns
      const shortcutKey = ctrlOrCmd
        ? `ctrl+${key}`
        : shift
        ? `shift+${key}`
        : alt
        ? `alt+${key}`
        : key;

      // Executar atalho se definido
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey](event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

export default useKeyboardShortcuts;

