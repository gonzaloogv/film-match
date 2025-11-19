/**
 * IconButton Component
 * Reusable icon button with variants and sizes
 */

import type React from 'react';
import { getIconButtonClassName } from './iconButtonStrategies';
import type { IconButtonProps } from './IconButton.types';

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const computedClassName = getIconButtonClassName(variant, size, className);

  return (
    <button className={computedClassName} {...props}>
      {icon}
    </button>
  );
};
