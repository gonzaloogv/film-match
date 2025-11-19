/**
 * Cache Service
 * Centralized caching layer with NodeCache for L1 in-memory caching
 * Provides TTL-based expiration and event-based invalidation
 * Future: Add Redis L2 caching for distributed deployments
 */

import NodeCache from 'node-cache';

export interface CacheConfig {
  stdTTL?: number; // Standard TTL in seconds (default: 300 = 5 minutes)
  checkperiod?: number; // Check period for expired keys (default: 60)
  useClones?: boolean; // Clone values on retrieval (default: true)
}

export interface CacheStats {
  keys: number;
  hits: number;
  misses: number;
  ksize: number;
  vsize: number;
}

/**
 * Singleton cache service managing all application caching
 * Organized by cache type for easier management and TTL configuration
 */
class CacheService {
  private static instance: CacheService;

  // L1 Cache instances (organized by data type)
  private userMetadataCache: NodeCache;
  private embeddingsCache: NodeCache;
  private recommendationsCache: NodeCache;
  private popularMoviesCache: NodeCache;
  private userRatedIdsCache: NodeCache;

  // Cache statistics for monitoring
  private stats = {
    hits: 0,
    misses: 0,
    invalidations: 0
  };

  private constructor() {
    // User metadata: aggressive caching (5 min TTL)
    // Extract happens on every recommendation, so cache is critical
    this.userMetadataCache = new NodeCache({
      stdTTL: 300, // 5 minutes
      checkperiod: 60,
      useClones: true
    });

    // Embeddings: aggressive caching (10 min TTL)
    // Embeddings never change and are expensive to retrieve
    this.embeddingsCache = new NodeCache({
      stdTTL: 600, // 10 minutes
      checkperiod: 120,
      useClones: true
    });

    // Recommendations: moderate caching (3 min TTL)
    // User ratings may change frequently
    this.recommendationsCache = new NodeCache({
      stdTTL: 180, // 3 minutes
      checkperiod: 60,
      useClones: true
    });

    // Popular movies: long TTL (30 min)
    // Popular movies don't change frequently
    this.popularMoviesCache = new NodeCache({
      stdTTL: 1800, // 30 minutes
      checkperiod: 180,
      useClones: true
    });

    // User rated IDs: moderate caching (3 min TTL)
    // Cache which movies user has rated
    this.userRatedIdsCache = new NodeCache({
      stdTTL: 180, // 3 minutes
      checkperiod: 60,
      useClones: true
    });

    console.log('✅ Cache service initialized (L1: NodeCache)');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // ============================================
  // User Metadata Cache Methods
  // ============================================

  setUserMetadata(userId: number, data: any): void {
    const key = `user_metadata_${userId}`;
    this.userMetadataCache.set(key, data);
    console.log(`📦 Cached user metadata: ${key}`);
  }

  getUserMetadata(userId: number): any | undefined {
    const key = `user_metadata_${userId}`;
    const value = this.userMetadataCache.get(key);
    if (value) {
      this.stats.hits++;
      console.log(`✅ Cache hit: ${key}`);
    } else {
      this.stats.misses++;
      console.log(`❌ Cache miss: ${key}`);
    }
    return value;
  }

  invalidateUserMetadata(userId: number): void {
    const key = `user_metadata_${userId}`;
    this.userMetadataCache.del(key);
    this.stats.invalidations++;
    console.log(`🗑️  Invalidated: ${key}`);
  }

  invalidateAllUserMetadata(): void {
    this.userMetadataCache.flushAll();
    console.log('🗑️  All user metadata cache cleared');
  }

  // ============================================
  // Embeddings Cache Methods
  // ============================================

  setEmbedding(movieId: number, embedding: number[]): void {
    const key = `embedding_${movieId}`;
    this.embeddingsCache.set(key, embedding);
  }

  getEmbedding(movieId: number): number[] | undefined {
    const key = `embedding_${movieId}`;
    return this.embeddingsCache.get(key);
  }

  setEmbeddings(embeddings: Map<number, number[]>): void {
    embeddings.forEach((embedding, movieId) => {
      this.setEmbedding(movieId, embedding);
    });
    console.log(`📦 Cached ${embeddings.size} embeddings`);
  }

  getEmbeddings(movieIds: number[]): Map<number, number[]> {
    const result = new Map<number, number[]>();
    const missing: number[] = [];

    for (const id of movieIds) {
      const embedding = this.getEmbedding(id);
      if (embedding) {
        result.set(id, embedding);
      } else {
        missing.push(id);
      }
    }

    if (missing.length > 0) {
      console.log(`⚠️  Embedding cache: ${result.size}/${movieIds.length} found, ${missing.length} missing`);
    }

    return result;
  }

  invalidateEmbedding(movieId: number): void {
    const key = `embedding_${movieId}`;
    this.embeddingsCache.del(key);
  }

  clearEmbeddingsCache(): void {
    this.embeddingsCache.flushAll();
    console.log('🗑️  Embeddings cache cleared');
  }

  // ============================================
  // Recommendations Cache Methods
  // ============================================

  setRecommendations(userId: number, recommendations: any[]): void {
    const key = `recommendations_${userId}`;
    this.recommendationsCache.set(key, recommendations);
    console.log(`📦 Cached recommendations for user ${userId}`);
  }

  getRecommendations(userId: number): any[] | undefined {
    const key = `recommendations_${userId}`;
    const value = this.recommendationsCache.get<any[]>(key);
    if (value) {
      this.stats.hits++;
      console.log(`✅ Cache hit: ${key}`);
    } else {
      this.stats.misses++;
    }
    return value;
  }

  invalidateRecommendations(userId: number): void {
    const key = `recommendations_${userId}`;
    this.recommendationsCache.del(key);
    this.stats.invalidations++;
    console.log(`🗑️  Invalidated: ${key}`);
  }

  // ============================================
  // Popular Movies Cache Methods
  // ============================================

  setPopularMovies(topK: number, movies: any[]): void {
    const key = `popular_movies_${topK}`;
    this.popularMoviesCache.set(key, movies);
    console.log(`📦 Cached popular movies (topK=${topK})`);
  }

  getPopularMovies(topK: number): any[] | undefined {
    const key = `popular_movies_${topK}`;
    const value = this.popularMoviesCache.get<any[]>(key);
    if (value) {
      this.stats.hits++;
      console.log(`✅ Cache hit: ${key}`);
    } else {
      this.stats.misses++;
    }
    return value;
  }

  invalidatePopularMovies(): void {
    this.popularMoviesCache.flushAll();
    console.log('🗑️  Popular movies cache cleared');
  }

  // ============================================
  // User Rated IDs Cache Methods
  // ============================================

  setUserRatedIds(userId: number, movieIds: number[]): void {
    const key = `user_rated_ids_${userId}`;
    this.userRatedIdsCache.set(key, movieIds);
    console.log(`📦 Cached rated IDs for user ${userId} (${movieIds.length} movies)`);
  }

  getUserRatedIds(userId: number): number[] | undefined {
    const key = `user_rated_ids_${userId}`;
    return this.userRatedIdsCache.get(key);
  }

  invalidateUserRatedIds(userId: number): void {
    const key = `user_rated_ids_${userId}`;
    this.userRatedIdsCache.del(key);
    this.stats.invalidations++;
  }

  // ============================================
  // Cache Management & Monitoring
  // ============================================

  /**
   * Get cache statistics across all caches
   */
  getStats() {
    const userMetadataKeys = this.userMetadataCache.keys();
    const embeddingsKeys = this.embeddingsCache.keys();
    const recommendationsKeys = this.recommendationsCache.keys();
    const popularMoviesKeys = this.popularMoviesCache.keys();
    const userRatedIdsKeys = this.userRatedIdsCache.keys();

    return {
      timestamp: new Date().toISOString(),
      userMetadata: {
        keys: userMetadataKeys.length,
        enabled: true
      },
      embeddings: {
        keys: embeddingsKeys.length,
        enabled: true
      },
      recommendations: {
        keys: recommendationsKeys.length,
        enabled: true
      },
      popularMovies: {
        keys: popularMoviesKeys.length,
        enabled: true
      },
      userRatedIds: {
        keys: userRatedIdsKeys.length,
        enabled: true
      },
      totalKeys: userMetadataKeys.length + embeddingsKeys.length + recommendationsKeys.length + popularMoviesKeys.length + userRatedIdsKeys.length,
      statistics: {
        hits: this.stats.hits,
        misses: this.stats.misses,
        invalidations: this.stats.invalidations,
        hitRate: this.stats.hits + this.stats.misses > 0
          ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2) + '%'
          : 'N/A'
      }
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.userMetadataCache.flushAll();
    this.embeddingsCache.flushAll();
    this.recommendationsCache.flushAll();
    this.popularMoviesCache.flushAll();
    this.userRatedIdsCache.flushAll();
    console.log('🗑️  All caches cleared');
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      invalidations: 0
    };
  }
}

export const cacheService = CacheService.getInstance();
