/**
 * Use Case Providers
 * Factory functions for creating and configuring use case instances
 * Use cases depend on repositories, so they're created with repository dependencies
 */

import {
  FilterMoviesUseCase,
  AddMovieMatchUseCase,
  RateMovieUseCase,
} from '../../domain/useCases';
import type { IUserDataRepository } from '../../domain/repositories';

/**
 * Creates a FilterMoviesUseCase instance
 * Depends on: None (stateless use case)
 *
 * Business Logic:
 * - Filters movies by various criteria (genre, year, rating, search)
 * - Provides statistics about filtered results
 * - Supports grouping and sorting of results
 *
 * @returns New instance of FilterMoviesUseCase
 *
 * @example
 * ```typescript
 * const useCase = provideFilterMoviesUseCase();
 * const filtered = useCase.execute(movies, filter);
 * ```
 */
export function provideFilterMoviesUseCase(): FilterMoviesUseCase {
  return new FilterMoviesUseCase();
}

/**
 * Creates an AddMovieMatchUseCase instance
 * Depends on: IUserDataRepository
 *
 * Business Logic:
 * - Adds/removes movies from user's matches
 * - Validates movies exist before adding
 * - Prevents duplicate matches
 * - Manages match persistence
 *
 * @param userDataRepository - The repository for user data operations
 * @returns New instance of AddMovieMatchUseCase
 *
 * @example
 * ```typescript
 * const userRepo = container.get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
 * const useCase = provideAddMovieMatchUseCase(userRepo);
 * await useCase.execute(movie);
 * ```
 */
export function provideAddMovieMatchUseCase(
  userDataRepository: IUserDataRepository
): AddMovieMatchUseCase {
  return new AddMovieMatchUseCase(userDataRepository);
}

/**
 * Creates a RateMovieUseCase instance
 * Depends on: IUserDataRepository
 *
 * Business Logic:
 * - Adds/updates movie ratings from user
 * - Validates ratings are within valid range (1-5)
 * - Stores comments alongside ratings
 * - Calculates rating statistics
 *
 * @param userDataRepository - The repository for user data operations
 * @returns New instance of RateMovieUseCase
 *
 * @example
 * ```typescript
 * const userRepo = container.get<IUserDataRepository>(DI_TOKENS.USER_DATA_REPOSITORY);
 * const useCase = provideRateMovieUseCase(userRepo);
 * await useCase.execute(rating);
 * ```
 */
export function provideRateMovieUseCase(
  userDataRepository: IUserDataRepository
): RateMovieUseCase {
  return new RateMovieUseCase(userDataRepository);
}
