import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/api/services';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';
import type { MatchStatus, MatchQueryParams } from '@/api/types';

/**
 * useMatches hook
 * Manages movie matching/swiping functionality (Tinder-style)
 * - getDiscoverMovies: Get movies for swiping
 * - getMatchlist: Get user's matches by status
 * - getMatchStats: Get match statistics
 * - createMatch: Create like/dislike/superlike
 * - deleteMatch: Remove a match
 */
export const useMatches = () => {
  const queryClient = useQueryClient();

  // Query: Get discover movies (for swiping)
  const {
    data: discoverData,
    isLoading: isLoadingDiscover,
    error: discoverError,
    isError: isDiscoverError,
    refetch: refetchDiscover,
  } = useQuery({
    queryKey: queryKeys.matches.discover(10),
    queryFn: () => matchService.getDiscoverMovies(10),
    staleTime: QUERY_CACHE_TIMES.DISCOVER,
  });

  // Query: Get matchlist with optional filters
  const getMatchlist = (params?: MatchQueryParams) => {
    return useQuery({
      queryKey: queryKeys.matches.list(params?.status),
      queryFn: () => matchService.getMatchlist(params),
      staleTime: QUERY_CACHE_TIMES.MATCHES,
    });
  };

  // Query: Get match statistics
  const {
    data: matchStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: queryKeys.matches.stats(),
    queryFn: () => matchService.getMatchStats(),
    staleTime: QUERY_CACHE_TIMES.MATCH_STATS,
  });

  // Mutation: Create match (like/dislike/superlike)
  const createMatchMutation = useMutation({
    mutationFn: ({ movieId, status }: { movieId: number; status: MatchStatus }) =>
      matchService.createMatch(movieId, status),
    onMutate: async ({ movieId, status }) => {
      // Cancel pending refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.matches.all,
      });

      // Get previous data for rollback
      const previousDiscover = queryClient.getQueryData(queryKeys.matches.discover(10));
      const previousStats = queryClient.getQueryData(queryKeys.matches.stats());

      // Optimistic update: Remove movie from discover list
      queryClient.setQueryData(
        queryKeys.matches.discover(10),
        (old: any[] | undefined) => old?.filter((movie: any) => movie.id !== movieId) || []
      );

      // Optimistic update: Increment stats
      queryClient.setQueryData(
        queryKeys.matches.stats(),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            total: (old.total || 0) + 1,
            [status === 'like' ? 'likes' : status === 'dislike' ? 'dislikes' : 'superlikes']:
              (old[status === 'like' ? 'likes' : status === 'dislike' ? 'dislikes' : 'superlikes'] || 0) + 1,
          };
        }
      );

      return { previousDiscover, previousStats };
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.stats() });
      // Refetch discover if running low on movies
      const currentDiscover = queryClient.getQueryData(queryKeys.matches.discover(10)) as any[] | undefined;
      if (currentDiscover && currentDiscover.length < 3) {
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.discover(10) });
      }
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.previousDiscover) {
        queryClient.setQueryData(
          queryKeys.matches.discover(10),
          context.previousDiscover
        );
      }
      if (context?.previousStats) {
        queryClient.setQueryData(
          queryKeys.matches.stats(),
          context.previousStats
        );
      }
    },
  });

  // Mutation: Delete match
  const deleteMatchMutation = useMutation({
    mutationFn: (matchId: number) => matchService.deleteMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });

  // Helper mutations for convenience
  const likeMutation = useMutation({
    mutationFn: (movieId: number) => matchService.like(movieId),
    onMutate: async (movieId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.discover(10) });
      const previousDiscover = queryClient.getQueryData(queryKeys.matches.discover(10));
      queryClient.setQueryData(
        queryKeys.matches.discover(10),
        (old: any[] | undefined) => old?.filter((movie: any) => movie.id !== movieId) || []
      );
      return { previousDiscover };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.stats() });
    },
    onError: (error, movieId, context: any) => {
      if (context?.previousDiscover) {
        queryClient.setQueryData(queryKeys.matches.discover(10), context.previousDiscover);
      }
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: (movieId: number) => matchService.dislike(movieId),
    onMutate: async (movieId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.discover(10) });
      const previousDiscover = queryClient.getQueryData(queryKeys.matches.discover(10));
      queryClient.setQueryData(
        queryKeys.matches.discover(10),
        (old: any[] | undefined) => old?.filter((movie: any) => movie.id !== movieId) || []
      );
      return { previousDiscover };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.stats() });
    },
    onError: (error, movieId, context: any) => {
      if (context?.previousDiscover) {
        queryClient.setQueryData(queryKeys.matches.discover(10), context.previousDiscover);
      }
    },
  });

  const superlikeMutation = useMutation({
    mutationFn: (movieId: number) => matchService.superlike(movieId),
    onMutate: async (movieId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.discover(10) });
      const previousDiscover = queryClient.getQueryData(queryKeys.matches.discover(10));
      queryClient.setQueryData(
        queryKeys.matches.discover(10),
        (old: any[] | undefined) => old?.filter((movie: any) => movie.id !== movieId) || []
      );
      return { previousDiscover };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.stats() });
    },
    onError: (error, movieId, context: any) => {
      if (context?.previousDiscover) {
        queryClient.setQueryData(queryKeys.matches.discover(10), context.previousDiscover);
      }
    },
  });

  return {
    // Discover data
    discoverMovies: discoverData || [],
    isLoadingDiscover,
    isDiscoverError,
    discoverError,
    refetchDiscover,

    // Match stats
    matchStats,
    isLoadingStats,
    statsError,

    // Queries
    getMatchlist,

    // Create match
    createMatch: (movieId: number, status: MatchStatus) =>
      createMatchMutation.mutate({ movieId, status }),
    isCreatingMatch: createMatchMutation.isPending,
    createMatchError: createMatchMutation.error,

    // Delete match
    deleteMatch: (matchId: number) => deleteMatchMutation.mutate(matchId),
    isDeletingMatch: deleteMatchMutation.isPending,
    deleteMatchError: deleteMatchMutation.error,

    // Helper actions
    like: (movieId: number) => likeMutation.mutate(movieId),
    isLiking: likeMutation.isPending,

    dislike: (movieId: number) => dislikeMutation.mutate(movieId),
    isDisliking: dislikeMutation.isPending,

    superlike: (movieId: number) => superlikeMutation.mutate(movieId),
    isSuperliking: superlikeMutation.isPending,
  };
};

export default useMatches;
