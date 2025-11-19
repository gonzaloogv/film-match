/**
 * Badge Component Style Strategies
 */

import { mergeClassNames } from '@/shared/utils';
import type { BadgeVariant, BadgeSize } from './Badge.types';

const BASE_STYLES = 'rounded-full inline-flex items-center justify-center font-semibold whitespace-nowrap';

export const BADGE_VARIANT_STRATEGIES: Record<BadgeVariant, string> = {
  default: 'bg-dark-card text-white border border-primary-pink',
  success: 'bg-green-500/20 text-green-400 border border-green-500/50',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
  error: 'bg-rose-500/20 text-rose-400 border border-rose-500/50',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
};

export const BADGE_SIZE_STRATEGIES: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const getBadgeClassName = (
  variant: BadgeVariant = 'default',
  size: BadgeSize = 'md',
  customClassName?: string
): string => {
  const variantClass = BADGE_VARIANT_STRATEGIES[variant] || BADGE_VARIANT_STRATEGIES.default;
  const sizeClass = BADGE_SIZE_STRATEGIES[size] || BADGE_SIZE_STRATEGIES.md;

  return mergeClassNames(BASE_STYLES, variantClass, sizeClass, customClassName);
};
