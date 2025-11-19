import { Response, NextFunction } from 'express';
import * as matchService from '../services/match.service';
import { MatchStatus } from '@prisma/client';
import { AuthRequest } from '../types/auth.types';
import { AppError } from '../middleware/error.middleware';

export const matchController = {
  /**
   * POST /api/matches - Crear match
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userIdStr = req.user?.userId;
      if (!userIdStr) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = parseInt(userIdStr);
      const { movieId, status } = req.body;

      const match = await matchService.upsertMatch(
        userId,
        movieId,
        status as MatchStatus
      );

      res.status(201).json({
        success: true,
        data: match
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error && error.message.includes('not found')) {
        next(new AppError(404, error.message));
      } else {
        next(error);
      }
    }
  },

  /**
   * GET /api/matches - Obtener matchlist
   */
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userIdStr = req.user?.userId;
      if (!userIdStr) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = parseInt(userIdStr);
      const { status, page, limit } = req.query;

      const result = await matchService.getMatchlist(
        userId,
        status as MatchStatus | undefined,
        Number(page) || 1,
        Number(limit) || 20
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/status/:movieId - Estado de película
   */
  async status(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userIdStr = req.user?.userId;
      if (!userIdStr) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = parseInt(userIdStr);
      const movieId = Number(req.params.movieId);

      const match = await matchService.getMatchStatus(userId, movieId);

      res.json({
        success: true,
        data: match
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/discover - Películas para swipe
   */
  async discover(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userIdStr = req.user?.userId;
      if (!userIdStr) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = parseInt(userIdStr);
      const limit = Number(req.query.limit) || 10;

      const movies = await matchService.getDiscoverMovies(userId, limit);

      res.json({
        success: true,
        data: movies
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/stats - Estadísticas
   */
  async stats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userIdStr = req.user?.userId;
      if (!userIdStr) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = parseInt(userIdStr);
      const stats = await matchService.getMatchStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/matches/:movieId - Eliminar match
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userIdStr = req.user?.userId;
      if (!userIdStr) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = parseInt(userIdStr);
      const movieId = Number(req.params.movieId);

      await matchService.deleteMatch(userId, movieId);

      res.json({
        success: true,
        data: { message: 'Match eliminado exitosamente' }
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        next(new AppError(404, error.message));
      } else {
        next(error);
      }
    }
  }
};
