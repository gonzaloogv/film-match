import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { ratingService } from '../services/rating.service';
import { CreateRatingDto } from '../validators/rating.validator';

export class RatingController {
  /**
   * POST /api/ratings
   */
  async createRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const dto: CreateRatingDto = req.body;

      const result = await ratingService.createOrUpdateRating(userId, dto);

      res.status(result.isUpdate ? 200 : 201).json({
        success: true,
        data: result,
        message: result.isUpdate ? 'Rating updated' : 'Rating created'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ratings
   */
  async getUserRatings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ratingService.getUserRatings(userId, page, limit);

      res.json({
        success: true,
        data: result.ratings,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ratings/movie/:movieId
   */
  async getRatingForMovie(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const movieId = parseInt(req.params.movieId);

      const rating = await ratingService.getUserRatingForMovie(userId, movieId);

      res.json({
        success: true,
        data: rating
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ratings/:id
   */
  async deleteRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ratingId = parseInt(req.params.id);
      const result = await ratingService.deleteRating(ratingId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ratings/stats
   */
  async getRatingStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const stats = await ratingService.getUserRatingStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ratingController = new RatingController();