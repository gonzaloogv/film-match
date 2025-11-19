/**
 * Input Component
 * Reusable form input with variants and sizes
 */

import type React from 'react';
import { getInputClassName } from './inputStrategies';
import type { InputProps } from './Input.types';

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  label,
  error = false,
  helperText,
  className,
  id,
  ...props
}) => {
  const computedClassName = getInputClassName(variant, size, error, className);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input id={inputId} className={computedClassName} {...props} />
      {helperText && (
        <p className={`text-xs mt-1 ${error ? 'text-rose-500' : 'text-gray-400'}`}>{helperText}</p>
      )}
    </div>
  );
};
