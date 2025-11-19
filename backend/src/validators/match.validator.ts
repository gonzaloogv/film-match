import { z } from 'zod';

/**
 * Schema para crear un match
 */
export const createMatchSchema = z.object({
  movieId: z.number().int().positive('movieId debe ser un número positivo'),
  status: z.enum(['like', 'dislike', 'superlike'], {
    errorMap: () => ({ message: 'status debe ser like, dislike o superlike' })
  })
});

/**
 * Schema para query de matchlist
 */
export const matchQuerySchema = z.object({
  status: z.enum(['like', 'dislike', 'superlike']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

/**
 * Schema para parámetro movieId
 */
export const movieIdParamSchema = z.object({
  movieId: z.coerce.number().int().positive('movieId debe ser un número positivo')
});

/**
 * Schema para query de discover
 */
export const discoverQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10)
});

// Tipos inferidos
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type MatchQueryInput = z.infer<typeof matchQuerySchema>;
export type MovieIdParam = z.infer<typeof movieIdParamSchema>;
export type DiscoverQueryInput = z.infer<typeof discoverQuerySchema>;
