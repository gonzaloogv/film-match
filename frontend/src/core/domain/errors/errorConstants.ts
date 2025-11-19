/**
 * Error Messages and Constants
 *
 * @architecture_layer Domain - Error Handling
 */

/**
 * User-Friendly Error Messages
 */
export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  NETWORK_TIMEOUT: 'Request timed out. Please try again.',

  // Not Found
  NOT_FOUND_ERROR: 'The requested resource was not found.',
  MOVIE_NOT_FOUND: 'This movie is not available.',

  // Validation
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_RATING: 'Rating must be between 0 and 10.',

  // Auth
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',

  // Data
  DATA_PERSISTENCE_ERROR: 'Failed to save data. Please try again.',
  DATA_LOAD_ERROR: 'Failed to load data. Please refresh the page.',

  // Generic
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred.',
} as const;

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;
