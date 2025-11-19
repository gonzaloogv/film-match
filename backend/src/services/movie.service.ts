import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../utils/errors';
import { MovieQueryParams } from '../validators/movie.validator';
import { getPaginationMeta } from '../shared/utils/pagination';

export class MovieService {
  /**
   * Obtener películas con filtros, paginación y ordenamiento
   */
  async getMovies(params: MovieQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      sortBy = 'voteAverage',
      sortOrder = 'desc',
      minRating,
      year
    } = params;

    const skip = (page - 1) * limit;

    // Construir filtros dinámicamente
    const where: Prisma.MovieWhereInput = {};

    // Filtro por búsqueda de título
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Filtro por categoría
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      };
    }

    // Filtro por rating mínimo
    if (minRating !== undefined) {
      where.voteAverage = {
        gte: new Prisma.Decimal(minRating)
      };
    }

    // Filtro por año
    if (year !== undefined) {
      where.releaseDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      };
    }

    // Construir ordenamiento
    const orderBy: Prisma.MovieOrderByWithRelationInput = {};
    if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else if (sortBy === 'releaseDate') {
      orderBy.releaseDate = sortOrder;
    } else {
      orderBy.voteAverage = sortOrder;
    }

    // Ejecutar queries en paralelo
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      }),
      prisma.movie.count({ where })
    ]);

    const meta = getPaginationMeta(total, limit, page);

    return { movies, meta };
  }

  /**
   * Obtener película por ID
   */
  async getMovieById(id: number) {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      }
    });

    if (!movie) {
      throw new NotFoundError('Movie');
    }

    // Calcular rating promedio
    const avgRating = movie.ratings.length > 0
      ? movie.ratings.reduce((sum, r) => sum + r.rating, 0) / movie.ratings.length
      : null;

    return {
      ...movie,
      userRatingsCount: movie.ratings.length,
      userRatingsAverage: avgRating
    };
  }

  /**
   * Obtener película por TMDB ID
   */
  async getMovieByTmdbId(tmdbId: number) {
    const movie = await prisma.movie.findUnique({
      where: { tmdbId },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      }
    });

    if (!movie) {
      throw new NotFoundError('Movie');
    }

    // Calcular rating promedio
    const avgRating = movie.ratings.length > 0
      ? movie.ratings.reduce((sum, r) => sum + r.rating, 0) / movie.ratings.length
      : null;

    return {
      ...movie,
      userRatingsCount: movie.ratings.length,
      userRatingsAverage: avgRating
    };
  }

  /**
   * Obtener películas por categoría
   */
  async getMoviesByCategory(slug: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where: {
          categories: {
            some: {
              categoryId: category.id
            }
          }
        },
        skip,
        take: limit,
        orderBy: { voteAverage: 'desc' },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      }),
      prisma.movie.count({
        where: {
          categories: {
            some: {
              categoryId: category.id
            }
          }
        }
      })
    ]);

    const meta = getPaginationMeta(total, limit, page);

    return { movies, meta, category };
  }
}

export const movieService = new MovieService();