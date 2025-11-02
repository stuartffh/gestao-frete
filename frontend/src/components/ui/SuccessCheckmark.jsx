import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

/**
 * SuccessCheckmark - Animação de checkmark de sucesso
 *
 * Exibe um checkmark animado com círculo ao redor
 * Útil para feedback de ações bem-sucedidas
 *
 * @param {Number} size - Tamanho do checkmark (padrão: 64)
 * @param {String} className - Classes CSS adicionais
 *
 * Exemplo:
 * ```jsx
 * <SuccessCheckmark size={80} />
 * ```
 */
export default function SuccessCheckmark({ size = 64, className }) {
  const strokeWidth = size > 80 ? 3 : 2;
  const checkmarkSize = size * 0.4;

  return (
    <div className={cn('success-checkmark inline-block', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sucesso"
        role="img"
      >
        {/* Círculo */}
        <circle
          className="checkmark-circle"
          cx="26"
          cy="26"
          r="25"
          fill="none"
          stroke="var(--color-success)"
          strokeWidth={strokeWidth}
        />

        {/* Checkmark */}
        <path
          className="checkmark-check"
          fill="none"
          stroke="var(--color-success)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      </svg>
    </div>
  );
}

SuccessCheckmark.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};
