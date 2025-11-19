/**
 * Movie Mapper
 * Transforms backend MovieDTO to frontend Movie entity
 * Handles field name mismatches and type conversions
 */

import type { MovieDTO } from '@/api/types';
import { Movie } from '@/core/domain/entities';

export class MovieMapper {
  /**
   * Map MovieDTO from backend to Movie entity for frontend
   *
   * Transformations:
   * - releaseDate (DateTime) → year (number)
   * - categories (object[]) → genres (string[])
   * - voteAverage (Decimal) → rating (number)
   * - posterPath → poster
   * - Missing fields use defaults: director, cast, duration
   *
   * @param dto - MovieDTO from backend
   * @returns Movie entity ready for frontend use
   * @throws Error if required fields are missing or invalid
   */
  static toDomain(dto: MovieDTO): Movie {
    // Extract year from releaseDate
    let year = new Date().getFullYear(); // Default to current year
    if (dto.releaseDate) {
      year = new Date(dto.releaseDate).getFullYear();
    }

    // Extract genres from categories
    const genres: string[] = (dto.categories || [])
      .map(cat => cat.category.name)
      .filter(Boolean); // Remove empty values

    // Default genres if none provided
    if (genres.length === 0) {
      genres.push('Unknown');
    }

    // Convert voteAverage to number
    const rating = dto.voteAverage ? Number(dto.voteAverage) : 0;

    // Build poster URL
    // posterPath from backend is a TMDB relative path (e.g., "/w500/abcd1234.jpg")
    // Convert to full TMDB URL for display
    const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
    const FALLBACK_POSTER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 500 750%22%3E%3Crect fill=%22%23333%22 width=%22500%22 height=%22750%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2240%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E';

    let poster = FALLBACK_POSTER;
    if (dto.posterPath && dto.posterPath.trim() !== '') {
      // If it's already a full URL, use it; otherwise prepend TMDB base URL
      if (dto.posterPath.startsWith('http')) {
        poster = dto.posterPath;
      } else {
        poster = `${TMDB_IMAGE_BASE}${dto.posterPath}`;
      }
    }

    // Create Movie entity with required fields
    // Using defaults for director, cast, duration since backend doesn't provide them
    const movieData = {
      id: dto.id,
      title: dto.title,
      year,
      genres,
      duration: 'N/A', // Backend doesn't provide this
      rating,
      overview: dto.overview || '',
      director: 'N/A', // Backend doesn't provide this
      cast: [], // Backend doesn't provide this
      poster,
    };

    return Movie.create(movieData);
  }

  /**
   * Map array of MovieDTOs to Movie entities
   *
   * @param dtos - Array of MovieDTOs from backend
   * @returns Array of Movie entities
   */
  static toDomainArray(dtos: MovieDTO[]): Movie[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}