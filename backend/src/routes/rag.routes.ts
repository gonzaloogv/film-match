/**
 * RAG Routes
 * Semantic search, recommendations, and chat endpoints
 * Base: /api/rag
 */

import { Router, Request, Response, NextFunction } from 'express';
import { RagController } from '../controllers/rag.controller';

const ragRouter = Router();

/**
 * Semantic Search
 * POST /api/rag/search
 * Body: { query: string, topK?: number, filters?: {...} }
 */
ragRouter.post('/search', (req: Request, res: Response, next: NextFunction) => {
  RagController.semanticSearch(req, res, next);
});

/**
 * Similar Movies
 * GET /api/rag/similar/:movieId?topK=5
 */
ragRouter.get('/similar/:movieId', (req: Request, res: Response, next: NextFunction) => {
  RagController.getSimilarMovies(req, res, next);
});

/**
 * Popular Suggestions
 * GET /api/rag/suggestions?topK=10
 */
ragRouter.get('/suggestions', (req: Request, res: Response, next: NextFunction) => {
  RagController.getPopularSuggestions(req, res, next);
});

/**
 * Recommendations (requires auth)
 * GET /api/rag/recommendations?topK=10
 */
ragRouter.get('/recommendations', (req: Request, res: Response, next: NextFunction) => {
  RagController.getRecommendations(req, res, next);
});

/**
 * Chat Status
 * GET /api/rag/chat/status
 * Check if chat service is configured and ready
 */
ragRouter.get('/chat/status', (req: Request, res: Response, next: NextFunction) => {
  RagController.chatStatus(req, res, next);
});

/**
 * Chat with Gemini (requires auth)
 * POST /api/rag/chat
 * Body: { userId: number, message: string, conversationId?: string, includeRecommendations?: boolean, topK?: number }
 */
ragRouter.post('/chat', (req: Request, res: Response, next: NextFunction) => {
  RagController.chat(req, res, next);
});

export default ragRouter;
