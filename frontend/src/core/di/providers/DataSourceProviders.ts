/**
 * Data Source Providers
 * Factory functions for creating and configuring data source instances
 */

import { MovieLocalDataSource, UserDataLocalDataSource } from '../../data/dataSources';

/**
 * Creates a MovieLocalDataSource instance
 * Responsible for loading movies from movies.json with caching
 *
 * @returns New instance of MovieLocalDataSource
 *
 * @example
 * ```typescript
 * container.register(
 *   DI_TOKENS.MOVIE_LOCAL_DATA_SOURCE,
 *   provideMovieLocalDataSource
 * );
 * ```
 */
export function provideMovieLocalDataSource(): MovieLocalDataSource {
  return new MovieLocalDataSource();
}

/**
 * Creates a UserDataLocalDataSource instance
 * Responsible for managing user data in localStorage (matches and ratings)
 *
 * @returns New instance of UserDataLocalDataSource
 *
 * @example
 * ```typescript
 * container.register(
 *   DI_TOKENS.USER_DATA_LOCAL_DATA_SOURCE,
 *   provideUserDataLocalDataSource
 * );
 * ```
 */
export function provideUserDataLocalDataSource(): UserDataLocalDataSource {
  return new UserDataLocalDataSource();
}
