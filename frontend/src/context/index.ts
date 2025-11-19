/**
 * Context Exports
 * Central export point for all context providers and hooks
 */

// AppProvider
export { AppProvider } from './AppProvider';

// User Context
export { UserContext, initialUserState } from './user/UserContext';
export { UserProvider } from './user/UserProvider';
export { useUserContext } from './user/useUserContext';
export type { UserProfile, UserState, UserActions, UserContextValue } from './user/UserContext';

// Movies Context
export { MoviesContext, initialMoviesState } from './movies/MoviesContext';
export { MoviesProvider } from './movies/MoviesProvider';
export { useMoviesContext } from './movies/useMoviesContext';
export type { MoviesState, MoviesActions, MoviesContextValue } from './movies/MoviesContext';

// Filters Context
export { FiltersContext, initialFiltersState, defaultCriteria } from './filters/FiltersContext';
export { FiltersProvider } from './filters/FiltersProvider';
export { useFiltersContext } from './filters/useFiltersContext';
export type { FiltersState, FiltersActions, FiltersContextValue } from './filters/FiltersContext';

// Matches Context
export { MatchesContext, initialMatchesState } from './matches/MatchesContext';
export { MatchesProvider } from './matches/MatchesProvider';
export { useMatchesContext } from './matches/useMatchesContext';
export type { MatchesState, MatchesActions, MatchesContextValue } from './matches/MatchesContext';

// Ratings Context
export { RatingsContext, initialRatingsState } from './ratings/RatingsContext';
export { RatingsProvider } from './ratings/RatingsProvider';
export { useRatingsContext } from './ratings/useRatingsContext';
export type { RatingsState, RatingsActions, RatingsContextValue } from './ratings/RatingsContext';

// UI Context
export { UIContext, initialUIState } from './ui/UIContext';
export { UIProvider } from './ui/UIProvider';
export { useUIContext } from './ui/useUIContext';
export type { UIState, UIActions, UIContextValue, Notification } from './ui/UIContext';
