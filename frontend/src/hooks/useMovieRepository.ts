/**
 * useMovieRepository Hook
 * Provides access to movie operations through the repository pattern
 *
 * Uses the DI container to resolve the MovieRepository implementation
 * and provides a type-safe interface for movie operations.
 */

import { useCallback, useState, useEffect } from 'react';
import { useDIContainer } from './useDIContainer';
import { DI_TOKENS, type Movie } from '@core';
import type { IMovieRepository } from '@core';

/**
 * Hook for accessing movie repository operations
 *
 * Provides methods to:
 * - Get all movies
 * - Get a movie by ID
 * - Search movies
 * - Get movies by genre, year, director
 * - Get top-rated movies
 *
 * @returns Object with movie repository methods and loading/error states
 *
 * @example
 * ```typescript
 * const { movies, loading, error, getAll } = useMovieRepository()
 *
 * useEffect(() => {
 *   getAll().then(setMovies)
 * }, [])
 * ```
 */
export function useMovieRepository() {
  const { get } = useDIContainer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get all movies
   */
  const getAll = useCallback(async (): Promise<Movie[]> => {
    setLoading(true);
    setError(null);
    try {
      const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
      const movies = await repo.getAll();
      return movies;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error fetching all movies:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [get]);

  /**
   * Get a movie by ID
   */
  const getById = useCallback(
    async (id: number): Promise<Movie | null> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const movie = await repo.getById(id);
        return movie;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error fetching movie ${id}:`, error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  /**
   * Search movies
   */
  const search = useCallback(
    async (query: string): Promise<Movie[]> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const results = await repo.search(query);
        return results;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error searching movies:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  /**
   * Get movies by genre
   */
  const getByGenre = useCallback(
    async (genre: string): Promise<Movie[]> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const movies = await repo.getByGenre(genre);
        return movies;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error fetching movies by genre ${genre}:`, error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  /**
   * Get movies by year
   */
  const getByYear = useCallback(
    async (year: number): Promise<Movie[]> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const movies = await repo.getByYear(year);
        return movies;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error fetching movies by year ${year}:`, error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  /**
   * Get movies by director
   */
  const getByDirector = useCallback(
    async (director: string): Promise<Movie[]> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const movies = await repo.getByDirector(director);
        return movies;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error fetching movies by director ${director}:`, error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  /**
   * Get top-rated movies
   */
  const getTopRated = useCallback(
    async (limit: number = 10): Promise<Movie[]> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const movies = await repo.getTopRated(limit);
        return movies;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error fetching top-rated movies:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  /**
   * Get movies by rating range
   */
  const getByRatingRange = useCallback(
    async (minRating: number, maxRating: number): Promise<Movie[]> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const movies = await repo.getByRatingRange(minRating, maxRating);
        return movies;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error fetching movies by rating range:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  /**
   * Get movies by year range
   */
  const getByYearRange = useCallback(
    async (minYear: number, maxYear: number): Promise<Movie[]> => {
      setLoading(true);
      setError(null);
      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const movies = await repo.getByYearRange(minYear, maxYear);
        return movies;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error fetching movies by year range:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  return {
    loading,
    error,
    getAll,
    getById,
    search,
    getByGenre,
    getByYear,
    getByDirector,
    getTopRated,
    getByRatingRange,
    getByYearRange,
  };
}
