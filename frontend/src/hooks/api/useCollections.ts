import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService } from '@/api/services';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';
import type { AddToCollectionDTO, CollectionType } from '@/api/types';

/**
 * useCollections hook
 * Manages user collections (watchlist, favorites, watched)
 * - getUserCollections: Get all collection entries
 * - getCollectionByType: Get movies in specific collection
 * - checkMovieInCollections: Check if movie is in any collection
 * - addToCollection: Add movie to collection
 * - removeFromCollection: Remove from collection
 */
export const useCollections = () => {
  const queryClient = useQueryClient();

  // Query: Get all collections
  const {
    data: collectionsData,
    isLoading: isLoadingCollections,
    error: collectionsError,
    isError: isCollectionsError,
  } = useQuery({
    queryKey: queryKeys.collections.list(),
    queryFn: () => collectionService.getUserCollections(),
    staleTime: QUERY_CACHE_TIMES.COLLECTIONS,
  });

  // Query: Get collection by type
  const getCollectionByType = (type: CollectionType) => {
    return useQuery({
      queryKey: queryKeys.collections.byType(type),
      queryFn: () => collectionService.getCollectionByType(type),
      staleTime: QUERY_CACHE_TIMES.COLLECTIONS,
      enabled: !!type,
    });
  };

  // Query: Check movie status in all collections
  const checkMovieInCollections = (movieId: number) => {
    return useQuery({
      queryKey: queryKeys.collections.movieStatus(movieId),
      queryFn: () => collectionService.checkMovieInCollections(movieId),
      staleTime: QUERY_CACHE_TIMES.COLLECTIONS,
      enabled: !!movieId,
    });
  };

  // Mutation: Add to collection
  const addToCollectionMutation = useMutation({
    mutationFn: (data: AddToCollectionDTO) => collectionService.addToCollection(data),
    onMutate: async (newCollection: AddToCollectionDTO) => {
      // Cancel pending refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.collections.all,
      });

      // Get previous data for rollback
      const previousCollections = queryClient.getQueryData(queryKeys.collections.list());
      const previousStatus = queryClient.getQueryData(
        queryKeys.collections.movieStatus(newCollection.movieId)
      );

      // Optimistic update for movie status
      queryClient.setQueryData(
        queryKeys.collections.movieStatus(newCollection.movieId),
        (old: any) => ({
          ...old,
          [newCollection.type]: true,
        })
      );

      return { previousCollections, previousStatus };
    },
    onSuccess: (data, variables) => {
      // Invalidate all collection queries
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      // Also invalidate the movie status query
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.movieStatus(variables.movieId),
      });
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.previousCollections) {
        queryClient.setQueryData(
          queryKeys.collections.list(),
          context.previousCollections
        );
      }
      if (context?.previousStatus) {
        queryClient.setQueryData(
          queryKeys.collections.movieStatus(variables.movieId),
          context.previousStatus
        );
      }
    },
  });

  // Mutation: Remove from collection
  const removeFromCollectionMutation = useMutation({
    mutationFn: (collectionId: number) => collectionService.removeFromCollection(collectionId),
    onMutate: async (collectionId: number) => {
      // Cancel pending refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.collections.all,
      });

      // Get previous data for rollback
      const previousCollections = queryClient.getQueryData(queryKeys.collections.list());

      return { previousCollections };
    },
    onSuccess: () => {
      // Invalidate all collection queries
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
    },
    onError: (error, collectionId, context: any) => {
      // Rollback on error
      if (context?.previousCollections) {
        queryClient.setQueryData(
          queryKeys.collections.list(),
          context.previousCollections
        );
      }
    },
  });

  // Helper mutations
  const addToWatchlistMutation = useMutation({
    mutationFn: (movieId: number) => collectionService.addToWatchlist(movieId),
    onSuccess: (data, movieId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.movieStatus(movieId),
      });
    },
  });

  const addToFavoritesMutation = useMutation({
    mutationFn: (movieId: number) => collectionService.addToFavorites(movieId),
    onSuccess: (data, movieId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.movieStatus(movieId),
      });
    },
  });

  const markAsWatchedMutation = useMutation({
    mutationFn: (movieId: number) => collectionService.markAsWatched(movieId),
    onSuccess: (data, movieId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.movieStatus(movieId),
      });
    },
  });

  return {
    // Collections data
    collectionsData,
    collections: collectionsData || [],
    isLoadingCollections,
    isCollectionsError,
    collectionsError,

    // Queries
    getCollectionByType,
    checkMovieInCollections,

    // Add to collection
    addToCollection: (data: AddToCollectionDTO) =>
      addToCollectionMutation.mutate(data),
    isAddingToCollection: addToCollectionMutation.isPending,
    addToCollectionError: addToCollectionMutation.error,

    // Remove from collection
    removeFromCollection: (collectionId: number) =>
      removeFromCollectionMutation.mutate(collectionId),
    isRemovingFromCollection: removeFromCollectionMutation.isPending,
    removeFromCollectionError: removeFromCollectionMutation.error,

    // Helpers
    addToWatchlist: (movieId: number) =>
      addToWatchlistMutation.mutate(movieId),
    isAddingToWatchlist: addToWatchlistMutation.isPending,

    addToFavorites: (movieId: number) =>
      addToFavoritesMutation.mutate(movieId),
    isAddingToFavorites: addToFavoritesMutation.isPending,

    markAsWatched: (movieId: number) =>
      markAsWatchedMutation.mutate(movieId),
    isMarkingAsWatched: markAsWatchedMutation.isPending,
  };
};

export default useCollections;
