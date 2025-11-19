/**
 * MovieMapper
 * Converts between MovieDTO and Movie entity
 */

import { Movie } from '../../domain/entities';
import type { MovieDTO } from '../types';

/**
 * Maps Movie entity to/from MovieDTO
 */
export class MovieMapper {
  /**
   * Converts MovieDTO to Movie entity
   *
   * @param dto - Movie data transfer object
   * @returns Movie entity instance
   * @throws Error if DTO is invalid
   */
  static toDomain(dto: MovieDTO): Movie {
    return Movie.create({
      id: dto.id,
      title: dto.title,
      year: dto.year,
      genres: dto.genres,
      duration: dto.duration,
      rating: dto.rating,
      overview: dto.overview,
      director: dto.director,
      cast: dto.cast,
      poster: dto.poster,
    });
  }

  /**
   * Converts Movie entity to MovieDTO
   *
   * @param entity - Movie entity
   * @returns Movie data transfer object
   */
  static toPersistence(entity: Movie): MovieDTO {
    return {
      id: entity.id,
      title: entity.title,
      year: entity.year,
      genres: entity.genres,
      duration: entity.duration,
      rating: entity.rating,
      overview: entity.overview,
      director: entity.director,
      cast: entity.cast,
      poster: entity.poster,
    };
  }

  /**
   * Converts array of DTOs to Movie entities
   *
   * @param dtos - Array of movie DTOs
   * @returns Array of Movie entities
   */
  static toDomainCollection(dtos: MovieDTO[]): Movie[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  /**
   * Converts array of entities to DTOs
   *
   * @param entities - Array of Movie entities
   * @returns Array of movie DTOs
   */
  static toPersistenceCollection(entities: Movie[]): MovieDTO[] {
    return entities.map((entity) => this.toPersistence(entity));
  }
}
