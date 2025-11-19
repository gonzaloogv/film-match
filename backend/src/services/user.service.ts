import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import { UpdateUserDto } from '../validators/user.validator';

export class UserService {
  /**
   * Obtener perfil del usuario autenticado
   */
  async getUserProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        nickname: true,
        profilePicture: true,
        bio: true,
        twitterUrl: true,
        instagramUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateUserProfile(userId: number, dto: UpdateUserDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username !== undefined ? dto.username : user.username,
        nickname: dto.nickname !== undefined ? dto.nickname : user.nickname,
        bio: dto.bio !== undefined ? dto.bio : user.bio,
        profilePicture: dto.profilePicture !== undefined ? dto.profilePicture : user.profilePicture,
        twitterUrl: dto.twitterUrl !== undefined ? dto.twitterUrl : user.twitterUrl,
        instagramUrl: dto.instagramUrl !== undefined ? dto.instagramUrl : user.instagramUrl,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        nickname: true,
        profilePicture: true,
        bio: true,
        twitterUrl: true,
        instagramUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Obtener reseñas/ratings del usuario
   */
  async getUserReviews(userId: number, limit: number = 10) {
    const reviews = await prisma.userRating.findMany({
      where: { userId },
      include: {
        movie: {
          select: {
            id: true,
            tmdbId: true,
            title: true,
            overview: true,
            releaseDate: true,
            posterPath: true,
            voteAverage: true,
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      review: review.review,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      movie: {
        id: review.movie.id,
        tmdbId: review.movie.tmdbId,
        title: review.movie.title,
        overview: review.movie.overview,
        releaseDate: review.movie.releaseDate,
        posterPath: review.movie.posterPath,
        voteAverage: review.movie.voteAverage,
        categories: review.movie.categories.map(mc => ({
          id: mc.category.id,
          name: mc.category.name,
          slug: mc.category.slug
        }))
      }
    }));
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Obtener estadísticas en paralelo
    const [totalRatings, ratingsData, favoriteCount, watchlistCount, watchedCount] = await Promise.all([
      prisma.userRating.count({ where: { userId } }),
      prisma.userRating.findMany({
        where: { userId },
        select: { rating: true }
      }),
      prisma.userCollection.count({
        where: { userId, type: 'favorite' }
      }),
      prisma.userCollection.count({
        where: { userId, type: 'watchlist' }
      }),
      prisma.userCollection.count({
        where: { userId, type: 'watched' }
      })
    ]);

    // Calcular promedio
    const averageRating = totalRatings > 0
      ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    // Obtener categorías favoritas
    const topCategories = await prisma.userRating.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { rating: 'desc' },
      take: 10
    });

    // Agrupar categorías
    const categoryMap = new Map<string, number>();
    topCategories.forEach(rating => {
      rating.movie.categories.forEach(mc => {
        categoryMap.set(
          mc.category.name,
          (categoryMap.get(mc.category.name) || 0) + 1
        );
      });
    });

    const topCategoriesArray = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRatings,
      averageRating: parseFloat(averageRating.toFixed(2)),
      favoriteCount,
      watchlistCount,
      watchedCount,
      topCategories: topCategoriesArray
    };
  }
}

export const userService = new UserService();