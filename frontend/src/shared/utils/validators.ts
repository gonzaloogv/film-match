/**
 * Validation Utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string, minLength: number = 6): boolean => {
  return password.length >= minLength;
};

export const isValidRating = (rating: number): boolean => {
  return rating >= 0 && rating <= 5 && Number.isInteger(rating);
};

export const isValidYear = (year: number, minYear: number = 1900, maxYear: number = 2100): boolean => {
  return year >= minYear && year <= maxYear && Number.isInteger(year);
};

export const isValidYearRange = (
  minYear: number,
  maxYear: number,
  globalMin: number = 1900,
  globalMax: number = 2100
): boolean => {
  return (
    minYear >= globalMin &&
    maxYear <= globalMax &&
    minYear <= maxYear &&
    Number.isInteger(minYear) &&
    Number.isInteger(maxYear)
  );
};

export const isValidMovieFilter = (
  search: string,
  genres: string[],
  yearRange: [number, number],
  minRating: number
): boolean => {
  return (
    typeof search === 'string' &&
    Array.isArray(genres) &&
    isValidYearRange(yearRange[0], yearRange[1]) &&
    isValidRating(minRating)
  );
};

export const isValidComment = (comment: string, minLength: number = 0, maxLength: number = 500): boolean => {
  return comment.length >= minLength && comment.length <= maxLength;
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};
