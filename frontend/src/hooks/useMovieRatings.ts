/**
 * useMovieRatings Hook
 * Manages user's movie ratings and reviews
 *
 * Provides state management and operations for ratings and comments
 * Integrates with both localStorage (UserDataRepository) and backend API
 * Automatically syncs with backend and invalidates React Query cache
 */

import { useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDIContainer } from './useDIContainer';
import { DI_TOKENS, type UserRating } from '@core';
import type { IUserDataRepository } from '@core';
import { ratingService } from '@/api/services/rating.service';
import { queryKeys } from '@/lib/cache/query-cache';
import type { CreateRatingDTO } from '@/api/types/rating.types';

/**
 * Hook for managing movie ratings
 *
 * Provides methods to:
 * - Get all ratings
 * - Add/update a rating
 * - Remove a rating
 * - Get rating for a specific movie
 * - Check if a movie has been rated
 * - Get average rating across all movies
 * - Get count of ratings
 *
 * @returns Object with rating operations and state
 *
 * @example
 * ```typescript
 * const {
 *   ratings,
 *   addRating,
 *   getRatingForMovie,
 *   getAverageRating
 * } = useMovieRatings()
 *
 * const handleRate = async (movieId, rating, comment) => {
 *   await addRating({ movieId, rating, comment })
 * }
 * ```
 */
export function useMovieRatings() {
  const { get } = useDIContainer();
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load ratings from repository on mount
   */
  useEffect(() => {
    const loadRatings = async () => {
      setLoading(true);
      try {
        const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
        const loadedRatings = await repo.getRatings();
        setRatings(loadedRatings);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error loading ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRatings();
  }, [get]);

  /**
   * Add or update a rating
   * Saves to both localStorage and backend API, then invalidates cache
   */
  const addRating = useCallback(
    async (rating: UserRating): Promise<void> => {
      try {
        // 1. Save to localStorage first (for immediate feedback)
        const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
        await repo.addRating(rating);

        // 2. Send to backend API
        // Backend expects rating 1-10, but UserRating uses 1-5, so multiply by 2
        const createRatingDto: CreateRatingDTO = {
          movieId: rating.movieId,
          rating: rating.rating * 2, // Convert 1-5 to 1-10
          review: rating.comment || undefined,
        };

        await ratingService.createOrUpdateRating(createRatingDto);

        // 3. Invalidate React Query cache to refresh user reviews
        await queryClient.invalidateQueries({ queryKey: queryKeys.user.reviews() });
        await queryClient.invalidateQueries({ queryKey: queryKeys.ratings.all });

        // 4. Update local state
        setRatings((prev) => {
          const existingIndex = prev.findIndex((r) => r.movieId === rating.movieId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = rating;
            return updated;
          }
          return [...prev, rating];
        });

        console.log(`✅ Rating saved to backend and cache invalidated for movie ${rating.movieId}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error adding rating:', error);
        throw error;
      }
    },
    [get, queryClient]
  );

  /**
   * Remove a rating
   */
  const removeRating = useCallback(
    async (movieId: number): Promise<void> => {
      try {
        const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
        await repo.removeRating(movieId);
        setRatings((prev) => prev.filter((r) => r.movieId !== movieId));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error removing rating:', error);
        throw error;
      }
    },
    [get]
  );

  /**
   * Get rating for a specific movie
   */
  const getRatingForMovie = useCallback(
    (movieId: number): UserRating | undefined => {
      return ratings.find((r) => r.movieId === movieId);
    },
    [ratings]
  );

  /**
   * Check if a movie has been rated
   */
  const hasRating = useCallback(
    (movieId: number): boolean => {
      return ratings.some((r) => r.movieId === movieId);
    },
    [ratings]
  );

  /**
   * Get average rating across all movies
   */
  const getAverageRating = useCallback((): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }, [ratings]);

  /**
   * Get count of ratings
   */
  const getRatingCount = useCallback((): number => {
    return ratings.length;
  }, [ratings]);

  /**
   * Get rating distribution (how many movies have each rating)
   */
  const getRatingDistribution = useCallback(
    (): Record<number, number> => {
      const distribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      ratings.forEach((r) => {
        if (r.rating >= 1 && r.rating <= 5) {
          distribution[r.rating]++;
        }
      });

      return distribution;
    },
    [ratings]
  );

  /**
   * Get movies rated above a certain threshold
   */
  const getMoviesRatedAbove = useCallback(
    (threshold: number): UserRating[] => {
      return ratings.filter((r) => r.rating > threshold);
    },
    [ratings]
  );

  /**
   * Clear all ratings
   */
  const clearRatings = useCallback(async (): Promise<void> => {
    try {
      const repo = get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
      // Remove all ratings one by one (if no bulk clear method exists)
      for (const rating of ratings) {
        await repo.removeRating(rating.movieId);
      }
      setRatings([]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error clearing ratings:', error);
      throw error;
    }
  }, [get, ratings]);

  return {
    ratings,
    loading,
    error,
    addRating,
    removeRating,
    getRatingForMovie,
    hasRating,
    getAverageRating,
    getRatingCount,
    getRatingDistribution,
    getMoviesRatedAbove,
    clearRatings,
  };
}
