/**
 * Infrastructure Layer Exports
 * External services, logging, and infrastructure concerns
 */

// Logging
export { errorLogger, ConsoleErrorLogger } from './logging/ErrorLogger';
export type { IErrorLogger, LogEntry } from './logging/ErrorLogger';
