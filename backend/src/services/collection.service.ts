import { prisma } from '../lib/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { CreateCollectionDto, CollectionType } from '../validators/collection.validator';
import { getPaginationMeta } from '../shared/utils/pagination';

export class CollectionService {
  /**
   * Agregar película a colección (o actualizar tipo si ya existe)
   */
  async addToCollection(userId: number, dto: CreateCollectionDto) {
    const { movieId, type } = dto;

    // Verificar que la película existe
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      throw new NotFoundError('Movie');
    }

    // Buscar si ya existe en alguna colección
    const existingCollection = await prisma.userCollection.findFirst({
      where: {
        userId,
        movieId
      }
    });

    // Si ya existe en una colección diferente, eliminarla
    if (existingCollection && existingCollection.type !== type) {
      await prisma.userCollection.delete({
        where: { id: existingCollection.id }
      });
    }

    // Crear o actualizar la colección
    const result = await prisma.userCollection.upsert({
      where: {
        userId_movieId_type: {
          userId,
          movieId,
          type
        }
      },
      update: {},
      create: {
        userId,
        movieId,
        type
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
      isNew: !existingCollection
    };
  }

  /**
   * Obtener todas las colecciones del usuario
   */
  async getUserCollections(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      prisma.userCollection.findMany({
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
      prisma.userCollection.count({ where: { userId } })
    ]);

    const meta = getPaginationMeta(total, limit, page);

    return { collections, meta };
  }

  /**
   * Obtener colección específica por tipo (favorite, watchlist, watched)
   */
  async getUserCollectionByType(userId: number, type: CollectionType, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      prisma.userCollection.findMany({
        where: { userId, type },
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
      prisma.userCollection.count({ where: { userId, type } })
    ]);

    const meta = getPaginationMeta(total, limit, page);

    return { collections, meta, type };
  }

  /**
   * Verificar si una película está en la colección del usuario
   */
  async checkMovieInCollections(userId: number, movieId: number) {
    const collections = await prisma.userCollection.findMany({
      where: {
        userId,
        movieId
      }
    });

    return {
      inCollections: collections.length > 0,
      types: collections.map(c => c.type)
    };
  }

  /**
   * Eliminar película de colección
   */
  async removeFromCollection(collectionId: number) {
    const collection = await prisma.userCollection.findUnique({
      where: { id: collectionId }
    });

    if (!collection) {
      throw new NotFoundError('Collection item');
    }

    await prisma.userCollection.delete({
      where: { id: collectionId }
    });

    return { message: 'Item removed from collection' };
  }

  /**
   * Obtener estadísticas de colecciones del usuario
   */
  async getCollectionStats(userId: number) {
    const [favoriteCount, watchlistCount, watchedCount] = await Promise.all([
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

    return {
      favoriteCount,
      watchlistCount,
      watchedCount
    };
  }
}

export const collectionService = new CollectionService();