/**
 * RateMovie Use Case
 * Handles adding and updating movie ratings
 */

import type { UserRating } from '../entities';
import type { IUserDataRepository } from '../repositories';

/**
 * Use case for rating movies
 */
export class RateMovieUseCase {
  /**
   * Creates an instance of RateMovieUseCase
   *
   * @param userDataRepository - Repository for user data persistence
   */
  constructor(private readonly userDataRepository: IUserDataRepository) {}

  /**
   * Rates a movie
   *
   * @param rating - UserRating entity to save
   * @returns Promise resolving when operation completes
   * @throws Error if rating is invalid
   *
   * @example
   * ```typescript
   * const repository = new UserDataRepositoryImpl();
   * const useCase = new RateMovieUseCase(repository);
   *
   * const rating = UserRating.create({
   *   movieId: 1,
   *   rating: 4,
   *   comment: 'Excellent movie!'
   * });
   * await useCase.execute(rating);
   * ```
   */
  async execute(rating: UserRating): Promise<void> {
    this.validateInput(rating);
    await this.userDataRepository.addRating(rating);
  }

  /**
   * Rates multiple movies
   *
   * @param ratings - Array of UserRating entities
   * @returns Promise resolving when all operations complete
   *
   * @example
   * ```typescript
   * await useCase.executeMultiple(ratingList);
   * ```
   */
  async executeMultiple(ratings: UserRating[]): Promise<void> {
    if (!ratings || ratings.length === 0) {
      return;
    }

    ratings.forEach((rating) => this.validateInput(rating));

    const promises = ratings.map((rating) => this.userDataRepository.addRating(rating));
    await Promise.all(promises);
  }

  /**
   * Gets rating for a specific movie
   *
   * @param movieId - ID of movie to get rating for
   * @returns Promise resolving to UserRating or null if not rated
   *
   * @example
   * ```typescript
   * const rating = await useCase.getRating(movieId);
   * if (rating) {
   *   console.log(`Rated ${rating.rating} stars`);
   * }
   * ```
   */
  async getRating(movieId: number): Promise<UserRating | null> {
    return this.userDataRepository.getRatingForMovie(movieId);
  }

  /**
   * Gets all user ratings
   *
   * @returns Promise resolving to array of UserRating entities
   *
   * @example
   * ```typescript
   * const allRatings = await useCase.getAllRatings();
   * ```
   */
  async getAllRatings(): Promise<UserRating[]> {
    return this.userDataRepository.getRatings();
  }

  /**
   * Updates a movie rating
   *
   * @param movieId - ID of movie to update
   * @param newRating - New rating value (0-5)
   * @param newComment - Optional new comment
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await useCase.updateRating(movieId, 5, 'Better on rewatch!');
   * ```
   */
  async updateRating(movieId: number, newRating: number, newComment?: string): Promise<void> {
    const existing = await this.userDataRepository.getRatingForMovie(movieId);

    if (!existing) {
      throw new Error(`No existing rating found for movie ${movieId}`);
    }

    const updatedRating = existing.update(newRating, newComment);
    await this.userDataRepository.addRating(updatedRating);
  }

  /**
   * Removes a rating
   *
   * @param movieId - ID of movie to remove rating for
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await useCase.removeRating(movieId);
   * ```
   */
  async removeRating(movieId: number): Promise<void> {
    await this.userDataRepository.removeRating(movieId);
  }

  /**
   * Checks if a movie has been rated
   *
   * @param movieId - Movie ID to check
   * @returns Promise resolving to true if movie has been rated
   *
   * @example
   * ```typescript
   * const hasRated = await useCase.hasRated(movieId);
   * ```
   */
  async hasRated(movieId: number): Promise<boolean> {
    return this.userDataRepository.hasRating(movieId);
  }

  /**
   * Gets average rating of all rated movies
   *
   * @returns Promise resolving to average rating (0-5)
   *
   * @example
   * ```typescript
   * const avg = await useCase.getAverageRating();
   * ```
   */
  async getAverageRating(): Promise<number> {
    return this.userDataRepository.getAverageRating();
  }

  /**
   * Gets count of rated movies
   *
   * @returns Promise resolving to number of ratings
   *
   * @example
   * ```typescript
   * const count = await useCase.getRatingCount();
   * ```
   */
  async getRatingCount(): Promise<number> {
    return this.userDataRepository.getRatingCount();
  }

  /**
   * Gets ratings statistics
   *
   * @returns Promise resolving to statistics object
   *
   * @example
   * ```typescript
   * const stats = await useCase.getStatistics();
   * console.log(stats.positiveCount); // Movies rated 4-5
   * ```
   */
  async getStatistics(): Promise<{
    totalCount: number;
    averageRating: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    withCommentCount: number;
  }> {
    const ratings = await this.userDataRepository.getRatings();

    const totalCount = ratings.length;
    const averageRating = totalCount > 0 ?
      Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10 : 0;

    const positiveCount = ratings.filter((r) => r.isPositive()).length;
    const neutralCount = ratings.filter((r) => r.isNeutral()).length;
    const negativeCount = ratings.filter((r) => r.isNegative()).length;
    const withCommentCount = ratings.filter((r) => r.hasComment()).length;

    return {
      totalCount,
      averageRating,
      positiveCount,
      neutralCount,
      negativeCount,
      withCommentCount,
    };
  }

  /**
   * Clears all ratings
   *
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await useCase.clearAll();
   * ```
   */
  async clearAll(): Promise<void> {
    const ratings = await this.userDataRepository.getRatings();
    const promises = ratings.map((r) => this.userDataRepository.removeRating(r.movieId));
    await Promise.all(promises);
  }

  /**
   * Validates input rating
   *
   * @param rating - Rating to validate
   * @throws Error if rating is invalid
   */
  private validateInput(rating: UserRating): void {
    if (!rating) {
      throw new Error('Rating is required');
    }

    if (!rating.isValid()) {
      throw new Error('Rating is invalid');
    }

    if (rating.movieId <= 0) {
      throw new Error('Movie ID must be valid');
    }
  }
}
