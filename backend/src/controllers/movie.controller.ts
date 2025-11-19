import { Request, Response, NextFunction } from 'express';
import { movieService } from '../services/movie.service';
import { MovieQueryParams } from '../validators/movie.validator';

export class MovieController {
  /**
   * GET /api/movies
   */
  async getMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.query as unknown as MovieQueryParams;
      const result = await movieService.getMovies(params);

      res.json({
        success: true,
        data: result.movies,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/movies/:id
   */
  async getMovieById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const movie = await movieService.getMovieById(parseInt(id));

      res.json({
        success: true,
        data: movie
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/movies/tmdb/:tmdbId
   */
  async getMovieByTmdbId(req: Request, res: Response, next: NextFunction) {
    try {
      const { tmdbId } = req.params;
      const movie = await movieService.getMovieByTmdbId(parseInt(tmdbId));

      res.json({
        success: true,
        data: movie
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/movies/category/:slug
   */
  async getMoviesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await movieService.getMoviesByCategory(slug, page, limit);

      res.json({
        success: true,
        data: result.movies,
        meta: result.meta,
        category: result.category
      });
    } catch (error) {
      next(error);
    }
  }
}

export const movieController = new MovieController();