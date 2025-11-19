/**
 * UserDataLocalDataSource
 * Accesses user data (matches and ratings) from localStorage
 */

import type { MovieDTO, UserRatingDTO } from '../types';

/**
 * Data source for accessing user data from localStorage
 */
export class UserDataLocalDataSource {
  private readonly MATCHES_KEY = 'film_match_matches';
  private readonly RATINGS_KEY = 'film_match_ratings';

  /**
   * Checks if localStorage is available
   *
   * @returns true if localStorage is accessible
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      console.warn('localStorage is not available');
      return false;
    }
  }

  /**
   * Loads all matched movies from storage
   *
   * @returns Promise resolving to array of matched MovieDTOs
   */
  async loadMatches(): Promise<MovieDTO[]> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return [];
      }

      const data = localStorage.getItem(this.MATCHES_KEY);
      if (!data) {
        return [];
      }

      const matches = JSON.parse(data) as MovieDTO[];
      return Array.isArray(matches) ? matches : [];
    } catch (error) {
      console.error('Failed to load matches from localStorage:', error);
      return [];
    }
  }

  /**
   * Saves matched movies to storage
   *
   * @param matches - Array of matched MovieDTOs
   * @returns Promise resolving when save completes
   */
  async saveMatches(matches: MovieDTO[]): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('localStorage is not available');
      }

      localStorage.setItem(this.MATCHES_KEY, JSON.stringify(matches));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Loads all ratings from storage
   *
   * @returns Promise resolving to array of UserRatingDTOs
   */
  async loadRatings(): Promise<UserRatingDTO[]> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return [];
      }

      const data = localStorage.getItem(this.RATINGS_KEY);
      if (!data) {
        return [];
      }

      const ratings = JSON.parse(data) as UserRatingDTO[];
      return Array.isArray(ratings) ? ratings : [];
    } catch (error) {
      console.error('Failed to load ratings from localStorage:', error);
      return [];
    }
  }

  /**
   * Saves ratings to storage
   *
   * @param ratings - Array of UserRatingDTOs
   * @returns Promise resolving when save completes
   */
  async saveRatings(ratings: UserRatingDTO[]): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('localStorage is not available');
      }

      localStorage.setItem(this.RATINGS_KEY, JSON.stringify(ratings));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save ratings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears all user data from storage
   *
   * @returns Promise resolving when clear completes
   */
  async clearAll(): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return;
      }

      localStorage.removeItem(this.MATCHES_KEY);
      localStorage.removeItem(this.RATINGS_KEY);
    } catch (error) {
      throw new Error(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets storage statistics
   *
   * @returns Object with storage info
   */
  async getStorageInfo(): Promise<{
    matchesCount: number;
    ratingsCount: number;
    storageSize: number;
  }> {
    try {
      const matches = await this.loadMatches();
      const ratings = await this.loadRatings();

      const matchesJson = JSON.stringify(matches);
      const ratingsJson = JSON.stringify(ratings);
      const storageSize = matchesJson.length + ratingsJson.length;

      return {
        matchesCount: matches.length,
        ratingsCount: ratings.length,
        storageSize,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        matchesCount: 0,
        ratingsCount: 0,
        storageSize: 0,
      };
    }
  }
}
