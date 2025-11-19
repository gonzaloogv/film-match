/**
 * MatchesContext
 *
 * Context for managing user's matched movies
 * Syncs with UserDataRepository through custom hooks
 *
 * @responsibility Manage matched movies state
 * @architecture_layer Presentation - State Management
 */

import { createContext } from 'react';
import type { Movie } from '@core';

/**
 * Matches State Interface
 */
export interface MatchesState {
  matches: Movie[];
  loading: boolean;
  error: Error | null;
}

/**
 * Matches Actions Interface
 */
export interface MatchesActions {
  addMatch: (movie: Movie) => void;
  removeMatch: (movieId: number) => void;
  clearMatches: () => void;
  isMatched: (movieId: number) => boolean;
  getMatchCount: () => number;
  setMatches: (matches: Movie[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

/**
 * Combined Context Interface
 */
export interface MatchesContextValue extends MatchesState, MatchesActions {}

/**
 * Initial State
 */
export const initialMatchesState: MatchesState = {
  matches: [],
  loading: false,
  error: null,
};

/**
 * Matches Context
 */
export const MatchesContext = createContext<MatchesContextValue | undefined>(undefined);
