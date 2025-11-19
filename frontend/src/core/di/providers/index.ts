/**
 * Providers Index
 * Central export point for all provider functions
 * Providers are factory functions for creating service instances
 */

// Data Source Providers
export {
  provideMovieLocalDataSource,
  provideUserDataLocalDataSource,
} from './DataSourceProviders';

// Repository Providers
export { provideMovieRepository, provideUserDataRepository } from './RepositoryProviders';

// Use Case Providers
export {
  provideFilterMoviesUseCase,
  provideAddMovieMatchUseCase,
  provideRateMovieUseCase,
} from './UseCaseProviders';
