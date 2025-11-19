/**
 * Button Component Style Strategies
 * Implements Strategy Pattern for button styling using Tailwind CSS utilities
 */

import { mergeClassNames } from '@/shared/utils';
import type { ButtonVariant, ButtonSize } from './Button.types';

/**
 * Base styles applied to all buttons
 */
const BASE_STYLES =
  'rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2';

/**
 * Variant strategy: Maps variant names to Tailwind classes
 */
export const BUTTON_VARIANT_STRATEGIES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-primary-pink to-primary-purple text-white hover:opacity-90 active:scale-95 focus:ring-primary-pink',
  secondary:
    'bg-dark-card text-white border border-primary-pink hover:border-primary-purple transition-colors active:scale-95 focus:ring-primary-pink',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95 focus:ring-rose-500',
  ghost: 'text-primary-pink hover:bg-primary-pink/10 active:bg-primary-pink/20 focus:ring-primary-pink',
};

/**
 * Size strategy: Maps size names to Tailwind classes
 */
export const BUTTON_SIZE_STRATEGIES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

/**
 * Loading state styles
 */
const LOADING_STYLES = 'opacity-70 cursor-wait';

/**
 * Get complete button class name based on variant and size
 * Combines base styles with strategy-based variant and size classes
 */
export const getButtonClassName = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  customClassName?: string,
  isLoading?: boolean
): string => {
  const variantClass = BUTTON_VARIANT_STRATEGIES[variant] || BUTTON_VARIANT_STRATEGIES.primary;
  const sizeClass = BUTTON_SIZE_STRATEGIES[size] || BUTTON_SIZE_STRATEGIES.md;
  const loadingClass = isLoading ? LOADING_STYLES : '';

  return mergeClassNames(BASE_STYLES, variantClass, sizeClass, loadingClass, customClassName);
};
