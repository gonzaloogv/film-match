/**
 * useFilterMovies Hook
 * Manages movie filtering with multiple criteria
 *
 * Provides filtering capabilities for movies by various criteria
 * including search, genres, year range, and minimum rating
 */

import { useCallback, useState, useEffect } from 'react';
import { useDIContainer } from './useDIContainer';
import { DI_TOKENS, type Movie, MovieFilter, type MovieFilterCriteria } from '@core';
import type { FilterMoviesUseCase } from '@core';

/**
 * Hook for filtering movies
 *
 * Provides methods to:
 * - Filter movies by multiple criteria
 * - Add/remove genre filters
 * - Set year range
 * - Set minimum rating
 * - Search within results
 * - Sort results
 * - Get statistics about filtered results
 *
 * @param initialMovies - Initial array of movies to filter
 * @returns Object with filter operations and filtered results
 *
 * @example
 * ```typescript
 * const {
 *   filteredMovies,
 *   criteria,
 *   toggleGenre,
 *   setYearRange,
 *   filterBySearch
 * } = useFilterMovies(allMovies)
 *
 * const handleGenreToggle = (genre) => {
 *   toggleGenre(genre)
 * }
 * ```
 */
export function useFilterMovies(initialMovies: Movie[]) {
  const { get } = useDIContainer();
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(initialMovies);
  const [criteria, setCriteria] = useState<MovieFilterCriteria>({
    search: '',
    genres: [],
    yearRange: [1970, new Date().getFullYear()],
    minRating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Apply filters when criteria or movies change
   */
  useEffect(() => {
    const applyFiltersSync = () => {
      setLoading(true);
      try {
        const useCase = get<FilterMoviesUseCase>(DI_TOKENS.FILTER_MOVIES_USE_CASE);

        // Create filter entity
        const filter = MovieFilter.create(criteria);

        // Execute filtering
        const results = useCase.execute(initialMovies, filter);
        setFilteredMovies(results);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error applying filters:', error);
      } finally {
        setLoading(false);
      }
    };

    applyFiltersSync();
  }, [criteria, initialMovies, get]);

  /**
   * Apply current filters to movies (memoized for external use)
   */
  const applyFilters = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const useCase = get<FilterMoviesUseCase>(DI_TOKENS.FILTER_MOVIES_USE_CASE);

      // Create filter entity
      const filter = MovieFilter.create(criteria);

      // Execute filtering
      const results = useCase.execute(initialMovies, filter);
      setFilteredMovies(results);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  }, [criteria, initialMovies, get]);

  /**
   * Toggle a genre in the filter
   */
  const toggleGenre = useCallback((genre: string): void => {
    setCriteria((prev) => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  }, []);

  /**
   * Set multiple genres
   */
  const setGenres = useCallback((genres: string[]): void => {
    setCriteria((prev) => ({ ...prev, genres }));
  }, []);

  /**
   * Set year range
   */
  const setYearRange = useCallback((min: number, max: number): void => {
    setCriteria((prev) => ({ ...prev, yearRange: [min, max] }));
  }, []);

  /**
   * Set minimum rating
   */
  const setMinRating = useCallback((rating: number): void => {
    setCriteria((prev) => ({ ...prev, minRating: rating }));
  }, []);

  /**
   * Set search query
   */
  const filterBySearch = useCallback((search: string): void => {
    setCriteria((prev) => ({ ...prev, search }));
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback((): void => {
    setCriteria({
      search: '',
      genres: [],
      yearRange: [1970, new Date().getFullYear()],
      minRating: 0,
    });
  }, []);

  /**
   * Sort filtered results
   */
  const sortResults = useCallback(
    (
      sortBy: 'title' | 'year' | 'rating' | 'duration' = 'title',
      ascending: boolean = true
    ): Movie[] => {
      const sorted = [...filteredMovies].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'year':
            comparison = a.year - b.year;
            break;
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'duration':
            const durationA = parseInt(a.duration);
            const durationB = parseInt(b.duration);
            comparison = durationA - durationB;
            break;
        }

        return ascending ? comparison : -comparison;
      });

      return sorted;
    },
    [filteredMovies]
  );

  /**
   * Get statistics about filtered results
   */
  const getStatistics = useCallback(
    (): {
      total: number;
      averageRating: number;
      averageYear: number;
      genreDistribution: Record<string, number>;
    } => {
      if (filteredMovies.length === 0) {
        return {
          total: 0,
          averageRating: 0,
          averageYear: 0,
          genreDistribution: {},
        };
      }

      const genreDistribution: Record<string, number> = {};
      let totalRating = 0;
      let totalYear = 0;

      filteredMovies.forEach((movie) => {
        totalRating += movie.rating;
        totalYear += movie.year;

        movie.genres.forEach((genre) => {
          genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
        });
      });

      return {
        total: filteredMovies.length,
        averageRating: Math.round((totalRating / filteredMovies.length) * 10) / 10,
        averageYear: Math.round(totalYear / filteredMovies.length),
        genreDistribution,
      };
    },
    [filteredMovies]
  );

  /**
   * Get available genres from filtered results
   */
  const getAvailableGenres = useCallback((): string[] => {
    const genreSet = new Set<string>();
    filteredMovies.forEach((movie) => {
      movie.genres.forEach((genre) => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  }, [filteredMovies]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useCallback((): boolean => {
    return (
      criteria.search !== '' ||
      criteria.genres.length > 0 ||
      criteria.yearRange[0] !== 1970 ||
      criteria.yearRange[1] !== new Date().getFullYear() ||
      criteria.minRating > 0
    );
  }, [criteria]);

  return {
    filteredMovies,
    criteria,
    loading,
    error,
    toggleGenre,
    setGenres,
    setYearRange,
    setMinRating,
    filterBySearch,
    resetFilters,
    sortResults,
    getStatistics,
    getAvailableGenres,
    hasActiveFilters,
  };
}
