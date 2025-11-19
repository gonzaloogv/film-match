/**
 * Core Layer Exports
 * Clean Architecture: Domain, Data, Infrastructure, and DI layers
 */

// Domain Layer
export {
  Movie,
  UserRating,
  MovieFilter,
  FilterMoviesUseCase,
  AddMovieMatchUseCase,
  RateMovieUseCase,
  ErrorClassifier,
} from './domain';
export type { IMovieRepository, IUserDataRepository, MovieFilterCriteria } from './domain';

// Domain - Errors
export * from './domain/errors';

// Data Layer
export {
  MovieRepositoryImpl,
  UserDataRepositoryImpl,
  MovieMapper,
  UserRatingMapper,
  MovieLocalDataSource,
  UserDataLocalDataSource,
} from './data';
export type { MovieDTO, UserRatingDTO, UserDataDTO } from './data';

// Infrastructure Layer
export { errorLogger, ConsoleErrorLogger } from './infrastructure';
export type { IErrorLogger, LogEntry } from './infrastructure';

// Dependency Injection Layer
export {
  DIContainer,
  diContainer,
  setupDIContainer,
  DI_TOKENS,
  provideMovieLocalDataSource,
  provideUserDataLocalDataSource,
  provideMovieRepository,
  provideUserDataRepository,
  provideFilterMoviesUseCase,
  provideAddMovieMatchUseCase,
  provideRateMovieUseCase,
} from './di';
export type { DIToken, IServiceContainer } from './di';
