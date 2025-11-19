/**
 * useMovieSearch Hook
 * Manages movie search functionality with debouncing
 *
 * Provides search capabilities with optional debouncing to prevent
 * excessive API calls while typing
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { useDIContainer } from './useDIContainer';
import { DI_TOKENS, type Movie } from '@core';
import type { IMovieRepository } from '@core';

/**
 * Hook for searching movies with debouncing
 *
 * Provides methods to:
 * - Search movies by query
 * - Clear search results
 * - Get search history
 * - Set custom debounce delay
 *
 * @param initialDebounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Object with search operations and state
 *
 * @example
 * ```typescript
 * const {
 *   results,
 *   searchQuery,
 *   search,
 *   clearSearch,
 *   isSearching
 * } = useMovieSearch(500)
 *
 * const handleChange = (e) => {
 *   search(e.target.value)
 * }
 * ```
 */
export function useMovieSearch(initialDebounceMs: number = 300) {
  const { get } = useDIContainer();
  const [results, setResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const debounceDelayRef = useRef(initialDebounceMs);

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(
    async (query: string): Promise<Movie[]> => {
      if (!query.trim()) {
        setResults([]);
        setSearchQuery('');
        return [];
      }

      setIsSearching(true);
      setError(null);

      try {
        const repo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
        const searchResults = await repo.search(query);
        setResults(searchResults);
        setSearchQuery(query);

        // Add to search history (avoid duplicates)
        setSearchHistory((prev) => {
          const filtered = prev.filter((item) => item !== query);
          return [query, ...filtered].slice(0, 10); // Keep last 10 searches
        });

        return searchResults;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error searching movies:', error);
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [get]
  );

  /**
   * Search with debouncing
   */
  const search = useCallback(
    (query: string): void => {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, debounceDelayRef.current);
    },
    [performSearch]
  );

  /**
   * Immediate search without debounce
   */
  const searchImmediate = useCallback(
    async (query: string): Promise<Movie[]> => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      return performSearch(query);
    },
    [performSearch]
  );

  /**
   * Clear search results
   */
  const clearSearch = useCallback((): void => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setResults([]);
    setSearchQuery('');
    setError(null);
  }, []);

  /**
   * Set debounce delay
   */
  const setDebounceDelay = useCallback((delay: number): void => {
    debounceDelayRef.current = Math.max(0, delay);
  }, []);

  /**
   * Clear search history
   */
  const clearSearchHistory = useCallback((): void => {
    setSearchHistory([]);
  }, []);

  /**
   * Remove a specific item from search history
   */
  const removeFromHistory = useCallback((query: string): void => {
    setSearchHistory((prev) => prev.filter((item) => item !== query));
  }, []);

  /**
   * Get search results count
   */
  const getResultCount = useCallback((): number => {
    return results.length;
  }, [results]);

  /**
   * Check if a result exists
   */
  const hasResults = useCallback((): boolean => {
    return results.length > 0;
  }, [results]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    results,
    searchQuery,
    isSearching,
    error,
    searchHistory,
    search,
    searchImmediate,
    clearSearch,
    setDebounceDelay,
    clearSearchHistory,
    removeFromHistory,
    getResultCount,
    hasResults,
  };
}
