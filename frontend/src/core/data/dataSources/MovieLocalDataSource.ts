/**
 * MovieLocalDataSource
 *
 * DEPRECATED: This data source used mock data from movies.json
 * TODO: Replace with API-based data source or remove if no longer needed
 * For now, returns empty results to prevent build errors
 */

import type { MovieDTO } from '../types';

/**
 * Data source for accessing movie data from local file
 * DEPRECATED - Use API-based services instead
 */
export class MovieLocalDataSource {
  private moviesCache: MovieDTO[] | null = null;

  /**
   * Loads all movies from the data source
   * DEPRECATED - Returns empty array
   *
   * @returns Promise resolving to empty array
   */
  async getAll(): Promise<MovieDTO[]> {
    console.warn('MovieLocalDataSource.getAll() is deprecated. Use API-based services instead.');
    return [];
  }

  /**
   * Gets a single movie by ID
   * DEPRECATED - Returns null
   *
   * @param id - Movie ID
   * @returns Promise resolving to null
   */
  async getById(id: number): Promise<MovieDTO | null> {
    console.warn('MovieLocalDataSource.getById() is deprecated. Use API-based services instead.');
    return null;
  }

  /**
   * Searches movies by query
   * DEPRECATED - Returns empty array
   *
   * @param query - Search query
   * @returns Promise resolving to empty array
   */
  async search(query: string): Promise<MovieDTO[]> {
    console.warn('MovieLocalDataSource.search() is deprecated. Use API-based services instead.');
    return [];
  }

  /**
   * Clears the cache
   * DEPRECATED - No-op
   */
  clearCache(): void {
    // No-op
  }
}
