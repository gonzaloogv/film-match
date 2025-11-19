import { Router } from 'express';
import { tmdbController } from '../controllers/tmdb.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Rutas públicas (sin autenticación)
 */

// GET /api/tmdb/search?query=matrix&page=1
router.get('/search', tmdbController.searchAndSync.bind(tmdbController));

// GET /api/tmdb/discover?sort_by=popularity.desc&page=1
router.get('/discover', tmdbController.discover.bind(tmdbController));

// GET /api/tmdb/movie/:tmdbId
router.get('/movie/:tmdbId', tmdbController.getMovieDetails.bind(tmdbController));

// GET /api/tmdb/genres
router.get('/genres', tmdbController.getGenres.bind(tmdbController));

/**
 * Rutas protegidas (requieren autenticación)
 */

// POST /api/tmdb/sync
// Body: { type: 'popular' | 'category', maxPages: 5, category?: 'action' }
router.post(
  '/sync',
  authenticate,
  tmdbController.triggerSync.bind(tmdbController)
);

// GET /api/tmdb/rate-limit
router.get(
  '/rate-limit',
  authenticate,
  tmdbController.getRateLimitStatus.bind(tmdbController)
);

export default router;