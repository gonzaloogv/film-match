/**
 * Button Component
 * Reusable button with multiple variants and sizes using Strategy Pattern
 */

import type React from 'react';
import { getButtonClassName } from './buttonStrategies';
import type { ButtonProps } from './Button.types';

/**
 * Button component with variant and size strategies
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => alert('Clicked!')}>
 *   Click me
 * </Button>
 *
 * <Button variant="danger" size="lg" isLoading={true}>
 *   Loading...
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  disabled = false,
  children,
  ...props
}) => {
  const computedClassName = getButtonClassName(variant, size, className, isLoading);

  return (
    <button className={computedClassName} disabled={disabled || isLoading} {...props}>
      {children}
    </button>
  );
};
