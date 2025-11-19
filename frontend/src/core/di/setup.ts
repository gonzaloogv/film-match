/**
 * DI Container Setup
 * Initializes and configures the dependency injection container
 * This is the central place where all dependencies are registered
 */

import { DIContainer } from './container';
import { DI_TOKENS } from './types';
import {
  provideMovieLocalDataSource,
  provideUserDataLocalDataSource,
  provideMovieRepository,
  provideUserDataRepository,
  provideFilterMoviesUseCase,
  provideAddMovieMatchUseCase,
  provideRateMovieUseCase,
} from './providers';
import { MovieLocalDataSource, UserDataLocalDataSource } from '../data/dataSources';
import type { IUserDataRepository } from '../domain/repositories';

/**
 * Initializes the dependency injection container with all application services
 *
 * Registration Order:
 * 1. Data Sources (leaf nodes, no dependencies)
 * 2. Repositories (depend on data sources)
 * 3. Use Cases (depend on repositories)
 *
 * @param container - The DI container to configure
 *
 * @example
 * ```typescript
 * const container = new DIContainer();
 * setupDIContainer(container);
 *
 * // Now you can resolve services
 * const movieRepo = container.get<IMovieRepository>(
 *   DI_TOKENS.MOVIE_REPOSITORY
 * );
 * ```
 */
export function setupDIContainer(container: DIContainer): void {
  // ============= DATA SOURCES =============
  // Register data sources first (they have no dependencies)

  container.register(DI_TOKENS.MOVIE_LOCAL_DATA_SOURCE, () =>
    provideMovieLocalDataSource()
  );

  container.register(DI_TOKENS.USER_DATA_LOCAL_DATA_SOURCE, () =>
    provideUserDataLocalDataSource()
  );

  // ============= REPOSITORIES =============
  // Register repositories after data sources (they depend on data sources)

  container.register(DI_TOKENS.MOVIE_REPOSITORY, () => {
    const dataSource = container.get<MovieLocalDataSource>(
      DI_TOKENS.MOVIE_LOCAL_DATA_SOURCE
    );
    return provideMovieRepository(dataSource);
  });

  container.register(DI_TOKENS.USER_DATA_REPOSITORY, () => {
    const dataSource = container.get<UserDataLocalDataSource>(
      DI_TOKENS.USER_DATA_LOCAL_DATA_SOURCE
    );
    return provideUserDataRepository(dataSource);
  });

  // ============= USE CASES =============
  // Register use cases after repositories (they depend on repositories)

  container.register(DI_TOKENS.FILTER_MOVIES_USE_CASE, () => {
    return provideFilterMoviesUseCase();
  });

  container.register(DI_TOKENS.ADD_MOVIE_MATCH_USE_CASE, () => {
    const userDataRepo = container.get<IUserDataRepository>(
      DI_TOKENS.USER_DATA_REPOSITORY
    );
    return provideAddMovieMatchUseCase(userDataRepo);
  });

  container.register(DI_TOKENS.RATE_MOVIE_USE_CASE, () => {
    const userDataRepo = container.get<IUserDataRepository>(
      DI_TOKENS.USER_DATA_REPOSITORY
    );
    return provideRateMovieUseCase(userDataRepo);
  });

  console.log(
    `✅ DI Container initialized with ${container.getServiceCount()} services`
  );
}
