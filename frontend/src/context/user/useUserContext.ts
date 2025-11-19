/**
 * useUserContext Hook
 */

import { useContext } from 'react';
import { UserContext } from './UserContext';

/**
 * Hook to access user context
 *
 * @throws Error if used outside UserProvider
 * @returns UserContextValue
 *
 * @example
 * ```typescript
 * const { isAuthenticated, user, login, logout } = useUserContext();
 * ```
 */
export function useUserContext() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUserContext must be used within UserProvider');
  }

  return context;
}
