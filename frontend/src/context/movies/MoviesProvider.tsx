/**
 * MoviesProvider
 *
 * Provider component for MoviesContext
 * Now uses React Query for server state (movies data)
 * Only manages local UI state (navigation index)
 */

import React, { useReducer, useCallback, ReactNode, useMemo } from 'react';
import { useMovies } from '@/hooks/api';
import { MoviesContext, type MoviesState } from './MoviesContext';
import type { Movie } from '@core';

/**
 * Action Types - Only for local navigation
 */
type MoviesAction =
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'NEXT_MOVIE'; payload: number }
  | { type: 'RESET_INDEX' };

/**
 * Local state for navigation only
 */
interface LocalMoviesState {
  currentMovieIndex: number;
}

/**
 * Reducer Function - Only manages index
 */
function moviesReducer(state: LocalMoviesState, action: MoviesAction): LocalMoviesState {
  switch (action.type) {
    case 'SET_CURRENT_INDEX':
      return {
        currentMovieIndex: Math.max(0, action.payload),
      };

    case 'NEXT_MOVIE':
      return {
        currentMovieIndex: Math.min(state.currentMovieIndex + 1, action.payload),
      };

    case 'RESET_INDEX':
      return {
        currentMovieIndex: 0,
      };

    default:
      return state;
  }
}

/**
 * Provider Props
 */
interface MoviesProviderProps {
  children: ReactNode;
}

/**
 * MoviesProvider Component
 * Delegates server state to React Query (useMovies hook)
 * Manages only local navigation state
 */
export const MoviesProvider: React.FC<MoviesProviderProps> = ({ children }) => {
  // Get server state from React Query
  // Enabled: Load movies on mount (Home page needs them)
  const { moviesData, isLoadingMovies, moviesError } = useMovies(undefined, true);

  // Local navigation state
  const [navState, dispatch] = useReducer(moviesReducer, { currentMovieIndex: 0 });

  // Get movies from React Query data (convert MovieDTO to Movie type)
  const movies: Movie[] = useMemo(() => {
    return (moviesData?.data || []) as unknown as Movie[];
  }, [moviesData]);

  // Navigation actions
  const setCurrentMovieIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
  }, []);

  const nextMovie = useCallback(() => {
    dispatch({ type: 'NEXT_MOVIE', payload: movies.length });
  }, [movies.length]);

  const resetMovieIndex = useCallback(() => {
    dispatch({ type: 'RESET_INDEX' });
  }, []);

  // Backward compatibility - expose old setMovies, setLoading, setError
  const setMovies = useCallback((_movies: Movie[]) => {
    console.warn('setMovies from context is deprecated, use useMovies hook instead');
  }, []);

  const setLoading = useCallback((_loading: boolean) => {
    console.warn('setLoading from context is deprecated, use useMovies hook instead');
  }, []);

  const setError = useCallback((_error: Error | null) => {
    console.warn('setError from context is deprecated, use useMovies hook instead');
  }, []);

  // Combine React Query server state with local navigation state
  const value = {
    movies,
    loading: isLoadingMovies,
    error: moviesError as Error | null,
    currentMovieIndex: navState.currentMovieIndex,

    // Navigation actions
    setCurrentMovieIndex,
    nextMovie,
    resetMovieIndex,

    // Deprecated actions (for backward compatibility)
    setMovies,
    setLoading,
    setError,
  } as any;

  return (
    <MoviesContext.Provider value={value}>
      {children}
    </MoviesContext.Provider>
  );
};
