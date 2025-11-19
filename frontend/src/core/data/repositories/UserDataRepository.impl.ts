/**
 * UserDataRepository Implementation
 * Implements IUserDataRepository using UserDataLocalDataSource
 */

import { Movie, UserRating } from '../../domain/entities';
import type { IUserDataRepository } from '../../domain/repositories';
import { UserDataLocalDataSource } from '../dataSources';
import { MovieMapper, UserRatingMapper } from '../mappers';

/**
 * Concrete implementation of IUserDataRepository
 * Uses localStorage as persistence layer for user data
 */
export class UserDataRepositoryImpl implements IUserDataRepository {
  /**
   * Creates an instance of UserDataRepositoryImpl
   *
   * @param dataSource - User data source
   */
  constructor(private readonly dataSource: UserDataLocalDataSource) {}

  // ============= MATCHES METHODS =============

  /**
   * Retrieves all matched movies
   */
  async getMatches(): Promise<Movie[]> {
    const matchDtos = await this.dataSource.loadMatches();
    return MovieMapper.toDomainCollection(matchDtos);
  }

  /**
   * Adds a movie to user's matches
   */
  async addMatch(movie: Movie): Promise<void> {
    const matches = await this.getMatches();
    const alreadyMatched = matches.some((m) => m.id === movie.id);

    if (!alreadyMatched) {
      matches.push(movie);
      const dtos = MovieMapper.toPersistenceCollection(matches);
      await this.dataSource.saveMatches(dtos);
    }
  }

  /**
   * Removes a movie from user's matches
   */
  async removeMatch(movieId: number): Promise<void> {
    const matches = await this.getMatches();
    const filtered = matches.filter((m) => m.id !== movieId);

    if (filtered.length < matches.length) {
      const dtos = MovieMapper.toPersistenceCollection(filtered);
      await this.dataSource.saveMatches(dtos);
    }
  }

  /**
   * Checks if a movie is in user's matches
   */
  async isMatched(movieId: number): Promise<boolean> {
    const matches = await this.getMatches();
    return matches.some((m) => m.id === movieId);
  }

  /**
   * Clears all user matches
   */
  async clearMatches(): Promise<void> {
    await this.dataSource.saveMatches([]);
  }

  // ============= RATINGS METHODS =============

  /**
   * Retrieves all user ratings
   */
  async getRatings(): Promise<UserRating[]> {
    const ratingDtos = await this.dataSource.loadRatings();
    return UserRatingMapper.toDomainCollection(ratingDtos);
  }

  /**
   * Adds or updates a rating for a movie
   */
  async addRating(rating: UserRating): Promise<void> {
    const ratings = await this.getRatings();
    const existingIndex = ratings.findIndex((r) => r.movieId === rating.movieId);

    if (existingIndex >= 0) {
      ratings[existingIndex] = rating;
    } else {
      ratings.push(rating);
    }

    const dtos = UserRatingMapper.toPersistenceCollection(ratings);
    await this.dataSource.saveRatings(dtos);
  }

  /**
   * Removes a rating for a movie
   */
  async removeRating(movieId: number): Promise<void> {
    const ratings = await this.getRatings();
    const filtered = ratings.filter((r) => r.movieId !== movieId);

    if (filtered.length < ratings.length) {
      const dtos = UserRatingMapper.toPersistenceCollection(filtered);
      await this.dataSource.saveRatings(dtos);
    }
  }

  /**
   * Retrieves rating for a specific movie
   */
  async getRatingForMovie(movieId: number): Promise<UserRating | null> {
    const ratings = await this.getRatings();
    const rating = ratings.find((r) => r.movieId === movieId);
    return rating || null;
  }

  /**
   * Checks if a movie has been rated
   */
  async hasRating(movieId: number): Promise<boolean> {
    const rating = await this.getRatingForMovie(movieId);
    return rating !== null;
  }

  /**
   * Gets average rating across all movies
   */
  async getAverageRating(): Promise<number> {
    const ratings = await this.getRatings();
    if (ratings.length === 0) {
      return 0;
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  /**
   * Gets count of ratings
   */
  async getRatingCount(): Promise<number> {
    const ratings = await this.getRatings();
    return ratings.length;
  }

  // ============= DATA MANAGEMENT METHODS =============

  /**
   * Exports all user data as JSON
   */
  async exportData(): Promise<{ matches: Movie[]; ratings: UserRating[] }> {
    const matches = await this.getMatches();
    const ratings = await this.getRatings();

    return {
      matches,
      ratings,
    };
  }

  /**
   * Imports user data from JSON
   */
  async importData(data: { matches: Movie[]; ratings: UserRating[] }): Promise<void> {
    if (!data || !Array.isArray(data.matches) || !Array.isArray(data.ratings)) {
      throw new Error('Invalid data format for import');
    }

    try {
      const matchDtos = MovieMapper.toPersistenceCollection(data.matches);
      const ratingDtos = UserRatingMapper.toPersistenceCollection(data.ratings);

      await this.dataSource.saveMatches(matchDtos);
      await this.dataSource.saveRatings(ratingDtos);
    } catch (error) {
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears all user data (matches and ratings)
   */
  async clearAll(): Promise<void> {
    await this.dataSource.clearAll();
  }
}
