import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';
import { validate } from '../middleware/validation.middleware';
import { movieQuerySchema, movieIdSchema, movieTmdbIdSchema, movieCategorySchema } from '../validators/movie.validator';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas (opcional auth para datos personalizados)
router.get(
  '/',
  optionalAuth,
  validate(movieQuerySchema, 'query'),
  movieController.getMovies.bind(movieController)
);

router.get(
  '/tmdb/:tmdbId',
  optionalAuth,
  validate(movieTmdbIdSchema, 'params'),
  movieController.getMovieByTmdbId.bind(movieController)
);

router.get(
  '/category/:slug',
  optionalAuth,
  validate(movieCategorySchema, 'params'),
  movieController.getMoviesByCategory.bind(movieController)
);

router.get(
  '/:id',
  optionalAuth,
  validate(movieIdSchema, 'params'),
  movieController.getMovieById.bind(movieController)
);

export default router;