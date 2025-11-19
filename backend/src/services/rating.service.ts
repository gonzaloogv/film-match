import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import { CreateRatingDto } from '../validators/rating.validator';
import { getPaginationMeta } from '../shared/utils/pagination';

export class RatingService {
  /**
   * Crear o actualizar rating de película
   */
  async createOrUpdateRating(userId: number, dto: CreateRatingDto) {
    const { movieId, rating, review } = dto;

    // Verificar que la película existe
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      throw new NotFoundError('Movie');
    }

    // Buscar rating existente
    const existingRating = await prisma.userRating.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    // Actualizar o crear
    const result = await prisma.userRating.upsert({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      },
      update: {
        rating,
        review: review || null
      },
      create: {
        userId,
        movieId,
        rating,
        review: review || null
      },
      include: {
        movie: {
          select: {
            id: true,
            tmdbId: true,
            title: true,
            posterPath: true
          }
        }
      }
    });

    return {
      ...result,
      isUpdate: !!existingRating
    };
  }

  /**
   * Obtener todos los ratings del usuario
   */
  async getUserRatings(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      prisma.userRating.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          movie: {
            select: {
              id: true,
              tmdbId: true,
              title: true,
              posterPath: true,
              releaseDate: true,
              voteAverage: true
            }
          }
        }
      }),
      prisma.userRating.count({ where: { userId } })
    ]);

    const meta = getPaginationMeta(total, limit, page);

    return { ratings, meta };
  }

  /**
   * Obtener rating del usuario para película específica
   */
  async getUserRatingForMovie(userId: number, movieId: number) {
    const rating = await prisma.userRating.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      },
      include: {
        movie: {
          select: {
            id: true,
            tmdbId: true,
            title: true,
            posterPath: true
          }
        }
      }
    });

    return rating; // Puede ser null si no existe
  }

  /**
   * Eliminar rating
   */
  async deleteRating(ratingId: number) {
    const rating = await prisma.userRating.findUnique({
      where: { id: ratingId }
    });

    if (!rating) {
      throw new NotFoundError('Rating');
    }

    await prisma.userRating.delete({
      where: { id: ratingId }
    });

    return { message: 'Rating deleted successfully' };
  }

  /**
   * Obtener estadísticas de ratings del usuario
   */
  async getUserRatingStats(userId: number) {
    const ratings = await prisma.userRating.findMany({
      where: { userId },
      select: {
        rating: true
      }
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    // Distribución de ratings
    const distribution = ratings.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalRatings,
      averageRating: parseFloat(averageRating.toFixed(2)),
      distribution
    };
  }
}

export const ratingService = new RatingService();