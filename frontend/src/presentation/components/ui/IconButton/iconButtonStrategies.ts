/**
 * IconButton Component Style Strategies
 */

import { mergeClassNames } from '@/shared/utils';
import type { IconButtonVariant, IconButtonSize } from './IconButton.types';

const BASE_STYLES = 'rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

export const ICON_BUTTON_VARIANT_STRATEGIES: Record<IconButtonVariant, string> = {
  default: 'text-gray-400 hover:text-white hover:bg-dark-input',
  filled: 'bg-primary-pink text-white hover:bg-primary-purple',
  outlined: 'border border-primary-pink text-primary-pink hover:bg-primary-pink/10',
};

export const ICON_BUTTON_SIZE_STRATEGIES: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const getIconButtonClassName = (
  variant: IconButtonVariant = 'default',
  size: IconButtonSize = 'md',
  customClassName?: string
): string => {
  const variantClass = ICON_BUTTON_VARIANT_STRATEGIES[variant] || ICON_BUTTON_VARIANT_STRATEGIES.default;
  const sizeClass = ICON_BUTTON_SIZE_STRATEGIES[size] || ICON_BUTTON_SIZE_STRATEGIES.md;

  return mergeClassNames(BASE_STYLES, variantClass, sizeClass, customClassName);
};
