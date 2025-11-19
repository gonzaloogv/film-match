import { Router } from 'express';
import { ratingController } from '../controllers/rating.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { verifyRatingOwnership } from '../middleware/ownership.middleware';
import {
  createRatingSchema,
  ratingIdSchema,
  movieIdParamSchema
} from '../validators/rating.validator';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear o actualizar rating
router.post(
  '/',
  validate(createRatingSchema, 'body'),
  ratingController.createRating.bind(ratingController)
);

// Obtener ratings del usuario
router.get(
  '/',
  ratingController.getUserRatings.bind(ratingController)
);

// Obtener estadísticas
router.get(
  '/stats',
  ratingController.getRatingStats.bind(ratingController)
);

// Obtener rating para película específica
router.get(
  '/movie/:movieId',
  validate(movieIdParamSchema, 'params'),
  ratingController.getRatingForMovie.bind(ratingController)
);

// Eliminar rating (con verificación de ownership)
router.delete(
  '/:id',
  validate(ratingIdSchema, 'params'),
  verifyRatingOwnership,
  ratingController.deleteRating.bind(ratingController)
);

export default router;