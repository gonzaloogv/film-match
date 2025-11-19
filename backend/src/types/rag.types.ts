/**
 * RAG (Retrieval-Augmented Generation) Types
 * Defines interfaces for semantic search and recommendation features
 */

import { Decimal } from '@prisma/client/runtime/library';

export interface MovieResult {
  id: number;
  tmdbId: number;
  title: string;
  year: number | null;
  overview: string | null;
  genres: string[];
  posterPath: string | null;
  voteAverage: number | Decimal | null;
  similarityScore?: number; // 0-1 from Pinecone
}

export interface SearchOptions {
  topK?: number;
  filters?: {
    genres?: string[];
    yearRange?: [number, number];
    minSimilarity?: number;
  };
}

export interface RecommendationOptions {
  topK?: number;
  excludeRated?: boolean;
  minRating?: number; // Only consider movies user rated >= this
}

export interface ChatContext {
  movies: MovieResult[];
  userPreferences?: {
    favoriteGenres: string[];
    averageRating: number;
  };
}

export interface ChatResponse {
  response: string;
  movies?: MovieResult[];
  sessionId: string;
  tokensUsed?: number;
}

/**
 * Chat Types (Fase 3B.3 - Gemini Integration)
 */

export interface GeminiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiChatRequest {
  userId: number;
  message: string;
  conversationId?: string;
  includeRecommendations?: boolean; // Include hybrid recommendations in context
  topK?: number; // Number of recommendations to include
}

export interface GeminiChatContextData {
  userMessage: string;
  userProfile?: UserMetadataProfile;
  recommendations?: RecommendationResult[];
  conversationHistory?: GeminiChatMessage[];
  contextSource?: 'hybrid' | 'vector' | 'metadata' | 'direct';
}

export interface GeminiChatResponseData {
  id: string;
  conversationId: string;
  userMessage: string;
  assistantMessage: string;
  tokensUsed: number;
  recommendedMovies?: MovieResult[];
  contextSource?: string;
  timestamp: string;
}

export interface SemanticSearchQuery {
  query: string;
  topK?: number; // Default: 10
  minSimilarity?: number; // Default: 0.0 (no filter)
  userId?: string; // Optional: for personalized filtering
}

export interface RecommendationQuery {
  userId: number;
  topK?: number; // Default: 10
  minSimilarity?: number; // Default: 0.7
  excludeWatched?: boolean; // Default: true
}

export interface ChatQuery {
  message: string;
  userId?: number;
  conversationContext?: string[];
  topK?: number; // Default: 5
}

export interface RecommendationWithReason {
  movie: MovieResult;
  reason: string;
  score: number;
}

/**
 * Hybrid Recommendation Types (Fase 3B.2)
 */

export interface UserMetadataProfile {
  userId: number;
  favoriteGenres: Array<{ genre: string; weight: number; count: number }>;
  averageRating: number;
  totalRatings: number;
  topRatedMovieIds: number[];
}

export interface ScoreWeights {
  vector: number;      // Default: 0.30 (30%)
  genre: number;       // Default: 0.20 (20%)
  popularity: number;  // Default: 0.15 (15%)
  genreBoost: number;  // Default: 0.25 (25%) - Genre matching bonus
  recencyBoost: number; // Default: 0.10 (10%) - Recent high ratings
}

export interface RecommendationScore {
  movieId: number;
  vectorScore: number;
  genreScore: number;
  popularityScore: number;
  finalScore: number;
}

export interface RecommendationResult extends MovieResult {
  recommendationScore: number;
  scoreBreakdown?: {
    vector: number;
    genre: number;
    popularity: number;
  };
  matchedGenres?: string[];
  matchReason?: string;
}

export interface HybridRecommendationOptions {
  topK?: number;              // Default: 10
  excludeRated?: boolean;     // Default: true
  minUserRating?: number;     // Default: 3 (only 3+ stars for profile)
  weights?: Partial<ScoreWeights>; // Custom scoring weights
  diversityBoost?: boolean;   // Default: false (for future)
}

export interface HybridSearchResult {
  vectorResults: MovieResult[];
  genreResults: MovieResult[];
  combinedResults: RecommendationResult[];
  userProfile: UserMetadataProfile;
}