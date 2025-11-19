/**
 * useDIContainer Hook
 * Provides access to the Dependency Injection container in React components
 *
 * This is the base hook that all other custom hooks use to resolve services
 * from the DI container. It acts as a bridge between React components and
 * the core business logic layer.
 */

import { useCallback } from 'react';
import { diContainer, type DIToken } from '@core';

/**
 * Hook for accessing DI container services
 *
 * Provides type-safe access to registered services from the DI container.
 * Each service is resolved only once and cached as a singleton.
 *
 * @returns Object with `get` method to resolve services
 *
 * @example
 * ```typescript
 * const { get } = useDIContainer()
 * const movieRepo = get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY)
 * ```
 *
 * @remarks
 * - This hook should only be called once per component
 * - The returned services are singletons (shared across the app)
 * - Use other custom hooks instead of directly using this for specific features
 */
export function useDIContainer() {
  /**
   * Resolves a service from the DI container
   *
   * @template T - The type of the service being resolved
   * @param token - The DI token identifying the service
   * @returns The resolved service instance
   * @throws Error if the service is not registered
   */
  const get = useCallback(<T,>(token: DIToken): T => {
    return diContainer.get<T>(token);
  }, []);

  /**
   * Checks if a service is registered
   */
  const has = useCallback((token: DIToken): boolean => {
    return diContainer.has(token);
  }, []);

  return { get, has };
}
