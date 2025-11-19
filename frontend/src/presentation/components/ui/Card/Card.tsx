/**
 * Card Component
 * Reusable container with multiple variants and padding using Strategy Pattern
 */

import type React from 'react';
import { getCardClassName } from './cardStrategies';
import type { CardProps } from './Card.types';

/**
 * Card component with variant and padding strategies
 *
 * @example
 * ```tsx
 * <Card variant="default" padding="md">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card variant="elevated" padding="lg">
 *   Important information
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const computedClassName = getCardClassName(variant, padding, className);

  return (
    <div className={computedClassName} {...props}>
      {children}
    </div>
  );
};
