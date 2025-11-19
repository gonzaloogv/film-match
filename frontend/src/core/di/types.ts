/**
 * Dependency Injection Token Types
 * Defines all DI tokens for service registration and resolution
 */

/**
 * DI Tokens for all services in the application
 * Used as keys for registering and resolving dependencies
 */
export const DI_TOKENS = {
  // Data Sources
  MOVIE_LOCAL_DATA_SOURCE: 'MovieLocalDataSource',
  USER_DATA_LOCAL_DATA_SOURCE: 'UserDataLocalDataSource',

  // Repositories
  MOVIE_REPOSITORY: 'IMovieRepository',
  USER_DATA_REPOSITORY: 'IUserDataRepository',

  // Use Cases
  FILTER_MOVIES_USE_CASE: 'FilterMoviesUseCase',
  ADD_MOVIE_MATCH_USE_CASE: 'AddMovieMatchUseCase',
  RATE_MOVIE_USE_CASE: 'RateMovieUseCase',
} as const;

/**
 * Type for DI Token keys
 */
export type DIToken = (typeof DI_TOKENS)[keyof typeof DI_TOKENS];

/**
 * Service container type
 */
export interface IServiceContainer {
  register<T>(token: DIToken, factory: () => T): void;
  get<T>(token: DIToken): T;
  has(token: DIToken): boolean;
  clear(): void;
}
