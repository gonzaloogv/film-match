/**
 * UserRatingMapper
 * Converts between UserRatingDTO and UserRating entity
 */

import { UserRating } from '../../domain/entities';
import type { UserRatingDTO } from '../types';

/**
 * Maps UserRating entity to/from UserRatingDTO
 */
export class UserRatingMapper {
  /**
   * Converts UserRatingDTO to UserRating entity
   *
   * @param dto - User rating data transfer object
   * @returns UserRating entity instance
   * @throws Error if DTO is invalid
   */
  static toDomain(dto: UserRatingDTO): UserRating {
    return UserRating.create({
      movieId: dto.movieId,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: new Date(dto.createdAt),
    });
  }

  /**
   * Converts UserRating entity to UserRatingDTO
   *
   * @param entity - UserRating entity
   * @returns User rating data transfer object
   */
  static toPersistence(entity: UserRating): UserRatingDTO {
    return {
      movieId: entity.movieId,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  /**
   * Converts array of DTOs to UserRating entities
   *
   * @param dtos - Array of rating DTOs
   * @returns Array of UserRating entities
   */
  static toDomainCollection(dtos: UserRatingDTO[]): UserRating[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  /**
   * Converts array of entities to DTOs
   *
   * @param entities - Array of UserRating entities
   * @returns Array of rating DTOs
   */
  static toPersistenceCollection(entities: UserRating[]): UserRatingDTO[] {
    return entities.map((entity) => this.toPersistence(entity));
  }
}
