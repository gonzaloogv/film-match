/**
 * ErrorFallback Component
 *
 * Reusable error display component with customization options
 * Can be used with ErrorBoundary or as standalone error UI
 *
 * @architecture_layer Presentation - UI Component
 * @responsibility Display user-friendly error messages with actions
 */

import { ErrorClassifier, ErrorSeverity } from '@core';

/**
 * ErrorFallback Props
 */
export interface ErrorFallbackProps {
  /**
   * Error to display
   */
  error: Error;

  /**
   * Reset/retry callback
   */
  resetError?: () => void;

  /**
   * Optional title override
   */
  title?: string;

  /**
   * Optional message override
   */
  message?: string;

  /**
   * Show technical details (default: only in DEV)
   */
  showDetails?: boolean;

  /**
   * Size variant
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';

  /**
   * Optional additional actions
   */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

/**
 * ErrorFallback Component
 *
 * @example Basic usage
 * ```tsx
 * <ErrorFallback error={error} resetError={resetError} />
 * ```
 *
 * @example Custom size and actions
 * ```tsx
 * <ErrorFallback
 *   error={error}
 *   size="small"
 *   actions={[
 *     { label: 'Contact Support', onClick: handleSupport }
 *   ]}
 * />
 * ```
 */
export function ErrorFallback({
  error,
  resetError,
  title,
  message,
  showDetails = import.meta.env.DEV,
  size = 'medium',
  actions = [],
}: ErrorFallbackProps) {
  const classified = ErrorClassifier.classify(error);

  // Determine display values
  const displayTitle = title || getDefaultTitle(classified.severity);
  const displayMessage = message || classified.userMessage;

  // Size classes
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={sizeClasses.container}>
      <div className={sizeClasses.card}>
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <ErrorIcon severity={classified.severity} />

          {/* Title */}
          <h2 className={sizeClasses.title}>{displayTitle}</h2>

          {/* Message */}
          <p className={sizeClasses.message}>{displayMessage}</p>

          {/* Technical Details */}
          {showDetails && (
            <TechnicalDetails error={error} classified={classified} />
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full">
            {/* Retry Button (if retryable) */}
            {classified.retryable && resetError && (
              <button
                onClick={resetError}
                className="flex-1 min-w-[140px] bg-gradient-to-r from-primary-pink to-primary-purple text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            )}

            {/* Custom Actions */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex-1 min-w-[140px] font-semibold py-3 px-6 rounded-lg transition-colors ${
                  action.variant === 'primary'
                    ? 'bg-gradient-to-r from-primary-pink to-primary-purple text-white hover:opacity-90'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {action.label}
              </button>
            ))}

            {/* Default Home Button */}
            {!actions.some(a => a.label.toLowerCase().includes('home')) && (
              <button
                onClick={() => (window.location.href = '/')}
                className={`${
                  classified.retryable || actions.length > 0
                    ? 'flex-1 min-w-[140px]'
                    : 'w-full'
                } bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors`}
              >
                Go Home
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Error Icon Component
 */
function ErrorIcon({ severity }: { severity: ErrorSeverity }) {
  const iconConfig = getIconConfig(severity);

  return (
    <div
      className={`w-16 h-16 ${iconConfig.bgColor} rounded-full flex items-center justify-center mb-4`}
    >
      <svg
        className={`w-8 h-8 ${iconConfig.textColor}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconConfig.path}
        />
      </svg>
    </div>
  );
}

/**
 * Technical Details Component
 */
function TechnicalDetails({
  error,
  classified,
}: {
  error: Error;
  classified: ReturnType<typeof ErrorClassifier.classify>;
}) {
  return (
    <details className="mb-6 w-full text-left">
      <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
        Technical Details
      </summary>
      <div className="bg-dark-bg rounded p-3 text-xs text-gray-400 overflow-auto max-h-48">
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Category:</span>{' '}
          {classified.category}
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Severity:</span>{' '}
          {classified.severity}
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Retryable:</span>{' '}
          {classified.retryable ? 'Yes' : 'No'}
        </div>
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
  );
}

/**
 * Helper: Get default title based on severity
 */
function getDefaultTitle(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.FATAL:
      return 'Critical Error';
    case ErrorSeverity.ERROR:
      return 'Something Went Wrong';
    case ErrorSeverity.WARNING:
      return 'Warning';
    case ErrorSeverity.INFO:
      return 'Information';
    default:
      return 'Error';
  }
}

/**
 * Helper: Get icon configuration based on severity
 */
function getIconConfig(severity: ErrorSeverity) {
  switch (severity) {
    case ErrorSeverity.FATAL:
      return {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-500',
        path: 'M6 18L18 6M6 6l12 12', // X icon
      };
    case ErrorSeverity.ERROR:
      return {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-500',
        path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', // Alert triangle
      };
    case ErrorSeverity.WARNING:
      return {
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-500',
        path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      };
    case ErrorSeverity.INFO:
      return {
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-500',
        path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Info icon
      };
    default:
      return {
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-500',
        path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      };
  }
}

/**
 * Helper: Get size-specific classes
 */
function getSizeClasses(size: ErrorFallbackProps['size']) {
  switch (size) {
    case 'small':
      return {
        container: 'p-4',
        card: 'bg-dark-card rounded-lg border border-gray-800 p-6 max-w-sm w-full',
        title: 'text-lg font-bold text-white mb-2',
        message: 'text-sm text-gray-400 mb-4',
      };
    case 'medium':
      return {
        container: 'p-4',
        card: 'bg-dark-card rounded-xl border border-gray-800 p-8 max-w-md w-full',
        title: 'text-2xl font-bold text-white mb-2',
        message: 'text-gray-400 mb-6',
      };
    case 'large':
      return {
        container: 'p-6',
        card: 'bg-dark-card rounded-2xl border border-gray-800 p-10 max-w-2xl w-full',
        title: 'text-3xl font-bold text-white mb-3',
        message: 'text-lg text-gray-400 mb-8',
      };
    case 'fullscreen':
      return {
        container: 'min-h-screen bg-dark-bg flex items-center justify-center p-4',
        card: 'bg-dark-card rounded-2xl border border-gray-800 p-10 max-w-2xl w-full',
        title: 'text-3xl font-bold text-white mb-3',
        message: 'text-lg text-gray-400 mb-8',
      };
    default:
      return {
        container: 'p-4',
        card: 'bg-dark-card rounded-xl border border-gray-800 p-8 max-w-md w-full',
        title: 'text-2xl font-bold text-white mb-2',
        message: 'text-gray-400 mb-6',
      };
  }
}
