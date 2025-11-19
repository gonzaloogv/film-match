/**
 * FiltersProvider
 *
 * Provider component for FiltersContext
 * Persists filters to localStorage
 */

import React, { useReducer, useCallback, useEffect, ReactNode } from 'react';
import {
  FiltersContext,
  initialFiltersState,
  defaultCriteria,
  type FiltersState,
  type SortOption,
  type TrendOption,
  type DecadeOption,
} from './FiltersContext';
import type { MovieFilterCriteria } from '@core';

const STORAGE_KEY = 'film-match:filters';

/**
 * Action Types
 */
type FiltersAction =
  | { type: 'SET_CRITERIA'; payload: MovieFilterCriteria }
  | { type: 'UPDATE_SEARCH'; payload: string }
  | { type: 'UPDATE_GENRES'; payload: string[] }
  | { type: 'TOGGLE_GENRE'; payload: string }
  | { type: 'UPDATE_YEAR_RANGE'; payload: [number, number] }
  | { type: 'UPDATE_MIN_RATING'; payload: number }
  | { type: 'RESET_FILTERS' }
  | { type: 'RESET_FILTER'; payload: keyof MovieFilterCriteria }
  | { type: 'SET_SORT_BY'; payload: SortOption }
  | { type: 'SET_TREND'; payload: TrendOption }
  | { type: 'SET_DECADE'; payload: DecadeOption }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_TOTAL_RESULTS'; payload: number };

/**
 * Check if filters are active
 */
function checkIsActive(criteria: MovieFilterCriteria): boolean {
  const currentYear = new Date().getFullYear();
  return (
    criteria.search.trim() !== '' ||
    criteria.genres.length > 0 ||
    criteria.yearRange[0] !== 1970 ||
    criteria.yearRange[1] !== currentYear ||
    criteria.minRating > 0
  );
}

/**
 * Reducer Function
 */
function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
  let newCriteria: MovieFilterCriteria;

  switch (action.type) {
    case 'SET_CRITERIA':
      return {
        criteria: action.payload,
        isActive: checkIsActive(action.payload),
      };

    case 'UPDATE_SEARCH':
      newCriteria = { ...state.criteria, search: action.payload };
      return {
        criteria: newCriteria,
        isActive: checkIsActive(newCriteria),
      };

    case 'UPDATE_GENRES':
      newCriteria = { ...state.criteria, genres: action.payload };
      return {
        criteria: newCriteria,
        isActive: checkIsActive(newCriteria),
      };

    case 'TOGGLE_GENRE':
      const genres = state.criteria.genres.includes(action.payload)
        ? state.criteria.genres.filter((g) => g !== action.payload)
        : [...state.criteria.genres, action.payload];
      newCriteria = { ...state.criteria, genres };
      return {
        criteria: newCriteria,
        isActive: checkIsActive(newCriteria),
      };

    case 'UPDATE_YEAR_RANGE':
      newCriteria = { ...state.criteria, yearRange: action.payload };
      return {
        criteria: newCriteria,
        isActive: checkIsActive(newCriteria),
      };

    case 'UPDATE_MIN_RATING':
      newCriteria = { ...state.criteria, minRating: action.payload };
      return {
        criteria: newCriteria,
        isActive: checkIsActive(newCriteria),
      };

    case 'RESET_FILTERS':
      return {
        criteria: defaultCriteria,
        isActive: false,
      };

    case 'RESET_FILTER':
      newCriteria = { ...state.criteria };
      switch (action.payload) {
        case 'search':
          newCriteria.search = '';
          break;
        case 'genres':
          newCriteria.genres = [];
          break;
        case 'yearRange':
          newCriteria.yearRange = [1970, new Date().getFullYear()];
          break;
        case 'minRating':
          newCriteria.minRating = 0;
          break;
      }
      return {
        ...state,
        criteria: newCriteria,
        isActive: checkIsActive(newCriteria),
      };

    case 'SET_SORT_BY':
      return {
        ...state,
        sortBy: action.payload,
        pagination: { ...state.pagination, currentPage: 1 },
      };

    case 'SET_TREND':
      return {
        ...state,
        trend: action.payload,
        pagination: { ...state.pagination, currentPage: 1 },
      };

    case 'SET_DECADE':
      return {
        ...state,
        decade: action.payload,
        pagination: { ...state.pagination, currentPage: 1 },
      };

    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, currentPage: action.payload },
      };

    case 'SET_TOTAL_RESULTS':
      return {
        ...state,
        pagination: { ...state.pagination, totalResults: action.payload },
      };

    default:
      return state;
  }
}

/**
 * Load filters from localStorage
 */
function loadFiltersFromStorage(): FiltersState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        criteria: parsed,
        isActive: checkIsActive(parsed),
      };
    }
  } catch (err) {
    console.error('Error loading filters from storage:', err);
  }
  return initialFiltersState;
}

/**
 * Provider Props
 */
interface FiltersProviderProps {
  children: ReactNode;
}

/**
 * FiltersProvider Component
 */
export const FiltersProvider: React.FC<FiltersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(filtersReducer, initialFiltersState, loadFiltersFromStorage);

  // Persist to localStorage when criteria changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.criteria));
    } catch (err) {
      console.error('Error saving filters to storage:', err);
    }
  }, [state.criteria]);

  // Actions
  const setCriteria = useCallback((criteria: MovieFilterCriteria) => {
    dispatch({ type: 'SET_CRITERIA', payload: criteria });
  }, []);

  const updateSearch = useCallback((search: string) => {
    dispatch({ type: 'UPDATE_SEARCH', payload: search });
  }, []);

  const updateGenres = useCallback((genres: string[]) => {
    dispatch({ type: 'UPDATE_GENRES', payload: genres });
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    dispatch({ type: 'TOGGLE_GENRE', payload: genre });
  }, []);

  const updateYearRange = useCallback((min: number, max: number) => {
    dispatch({ type: 'UPDATE_YEAR_RANGE', payload: [min, max] });
  }, []);

  const updateMinRating = useCallback((rating: number) => {
    dispatch({ type: 'UPDATE_MIN_RATING', payload: rating });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const resetFilter = useCallback((filterType: keyof MovieFilterCriteria) => {
    dispatch({ type: 'RESET_FILTER', payload: filterType });
  }, []);

  const setSortBy = useCallback((sort: SortOption) => {
    dispatch({ type: 'SET_SORT_BY', payload: sort });
  }, []);

  const setTrend = useCallback((trend: TrendOption) => {
    dispatch({ type: 'SET_TREND', payload: trend });
  }, []);

  const setDecade = useCallback((decade: DecadeOption) => {
    dispatch({ type: 'SET_DECADE', payload: decade });
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  const setTotalResults = useCallback((total: number) => {
    dispatch({ type: 'SET_TOTAL_RESULTS', payload: total });
  }, []);

  const value = {
    ...state,
    setCriteria,
    updateSearch,
    updateGenres,
    toggleGenre,
    updateYearRange,
    updateMinRating,
    resetFilters,
    resetFilter,
    setSortBy,
    setTrend,
    setDecade,
    setCurrentPage,
    setTotalResults,
  };

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
};
