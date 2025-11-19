import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ragService } from '@/api/services';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';
import { useAuth } from './useAuth';
import type { ChatRequestDTO, ChatMessageDTO } from '@/api/types';

/**
 * useRAGChat hook
 * Manages RAG chat and semantic search functionality
 * - checkChatStatus: Verify if RAG service is available
 * - sendMessage: Send message and get AI response
 * - semanticSearch: Search movies by semantic similarity
 * - getSimilarMovies: Find movies similar to a given movie
 * - getRecommendations: Get personalized recommendations
 * - getPopularSuggestions: Get popular movie suggestions
 */
export const useRAGChat = () => {
  const queryClient = useQueryClient();

  // Query: Check if chat service is available
  const {
    data: chatStatus,
    isLoading: isLoadingChatStatus,
    error: chatStatusError,
  } = useQuery({
    queryKey: queryKeys.auth.chatStatus(),
    queryFn: () => ragService.checkChatStatus(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry if service is down
  });

  // Mutation: Send chat message
  const chatMutation = useMutation({
    mutationFn: (request: ChatRequestDTO) => ragService.chat(request),
    onSuccess: (response, request) => {
      // Cache the conversation
      const convId = request.conversationId || response.conversationId;
      if (convId) {
        queryClient.setQueryData(
          queryKeys.rag.chatHistory(convId),
          (old: ChatMessageDTO[] = []) => [
            ...old,
            {
              role: 'user' as const,
              content: request.message,
              timestamp: new Date().toISOString(),
            },
            {
              role: 'assistant' as const,
              content: response.assistantMessage,
              timestamp: response.timestamp,
            },
          ]
        );
      }
    },
  });

  // Mutation: Semantic search
  const semanticSearchMutation = useMutation({
    mutationFn: (query: string) =>
      ragService.semanticSearch({
        query,
        topK: 10,
      }),
  });

  // Query: Get similar movies
  const getSimilarMovies = (movieId: number, topK: number = 5) => {
    return useQuery({
      queryKey: queryKeys.movies.similar(movieId),
      queryFn: () => ragService.getSimilarMovies(movieId, topK),
      staleTime: QUERY_CACHE_TIMES.RECOMMENDATIONS,
      enabled: !!movieId,
    });
  };

  // Query: Get personalized recommendations
  const {
    data: recommendations,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: queryKeys.rag.recommendations(),
    queryFn: () => ragService.getRecommendations(10),
    staleTime: QUERY_CACHE_TIMES.RECOMMENDATIONS,
  });

  // Query: Get popular suggestions
  const {
    data: suggestions,
    isLoading: isLoadingSuggestions,
    error: suggestionsError,
  } = useQuery({
    queryKey: queryKeys.rag.suggestions(),
    queryFn: () => ragService.getPopularSuggestions(10),
    staleTime: QUERY_CACHE_TIMES.RECOMMENDATIONS,
  });

  // Get current user
  const { currentUser } = useAuth();

  // Helper: Send message with proper structure
  const sendMessage = (message: string, conversationId?: string, topK?: number) => {
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }

    return chatMutation.mutate({
      userId: currentUser.id,
      message,
      conversationId,
      topK: topK || 5,
      includeRecommendations: true,
    });
  };

  // Helper: Perform semantic search
  const performSemanticSearch = (query: string) => {
    return semanticSearchMutation.mutate(query);
  };

  // Helper: Prefetch similar movies
  const prefetchSimilarMovies = async (movieId: number, topK: number = 5) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.movies.similar(movieId),
      queryFn: () => ragService.getSimilarMovies(movieId, topK),
      staleTime: QUERY_CACHE_TIMES.RECOMMENDATIONS,
    });
  };

  return {
    // Chat service status
    chatStatus,
    isLoadingChatStatus,
    chatStatusError,
    isServiceAvailable: chatStatus === true,

    // Chat
    sendMessage,
    isChattingLoading: chatMutation.isPending,
    chatError: chatMutation.error,
    chatResponse: chatMutation.data,

    // Semantic search
    performSemanticSearch,
    isSearching: semanticSearchMutation.isPending,
    searchError: semanticSearchMutation.error,
    searchResults: semanticSearchMutation.data,

    // Similar movies (function that returns hook)
    getSimilarMovies,
    prefetchSimilarMovies,

    // Recommendations
    recommendations,
    isLoadingRecommendations,
    recommendationsError,
    refetchRecommendations,

    // Suggestions
    suggestions,
    isLoadingSuggestions,
    suggestionsError,
  };
};

export default useRAGChat;
