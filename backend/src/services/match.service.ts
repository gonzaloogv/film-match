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
 * Shuffle array using Fisher-Yates algorithm
 * Provides "soft random" ordering for discover movies
 * @param items - Array to shuffle
 * @returns Shuffled copy of the array
 */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Obtiene películas para discover (excluyendo ya vistas)
 * Con orden aleatorio usando shuffle en memoria
 * 
 * Nota: Este endpoint usa "random soft" (shuffle en memoria) en lugar de ORDER BY RANDOM()
 * para mejor performance. Si necesitas agregar filtros en el futuro, agrega parámetros
 * opcionales pero mantén el shuffle para variedad.
 * 
 * @param userId - ID del usuario
 * @param limit - Cantidad de películas a retornar (default: 10)
 * @returns Array de películas en orden aleatorio, excluyendo las ya matcheadas
 */
export async function getDiscoverMovies(userId: number, limit = 10) {
  // Traer el doble de películas para tener buena variedad al mezclar
  // limit * 2 es suficiente sin sobrecargar la BD
  const candidates = await prisma.movie.findMany({
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
    // Traer más candidatos para shuffle, pero no usar orderBy para evitar overhead
    take: limit * 2,
  });

  // Mezclar y retornar solo el límite solicitado
  return shuffle(candidates).slice(0, limit);
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
