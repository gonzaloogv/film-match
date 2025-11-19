/**
 * RatingsContext
 *
 * Context for managing user's movie ratings
 * Syncs with UserDataRepository through custom hooks
 *
 * @responsibility Manage ratings and reviews state
 * @architecture_layer Presentation - State Management
 */

import { createContext } from 'react';
import type { UserRating } from '@core';

/**
 * Ratings State Interface
 */
export interface RatingsState {
  ratings: UserRating[];
  loading: boolean;
  error: Error | null;
}

/**
 * Ratings Actions Interface
 */
export interface RatingsActions {
  // Utility functions (computed from ratings data)
  getRatingForMovie: (movieId: number) => UserRating | undefined;
  hasRating: (movieId: number) => boolean;
  getAverageRating: () => number;
  getRatingCount: () => number;

  // React Query mutations
  createOrUpdateRating?: (data: any) => Promise<any>;
  deleteRating?: (movieId: number) => Promise<any>;

  // Deprecated actions (for backward compatibility)
  addRating: (rating: UserRating) => void;
  removeRating: (movieId: number) => void;
  clearRatings: () => void;
  setRatings: (ratings: UserRating[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

/**
 * Combined Context Interface
 */
export interface RatingsContextValue extends RatingsState, RatingsActions {}

/**
 * Initial State
 */
export const initialRatingsState: RatingsState = {
  ratings: [],
  loading: false,
  error: null,
};

/**
 * Ratings Context
 */
export const RatingsContext = createContext<RatingsContextValue | undefined>(undefined);
