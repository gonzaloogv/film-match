/**
 * RAG Request Validators
 * Zod schemas for validating RAG endpoint requests
 */

import { z } from 'zod';

/**
 * Semantic Search Request Validator
 */
export const semanticSearchSchema = z.object({
  query: z.string()
    .min(3, 'Query must be at least 3 characters')
    .max(500, 'Query must not exceed 500 characters'),

  topK: z.number()
    .int()
    .min(1, 'topK must be at least 1')
    .max(50, 'topK must not exceed 50')
    .optional()
    .default(10),

  filters: z.object({
    genres: z.array(z.string()).optional(),
    yearRange: z.tuple([z.number().int(), z.number().int()]).optional(),
    minSimilarity: z.number()
      .min(0, 'minSimilarity must be >= 0')
      .max(1, 'minSimilarity must be <= 1')
      .optional()
      .default(0)
  }).optional()
});

export type SemanticSearchRequest = z.infer<typeof semanticSearchSchema>;

/**
 * Recommendation Request Validator
 */
export const recommendationSchema = z.object({
  topK: z.number()
    .int()
    .min(1, 'topK must be at least 1')
    .max(50, 'topK must not exceed 50')
    .optional()
    .default(10),

  excludeRated: z.boolean()
    .optional()
    .default(true),

  minRating: z.number()
    .min(0, 'minRating must be >= 0')
    .max(10, 'minRating must be <= 10')
    .optional()
    .default(0)
});

export type RecommendationRequest = z.infer<typeof recommendationSchema>;

/**
 * Chat Request Validator
 */
export const chatSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must not exceed 1000 characters'),

  sessionId: z.string().optional(),

  includeRecommendations: z.boolean()
    .optional()
    .default(true)
});

export type ChatRequest = z.infer<typeof chatSchema>;

/**
 * Similar Movies Request Validator
 */
export const similarMoviesSchema = z.object({
  movieId: z.number()
    .int()
    .positive('movieId must be a positive integer'),

  topK: z.number()
    .int()
    .min(1, 'topK must be at least 1')
    .max(50, 'topK must not exceed 50')
    .optional()
    .default(5)
});

export type SimilarMoviesRequest = z.infer<typeof similarMoviesSchema>;