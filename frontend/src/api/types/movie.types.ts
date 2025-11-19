/**
 * Datos de una película
 */
export interface MovieDTO {
  id: number;
  tmdbId: number;
  title: string;
  overview?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  createdAt: string;
  updatedAt: string;
  // Campos opcionales cuando está autenticado
  userRating?: number | null;
  inWatchlist?: boolean;
  inWatched?: boolean;
  inFavorites?: boolean;
  categories?: Array<{ id: number; name: string; slug: string }>;
  // Campos adicionales para detalles
  userRatingsCount?: number;
  userRatingsAverage?: number | null;
}

/**
 * Parámetros de query para listar películas
 */
export interface MovieQueryParams {
  page?: number;
  limit?: number;
  category?: string;  // Category slug (e.g., 'accion', 'comedia')
  year?: number;
  minRating?: number;
  sortBy?: 'popularity' | 'release_date' | 'vote_average' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
