/**
 * Button Component Types
 */

import type { ButtonProps as ReactButtonProps } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ReactButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button content */
  children: React.ReactNode;
  /** Optional CSS class override */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
}
