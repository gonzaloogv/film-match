import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

export class CategoryController {
  /**
   * GET /api/categories
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAllCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/categories/:slug
   */
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await categoryService.getCategoryBySlug(slug);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();