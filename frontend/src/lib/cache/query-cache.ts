import { QueryClient } from '@tanstack/react-query';
import { isAuthError, isNetworkError, shouldRetry } from '@/lib/utils/error-handler';
import { TokenManager } from '@/lib/auth/token-manager';

/**
 * Default cache times (in milliseconds)
 * Adjust based on data freshness requirements
 */
export const QUERY_CACHE_TIMES = {
  // Frequently changing data
  RATINGS: 1 * 60 * 1000, // 1 minute
  COLLECTIONS: 1 * 60 * 1000, // 1 minute
  CHAT_HISTORY: 2 * 60 * 1000, // 2 minutes
  MATCHES: 1 * 60 * 1000, // 1 minute

  // Moderately changing data
  CURRENT_USER: 5 * 60 * 1000, // 5 minutes
  USER_REVIEWS: 5 * 60 * 1000, // 5 minutes
  MOVIES: 5 * 60 * 1000, // 5 minutes
  MOVIE_SEARCH: 5 * 60 * 1000, // 5 minutes
  SEARCH_RESULTS: 5 * 60 * 1000, // 5 minutes
  DISCOVER: 5 * 60 * 1000, // 5 minutes

  // Rarely changing data
  MOVIE_DETAILS: 10 * 60 * 1000, // 10 minutes
  RECOMMENDATIONS: 10 * 60 * 1000, // 10 minutes
  RATING_STATS: 10 * 60 * 1000, // 10 minutes
  MATCH_STATS: 10 * 60 * 1000, // 10 minutes

  // Very stable data
  CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Create and configure the React Query client
 * Handles caching, retry logic, and error handling
 */
export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time before background refetch
        staleTime: QUERY_CACHE_TIMES.CURRENT_USER,

        // Time data is kept in cache (cleared on unmount)
        gcTime: 10 * 60 * 1000, // 10 minutes

        // Retry strategy
        retry: (failureCount, error: any) => {
          // Don't retry on authentication or client errors
          if (isAuthError(error) || error?.status === 404 || error?.status === 422) {
            return false;
          }

          // Retry on network errors up to 2 times
          if (isNetworkError(error) && failureCount < 2) {
            return true;
          }

          // Retry on server errors (5xx) up to 2 times
          if (error?.status >= 500 && failureCount < 2) {
            return true;
          }

          return false;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => {
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },

        // Automatically refetch in background when window regains focus
        refetchOnWindowFocus: true,

        // Refetch when network connection is restored
        refetchOnReconnect: true,

        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
      },

      mutations: {
        // Retry mutations up to 2 times, but not on auth errors
        retry: (failureCount, error: any) => {
          if (isAuthError(error)) {
            return false;
          }
          return failureCount < 2;
        },

        retryDelay: (attemptIndex) => {
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
      },
    },
  });

  return queryClient;
};

/**
 * Query key factory for type-safe and organized query keys
 * Prevents key collisions and makes invalidation easier
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'current-user'] as const,
    authUrl: () => [...queryKeys.auth.all, 'auth-url'] as const,
    chatStatus: () => [...queryKeys.auth.all, 'chat-status'] as const,
  },

  user: {
    all: ['user'] as const,
    reviews: (limit?: number) => [...queryKeys.user.all, 'reviews', limit || 10] as const,
  },

  movies: {
    all: ['movies'] as const,
    lists: () => [...queryKeys.movies.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.movies.lists(), filters] as const,
    details: () => [...queryKeys.movies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.movies.details(), id] as const,
    byTmdbId: (tmdbId: number) => [...queryKeys.movies.details(), { tmdbId }] as const,
    search: (query: string) => [...queryKeys.movies.all, 'search', query] as const,
    byCategory: (slug: string) => [...queryKeys.movies.all, 'category', slug] as const,
    similar: (movieId: number) => [...queryKeys.movies.all, 'similar', movieId] as const,
  },

  ratings: {
    all: ['ratings'] as const,
    lists: () => [...queryKeys.ratings.all, 'list'] as const,
    list: () => [...queryKeys.ratings.lists()] as const,
    details: () => [...queryKeys.ratings.all, 'detail'] as const,
    detail: (movieId: number) => [...queryKeys.ratings.details(), movieId] as const,
    stats: () => [...queryKeys.ratings.all, 'stats'] as const,
  },

  collections: {
    all: ['collections'] as const,
    lists: () => [...queryKeys.collections.all, 'list'] as const,
    list: () => [...queryKeys.collections.lists()] as const,
    byType: (type: string) => [...queryKeys.collections.lists(), type] as const,
    status: () => [...queryKeys.collections.all, 'status'] as const,
    movieStatus: (movieId: number) => [...queryKeys.collections.status(), movieId] as const,
  },

  rag: {
    all: ['rag'] as const,
    chat: () => [...queryKeys.rag.all, 'chat'] as const,
    chatHistory: (conversationId?: string) =>
      [...queryKeys.rag.chat(), conversationId || 'current'] as const,
    semanticSearch: (query: string) => [...queryKeys.rag.all, 'semantic-search', query] as const,
    recommendations: () => [...queryKeys.rag.all, 'recommendations'] as const,
    suggestions: () => [...queryKeys.rag.all, 'suggestions'] as const,
  },

  matches: {
    all: ['matches'] as const,
    lists: () => [...queryKeys.matches.all, 'list'] as const,
    list: (status?: string) => [...queryKeys.matches.lists(), status] as const,
    discover: (limit?: number) => [...queryKeys.matches.all, 'discover', limit || 10] as const,
    stats: () => [...queryKeys.matches.all, 'stats'] as const,
    status: (movieId: number) => [...queryKeys.matches.all, 'status', movieId] as const,
  },
} as const;

export default createQueryClient;
