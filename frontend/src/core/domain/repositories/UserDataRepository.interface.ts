/**
 * UserDataRepository Interface
 * Defines contract for accessing user data (matches and ratings)
 * Abstracts persistence implementation
 */

import type { Movie, UserRating } from '../entities';

/**
 * Repository interface for user-specific data
 * Manages user matches and ratings
 */
export interface IUserDataRepository {
  /**
   * Retrieves all movies the user has matched
   *
   * @returns Promise resolving to array of matched movies
   *
   * @example
   * ```typescript
   * const matches = await userDataRepository.getMatches();
   * ```
   */
  getMatches(): Promise<Movie[]>;

  /**
   * Adds a movie to user's matches
   *
   * @param movie - Movie to match
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await userDataRepository.addMatch(movie);
   * ```
   */
  addMatch(movie: Movie): Promise<void>;

  /**
   * Removes a movie from user's matches
   *
   * @param movieId - ID of movie to remove
   * @returns Promise resolving when operation completes
   * @throws Error if movie is not in matches
   *
   * @example
   * ```typescript
   * await userDataRepository.removeMatch(1);
   * ```
   */
  removeMatch(movieId: number): Promise<void>;

  /**
   * Checks if a movie is in user's matches
   *
   * @param movieId - Movie ID to check
   * @returns Promise resolving to true if movie is matched
   *
   * @example
   * ```typescript
   * const isMatched = await userDataRepository.isMatched(1);
   * ```
   */
  isMatched(movieId: number): Promise<boolean>;

  /**
   * Clears all user matches
   *
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await userDataRepository.clearMatches();
   * ```
   */
  clearMatches(): Promise<void>;

  /**
   * Retrieves all user ratings
   *
   * @returns Promise resolving to array of ratings
   *
   * @example
   * ```typescript
   * const ratings = await userDataRepository.getRatings();
   * ```
   */
  getRatings(): Promise<UserRating[]>;

  /**
   * Adds or updates a rating for a movie
   *
   * @param rating - UserRating entity to save
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * const rating = UserRating.create({
   *   movieId: 1,
   *   rating: 4,
   *   comment: 'Great movie!'
   * });
   * await userDataRepository.addRating(rating);
   * ```
   */
  addRating(rating: UserRating): Promise<void>;

  /**
   * Removes a rating for a movie
   *
   * @param movieId - Movie ID to remove rating for
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await userDataRepository.removeRating(1);
   * ```
   */
  removeRating(movieId: number): Promise<void>;

  /**
   * Retrieves rating for a specific movie
   *
   * @param movieId - Movie ID to get rating for
   * @returns Promise resolving to UserRating or null if not rated
   *
   * @example
   * ```typescript
   * const rating = await userDataRepository.getRatingForMovie(1);
   * if (rating) {
   *   console.log(rating.toString());
   * }
   * ```
   */
  getRatingForMovie(movieId: number): Promise<UserRating | null>;

  /**
   * Checks if a movie has been rated
   *
   * @param movieId - Movie ID to check
   * @returns Promise resolving to true if movie has been rated
   *
   * @example
   * ```typescript
   * const hasRating = await userDataRepository.hasRating(1);
   * ```
   */
  hasRating(movieId: number): Promise<boolean>;

  /**
   * Gets average rating across all movies
   *
   * @returns Promise resolving to average rating or 0 if no ratings
   *
   * @example
   * ```typescript
   * const avg = await userDataRepository.getAverageRating();
   * ```
   */
  getAverageRating(): Promise<number>;

  /**
   * Gets count of ratings
   *
   * @returns Promise resolving to number of ratings
   *
   * @example
   * ```typescript
   * const count = await userDataRepository.getRatingCount();
   * ```
   */
  getRatingCount(): Promise<number>;

  /**
   * Exports all user data as JSON
   *
   * @returns Promise resolving to object containing matches and ratings
   *
   * @example
   * ```typescript
   * const data = await userDataRepository.exportData();
   * ```
   */
  exportData(): Promise<{ matches: Movie[]; ratings: UserRating[] }>;

  /**
   * Imports user data from JSON
   *
   * @param data - Object containing matches and ratings
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await userDataRepository.importData({
   *   matches: [...],
   *   ratings: [...]
   * });
   * ```
   */
  importData(data: { matches: Movie[]; ratings: UserRating[] }): Promise<void>;

  /**
   * Clears all user data (matches and ratings)
   *
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await userDataRepository.clearAll();
   * ```
   */
  clearAll(): Promise<void>;
}
