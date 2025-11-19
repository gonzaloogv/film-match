/**
 * useUIContext Hook
 */

import { useContext } from 'react';
import { UIContext } from './UIContext';

/**
 * Hook to access UI context
 *
 * @throws Error if used outside UIProvider
 * @returns UIContextValue
 *
 * @example
 * ```typescript
 * const { openMatchModal, closeFiltersSidebar, showNotification } = useUIContext();
 * ```
 */
export function useUIContext() {
  const context = useContext(UIContext);

  if (context === undefined) {
    throw new Error('useUIContext must be used within UIProvider');
  }

  return context;
}
