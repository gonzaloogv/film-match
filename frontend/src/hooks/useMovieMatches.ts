/**
 * useMovieMatches Hook
 * Manages user's matched (liked) movies
 *
 * Provides state management and operations for movies the user has marked as matches
 * Integrates with the UserDataRepository for persistence to localStorage
 */

import { useCallback, useState, useEffect } from 'react';
import { useDIContainer } from './useDIContainer';
import { DI_TOKENS, type Movie } from '@core';
import type { IUserDataRepository } from '@core';

/**
 * Hook for managing movie matches (liked movies)
 *
 * Provides methods to:
 * - Get all matched movies
 * - Add a movie to matches
 * - Remove a movie from matches
 * - Check if a movie is matched
 * - Clear all matches
 *
 * @returns Object with match operations and state
 *
 * @example
 * ```typescript
 * const {
 *   matches,
 *   loading,
 *   addMatch,
 *   removeMatch,
 *   isMatched
 * } = useMovieMatches()
 *
 * const handleLike = async (movie) => {
 *   await addMatch(movie)
 * }
 * ```
 */
export function useMovieMatches() {
  const { get } = useDIContainer();
  const [matches, setMatches] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load matches from repository on mount
   */
  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
        const loadedMatches = await repo.getMatches();
        setMatches(loadedMatches);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [get]);

  /**
   * Add a movie to matches
   */
  const addMatch = useCallback(
    async (movie: Movie): Promise<void> => {
      try {
        const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
        await repo.addMatch(movie);
        setMatches((prev) => [...prev, movie]);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error adding match:', error);
        throw error;
      }
    },
    [get]
  );

  /**
   * Remove a movie from matches
   */
  const removeMatch = useCallback(
    async (movieId: number): Promise<void> => {
      try {
        const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
        await repo.removeMatch(movieId);
        setMatches((prev) => prev.filter((m) => m.id !== movieId));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error removing match:', error);
        throw error;
      }
    },
    [get]
  );

  /**
   * Check if a movie is matched
   */
  const isMatched = useCallback(
    async (movieId: number): Promise<boolean> => {
      try {
        const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
        return await repo.isMatched(movieId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error checking match:', error);
        return false;
      }
    },
    [get]
  );

  /**
   * Clear all matches
   */
  const clearMatches = useCallback(async (): Promise<void> => {
    try {
      const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
      await repo.clearMatches();
      setMatches([]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error clearing matches:', error);
      throw error;
    }
  }, [get]);

  /**
   * Get count of matches
   */
  const getMatchCount = useCallback((): number => {
    return matches.length;
  }, [matches]);

  /**
   * Get a match by ID
   */
  const getMatchById = useCallback(
    (movieId: number): Movie | undefined => {
      return matches.find((m) => m.id === movieId);
    },
    [matches]
  );

  return {
    matches,
    loading,
    error,
    addMatch,
    removeMatch,
    isMatched,
    clearMatches,
    getMatchCount,
    getMatchById,
  };
}
