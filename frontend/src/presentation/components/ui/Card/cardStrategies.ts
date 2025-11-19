/**
 * Card Component Style Strategies
 * Implements Strategy Pattern for card styling using Tailwind CSS utilities
 */

import { mergeClassNames } from '@/shared/utils';
import type { CardVariant, CardPadding } from './Card.types';

/**
 * Base styles applied to all cards
 */
const BASE_STYLES = 'rounded-2xl transition-all duration-300';

/**
 * Variant strategy: Maps variant names to Tailwind classes
 */
export const CARD_VARIANT_STRATEGIES: Record<CardVariant, string> = {
  default:
    'bg-dark-card text-white shadow-lg hover:shadow-xl hover:shadow-primary-pink/20 border border-transparent hover:border-primary-pink/30',
  elevated:
    'bg-gradient-to-br from-dark-card to-dark-bg text-white shadow-2xl hover:shadow-2xl hover:shadow-primary-purple/30 border border-primary-pink/20',
  outlined: 'bg-transparent text-white border-2 border-primary-pink hover:border-primary-purple',
};

/**
 * Padding strategy: Maps padding names to Tailwind classes
 */
export const CARD_PADDING_STRATEGIES: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Get complete card class name based on variant and padding
 */
export const getCardClassName = (
  variant: CardVariant = 'default',
  padding: CardPadding = 'md',
  customClassName?: string
): string => {
  const variantClass = CARD_VARIANT_STRATEGIES[variant] || CARD_VARIANT_STRATEGIES.default;
  const paddingClass = CARD_PADDING_STRATEGIES[padding] || CARD_PADDING_STRATEGIES.md;

  return mergeClassNames(BASE_STYLES, variantClass, paddingClass, customClassName);
};
