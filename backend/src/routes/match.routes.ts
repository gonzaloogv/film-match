import { Router } from 'express';
import { matchController } from '../controllers/match.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * POST /api/matches - Crear match (like/dislike/superlike)
 */
router.post('/', matchController.create);

/**
 * GET /api/matches - Obtener matchlist del usuario
 * Query params: status, page, limit
 */
router.get('/', matchController.list);

/**
 * GET /api/matches/discover - Películas para swipe
 * Query params: limit
 */
router.get('/discover', matchController.discover);

/**
 * GET /api/matches/stats - Estadísticas del usuario
 */
router.get('/stats', matchController.stats);

/**
 * GET /api/matches/status/:movieId - Estado de match para una película
 */
router.get('/status/:movieId', matchController.status);

/**
 * DELETE /api/matches/:movieId - Eliminar match
 */
router.delete('/:movieId', matchController.delete);

export default router;
