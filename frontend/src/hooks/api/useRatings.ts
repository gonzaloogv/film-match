import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingService } from '@/api/services';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';
import type { CreateRatingDTO } from '@/api/types';

/**
 * useRatings hook
 * Manages movie ratings for the authenticated user
 * - getUserRatings: List all user ratings
 * - getRatingForMovie: Get rating for specific movie
 * - getRatingStats: Get overall rating statistics
 * - createOrUpdateRating: Add/update a rating
 * - deleteRating: Remove a rating
 */
export const useRatings = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  // Query: Get all user ratings
  const {
    data: ratingsData,
    isLoading: isLoadingRatings,
    error: ratingsError,
    isError: isRatingsError,
  } = useQuery({
    queryKey: queryKeys.ratings.list(),
    queryFn: () => ratingService.getUserRatings(),
    staleTime: QUERY_CACHE_TIMES.RATINGS,
    enabled: enabled, // Allow disabling queries
  });

  // Query: Get rating for specific movie
  const getRatingForMovie = (movieId: number) => {
    return useQuery({
      queryKey: queryKeys.ratings.detail(movieId),
      queryFn: () => ratingService.getRatingForMovie(movieId),
      staleTime: QUERY_CACHE_TIMES.RATINGS,
      enabled: !!movieId,
    });
  };

  // Query: Get rating statistics
  const {
    data: ratingStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: queryKeys.ratings.stats(),
    queryFn: () => ratingService.getRatingStats(),
    staleTime: QUERY_CACHE_TIMES.RATING_STATS,
    enabled: enabled, // Allow disabling queries
  });

  // Mutation: Create or update rating
  const createOrUpdateRatingMutation = useMutation({
    mutationFn: (data: CreateRatingDTO) => ratingService.createOrUpdateRating(data),
    onMutate: async (newRating: CreateRatingDTO) => {
      // Optimistic update: cancel any pending refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.ratings.all,
      });

      // Get previous data for rollback
      const previousRatings = queryClient.getQueryData(queryKeys.ratings.list());
      const previousStats = queryClient.getQueryData(queryKeys.ratings.stats());

      // Optimistically update the list
      queryClient.setQueryData(queryKeys.ratings.detail(newRating.movieId), {
        movieId: newRating.movieId,
        rating: newRating.rating,
        review: newRating.review,
      });

      return { previousRatings, previousStats };
    },
    onSuccess: (data) => {
      // Invalidate and refetch after successful mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.stats() });
    },
    onError: (error, newRating, context: any) => {
      // Rollback on error
      if (context?.previousRatings) {
        queryClient.setQueryData(queryKeys.ratings.list(), context.previousRatings);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(queryKeys.ratings.stats(), context.previousStats);
      }
    },
  });

  // Mutation: Delete rating
  const deleteRatingMutation = useMutation({
    mutationFn: (ratingId: number) => ratingService.deleteRating(ratingId),
    onSuccess: () => {
      // Invalidate ratings data
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.stats() });
    },
  });

  return {
    // Ratings list
    ratingsData,
    ratings: ratingsData || [],
    isLoadingRatings,
    isRatingsError,
    ratingsError,

    // Rating for specific movie (function that returns hook)
    getRatingForMovie,

    // Stats
    ratingStats,
    isLoadingStats,
    statsError,

    // Create/Update mutation
    createOrUpdateRating: (data: CreateRatingDTO) =>
      createOrUpdateRatingMutation.mutate(data),
    isCreatingRating: createOrUpdateRatingMutation.isPending,
    createRatingError: createOrUpdateRatingMutation.error,

    // Delete mutation
    deleteRating: (ratingId: number) =>
      deleteRatingMutation.mutate(ratingId),
    isDeletingRating: deleteRatingMutation.isPending,
    deleteRatingError: deleteRatingMutation.error,
  };
};

export default useRatings;
