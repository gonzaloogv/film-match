/**
 * Dependency Injection Layer Exports
 * Central export point for DI container, types, and setup
 */

// Container and Setup
export { DIContainer, diContainer } from './container';
export { setupDIContainer } from './setup';

// Types and Tokens
export { DI_TOKENS } from './types';
export type { DIToken, IServiceContainer } from './types';

// Providers
export {
  provideMovieLocalDataSource,
  provideUserDataLocalDataSource,
  provideMovieRepository,
  provideUserDataRepository,
  provideFilterMoviesUseCase,
  provideAddMovieMatchUseCase,
  provideRateMovieUseCase,
} from './providers';
