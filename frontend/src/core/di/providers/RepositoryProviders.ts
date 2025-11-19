/**
 * Repository Providers
 * Factory functions for creating and configuring repository instances
 * Repositories depend on data sources, so they're created with data source dependencies
 */

import { MovieRepositoryImpl, UserDataRepositoryImpl } from '../../data/repositories';
import { MovieLocalDataSource, UserDataLocalDataSource } from '../../data/dataSources';

/**
 * Creates a MovieRepositoryImpl instance
 * Implements IMovieRepository interface
 * Depends on: MovieLocalDataSource
 *
 * @param movieDataSource - The data source for movie operations
 * @returns New instance of MovieRepositoryImpl
 *
 * @example
 * ```typescript
 * const dataSource = container.get<MovieLocalDataSource>(
 *   DI_TOKENS.MOVIE_LOCAL_DATA_SOURCE
 * );
 * const repo = provideMovieRepository(dataSource);
 * ```
 */
export function provideMovieRepository(
  movieDataSource: MovieLocalDataSource
): MovieRepositoryImpl {
  return new MovieRepositoryImpl(movieDataSource);
}

/**
 * Creates a UserDataRepositoryImpl instance
 * Implements IUserDataRepository interface
 * Depends on: UserDataLocalDataSource
 *
 * @param userDataSource - The data source for user data operations
 * @returns New instance of UserDataRepositoryImpl
 *
 * @example
 * ```typescript
 * const dataSource = container.get<UserDataLocalDataSource>(
 *   DI_TOKENS.USER_DATA_LOCAL_DATA_SOURCE
 * );
 * const repo = provideUserDataRepository(dataSource);
 * ```
 */
export function provideUserDataRepository(
  userDataSource: UserDataLocalDataSource
): UserDataRepositoryImpl {
  return new UserDataRepositoryImpl(userDataSource);
}
