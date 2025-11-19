/**
 * RatingStars Component Style Strategies
 */

import { mergeClassNames } from '@/shared/utils';
import type { RatingSize } from './RatingStars.types';

export const RATING_SIZE_STRATEGIES: Record<RatingSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const getRatingClassName = (
  size: RatingSize = 'md',
  customClassName?: string
): string => {
  const sizeClass = RATING_SIZE_STRATEGIES[size] || RATING_SIZE_STRATEGIES.md;

  return mergeClassNames(sizeClass, customClassName);
};
