import { z } from 'zod';

// Schema para crear/actualizar rating
export const createRatingSchema = z.object({
  movieId: z.number().int().positive('movieId must be a positive integer'),
  rating: z.number().int().min(1, 'rating must be at least 1').max(10, 'rating must be at most 10'),
  review: z.string().max(2000, 'review must be at most 2000 characters').optional(),
});

export const ratingIdSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), 'id must be a valid number')
});

export const movieIdParamSchema = z.object({
  movieId: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), 'movieId must be a valid number')
});

export type CreateRatingDto = z.infer<typeof createRatingSchema>;
export type RatingIdParams = z.infer<typeof ratingIdSchema>;
export type MovieIdParam = z.infer<typeof movieIdParamSchema>;