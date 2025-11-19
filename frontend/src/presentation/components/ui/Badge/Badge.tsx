/**
 * Badge Component
 */

import type React from 'react';
import { getBadgeClassName } from './badgeStrategies';
import type { BadgeProps } from './Badge.types';

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const computedClassName = getBadgeClassName(variant, size, className);

  return (
    <div className={computedClassName} {...props}>
      {children}
    </div>
  );
};
