import { MovieDTO } from './movie.types';

/**
 * Datos de una calificación de usuario
 */
export interface RatingDTO {
  id: number;
  userId: number;
  movieId: number;
  rating: number; // 1-10
  review?: string | null;
  createdAt: string;
  updatedAt: string;
  movie?: MovieDTO;
}

/**
 * Payload para crear/actualizar una calificación
 */
export interface CreateRatingDTO {
  movieId: number;
  rating: number;
  review?: string;
}

/**
 * Estadísticas de calificaciones del usuario
 */
export interface RatingStatsDTO {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}
