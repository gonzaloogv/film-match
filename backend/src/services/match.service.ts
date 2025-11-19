import { prisma } from '../lib/prisma';
import { MatchStatus } from '@prisma/client';

/**
 * Error personalizado para la API
 */
class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

/**
 * Crea o actualiza un match (like/dislike/superlike)
 */
export async function upsertMatch(userId: number, movieId: number, status: MatchStatus) {
  // Verificar que la película existe
  const movie = await prisma.movie.findUnique({
    where: { id: movieId }
  });

  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  return prisma.userMatch.upsert({
    where: {
      userId_movieId: { userId, movieId }
    },
    update: { status },
    create: { userId, movieId, status },
    include: {
      movie: true
    }
  });
}

/**
 * Obtiene la matchlist del usuario (paginada)
 */
export async function getMatchlist(
  userId: number,
  status?: MatchStatus,
  page = 1,
  limit = 20
) {
  const where = {
    userId,
    ...(status ? { status } : {})
  };

  const [items, total] = await Promise.all([
    prisma.userMatch.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.userMatch.count({ where })
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Obtiene el estado de match para una película
 */
export async function getMatchStatus(userId: number, movieId: number) {
  return prisma.userMatch.findUnique({
    where: {
      userId_movieId: { userId, movieId }
    }
  });
}

/**
 * Obtiene películas para discover (excluyendo ya vistas)
 * Optimizado usando relación inversa
 */
export async function getDiscoverMovies(userId: number, limit = 10) {
  return prisma.movie.findMany({
    where: {
      matches: {
        none: { userId }
      }
    },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: [
      { voteAverage: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  });
}

/**
 * Obtiene estadísticas de matches del usuario
 */
export async function getMatchStats(userId: number) {
  const [likes, dislikes, superlikes] = await Promise.all([
    prisma.userMatch.count({ where: { userId, status: 'like' } }),
    prisma.userMatch.count({ where: { userId, status: 'dislike' } }),
    prisma.userMatch.count({ where: { userId, status: 'superlike' } })
  ]);

  return {
    likes,
    dislikes,
    superlikes,
    total: likes + dislikes + superlikes
  };
}

/**
 * Elimina un match
 */
export async function deleteMatch(userId: number, movieId: number) {
  const match = await prisma.userMatch.findUnique({
    where: {
      userId_movieId: { userId, movieId }
    }
  });

  if (!match) {
    throw new AppError('Match not found', 404);
  }

  return prisma.userMatch.delete({
    where: {
      userId_movieId: { userId, movieId }
    }
  });
}
