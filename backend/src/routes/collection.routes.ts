import { Router } from 'express';
import { collectionController } from '../controllers/collection.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { verifyCollectionOwnership } from '../middleware/ownership.middleware';
import {
  createCollectionSchema,
  collectionTypeParamSchema,
  collectionIdSchema,
  checkMovieInCollectionSchema
} from '../validators/collection.validator';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Agregar a colección
router.post(
  '/',
  validate(createCollectionSchema, 'body'),
  collectionController.addToCollection.bind(collectionController)
);

// Obtener todas las colecciones del usuario
router.get(
  '/',
  collectionController.getUserCollections.bind(collectionController)
);

// Verificar si película está en colecciones
router.get(
  '/check/:movieId',
  validate(checkMovieInCollectionSchema, 'params'),
  collectionController.checkMovieInCollections.bind(collectionController)
);

// Obtener colección por tipo
router.get(
  '/:type',
  validate(collectionTypeParamSchema, 'params'),
  collectionController.getUserCollectionByType.bind(collectionController)
);

// Eliminar de colección
router.delete(
  '/:id',
  validate(collectionIdSchema, 'params'),
  verifyCollectionOwnership,
  collectionController.removeFromCollection.bind(collectionController)
);

export default router;