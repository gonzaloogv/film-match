/**
 * RatingsProvider
 *
 * Provider component for RatingsContext
 * Now uses React Query with useRatings hook
 * Provides derived data and utility functions for backward compatibility
 */

import React, { useCallback, ReactNode, useMemo } from 'react';
import { useRatings } from '@/hooks/api';
import { RatingsContext, type RatingsState } from './RatingsContext';
import type { UserRating } from '@core';

/**
 * Provider Props
 */
interface RatingsProviderProps {
  children: ReactNode;
}

/**
 * RatingsProvider Component
 * Delegates server state to React Query (useRatings hook)
 * Derives utility functions from ratings data
 */
export const RatingsProvider: React.FC<RatingsProviderProps> = ({ children }) => {
  // Get server state from React Query
  // Disable by default - will be enabled on Home page via refetch
  const {
    ratingsData,
    isLoadingRatings,
    ratingsError,
    ratingStats,
    createOrUpdateRating,
    deleteRating,
  } = useRatings(false);

  // Convert RatingDTO to UserRating for backward compatibility
  const ratings: UserRating[] = useMemo(() => {
    return (ratingsData || []).map((rating: any) => {
      const userRating = {
        id: rating.id,
        movieId: rating.movieId,
        userId: rating.userId,
        rating: rating.rating,
        review: rating.review,
        createdAt: new Date(rating.createdAt),
        // Add utility methods if needed
        hasComment: !!rating.review,
        getComment: () => rating.review,
        // Add other UserRating methods as needed
      } as unknown as UserRating;
      return userRating;
    });
  }, [ratingsData]);

  // Utility functions
  const getRatingForMovie = useCallback(
    (movieId: number): UserRating | undefined => {
      return ratings.find(r => r.movieId === movieId);
    },
    [ratings]
  );

  const hasRating = useCallback(
    (movieId: number): boolean => {
      return ratings.some(r => r.movieId === movieId);
    },
    [ratings]
  );

  const getAverageRating = useCallback((): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }, [ratings]);

  const getRatingCount = useCallback((): number => {
    return ratings.length;
  }, [ratings]);

  // Deprecated actions for backward compatibility
  const setRatings = useCallback((_ratings: UserRating[]) => {
    console.warn('setRatings from context is deprecated, use useRatings hook instead');
  }, []);

  const addRating = useCallback((rating: UserRating) => {
    console.warn('addRating from context is deprecated, use useRatings hook instead');
    // Could call createOrUpdateRating if needed
  }, [createOrUpdateRating]);

  const removeRating = useCallback((movieId: number) => {
    console.warn('removeRating from context is deprecated, use useRatings hook instead');
  }, []);

  const clearRatings = useCallback(() => {
    console.warn('clearRatings from context is deprecated, use useRatings hook instead');
  }, []);

  const setLoading = useCallback((_loading: boolean) => {
    console.warn('setLoading from context is deprecated, use useRatings hook instead');
  }, []);

  const setError = useCallback((_error: Error | null) => {
    console.warn('setError from context is deprecated, use useRatings hook instead');
  }, []);

  // Combine React Query server state with derived data
  const value = {
    ratings,
    loading: isLoadingRatings,
    error: ratingsError as Error | null,

    // Utility functions
    getRatingForMovie,
    hasRating,
    getAverageRating,
    getRatingCount,

    // Deprecated actions (for backward compatibility)
    setRatings,
    addRating,
    removeRating,
    clearRatings,
    setLoading,
    setError,

    // React Query actions
    createOrUpdateRating,
    deleteRating,
  } as any;

  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
};
