/**
 * ErrorTest Component
 *
 * Component for testing ErrorBoundary functionality
 * ONLY FOR DEVELOPMENT - Remove in production
 *
 * @usage Add this component to any page during development to test error handling
 */

import { useState } from 'react';
import {
  ValidationError,
  NetworkError,
  NotFoundError,
  AuthenticationError,
} from '@core';

export function ErrorTest() {
  const [shouldThrowRender, setShouldThrowRender] = useState(false);

  // Simulate render error
  if (shouldThrowRender) {
    throw new Error('Simulated render error for testing ErrorBoundary');
  }

  // Async error simulation
  const throwAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new NetworkError('Simulated network error', {
      statusCode: 500,
      endpoint: '/api/test',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-dark-card border border-gray-800 rounded-lg p-4 shadow-xl z-50">
      <h3 className="text-white font-bold mb-3">Error Testing (DEV)</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShouldThrowRender(true)}
          className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
        >
          Throw Render Error
        </button>
        <button
          onClick={() => {
            throw new ValidationError('Test validation error');
          }}
          className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
        >
          Throw Validation Error
        </button>
        <button
          onClick={throwAsyncError}
          className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Throw Async Error
        </button>
        <button
          onClick={() => {
            throw new NotFoundError('Test resource not found');
          }}
          className="bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600"
        >
          Throw NotFound Error
        </button>
        <button
          onClick={() => {
            throw new AuthenticationError('Test auth error');
          }}
          className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
        >
          Throw Auth Error
        </button>
      </div>
    </div>
  );
}
