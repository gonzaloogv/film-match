/**
 * MatchesProvider
 *
 * Provider component for MatchesContext
 * State only - business logic in custom hooks
 */

import React, { useReducer, useCallback, ReactNode } from 'react';
import { MatchesContext, initialMatchesState, type MatchesState } from './MatchesContext';
import type { Movie } from '@core';

/**
 * Action Types
 */
type MatchesAction =
  | { type: 'SET_MATCHES'; payload: Movie[] }
  | { type: 'ADD_MATCH'; payload: Movie }
  | { type: 'REMOVE_MATCH'; payload: number }
  | { type: 'CLEAR_MATCHES' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };

/**
 * Reducer Function
 */
function matchesReducer(state: MatchesState, action: MatchesAction): MatchesState {
  switch (action.type) {
    case 'SET_MATCHES':
      return {
        ...state,
        matches: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_MATCH':
      // Prevent duplicates
      if (state.matches.some(m => m.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        matches: [...state.matches, action.payload],
      };

    case 'REMOVE_MATCH':
      return {
        ...state,
        matches: state.matches.filter(m => m.id !== action.payload),
      };

    case 'CLEAR_MATCHES':
      return {
        ...state,
        matches: [],
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
}

/**
 * Provider Props
 */
interface MatchesProviderProps {
  children: ReactNode;
}

/**
 * MatchesProvider Component
 */
export const MatchesProvider: React.FC<MatchesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(matchesReducer, initialMatchesState);

  // Actions
  const setMatches = useCallback((matches: Movie[]) => {
    dispatch({ type: 'SET_MATCHES', payload: matches });
  }, []);

  const addMatch = useCallback((movie: Movie) => {
    dispatch({ type: 'ADD_MATCH', payload: movie });
  }, []);

  const removeMatch = useCallback((movieId: number) => {
    dispatch({ type: 'REMOVE_MATCH', payload: movieId });
  }, []);

  const clearMatches = useCallback(() => {
    dispatch({ type: 'CLEAR_MATCHES' });
  }, []);

  const isMatched = useCallback((movieId: number): boolean => {
    return state.matches.some(m => m.id === movieId);
  }, [state.matches]);

  const getMatchCount = useCallback((): number => {
    return state.matches.length;
  }, [state.matches]);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: Error | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const value = {
    ...state,
    addMatch,
    removeMatch,
    clearMatches,
    isMatched,
    getMatchCount,
    setMatches,
    setLoading,
    setError,
  };

  return (
    <MatchesContext.Provider value={value}>
      {children}
    </MatchesContext.Provider>
  );
};
