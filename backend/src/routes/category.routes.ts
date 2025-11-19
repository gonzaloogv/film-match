import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validation.middleware';
import { categorySlugSchema } from '../validators/user.validator';

const router = Router();

// Obtener todas las categorías
router.get(
  '/',
  categoryController.getAllCategories.bind(categoryController)
);

// Obtener categoría por slug
router.get(
  '/:slug',
  validate(categorySlugSchema, 'params'),
  categoryController.getCategoryBySlug.bind(categoryController)
);

export default router;