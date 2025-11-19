/**
 * MovieRepository Interface
 * Defines contract for accessing movie data
 * Abstracts data source implementation details
 */

import type { Movie } from '../entities';

/**
 * Repository interface for Movie entity
 * Provides methods to fetch and search movies
 */
export interface IMovieRepository {
  /**
   * Retrieves all available movies
   *
   * @returns Promise resolving to array of all movies
   *
   * @example
   * ```typescript
   * const movies = await movieRepository.getAll();
   * ```
   */
  getAll(): Promise<Movie[]>;

  /**
   * Retrieves a single movie by ID
   *
   * @param id - Movie ID to fetch
   * @returns Promise resolving to Movie or null if not found
   *
   * @example
   * ```typescript
   * const movie = await movieRepository.getById(1);
   * if (movie) {
   *   console.log(movie.title);
   * }
   * ```
   */
  getById(id: number): Promise<Movie | null>;

  /**
   * Searches movies by query string
   * Searches in title, director, cast, and overview
   *
   * @param query - Search query
   * @returns Promise resolving to array of matching movies
   *
   * @example
   * ```typescript
   * const results = await movieRepository.search('Inception');
   * ```
   */
  search(query: string): Promise<Movie[]>;

  /**
   * Retrieves movies by genre
   *
   * @param genre - Genre name
   * @returns Promise resolving to array of movies in that genre
   *
   * @example
   * ```typescript
   * const sciFiMovies = await movieRepository.getByGenre('Sci-Fi');
   * ```
   */
  getByGenre(genre: string): Promise<Movie[]>;

  /**
   * Retrieves movies from a specific year
   *
   * @param year - Year to filter by
   * @returns Promise resolving to array of movies from that year
   *
   * @example
   * ```typescript
   * const movies2023 = await movieRepository.getByYear(2023);
   * ```
   */
  getByYear(year: number): Promise<Movie[]>;

  /**
   * Retrieves movies by director
   *
   * @param director - Director name
   * @returns Promise resolving to array of movies by that director
   *
   * @example
   * ```typescript
   * const nolanFilms = await movieRepository.getByDirector('Christopher Nolan');
   * ```
   */
  getByDirector(director: string): Promise<Movie[]>;

  /**
   * Retrieves top-rated movies
   *
   * @param limit - Maximum number of movies to return
   * @param minRating - Minimum rating threshold (default 0)
   * @returns Promise resolving to array of top-rated movies
   *
   * @example
   * ```typescript
   * const topMovies = await movieRepository.getTopRated(10, 8);
   * ```
   */
  getTopRated(limit: number, minRating?: number): Promise<Movie[]>;

  /**
   * Retrieves movies within a rating range
   *
   * @param minRating - Minimum rating (inclusive)
   * @param maxRating - Maximum rating (inclusive)
   * @returns Promise resolving to matching movies
   *
   * @example
   * ```typescript
   * const good = await movieRepository.getByRatingRange(7, 10);
   * ```
   */
  getByRatingRange(minRating: number, maxRating: number): Promise<Movie[]>;

  /**
   * Retrieves movies released within a year range
   *
   * @param startYear - Start year (inclusive)
   * @param endYear - End year (inclusive)
   * @returns Promise resolving to matching movies
   *
   * @example
   * ```typescript
   * const recentMovies = await movieRepository.getByYearRange(2020, 2023);
   * ```
   */
  getByYearRange(startYear: number, endYear: number): Promise<Movie[]>;
}
