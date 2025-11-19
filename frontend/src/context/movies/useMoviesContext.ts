/**
 * useMoviesContext Hook
 *
 * Custom hook to access MoviesContext
 * Throws error if used outside MoviesProvider
 */

import { useContext } from 'react';
import { MoviesContext } from './MoviesContext';

/**
 * Hook to access movies context
 *
 * @throws Error if used outside MoviesProvider
 * @returns MoviesContextValue
 *
 * @example
 * ```typescript
 * const { movies, loading, setMovies } = useMoviesContext();
 * ```
 */
export function useMoviesContext() {
  const context = useContext(MoviesContext);

  if (context === undefined) {
    throw new Error('useMoviesContext must be used within MoviesProvider');
  }

  return context;
}
