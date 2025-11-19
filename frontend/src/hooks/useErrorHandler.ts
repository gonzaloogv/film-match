/**
 * useErrorHandler Hook
 *
 * Provides error handling capabilities in functional components
 * Integrates with UIContext for notifications and ErrorLogger for logging
 *
 * @architecture_pattern Custom Hook
 * @responsibility Error handling in components
 */

import { useCallback, useContext } from 'react';
import { UIContext } from '@/context/ui/UIContext';
import { ErrorClassifier, errorLogger, ErrorContext } from '@core';

export interface UseErrorHandlerReturn {
  handleError: (error: Error, context?: ErrorContext) => void;
  handleAsyncError: <T>(
    promise: Promise<T>,
    context?: ErrorContext
  ) => Promise<T | null>;
  clearErrors: () => void;
}

/**
 * Hook for handling errors in components
 *
 * @example
 * ```typescript
 * const { handleError, handleAsyncError } = useErrorHandler();
 *
 * // Synchronous error
 * try {
 *   somethingRisky();
 * } catch (error) {
 *   handleError(error, { component: 'MovieCard', action: 'swipe' });
 * }
 *
 * // Async error
 * const movie = await handleAsyncError(
 *   fetchMovie(id),
 *   { component: 'MovieDetails', movieId: id }
 * );
 * ```
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const uiContext = useContext(UIContext);

  if (!uiContext) {
    throw new Error('useErrorHandler must be used within UIProvider');
  }

  const { showNotification } = uiContext;

  /**
   * Handle error: classify, log, and notify user
   */
  const handleError = useCallback(
    (error: Error, context?: ErrorContext) => {
      const classified = ErrorClassifier.classify(error);

      if (classified.shouldLog) {
        errorLogger.logClassifiedError(classified, context);
      }

      if (classified.shouldNotify) {
        const notificationType =
          classified.severity === 'warning' || classified.severity === 'info'
            ? classified.severity
            : 'error';

        showNotification({
          type: notificationType as 'error' | 'warning' | 'info' | 'success',
          message: classified.userMessage,
          duration: 5000,
        });
      }
    },
    [showNotification]
  );

  /**
   * Handle async operations with automatic error handling
   */
  const handleAsyncError = useCallback(
    async <T,>(
      promise: Promise<T>,
      context?: ErrorContext
    ): Promise<T | null> => {
      try {
        return await promise;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        handleError(err, context);
        return null;
      }
    },
    [handleError]
  );

  /**
   * Clear all error notifications
   */
  const clearErrors = useCallback(() => {
    // No-op for now, could be extended
  }, []);

  return {
    handleError,
    handleAsyncError,
    clearErrors,
  };
}
