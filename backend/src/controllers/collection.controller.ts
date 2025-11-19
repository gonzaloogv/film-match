import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { collectionService } from '../services/collection.service';
import { CreateCollectionDto, CollectionType } from '../validators/collection.validator';

export class CollectionController {
  /**
   * POST /api/collections
   */
  async addToCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const dto: CreateCollectionDto = req.body;

      const result = await collectionService.addToCollection(userId, dto);

      res.status(result.isNew ? 201 : 200).json({
        success: true,
        data: result,
        message: result.isNew ? 'Item added to collection' : 'Collection updated'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/collections
   */
  async getUserCollections(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await collectionService.getUserCollections(userId, page, limit);

      res.json({
        success: true,
        data: result.collections,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/collections/:type
   */
  async getUserCollectionByType(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const type = req.params.type as CollectionType;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await collectionService.getUserCollectionByType(userId, type, page, limit);

      res.json({
        success: true,
        data: result.collections,
        meta: result.meta,
        type: result.type
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/collections/check/:movieId
   */
  async checkMovieInCollections(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const movieId = parseInt(req.params.movieId);

      const result = await collectionService.checkMovieInCollections(userId, movieId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/collections/:id
   */
  async removeFromCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const collectionId = parseInt(req.params.id);
      const result = await collectionService.removeFromCollection(collectionId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export const collectionController = new CollectionController();