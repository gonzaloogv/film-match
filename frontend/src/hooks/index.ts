/**
 * Hooks Layer Exports
 * Central export point for all custom hooks
 *
 * Custom hooks provide a React-friendly interface to the DI container
 * and business logic from the domain and data layers
 */

// Base hook for DI container access
export { useDIContainer } from './useDIContainer';

// Movie repository hook
export { useMovieRepository } from './useMovieRepository';

// User data hooks
export { useMovieMatches } from './useMovieMatches';
export { useMovieRatings } from './useMovieRatings';

// Search hook
export { useMovieSearch } from './useMovieSearch';

// Statistics hook
export { useMovieStats } from './useMovieStats';

// Filtering hook
export { useFilterMovies } from './useFilterMovies';
