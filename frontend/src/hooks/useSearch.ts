/**
 * useSearch Hook
 *
 * DEPRECATED: This hook used mock data from movies.json
 * TODO: Refactor Search.tsx to use API-based hooks (useMovies, useMovieSearch)
 * For now, returns empty results to prevent build errors
 *
 * @returns Object with filteredMovies, totalResults, and related state
 */

import { useFiltersContext } from '../context/filters/useFiltersContext';
import type { Movie } from '@core';

interface UseSearchResult {
  filteredMovies: Movie[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
}

export function useSearch(): UseSearchResult {
  const context = useFiltersContext();

  if (!context) {
    throw new Error('useSearch must be used within FiltersProvider');
  }

  const { pagination } = context;

  // Provide default values if pagination is undefined
  const currentPagination = pagination || {
    currentPage: 1,
    itemsPerPage: 10,
    totalResults: 0,
  };

  // DEPRECATED: Returning empty results
  // TODO: Use API-based search hooks instead
  return {
    filteredMovies: [],
    totalResults: 0,
    totalPages: 0,
    currentPage: currentPagination.currentPage,
  };
}
