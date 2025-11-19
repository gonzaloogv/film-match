/**
 * MovieRepository Implementation
 * Implements IMovieRepository using MovieLocalDataSource
 */

import { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MovieLocalDataSource } from '../dataSources';
import { MovieMapper } from '../mappers';

/**
 * Concrete implementation of IMovieRepository
 * Uses local data source (JSON file) as movie database
 */
export class MovieRepositoryImpl implements IMovieRepository {
  /**
   * Creates an instance of MovieRepositoryImpl
   *
   * @param dataSource - Movie data source
   */
  constructor(private readonly dataSource: MovieLocalDataSource) {}

  /**
   * Retrieves all available movies
   */
  async getAll(): Promise<Movie[]> {
    const dtos = await this.dataSource.getAll();
    return MovieMapper.toDomainCollection(dtos);
  }

  /**
   * Retrieves a single movie by ID
   */
  async getById(id: number): Promise<Movie | null> {
    if (id <= 0) {
      return null;
    }

    const dto = await this.dataSource.getById(id);
    return dto ? MovieMapper.toDomain(dto) : null;
  }

  /**
   * Searches movies by query
   */
  async search(query: string): Promise<Movie[]> {
    if (!query || query.trim().length === 0) {
      return this.getAll();
    }

    const dtos = await this.dataSource.search(query);
    return MovieMapper.toDomainCollection(dtos);
  }

  /**
   * Retrieves movies by genre
   */
  async getByGenre(genre: string): Promise<Movie[]> {
    if (!genre || genre.trim().length === 0) {
      return [];
    }

    const allMovies = await this.getAll();
    return allMovies.filter((movie) => movie.genres.includes(genre));
  }

  /**
   * Retrieves movies from a specific year
   */
  async getByYear(year: number): Promise<Movie[]> {
    const allMovies = await this.getAll();
    return allMovies.filter((movie) => movie.year === year);
  }

  /**
   * Retrieves movies by director
   */
  async getByDirector(director: string): Promise<Movie[]> {
    if (!director || director.trim().length === 0) {
      return [];
    }

    const directorLower = director.toLowerCase();
    const allMovies = await this.getAll();
    return allMovies.filter((movie) => movie.director.toLowerCase().includes(directorLower));
  }

  /**
   * Retrieves top-rated movies
   */
  async getTopRated(limit: number, minRating: number = 0): Promise<Movie[]> {
    if (limit <= 0) {
      return [];
    }

    const allMovies = await this.getAll();
    return allMovies
      .filter((movie) => movie.rating >= minRating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Retrieves movies by rating range
   */
  async getByRatingRange(minRating: number, maxRating: number): Promise<Movie[]> {
    if (minRating < 0 || maxRating > 10 || minRating > maxRating) {
      return [];
    }

    const allMovies = await this.getAll();
    return allMovies.filter((movie) => movie.rating >= minRating && movie.rating <= maxRating);
  }

  /**
   * Retrieves movies within a year range
   */
  async getByYearRange(startYear: number, endYear: number): Promise<Movie[]> {
    if (startYear < 1900 || endYear > 2100 || startYear > endYear) {
      return [];
    }

    const allMovies = await this.getAll();
    return allMovies.filter((movie) => movie.year >= startYear && movie.year <= endYear);
  }
}
