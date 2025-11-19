import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { preferencesController } from '../controllers/preferences.controller';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticate);

/**
 * GET /api/preferences
 * Obtener preferencias del usuario
 */
router.get('/', (req, res, next) => preferencesController.getPreferences(req, res, next));

/**
 * PUT /api/preferences
 * Actualizar preferencias del usuario
 */
router.put('/', (req, res, next) => preferencesController.updatePreferences(req, res, next));

export default router;
