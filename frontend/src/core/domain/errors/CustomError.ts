/**
 * CustomError Base Classes
 *
 * All custom errors in the application extend from this base class
 * Provides common structure for error handling and logging
 *
 * @architecture_layer Domain - Error Handling
 */

/**
 * Base Custom Error
 */
export abstract class CustomError extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Validation Error
 */
export class ValidationError extends CustomError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code, true);
  }
}

/**
 * Network Error
 */
export class NetworkError extends CustomError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, code = 'NETWORK_ERROR') {
    super(message, code, true);
    this.statusCode = statusCode;
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends CustomError {
  public readonly resourceType: string;
  public readonly resourceId: string | number;

  constructor(resourceType: string, resourceId: string | number) {
    super(
      `${resourceType} with id '${resourceId}' not found`,
      'NOT_FOUND_ERROR',
      true
    );
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends CustomError {
  constructor(message = 'Authentication failed', code = 'AUTH_ERROR') {
    super(message, code, true);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends CustomError {
  constructor(message = 'Access denied', code = 'AUTHORIZATION_ERROR') {
    super(message, code, true);
  }
}

/**
 * Data Persistence Error
 */
export class DataPersistenceError extends CustomError {
  constructor(message: string, code = 'DATA_PERSISTENCE_ERROR') {
    super(message, code, true);
  }
}

/**
 * Configuration Error
 */
export class ConfigurationError extends CustomError {
  constructor(message: string, code = 'CONFIG_ERROR') {
    super(message, code, false);
  }
}

/**
 * Dependency Error
 */
export class DependencyError extends CustomError {
  constructor(message: string, code = 'DEPENDENCY_ERROR') {
    super(message, code, false);
  }
}
