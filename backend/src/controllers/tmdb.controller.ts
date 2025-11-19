import { Request, Response, NextFunction } from 'express';
import { tmdbService } from '../services/tmdb.service';
import { tmdbSyncService } from '../services/tmdb-sync.service';
import { movieService } from '../services/movie.service';
import { TMDBSearchParams, TMDBDiscoverParams } from '../types/tmdb.types';
import { buildImageUrl } from '../config/tmdb.config';

export class TMDBController {
  /**
   * Buscar películas en TMDB y sincronizar a BD
   */
  async searchAndSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, page = 1, year } = req.query as any;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
        return;
      }

      const searchParams: TMDBSearchParams = {
        query: query as string,
        page: parseInt(page as string, 10),
        year: year ? parseInt(year as string, 10) : undefined
      };

      // Buscar en TMDB
      const tmdbResults = await tmdbService.searchMovies(searchParams);

      // Sincronizar primeras películas a BD (async)
      const moviesToSync = tmdbResults.results.slice(0, 10);
      Promise.all(
        moviesToSync.map(movie =>
          tmdbSyncService.syncSingleMovie(movie).catch(err => {
            console.error(`Failed to sync movie ${movie.id}:`, err);
          })
        )
      );

      // Retornar resultados de TMDB con URLs de imagen
      const moviesWithImages = tmdbResults.results.map(movie => ({
        ...movie,
        poster_url: buildImageUrl(movie.poster_path, 'poster'),
        backdrop_url: buildImageUrl(movie.backdrop_path, 'backdrop')
      }));

      res.json({
        success: true,
        data: {
          movies: moviesWithImages,
          page: tmdbResults.page,
          total_pages: tmdbResults.total_pages,
          total_results: tmdbResults.total_results
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descubrir películas con filtros
   */
  async discover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        sort_by = 'popularity.desc',
        with_genres,
        year,
        min_rating
      } = req.query as any;

      const discoverParams: TMDBDiscoverParams = {
        page: parseInt(page as string, 10),
        sort_by: sort_by as string,
        with_genres: with_genres as string,
        year: year ? parseInt(year as string, 10) : undefined,
        'vote_average.gte': min_rating ? parseFloat(min_rating as string) : undefined,
        'vote_count.gte': 100
      };

      const results = await tmdbService.discoverMovies(discoverParams);

      const moviesWithImages = results.results.map(movie => ({
        ...movie,
        poster_url: buildImageUrl(movie.poster_path, 'poster'),
        backdrop_url: buildImageUrl(movie.backdrop_path, 'backdrop')
      }));

      res.json({
        success: true,
        data: {
          movies: moviesWithImages,
          page: results.page,
          total_pages: results.total_pages,
          total_results: results.total_results
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener detalles de película de TMDB y sincronizar
   */
  async getMovieDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tmdbId } = req.params;
      const tmdbIdNum = parseInt(tmdbId, 10);

      if (isNaN(tmdbIdNum)) {
        res.status(400).json({
          success: false,
          error: 'Invalid TMDB ID'
        });
        return;
      }

      // Verificar primero en BD local
      try {
        const localMovie = await movieService.getMovieByTmdbId(tmdbIdNum);
        res.json({
          success: true,
          data: localMovie,
          source: 'local'
        });
        return;
      } catch (error) {
        // No está en BD local, obtener de TMDB
      }

      // Obtener de TMDB
      const movieDetail = await tmdbService.getMovieDetails(tmdbIdNum);

      // Sincronizar a BD (async)
      tmdbSyncService.syncMovieById(tmdbIdNum).catch(err => {
        console.error(`Failed to sync movie ${tmdbIdNum}:`, err);
      });

      res.json({
        success: true,
        data: {
          ...movieDetail,
          poster_url: buildImageUrl(movieDetail.poster_path, 'poster'),
          backdrop_url: buildImageUrl(movieDetail.backdrop_path, 'backdrop')
        },
        source: 'tmdb'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger manual de sincronización
   */
  async triggerSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type = 'popular', maxPages = 5, category } = req.body;

      let result;

      if (type === 'popular') {
        result = await tmdbSyncService.syncPopularMovies({ maxPages });
      } else if (type === 'category' && category) {
        result = await tmdbSyncService.syncByCategory(category, { maxPages });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid sync type or missing category'
        });
        return;
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener géneros de TMDB
   */
  async getGenres(req: Request, res: Response, next: NextFunction) {
    try {
      const genres = await tmdbService.getGenres();

      res.json({
        success: true,
        data: genres
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estado del rate limiter
   */
  async getRateLimitStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const availableTokens = tmdbService.getAvailableTokens();

      res.json({
        success: true,
        data: {
          availableTokens,
          maxTokens: 40,
          windowMs: 10000
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tmdbController = new TMDBController();