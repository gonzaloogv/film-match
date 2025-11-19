import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { userService } from '../services/user.service';
import { UpdateUserDto } from '../validators/user.validator';

export class UserController {
  /**
   * GET /api/users/me
   */
  async getUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log('📋 getUserProfile - req.user:', req.user);
      const userId = parseInt(req.user!.userId as any);
      console.log('📋 getUserProfile - userId:', userId);
      const user = await userService.getUserProfile(userId);
      console.log('📋 getUserProfile - user found:', user.email);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('❌ getUserProfile error:', error);
      next(error);
    }
  }

  /**
   * PUT /api/users/me
   */
  async updateUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const dto: UpdateUserDto = req.body;

      const user = await userService.updateUserProfile(userId, dto);

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/me/reviews
   */
  async getUserReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const reviews = await userService.getUserReviews(userId, limit);

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/me/stats
   */
  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId as any);
      const stats = await userService.getUserStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();