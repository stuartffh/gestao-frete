import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import useRipple from '../../hooks/useRipple';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disableRipple = false,
  onClick,
  ...props
}, ref) => {
  const createRipple = useRipple();

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ripple-container button-press focus-ring';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 shadow-md hover:shadow-lg hover-lift',
    secondary: 'bg-surface text-text border border-border hover:bg-card',
    subtle: 'bg-card text-text hover:bg-surface',
    ghost: 'text-text hover:bg-card',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-md hover:shadow-lg',
    outline: 'border border-border text-text hover:bg-card',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const handleClick = (e) => {
    if (!disabled && !loading && !disableRipple) {
      createRipple(e);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {!loading && LeftIcon && <LeftIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
      {!loading && RightIcon && <RightIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

