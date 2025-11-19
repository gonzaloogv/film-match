/**
 * Domain Layer Exports
 * Clean Architecture: Pure business logic and entities
 */

// Entities
export { Movie, UserRating, MovieFilter } from './entities';
export type { MovieFilterCriteria } from './entities';

// Repository Interfaces
export type { IMovieRepository, IUserDataRepository } from './repositories';

// Use Cases
export { FilterMoviesUseCase, AddMovieMatchUseCase, RateMovieUseCase } from './useCases';

// Errors
export * from './errors';

// Services
export { ErrorClassifier } from './services';
