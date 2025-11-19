/**
 * Error Logger
 *
 * Centralized logging system for errors
 *
 * @architecture_layer Infrastructure
 * @responsibility Error logging and reporting
 */

import { ErrorSeverity, ErrorContext, ClassifiedError } from '../../domain/errors';

export interface LogEntry {
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  error?: Error;
  context?: ErrorContext;
  stack?: string;
}

export interface IErrorLogger {
  debug(message: string, context?: ErrorContext): void;
  info(message: string, context?: ErrorContext): void;
  warn(message: string, error?: Error, context?: ErrorContext): void;
  error(message: string, error: Error, context?: ErrorContext): void;
  fatal(message: string, error: Error, context?: ErrorContext): void;
  logClassifiedError(classified: ClassifiedError, context?: ErrorContext): void;
  getLogs(severity?: ErrorSeverity): LogEntry[];
  clearLogs(): void;
}

/**
 * Console Error Logger Implementation
 */
export class ConsoleErrorLogger implements IErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  debug(message: string, context?: ErrorContext): void {
    this.log(ErrorSeverity.DEBUG, message, undefined, context);
    console.debug(`[DEBUG] ${message}`, context);
  }

  info(message: string, context?: ErrorContext): void {
    this.log(ErrorSeverity.INFO, message, undefined, context);
    console.info(`[INFO] ${message}`, context);
  }

  warn(message: string, error?: Error, context?: ErrorContext): void {
    this.log(ErrorSeverity.WARNING, message, error, context);
    console.warn(`[WARN] ${message}`, error, context);
  }

  error(message: string, error: Error, context?: ErrorContext): void {
    this.log(ErrorSeverity.ERROR, message, error, context);
    console.error(`[ERROR] ${message}`, error, context);
  }

  fatal(message: string, error: Error, context?: ErrorContext): void {
    this.log(ErrorSeverity.FATAL, message, error, context);
    console.error(`[FATAL] ${message}`, error, context);
  }

  logClassifiedError(classified: ClassifiedError, context?: ErrorContext): void {
    const message = `${classified.category.toUpperCase()}: ${classified.userMessage}`;

    switch (classified.severity) {
      case ErrorSeverity.DEBUG:
        this.debug(message, context);
        break;
      case ErrorSeverity.INFO:
        this.info(message, context);
        break;
      case ErrorSeverity.WARNING:
        this.warn(message, classified.error, context);
        break;
      case ErrorSeverity.ERROR:
        this.error(message, classified.error, context);
        break;
      case ErrorSeverity.FATAL:
        this.fatal(message, classified.error, context);
        break;
    }

    if (classified.shouldReport) {
      this.reportToExternalService(classified, context);
    }
  }

  getLogs(severity?: ErrorSeverity): LogEntry[] {
    if (!severity) {
      return [...this.logs];
    }
    return this.logs.filter(log => log.severity === severity);
  }

  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Internal log storage
   */
  private log(
    severity: ErrorSeverity,
    message: string,
    error?: Error,
    context?: ErrorContext
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      severity,
      message,
      error,
      context,
      stack: error?.stack,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.persistLog(entry);
  }

  /**
   * Persist log to localStorage
   */
  private persistLog(entry: LogEntry): void {
    try {
      const key = 'film-match:error-logs';
      const existing = localStorage.getItem(key);
      const logs = existing ? JSON.parse(existing) : [];

      logs.push({
        ...entry,
        error: entry.error
          ? {
              name: entry.error.name,
              message: entry.error.message,
              stack: entry.error.stack,
            }
          : undefined,
      });

      if (logs.length > 50) {
        logs.shift();
      }

      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to persist log to localStorage', e);
    }
  }

  /**
   * Report error to external service
   */
  private reportToExternalService(
    classified: ClassifiedError,
    context?: ErrorContext
  ): void {
    console.info('[REPORT] Would send to Sentry:', {
      error: classified.error,
      category: classified.category,
      severity: classified.severity,
      context,
    });
  }
}

/**
 * Singleton instance
 */
export const errorLogger = new ConsoleErrorLogger();
