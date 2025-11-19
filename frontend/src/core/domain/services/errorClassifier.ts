/**
 * Error Classifier Service
 *
 * Analyzes errors and determines handling strategy
 *
 * @architecture_layer Domain - Service
 * @responsibility Error analysis and classification
 */

import {
  CustomError,
  ValidationError,
  NetworkError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  DataPersistenceError,
  ConfigurationError,
  DependencyError,
} from '../errors/CustomError';
import {
  ErrorCategory,
  ErrorSeverity,
  ClassifiedError,
} from '../errors/errorTypes';
import { ERROR_MESSAGES } from '../errors/errorConstants';

export class ErrorClassifier {
  /**
   * Classify an error and determine handling strategy
   */
  static classify(error: Error): ClassifiedError {
    if (error instanceof CustomError) {
      return this.classifyCustomError(error);
    }

    return this.classifyStandardError(error);
  }

  /**
   * Classify custom application errors
   */
  private static classifyCustomError(error: CustomError): ClassifiedError {
    const baseClassification = {
      error,
      shouldLog: true,
      shouldReport: !error.isOperational,
    };

    if (error instanceof ValidationError) {
      return {
        ...baseClassification,
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        shouldNotify: true,
        retryable: false,
        userMessage: error.message,
      };
    }

    if (error instanceof NetworkError) {
      return {
        ...baseClassification,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
        shouldNotify: true,
        retryable: true,
        userMessage: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }

    if (error instanceof NotFoundError) {
      return {
        ...baseClassification,
        category: ErrorCategory.NOT_FOUND,
        severity: ErrorSeverity.WARNING,
        shouldNotify: true,
        retryable: false,
        userMessage: error.message,
      };
    }

    if (error instanceof AuthenticationError) {
      return {
        ...baseClassification,
        category: ErrorCategory.AUTH,
        severity: ErrorSeverity.ERROR,
        shouldNotify: true,
        retryable: false,
        userMessage: ERROR_MESSAGES.AUTH_ERROR,
      };
    }

    if (error instanceof AuthorizationError) {
      return {
        ...baseClassification,
        category: ErrorCategory.PERMISSION,
        severity: ErrorSeverity.WARNING,
        shouldNotify: true,
        retryable: false,
        userMessage: ERROR_MESSAGES.AUTHORIZATION_ERROR,
      };
    }

    if (error instanceof DataPersistenceError) {
      return {
        ...baseClassification,
        category: ErrorCategory.DATA,
        severity: ErrorSeverity.ERROR,
        shouldNotify: true,
        retryable: true,
        userMessage: ERROR_MESSAGES.DATA_PERSISTENCE_ERROR,
      };
    }

    if (error instanceof ConfigurationError || error instanceof DependencyError) {
      return {
        ...baseClassification,
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.FATAL,
        shouldNotify: true,
        retryable: false,
        userMessage: ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }

    return {
      ...baseClassification,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      shouldNotify: true,
      retryable: false,
      userMessage: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  /**
   * Classify standard JavaScript errors
   */
  private static classifyStandardError(error: Error): ClassifiedError {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout')
    ) {
      return {
        error,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
        shouldNotify: true,
        shouldLog: true,
        shouldReport: false,
        retryable: true,
        userMessage: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }

    if (
      error.name === 'Invariant Violation' ||
      errorMessage.includes('react') ||
      errorMessage.includes('render')
    ) {
      return {
        error,
        category: ErrorCategory.RENDER,
        severity: ErrorSeverity.FATAL,
        shouldNotify: true,
        shouldLog: true,
        shouldReport: true,
        retryable: false,
        userMessage: ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }

    return {
      error,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      shouldNotify: true,
      shouldLog: true,
      shouldReport: true,
      retryable: false,
      userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: Error): boolean {
    const classified = this.classify(error);
    return classified.retryable;
  }

  /**
   * Get user-friendly message
   */
  static getUserMessage(error: Error): string {
    const classified = this.classify(error);
    return classified.userMessage;
  }

  /**
   * Get error severity
   */
  static getSeverity(error: Error): ErrorSeverity {
    const classified = this.classify(error);
    return classified.severity;
  }
}
