import { MovieDTO } from './movie.types';

/**
 * Estado de un match
 */
export type MatchStatus = 'like' | 'dislike' | 'superlike';

/**
 * Datos de un match de usuario
 */
export interface UserMatchDTO {
  id: number;
  userId: number;
  movieId: number;
  status: MatchStatus;
  createdAt: string;
  movie: MovieDTO;
}

/**
 * Respuesta de matchlist paginada
 */
export interface MatchlistResponse {
  items: UserMatchDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Estadísticas de matches del usuario
 */
export interface MatchStats {
  likes: number;
  dislikes: number;
  superlikes: number;
  total: number;
}

/**
 * Payload para crear un match
 */
export interface CreateMatchPayload {
  movieId: number;
  status: MatchStatus;
}

/**
 * Parámetros de query para matchlist
 */
export interface MatchQueryParams {
  status?: MatchStatus;
  page?: number;
  limit?: number;
}
