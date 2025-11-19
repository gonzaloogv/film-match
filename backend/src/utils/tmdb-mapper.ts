import { TMDBMovie, TMDBMovieDetail, TMDB_GENRE_MAPPING } from '../types/tmdb.types';
import { Prisma } from '@prisma/client';

/**
 * Mapea una película de TMDB al formato de la BD local
 */
export function mapTMDBMovieToLocal(tmdbMovie: TMDBMovie | TMDBMovieDetail): Prisma.MovieCreateInput {
  return {
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title,
    overview: tmdbMovie.overview || null,
    releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
    posterPath: tmdbMovie.poster_path,
    voteAverage: new Prisma.Decimal(tmdbMovie.vote_average.toFixed(1)),
    embeddingStatus: 'pending'
  };
}

/**
 * Extrae slugs de categorías desde IDs de géneros TMDB
 */
export function mapTMDBGenresToCategories(genreIds: number[]): string[] {
  return genreIds
    .map(id => TMDB_GENRE_MAPPING[id])
    .filter((slug): slug is string => slug !== undefined);
}

/**
 * Valida que una película tenga datos mínimos requeridos
 */
export function isValidTMDBMovie(movie: TMDBMovie): boolean {
  return !!(
    movie.id &&
    movie.title &&
    movie.overview &&
    movie.poster_path &&
    movie.release_date &&
    movie.vote_count >= 50 // Mínimo de votos para considerar la película
  );
}

/**
 * Construye metadata adicional para embeddings (Fase 3)
 */
export function buildMovieMetadataForRAG(movie: TMDBMovie | TMDBMovieDetail): string {
  const detail = movie as TMDBMovieDetail;

  const parts: string[] = [
    `Title: ${movie.title}`,
    `Overview: ${movie.overview}`,
    `Release Date: ${movie.release_date || 'Unknown'}`,
    `Rating: ${movie.vote_average}/10`
  ];

  if (detail.genres) {
    parts.push(`Genres: ${detail.genres.map(g => g.name).join(', ')}`);
  }

  if (detail.tagline) {
    parts.push(`Tagline: ${detail.tagline}`);
  }

  return parts.join('\n');
}