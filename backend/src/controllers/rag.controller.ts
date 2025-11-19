/**
 * RAG Controller
 * Handles all RAG endpoints (semantic search, recommendations, chat)
 */

import { Request, Response, NextFunction } from 'express';
import { semanticSearchSchema, similarMoviesSchema } from '../validators/rag.validator';
import { semanticSearchService } from '../services/semantic-search.service';
import { hybridRecommendationEngine } from '../services/hybrid-recommendation-engine';
import { geminiChatService } from '../services/gemini-chat.service';
import { AppError } from '../middleware/error.middleware';

export class RagController {
  /**
   * Semantic Search Endpoint
   * POST /api/rag/search
   * Search for movies using natural language query
   */
  static async semanticSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request
      const validatedData = semanticSearchSchema.parse(req.body);

      // Execute search
      const results = await semanticSearchService.search(validatedData.query, {
        topK: validatedData.topK,
        filters: validatedData.filters
      });

      // Return results
      res.status(200).json({
        success: true,
        data: {
          query: validatedData.query,
          results,
          totalResults: results.length,
          executionTime: '~' // Will be tracked in service logs
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Zod validation')) {
        next(new AppError(400, error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Similar Movies Endpoint
   * GET /api/rag/similar/:movieId
   * Find movies similar to a specific movie
   */
  static async getSimilarMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate and parse parameters
      const { movieId } = req.params;
      const { topK } = req.query;

      const movieIdNum = parseInt(movieId, 10);
      const topKNum = topK ? parseInt(topK as string, 10) : 5;

      const validatedData = similarMoviesSchema.parse({
        movieId: movieIdNum,
        topK: topKNum
      });

      // Get similar movies
      const results = await semanticSearchService.searchByMovieId(
        validatedData.movieId,
        validatedData.topK
      );

      res.status(200).json({
        success: true,
        data: {
          movieId: validatedData.movieId,
          similar: results,
          totalResults: results.length
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        next(new AppError(400, error.message));
      } else if (error instanceof Error && error.message.includes('not found')) {
        next(new AppError(404, error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Popular Movies Suggestions
   * GET /api/rag/suggestions
   * Get popular movies as fallback suggestions
   */
  static async getPopularSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topKNum = req.query.topK ? parseInt(req.query.topK as string, 10) : 10;

      const suggestions = await semanticSearchService.getPopularMoviesSuggestions(topKNum);

      res.status(200).json({
        success: true,
        data: {
          suggestions,
          totalResults: suggestions.length,
          message: 'Popular movies suggestions'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hybrid Recommendations Endpoint
   * GET /api/rag/recommendations
   * Get personalized recommendations based on user ratings
   * Combines vector search + genre matching
   */
  static async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse userId from query or auth
      const { userId } = req.query;
      const { topK, excludeRated, minUserRating } = req.query;

      if (!userId) {
        throw new AppError(400, 'userId query parameter is required');
      }

      const userIdNum = parseInt(userId as string, 10);
      const topKNum = topK ? parseInt(topK as string, 10) : 10;
      const excludeRatedBool = excludeRated !== 'false';
      const minUserRatingNum = minUserRating ? parseInt(minUserRating as string, 10) : 3;

      // Get recommendations
      const recommendations = await hybridRecommendationEngine.getRecommendations(
        userIdNum,
        {
          topK: topKNum,
          excludeRated: excludeRatedBool,
          minUserRating: minUserRatingNum
        }
      );

      res.status(200).json({
        success: true,
        data: {
          userId: userIdNum,
          recommendations,
          totalResults: recommendations.length,
          method: 'Hybrid (Vector + Metadata)',
          message: `Generated ${recommendations.length} personalized recommendations`
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error && error.message.includes('validation')) {
        next(new AppError(400, error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Chat Endpoint
   * POST /api/rag/chat
   * Chat with Gemini about movies with hybrid context
   */
  static async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { userId, message, conversationId, includeRecommendations, topK } = req.body;

      // Validation
      if (!userId || typeof userId !== 'number') {
        throw new AppError(400, 'userId (number) is required');
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new AppError(400, 'message (non-empty string) is required');
      }

      if (message.length > 2000) {
        throw new AppError(400, 'message cannot exceed 2000 characters');
      }

      // Prepare chat request
      const chatRequest = {
        userId,
        message: message.trim(),
        conversationId,
        includeRecommendations: includeRecommendations !== false, // Default true
        topK: topK || 5
      };

      let response;

      // Use Gemini if configured, otherwise use fallback
      if (geminiChatService.isConfigured()) {
        try {
          response = await geminiChatService.chat(chatRequest);
        } catch (geminiError) {
          // If Gemini fails (rate limit, API error, etc.), try fallback
          console.warn('⚠️  Gemini chat failed, using fallback:', geminiError);
          response = await geminiChatService.fallbackChat(chatRequest);
        }
      } else {
        // Gemini not configured, use fallback directly
        console.log('ℹ️  Gemini not configured, using fallback chat');
        response = await geminiChatService.fallbackChat(chatRequest);
      }

      // Return response
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        // Handle Gemini-specific errors
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('not configured')) {
          next(new AppError(503, error.message));
        } else if (error.message.includes('BLOCKED')) {
          next(new AppError(400, 'Request blocked by safety filters. Please rephrase your message.'));
        } else if (error.message.includes('Rate limit')) {
          next(new AppError(429, 'Rate limit exceeded. Please try again later.'));
        } else {
          next(new AppError(500, `Chat error: ${error.message}`));
        }
      } else {
        next(error);
      }
    }
  }

  /**
   * Chat Status Endpoint
   * GET /api/rag/chat/status
   * Check if chat service is configured and ready
   */
  static async chatStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = geminiChatService.getStatus();

      res.status(200).json({
        success: true,
        data: {
          status,
          message: status.configured
            ? 'Chat service is ready'
            : 'Chat service is not configured. Set GEMINI_API_KEY to enable.'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}