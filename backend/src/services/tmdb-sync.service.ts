import { prisma } from '../lib/prisma';
import { tmdbService } from './tmdb.service';
import {
  TMDBSyncOptions,
  TMDBSyncResult,
  TMDBMovie,
  TMDB_GENRE_MAPPING
} from '../types/tmdb.types';
import {
  mapTMDBMovieToLocal,
  mapTMDBGenresToCategories,
  isValidTMDBMovie
} from '../utils/tmdb-mapper';
import { Prisma } from '@prisma/client';

export class TMDBSyncService {
  /**
   * Sincroniza películas populares de TMDB a BD local
   */
  async syncPopularMovies(options: TMDBSyncOptions = {}): Promise<TMDBSyncResult> {
    const {
      maxPages = 5,
      delayBetweenRequests = 300,
      minVoteCount = 100,
      minVoteAverage = 6.0
    } = options;

    const startTime = Date.now();
    let totalProcessed = 0;
    let totalSaved = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    console.log(`[SYNC] Starting sync of popular movies (${maxPages} pages)`);

    for (let page = 1; page <= maxPages; page++) {
      try {
        console.log(`[SYNC] Processing page ${page}/${maxPages}`);

        const response = await tmdbService.getPopularMovies(page);

        // Filtrar películas válidas
        const validMovies = response.results.filter(movie => {
          return (
            isValidTMDBMovie(movie) &&
            movie.vote_count >= minVoteCount &&
            movie.vote_average >= minVoteAverage
          );
        });

        // Sincronizar cada película
        for (const tmdbMovie of validMovies) {
          totalProcessed++;

          try {
            const saved = await this.syncSingleMovie(tmdbMovie);
            if (saved) {
              totalSaved++;
            } else {
              totalSkipped++;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Movie ${tmdbMovie.id}: ${message}`);
            totalSkipped++;
          }

          // Delay para no saturar la BD
          if (totalProcessed % 10 === 0) {
            await this.sleep(delayBetweenRequests);
          }
        }

        console.log(`[SYNC] Page ${page} completed. Saved: ${totalSaved}, Skipped: ${totalSkipped}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Page ${page}: ${message}`);
        console.error(`[SYNC] Error on page ${page}:`, message);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`[SYNC] Completed in ${(duration / 1000).toFixed(2)}s`);
    console.log(
      `[SYNC] Total: ${totalProcessed}, Saved: ${totalSaved}, Skipped: ${totalSkipped}, Errors: ${errors.length}`
    );

    return {
      totalProcessed,
      totalSaved,
      totalSkipped,
      errors,
      duration
    };
  }

  /**
   * Sincroniza películas por categoría
   */
  async syncByCategory(categorySlug: string, options: TMDBSyncOptions = {}): Promise<TMDBSyncResult> {
    const {
      maxPages = 3,
      delayBetweenRequests = 300,
      minVoteCount = 50,
      minVoteAverage = 5.0
    } = options;

    // Encontrar TMDB genre ID desde category slug
    const tmdbGenreId = Object.entries(TMDB_GENRE_MAPPING).find(
      ([_, slug]) => slug === categorySlug
    )?.[0];

    if (!tmdbGenreId) {
      throw new Error(`No TMDB genre mapping found for category: ${categorySlug}`);
    }

    const startTime = Date.now();
    let totalProcessed = 0;
    let totalSaved = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    console.log(`[SYNC] Starting sync for category: ${categorySlug} (TMDB genre: ${tmdbGenreId})`);

    for (let page = 1; page <= maxPages; page++) {
      try {
        const response = await tmdbService.discoverMovies({
          page,
          with_genres: tmdbGenreId,
          'vote_count.gte': minVoteCount,
          'vote_average.gte': minVoteAverage,
          sort_by: 'popularity.desc'
        });

        const validMovies = response.results.filter(isValidTMDBMovie);

        for (const tmdbMovie of validMovies) {
          totalProcessed++;

          try {
            const saved = await this.syncSingleMovie(tmdbMovie);
            if (saved) {
              totalSaved++;
            } else {
              totalSkipped++;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Movie ${tmdbMovie.id}: ${message}`);
            totalSkipped++;
          }

          if (totalProcessed % 10 === 0) {
            await this.sleep(delayBetweenRequests);
          }
        }

        console.log(`[SYNC] Page ${page} completed. Saved: ${totalSaved}, Skipped: ${totalSkipped}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Page ${page}: ${message}`);
      }
    }

    const duration = Date.now() - startTime;

    return {
      totalProcessed,
      totalSaved,
      totalSkipped,
      errors,
      duration
    };
  }

  /**
   * Sincroniza una sola película
   * @returns true si se guardó, false si ya existía
   */
  async syncSingleMovie(tmdbMovie: TMDBMovie): Promise<boolean> {
    // Verificar si ya existe
    const existing = await prisma.movie.findUnique({
      where: { tmdbId: tmdbMovie.id }
    });

    if (existing) {
      // Ya existe, actualizar datos si es necesario
      await prisma.movie.update({
        where: { tmdbId: tmdbMovie.id },
        data: {
          title: tmdbMovie.title,
          overview: tmdbMovie.overview,
          posterPath: tmdbMovie.poster_path,
          voteAverage: new Prisma.Decimal(tmdbMovie.vote_average.toFixed(1)),
          updatedAt: new Date()
        }
      });
      return false;
    }

    // Crear nueva película
    const movieData = mapTMDBMovieToLocal(tmdbMovie);

    // Mapear categorías
    const categorySlugs = mapTMDBGenresToCategories(tmdbMovie.genre_ids);

    // Obtener o crear categorías
    const categories = await Promise.all(
      categorySlugs.map(async slug => {
        const category = await prisma.category.findUnique({ where: { slug } });
        if (!category) {
          // Crear categoría si no existe
          return prisma.category.create({
            data: {
              slug,
              name: this.slugToName(slug)
            }
          });
        }
        return category;
      })
    );

    // Crear película con relaciones
    await prisma.movie.create({
      data: {
        ...movieData,
        categories: {
          create: categories.map(cat => ({
            categoryId: cat.id
          }))
        }
      }
    });

    return true;
  }

  /**
   * Obtener película de TMDB y sincronizarla (por ID)
   */
  async syncMovieById(tmdbId: number): Promise<void> {
    const movieDetail = await tmdbService.getMovieDetails(tmdbId);

    // Verificar validez
    if (!isValidTMDBMovie(movieDetail)) {
      throw new Error(`Movie ${tmdbId} does not meet minimum requirements`);
    }

    // Convertir genres a genre_ids para usar syncSingleMovie
    const tmdbMovie: TMDBMovie = {
      ...movieDetail,
      genre_ids: movieDetail.genres.map(g => g.id)
    };

    await this.syncSingleMovie(tmdbMovie);
  }

  /**
   * Helper: convertir slug a nombre capitalizado
   */
  private slugToName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const tmdbSyncService = new TMDBSyncService();