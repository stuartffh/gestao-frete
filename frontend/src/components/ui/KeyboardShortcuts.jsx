import { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import Modal from './Modal';
import Card from './Card';

const KeyboardShortcuts = ({ shortcuts = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // ? para abrir ajuda de atalhos
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        // Verificar se não está digitando
        if (
          event.target.tagName !== 'INPUT' &&
          event.target.tagName !== 'TEXTAREA' &&
          !event.target.isContentEditable
        ) {
          event.preventDefault();
          setIsOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const defaultShortcuts = shortcuts.length > 0 ? shortcuts : [
    { key: '/', description: 'Focar na busca' },
    { key: 'n', description: 'Criar novo item' },
    { key: 'f', description: 'Focar nos filtros' },
    { key: '?', description: 'Mostrar esta ajuda' },
    { key: 'Esc', description: 'Fechar modal/drawer' },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Atalhos de Teclado"
        size="lg"
      >
        <div className="space-y-4">
          {defaultShortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border"
            >
              <span className="text-text">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-card border border-border rounded text-sm font-mono text-text">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default KeyboardShortcuts;

