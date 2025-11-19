import { z } from 'zod';

// Schema para query params de listado de películas
export const movieQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 20),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['title', 'releaseDate', 'voteAverage']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  minRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  year: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

// Schema para params de ID
export const movieIdSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

export const movieTmdbIdSchema = z.object({
  tmdbId: z.string().transform(val => parseInt(val))
});

export const movieCategorySchema = z.object({
  slug: z.string().min(1)
});

export type MovieQueryParams = z.infer<typeof movieQuerySchema>;
export type MovieIdParams = z.infer<typeof movieIdSchema>;
export type MovieTmdbIdParams = z.infer<typeof movieTmdbIdSchema>;
export type MovieCategoryParams = z.infer<typeof movieCategorySchema>;