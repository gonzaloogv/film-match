import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { prisma } from '../lib/prisma';

/**
 * Verifica que el usuario autenticado sea dueño del rating
 */
export async function verifyRatingOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const ratingId = parseInt(req.params.id);
    const userId = parseInt(req.user!.userId as any);

    const rating = await prisma.userRating.findUnique({
      where: { id: ratingId }
    });

    if (!rating) {
      throw new NotFoundError('Rating');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenError('You can only modify your own ratings');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Verifica que el usuario autenticado sea dueño de la colección
 */
export async function verifyCollectionOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const collectionId = parseInt(req.params.id);
    const userId = parseInt(req.user!.userId as any);

    const collection = await prisma.userCollection.findUnique({
      where: { id: collectionId }
    });

    if (!collection) {
      throw new NotFoundError('Collection item');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenError('You can only modify your own collections');
    }

    next();
  } catch (error) {
    next(error);
  }
}