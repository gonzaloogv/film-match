/**
 * Backdrop Component
 * Semi-transparent overlay behind modals with optional blur
 */

import type React from 'react';
import { getBackdropClassName } from './backdropStrategies';
import type { BackdropProps } from './Backdrop.types';

export const Backdrop: React.FC<BackdropProps> = ({
  onClick,
  zIndex = 40,
  blur = true,
  className,
}) => {
  const computedClassName = getBackdropClassName(blur, zIndex, className);

  return <div className={computedClassName} onClick={onClick} />;
};
