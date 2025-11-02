import { useCallback } from 'react';

/**
 * useRipple - Hook para efeito ripple (Material Design-like)
 *
 * Cria efeito de onda ao clicar em elementos
 *
 * @returns {Function} createRipple - Função para criar ripple no evento de click
 *
 * Exemplo:
 * ```jsx
 * const createRipple = useRipple();
 *
 * <button
 *   className="ripple-container"
 *   onClick={(e) => {
 *     createRipple(e);
 *     handleClick();
 *   }}
 * >
 *   Clique aqui
 * </button>
 * ```
 */
export default function useRipple() {
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;

    // Verificar se o elemento tem a classe ripple-container
    if (!button.classList.contains('ripple-container')) {
      console.warn('useRipple: O elemento precisa ter a classe "ripple-container"');
      return;
    }

    // Remover ripples antigos (se houver)
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    // Criar elemento ripple
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    // Calcular tamanho e posição
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Adicionar ao botão
    button.appendChild(ripple);

    // Remover após animação
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  return createRipple;
}
