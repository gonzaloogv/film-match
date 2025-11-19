/**
 * AddMovieMatch Use Case
 * Handles adding a movie to user's matches
 */

import type { Movie } from '../entities';
import type { IUserDataRepository } from '../repositories';

/**
 * Use case for adding a movie to user's matches
 */
export class AddMovieMatchUseCase {
  /**
   * Creates an instance of AddMovieMatchUseCase
   *
   * @param userDataRepository - Repository for user data persistence
   */
  constructor(private readonly userDataRepository: IUserDataRepository) {}

  /**
   * Adds a movie to user's matches
   *
   * @param movie - Movie to add to matches
   * @returns Promise resolving when operation completes
   * @throws Error if movie is null or invalid
   *
   * @example
   * ```typescript
   * const repository = new UserDataRepositoryImpl();
   * const useCase = new AddMovieMatchUseCase(repository);
   *
   * const movie = Movie.create({...});
   * await useCase.execute(movie);
   * ```
   */
  async execute(movie: Movie): Promise<void> {
    this.validateInput(movie);
    await this.userDataRepository.addMatch(movie);
  }

  /**
   * Adds multiple movies to matches
   *
   * @param movies - Array of movies to add
   * @returns Promise resolving when all operations complete
   *
   * @example
   * ```typescript
   * await useCase.executeMultiple(movieList);
   * ```
   */
  async executeMultiple(movies: Movie[]): Promise<void> {
    if (!movies || movies.length === 0) {
      return;
    }

    movies.forEach((movie) => this.validateInput(movie));

    const promises = movies.map((movie) => this.userDataRepository.addMatch(movie));
    await Promise.all(promises);
  }

  /**
   * Toggles a movie match (adds if not present, removes if present)
   *
   * @param movie - Movie to toggle
   * @returns Promise resolving to true if added, false if removed
   *
   * @example
   * ```typescript
   * const wasAdded = await useCase.toggle(movie);
   * ```
   */
  async toggle(movie: Movie): Promise<boolean> {
    this.validateInput(movie);

    const isMatched = await this.userDataRepository.isMatched(movie.id);

    if (isMatched) {
      await this.userDataRepository.removeMatch(movie.id);
      return false;
    } else {
      await this.userDataRepository.addMatch(movie);
      return true;
    }
  }

  /**
   * Checks if a movie is already matched
   *
   * @param movieId - ID of movie to check
   * @returns Promise resolving to true if already matched
   *
   * @example
   * ```typescript
   * const isMatched = await useCase.isMatched(movieId);
   * ```
   */
  async isMatched(movieId: number): Promise<boolean> {
    return this.userDataRepository.isMatched(movieId);
  }

  /**
   * Gets all user matches
   *
   * @returns Promise resolving to array of matched movies
   *
   * @example
   * ```typescript
   * const matches = await useCase.getMatches();
   * ```
   */
  async getMatches(): Promise<Movie[]> {
    return this.userDataRepository.getMatches();
  }

  /**
   * Removes a match by movie ID
   *
   * @param movieId - ID of movie to remove from matches
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await useCase.removeMatch(movieId);
   * ```
   */
  async removeMatch(movieId: number): Promise<void> {
    await this.userDataRepository.removeMatch(movieId);
  }

  /**
   * Clears all user matches
   *
   * @returns Promise resolving when operation completes
   *
   * @example
   * ```typescript
   * await useCase.clearAll();
   * ```
   */
  async clearAll(): Promise<void> {
    await this.userDataRepository.clearMatches();
  }

  /**
   * Gets count of matched movies
   *
   * @returns Promise resolving to number of matches
   *
   * @example
   * ```typescript
   * const count = await useCase.getMatchCount();
   * ```
   */
  async getMatchCount(): Promise<number> {
    const matches = await this.userDataRepository.getMatches();
    return matches.length;
  }

  /**
   * Validates input movie
   *
   * @param movie - Movie to validate
   * @throws Error if movie is invalid
   */
  private validateInput(movie: Movie): void {
    if (!movie) {
      throw new Error('Movie is required');
    }

    if (movie.id <= 0) {
      throw new Error('Movie ID must be valid');
    }

    if (!movie.title || movie.title.trim().length === 0) {
      throw new Error('Movie must have a valid title');
    }
  }
}
