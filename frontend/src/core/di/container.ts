/**
 * Dependency Injection Container
 * Implements the Service Locator pattern for managing application dependencies
 *
 * Responsibilities:
 * - Register service factories
 * - Resolve services lazily (on-demand)
 * - Cache singleton instances
 * - Provide type-safe service resolution
 */

import type { DIToken, IServiceContainer } from './types';

/**
 * DIContainer class
 * Manages dependency registration and resolution with singleton caching
 */
export class DIContainer implements IServiceContainer {
  /**
   * Stores factory functions for creating services
   * @private
   */
  private factories: Map<DIToken, () => any> = new Map();

  /**
   * Stores singleton instances of services
   * @private
   */
  private singletons: Map<DIToken, any> = new Map();

  /**
   * Registers a factory function for a service
   * The factory is called lazily when the service is first requested
   *
   * @template T - The service type being registered
   * @param token - The DI token to register under
   * @param factory - Function that creates the service instance
   *
   * @example
   * ```typescript
   * container.register(
   *   DI_TOKENS.MOVIE_REPOSITORY,
   *   () => new MovieRepositoryImpl(movieDataSource)
   * );
   * ```
   */
  register<T>(token: DIToken, factory: () => T): void {
    if (this.factories.has(token)) {
      console.warn(`⚠️  Service ${token} is already registered. Overwriting...`);
    }
    this.factories.set(token, factory);
  }

  /**
   * Resolves a service by its token
   * Creates the service on first access and caches it as a singleton
   *
   * @template T - The service type being resolved
   * @param token - The DI token to resolve
   * @returns The service instance
   * @throws Error if service is not registered
   *
   * @example
   * ```typescript
   * const repo = container.get<IMovieRepository>(DI_TOKENS.MOVIE_REPOSITORY);
   * ```
   */
  get<T>(token: DIToken): T {
    // Return cached singleton if available
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    // Get factory for this token
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`❌ Service not registered: ${token}`);
    }

    // Create instance using factory
    const instance = factory() as T;

    // Cache as singleton
    this.singletons.set(token, instance);

    return instance;
  }

  /**
   * Checks if a service is registered
   *
   * @param token - The DI token to check
   * @returns true if the service is registered, false otherwise
   */
  has(token: DIToken): boolean {
    return this.factories.has(token);
  }

  /**
   * Clears all registered services and cached singletons
   * Useful for testing or application cleanup
   *
   * @example
   * ```typescript
   * container.clear(); // Reset container
   * ```
   */
  clear(): void {
    this.factories.clear();
    this.singletons.clear();
  }

  /**
   * Gets count of registered services
   * Useful for debugging
   *
   * @returns Number of registered services
   */
  getServiceCount(): number {
    return this.factories.size;
  }

  /**
   * Gets list of all registered service tokens
   * Useful for debugging and introspection
   *
   * @returns Array of registered DI tokens
   */
  getRegisteredServices(): DIToken[] {
    return Array.from(this.factories.keys());
  }
}

/**
 * Global singleton instance of the DI container
 * Exported as the main entry point for dependency resolution
 */
export const diContainer = new DIContainer();
