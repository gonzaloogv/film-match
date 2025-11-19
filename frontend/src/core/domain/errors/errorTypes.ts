/**
 * Error Types, Enums, and Interfaces
 *
 * Used for classification and handling of errors
 *
 * @architecture_layer Domain - Error Handling
 */

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Error Category
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  DATA = 'data',
  RENDER = 'render',
  UNKNOWN = 'unknown',
}

/**
 * Error Context
 */
export interface ErrorContext {
  userId?: string;
  movieId?: number;
  component?: string;
  action?: string;
  source?: string;
  line?: number;
  column?: number;
  type?: string;
  [key: string]: unknown;
}

/**
 * Classified Error
 */
export interface ClassifiedError {
  error: Error;
  category: ErrorCategory;
  severity: ErrorSeverity;
  shouldNotify: boolean;
  shouldLog: boolean;
  shouldReport: boolean;
  retryable: boolean;
  userMessage: string;
}
