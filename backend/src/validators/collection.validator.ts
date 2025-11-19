import { z } from 'zod';

export const collectionTypeEnum = z.enum(['favorite', 'watchlist', 'watched']);

export const createCollectionSchema = z.object({
  movieId: z.number().int().positive('movieId must be a positive integer'),
  type: collectionTypeEnum,
});

export const collectionTypeParamSchema = z.object({
  type: collectionTypeEnum
});

export const collectionIdSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), 'id must be a valid number')
});

export const checkMovieInCollectionSchema = z.object({
  movieId: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), 'movieId must be a valid number')
});

export type CreateCollectionDto = z.infer<typeof createCollectionSchema>;
export type CollectionType = z.infer<typeof collectionTypeEnum>;
export type CollectionIdParams = z.infer<typeof collectionIdSchema>;
export type CheckMovieParams = z.infer<typeof checkMovieInCollectionSchema>;