import { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  onBlur,
  validateOnBlur,
  validator,
  ...props
}, ref) => {
  const [localError, setLocalError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = (e) => {
    setIsFocused(false);

    // Validação onBlur se habilitada
    if (validateOnBlur && validator) {
      const validationResult = validator(e.target.value);
      if (validationResult) {
        setLocalError(validationResult);
        // Trigger shake animation on error
        const inputEl = e.target;
        inputEl.classList.add('shake-error');
        setTimeout(() => inputEl.classList.remove('shake-error'), 500);
      } else {
        setLocalError(null);
      }
    }

    // Callback onBlur original
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Clear local error on focus
    setLocalError(null);
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-muted mb-2">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2",
            displayError ? "text-danger" : isFocused ? "text-primary" : "text-muted"
          )}>
            <LeftIcon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 bg-surface border rounded-lg transition-all',
            'text-text placeholder:text-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            displayError ? 'border-danger' : 'border-border',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            className
          )}
          aria-invalid={displayError ? 'true' : 'false'}
          aria-describedby={displayError ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...props}
        />
        {RightIcon && (
          <div className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2",
            displayError ? "text-danger" : isFocused ? "text-primary" : "text-muted"
          )}>
            <RightIcon size={18} />
          </div>
        )}
      </div>
      {displayError && (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-danger" role="alert" aria-live="polite">
          {displayError}
        </p>
      )}
      {helperText && !displayError && (
        <p id={`${props.id}-helper`} className="mt-1 text-sm text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

