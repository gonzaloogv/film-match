/**
 * useRatingsContext Hook
 */

import { useContext } from 'react';
import { RatingsContext } from './RatingsContext';

/**
 * Hook to access ratings context
 *
 * @throws Error if used outside RatingsProvider
 * @returns RatingsContextValue
 *
 * @example
 * ```typescript
 * const { ratings, addRating, hasRating } = useRatingsContext();
 * ```
 */
export function useRatingsContext() {
  const context = useContext(RatingsContext);

  if (context === undefined) {
    throw new Error('useRatingsContext must be used within RatingsProvider');
  }

  return context;
}
