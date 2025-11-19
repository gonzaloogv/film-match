/**
 * ErrorBoundary Component
 *
 * Class component that catches errors in the React component tree
 * Integrates with ErrorClassifier and ErrorLogger for consistent error handling
 *
 * @architecture_layer Presentation - Error Handling
 * @responsibility Catch and handle React render errors
 *
 * @important This MUST be a class component because React error boundaries
 * require componentDidCatch and getDerivedStateFromError lifecycle methods
 *
 * NOTE: DefaultErrorFallback is an internal implementation detail
 */

/* eslint-disable react-refresh/only-export-components */

import { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorClassifier, errorLogger, ErrorContext } from '@core';

/**
 * ErrorBoundary Props
 */
export interface ErrorBoundaryProps {
  /**
   * Child components to protect
   */
  children: ReactNode;

  /**
   * Optional custom fallback UI
   * If not provided, uses default ErrorFallback
   */
  fallback?: (error: Error, resetError: () => void) => ReactNode;

  /**
   * Optional context to include in error logs
   */
  context?: ErrorContext;

  /**
   * Optional callback when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * ErrorBoundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => (
 *   <div>
 *     <h1>Oops!</h1>
 *     <button onClick={reset}>Try Again</button>
 *   </div>
 * )}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Static lifecycle method called when error occurs
   * Updates state to trigger fallback UI render
   *
   * @important This method runs during render phase, so side effects are not allowed
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called after error is caught
   * Used for side effects like logging
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Classify the error
    const classified = ErrorClassifier.classify(error);

    // Prepare error context
    const context: ErrorContext = {
      ...this.props.context,
      component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
      source: 'ErrorBoundary',
      type: 'render_error',
    };

    // Log the error
    if (classified.shouldLog) {
      errorLogger.logClassifiedError(classified, context);
    }

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log component stack for debugging
    console.error('Error Boundary Caught Error:', {
      error,
      componentStack: errorInfo.componentStack,
      classified,
      context,
    });
  }

  /**
   * Reset error state and attempt to re-render children
   *
   * @important This is the mechanism for "retry" functionality
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError);
      }

      // Use default fallback
      return <DefaultErrorFallback error={error} resetError={this.resetError} />;
    }

    return children;
  }
}

/**
 * Default Error Fallback Component
 *
 * @responsibility Display user-friendly error UI with retry option
 */
interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({
  error,
  resetError,
}: DefaultErrorFallbackProps): ReactNode {
  const classified = ErrorClassifier.classify(error);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-card rounded-xl border border-gray-800 p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Something Went Wrong
          </h2>

          {/* User-Friendly Message */}
          <p className="text-gray-400 mb-6">{classified.userMessage}</p>

          {/* Technical Details (development only) */}
          {import.meta.env.DEV && (
            <details className="mb-6 w-full text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
                Technical Details
              </summary>
              <div className="bg-dark-bg rounded p-3 text-xs text-gray-400 overflow-auto max-h-48">
                <p className="font-semibold text-red-400 mb-1">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="whitespace-pre-wrap text-[10px] leading-tight">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            {classified.retryable && (
              <button
                onClick={resetError}
                className="flex-1 bg-gradient-to-r from-primary-pink to-primary-purple text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/')}
              className={`${
                classified.retryable ? 'flex-1' : 'w-full'
              } bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors`}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
