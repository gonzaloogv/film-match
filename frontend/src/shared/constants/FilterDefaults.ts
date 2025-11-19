/**
 * Default Filter Values
 * Single source of truth for filter defaults across the application
 */

import { MovieFilterCriteria } from '../types';

export const DEFAULT_FILTER_CRITERIA: Readonly<MovieFilterCriteria> = {
  search: '',
  genres: [],
  yearRange: [1970, 2025],
  minRating: 0,
} as const;

export const DEFAULT_YEAR_RANGE: Readonly<[number, number]> = [1970, 2025];

export const YEAR_RANGE_MIN = 1970;
export const YEAR_RANGE_MAX = 2025;
export const RATING_MIN = 0;
export const RATING_MAX = 5;
