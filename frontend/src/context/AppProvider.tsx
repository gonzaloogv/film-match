/**
 * AppProvider
 *
 * Composite provider that wraps all context providers
 * Ensures proper nesting order and single wrapper component
 *
 * @architecture_pattern Composite Pattern
 */

import React, { ReactNode } from 'react';
import { UserProvider } from './user/UserProvider';
import { MoviesProvider } from './movies/MoviesProvider';
import { FiltersProvider } from './filters/FiltersProvider';
import { MatchesProvider } from './matches/MatchesProvider';
import { RatingsProvider } from './ratings/RatingsProvider';
import { UIProvider } from './ui/UIProvider';

/**
 * Provider Props
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider Component
 *
 * Wraps the entire application with all context providers
 * Order matters: User context should be first, UI context should be last
 *
 * @example
 * ```typescript
 * <AppProvider>
 *   <App />
 * </AppProvider>
 * ```
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <UserProvider>
      <MoviesProvider>
        <FiltersProvider>
          <MatchesProvider>
            <RatingsProvider>
              <UIProvider>
                {children}
              </UIProvider>
            </RatingsProvider>
          </MatchesProvider>
        </FiltersProvider>
      </MoviesProvider>
    </UserProvider>
  );
};
