/**
 * useFiltersContext Hook
 */

import { useContext } from 'react';
import { FiltersContext } from './FiltersContext';

/**
 * Hook to access filters context
 *
 * @throws Error if used outside FiltersProvider
 * @returns FiltersContextValue
 *
 * @example
 * ```typescript
 * const { criteria, isActive, toggleGenre } = useFiltersContext();
 * ```
 */
export function useFiltersContext() {
  const context = useContext(FiltersContext);

  if (context === undefined) {
    throw new Error('useFiltersContext must be used within FiltersProvider');
  }

  return context;
}
