import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener perfil
router.get(
  '/me',
  userController.getUserProfile.bind(userController)
);

// Actualizar perfil
router.put(
  '/me',
  validate(updateUserSchema, 'body'),
  userController.updateUserProfile.bind(userController)
);

// Obtener reseñas del usuario
router.get(
  '/me/reviews',
  userController.getUserReviews.bind(userController)
);

// Obtener estadísticas
router.get(
  '/me/stats',
  userController.getUserStats.bind(userController)
);

export default router;