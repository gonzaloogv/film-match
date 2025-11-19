/**
 * FiltersContext
 *
 * Context for managing active movie filters
 * Persists filter state across navigation
 *
 * @responsibility Manage and persist filter criteria
 * @architecture_layer Presentation - State Management
 */

import { createContext } from 'react';
import type { MovieFilterCriteria } from '@core';

/**
 * Pagination State Interface
 */
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalResults: number;
}

/**
 * Sort Options
 */
export type SortOption = 'title' | 'rating' | 'date';

/**
 * Trend Filter Options
 */
export type TrendOption = 'all' | 'trending' | 'recent' | 'oldest';

/**
 * Decade Filter Options
 */
export type DecadeOption = 'all' | '70s' | '80s' | '90s' | '00s' | '10s' | '20s';

/**
 * Filters State Interface
 */
export interface FiltersState {
  criteria: MovieFilterCriteria;
  isActive: boolean;
  pagination: PaginationState;
  sortBy: SortOption;
  trend: TrendOption;
  decade: DecadeOption;
}

/**
 * Filters Actions Interface
 */
export interface FiltersActions {
  setCriteria: (criteria: MovieFilterCriteria) => void;
  updateSearch: (search: string) => void;
  updateGenres: (genres: string[]) => void;
  toggleGenre: (genre: string) => void;
  updateYearRange: (min: number, max: number) => void;
  updateMinRating: (rating: number) => void;
  resetFilters: () => void;
  resetFilter: (filterType: keyof MovieFilterCriteria) => void;
  setSortBy: (sort: SortOption) => void;
  setTrend: (trend: TrendOption) => void;
  setDecade: (decade: DecadeOption) => void;
  setCurrentPage: (page: number) => void;
  setTotalResults: (total: number) => void;
}

/**
 * Combined Context Interface
 */
export interface FiltersContextValue extends FiltersState, FiltersActions {}

/**
 * Default Criteria
 */
export const defaultCriteria: MovieFilterCriteria = {
  search: '',
  genres: [],
  yearRange: [1970, new Date().getFullYear()],
  minRating: 0,
};

/**
 * Initial State
 */
export const initialFiltersState: FiltersState = {
  criteria: defaultCriteria,
  isActive: false,
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalResults: 0,
  },
  sortBy: 'title',
  trend: 'all',
  decade: 'all',
};

/**
 * Filters Context
 */
export const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);
