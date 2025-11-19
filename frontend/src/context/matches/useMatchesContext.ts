/**
 * useMatchesContext Hook
 */

import { useContext } from 'react';
import { MatchesContext } from './MatchesContext';

/**
 * Hook to access matches context
 *
 * @throws Error if used outside MatchesProvider
 * @returns MatchesContextValue
 *
 * @example
 * ```typescript
 * const { matches, addMatch, isMatched } = useMatchesContext();
 * ```
 */
export function useMatchesContext() {
  const context = useContext(MatchesContext);

  if (context === undefined) {
    throw new Error('useMatchesContext must be used within MatchesProvider');
  }

  return context;
}
