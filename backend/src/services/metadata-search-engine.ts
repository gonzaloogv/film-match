/**
 * MetadataSearchEngine
 * Searches movies based on genre and metadata
 * Used in Hybrid Recommendation System (Fase 3B.2)
 * Optimized with embedding cache and batch queries
 */

import { prisma } from '../lib/prisma';
import { MovieResult, UserMetadataProfile } from '../types/rag.types';
import { cacheService } from './cache.service';

export class MetadataSearchEngine {
  private static instance: MetadataSearchEngine;

  private constructor() {}

  static getInstance(): MetadataSearchEngine {
    if (!MetadataSearchEngine.instance) {
      MetadataSearchEngine.instance = new MetadataSearchEngine();
    }
    return MetadataSearchEngine.instance;
  }

  /**
   * Search movies by favorite genres of user
   * Returns movies that match user's favorite genres
   *
   * @param userProfile - User metadata profile with favorite genres
   * @param excludeMovieIds - Movie IDs to exclude (user's rated movies)
   * @param topK - Number of results to return
   * @returns Array of movies matching user's genres
   */
  async searchByGenres(
    userProfile: UserMetadataProfile,
    excludeMovieIds: number[] = [],
    topK: number = 20
  ): Promise<MovieResult[]> {
    try {
      if (userProfile.favoriteGenres.length === 0) {
        console.log('⚠️  User has no favorite genres');
        return [];
      }

      const favoriteGenreNames = userProfile.favoriteGenres.map(g => g.genre);

      console.log(
        `🔍 Searching by genres: ${favoriteGenreNames.slice(0, 3).join(', ')}`
      );

      // Find movies with favorite genres
      const movies = await prisma.movie.findMany({
        where: {
          id: { notIn: excludeMovieIds },
          categories: {
            some: {
              category: {
                name: { in: favoriteGenreNames }
              }
            }
          }
        },
        include: {
          categories: { include: { category: true } },
          embeddings: true
        },
        take: topK,
        orderBy: { voteAverage: 'desc' }
      });

      // Convert to MovieResult
      const results: MovieResult[] = movies.map(m => ({
        id: m.id,
        tmdbId: m.tmdbId,
        title: m.title,
        year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : null,
        overview: m.overview,
        genres: m.categories.map(mc => mc.category.name),
        posterPath: m.posterPath,
        voteAverage: m.voteAverage ? parseFloat(m.voteAverage.toString()) : null
      }));

      console.log(`✅ Found ${results.length} movies matching favorite genres`);
      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Genre search failed: ${message}`);
      throw new Error(`Metadata search failed: ${message}`);
    }
  }

  /**
   * Get embedding vectors for user's top-rated movies
   * Used for averaging to create user vector profile
   * Includes L1 cache optimization (10 min TTL) - embeddings never change
   *
   * @param movieIds - Array of movie IDs
   * @returns Array of embeddings
   */
  async getMovieEmbeddings(movieIds: number[]): Promise<number[][]> {
    try {
      if (movieIds.length === 0) {
        return [];
      }

      // Check cache first (10 min TTL for embeddings)
      const cachedEmbeddings = cacheService.getEmbeddings(movieIds);
      const missingIds = movieIds.filter(id => !cachedEmbeddings.has(id));

      if (missingIds.length === 0) {
        // All cached
        console.log(`💾 All ${movieIds.length} embeddings from cache`);
        const embeddings: number[][] = [];
        movieIds.forEach(id => {
          const cached = cachedEmbeddings.get(id);
          if (cached) embeddings.push(cached);
        });
        return embeddings;
      }

      // Batch fetch missing embeddings from DB
      console.log(`🔄 Fetching ${missingIds.length} missing embeddings from DB (cache hit: ${cachedEmbeddings.size}/${movieIds.length})`);

      const movies = await prisma.movie.findMany({
        where: { id: { in: missingIds } },
        include: { embeddings: true }
      });

      const newEmbeddings = new Map<number, number[]>();
      const embeddings: number[][] = [];

      for (const movie of movies) {
        if (movie.embeddings && movie.embeddings.length > 0) {
          try {
            const embedding = JSON.parse(movie.embeddings[0].vectorId as string);
            if (Array.isArray(embedding) && embedding.length === 384) {
              newEmbeddings.set(movie.id, embedding);
              embeddings.push(embedding);
            }
          } catch (e) {
            console.warn(`⚠️  Failed to parse embedding for movie ${movie.id}`);
          }
        }
      }

      // Cache newly retrieved embeddings
      if (newEmbeddings.size > 0) {
        cacheService.setEmbeddings(newEmbeddings);
      }

      // Add cached embeddings to results in original order
      if (cachedEmbeddings.size > 0) {
        movieIds.forEach(id => {
          if (!newEmbeddings.has(id)) {
            const cached = cachedEmbeddings.get(id);
            if (cached) embeddings.push(cached);
          }
        });
      }

      console.log(
        `✅ Retrieved ${embeddings.length}/${movieIds.length} embeddings (${newEmbeddings.size} from DB, ${cachedEmbeddings.size} from cache)`
      );
      return embeddings;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to get movie embeddings: ${message}`);
      throw new Error(`Embedding retrieval failed: ${message}`);
    }
  }

  /**
   * Average multiple embedding vectors
   * Used to create user profile vector from top-rated movies
   *
   * @param embeddings - Array of embedding vectors
   * @returns Averaged embedding vector
   */
  averageEmbeddings(embeddings: number[][]): number[] {
    if (embeddings.length === 0) {
      throw new Error('No embeddings to average');
    }

    const vectorSize = embeddings[0].length;
    const averaged = new Array(vectorSize).fill(0);

    // Sum all embeddings
    for (const embedding of embeddings) {
      for (let i = 0; i < vectorSize; i++) {
        averaged[i] += embedding[i];
      }
    }

    // Divide by count to get average
    for (let i = 0; i < vectorSize; i++) {
      averaged[i] /= embeddings.length;
    }

    console.log(`✅ Averaged ${embeddings.length} embeddings`);
    return averaged;
  }

  /**
   * Get movies excluded from recommendations (user's rated movies)
   * Includes L1 cache optimization (3 min TTL)
   *
   * @param userId - User ID
   * @returns Array of movie IDs that user has rated
   */
  async getRatedMovieIds(userId: number): Promise<number[]> {
    try {
      // Check cache first
      const cached = cacheService.getUserRatedIds(userId);
      if (cached) {
        console.log(`💾 Cached rated IDs for user ${userId}: ${cached.length} movies`);
        return cached;
      }

      const ratings = await prisma.userRating.findMany({
        where: { userId },
        select: { movieId: true }
      });

      const movieIds = ratings.map(r => r.movieId);

      // Cache the result
      cacheService.setUserRatedIds(userId, movieIds);

      console.log(
        `📊 User ${userId} has rated ${movieIds.length} movies (excluding from recommendations)`
      );
      return movieIds;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to get rated movie IDs: ${message}`);
      throw new Error(`Failed to retrieve rated movies: ${message}`);
    }
  }

  /**
   * Calculate genre match score for a movie against user preferences
   *
   * @param movieGenres - Array of movie's genres
   * @param userGenres - User's favorite genres with weights
   * @returns Score 0-1
   */
  calculateGenreScore(
    movieGenres: string[],
    userGenres: Array<{ genre: string; weight: number }>
  ): number {
    if (userGenres.length === 0 || movieGenres.length === 0) {
      return 0;
    }

    let totalWeight = 0;
    const genreWeightMap = new Map(userGenres.map(g => [g.genre, g.weight]));

    for (const movieGenre of movieGenres) {
      const weight = genreWeightMap.get(movieGenre) || 0;
      totalWeight += weight;
    }

    // Normalize: divide by max possible weight (sum of top genres)
    const maxWeight = userGenres.reduce((sum, g) => sum + g.weight, 0);
    return maxWeight > 0 ? totalWeight / maxWeight : 0;
  }

  /**
   * Calculate popularity score from movie rating
   *
   * @param voteAverage - TMDB vote average (0-10)
   * @returns Score 0-1
   */
  calculatePopularityScore(voteAverage: number | null): number {
    if (!voteAverage || voteAverage < 0) return 0;
    return Math.min(voteAverage / 10, 1); // Normalize 0-10 to 0-1
  }
}

export const metadataSearchEngine = MetadataSearchEngine.getInstance();