/**
 * SemanticSearchService
 * Handles semantic search using vector embeddings
 * - Generates embeddings from user query
 * - Searches Pinecone for similar movies
 * - Enriches results with PostgreSQL data
 * - Applies filters (genre, year, similarity threshold)
 * - Caches popular movies for cold start (30 min TTL)
 */

import { prisma } from '../lib/prisma';
import { embeddingService } from './embedding.service';
import { getPineconeService } from '../config/pinecone.config';
import { MovieResult, SearchOptions } from '../types/rag.types';
import { cacheService } from './cache.service';

export class SemanticSearchService {
  private static instance: SemanticSearchService;

  private constructor() {}

  static getInstance(): SemanticSearchService {
    if (!SemanticSearchService.instance) {
      SemanticSearchService.instance = new SemanticSearchService();
    }
    return SemanticSearchService.instance;
  }

  /**
   * Search for movies by natural language query
   * @param query - User's search query (e.g., "action movies with car chases")
   * @param options - Search options (topK, filters)
   * @returns Array of matching movies with similarity scores
   */
  async search(query: string, options?: SearchOptions): Promise<MovieResult[]> {
    const startTime = Date.now();

    try {
      const topK = options?.topK || 10;
      const minSimilarity = options?.filters?.minSimilarity || 0;

      console.log(`🔍 Semantic Search: "${query}" (topK: ${topK})`);

      // Step 1: Generate embedding from query
      console.log('📍 Generating query embedding...');
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      if (queryEmbedding.length !== 384) {
        throw new Error(`Invalid query embedding dimension: ${queryEmbedding.length}, expected 384`);
      }

      // Step 2: Search Pinecone
      console.log('📍 Searching Pinecone...');
      const pineconeService = getPineconeService();
      const vectorResults = await pineconeService.search(queryEmbedding, topK);

      if (vectorResults.length === 0) {
        console.log('⚠️ No results found in Pinecone');
        return [];
      }

      console.log(`📊 Found ${vectorResults.length} similar vectors`);

      // Step 3: Filter by similarity threshold
      const filteredResults = vectorResults.filter(r => r.score >= minSimilarity);
      if (filteredResults.length === 0) {
        console.log(`⚠️ No results meet minimum similarity threshold: ${minSimilarity}`);
        return [];
      }

      // Step 4: Fetch full movie data from PostgreSQL
      console.log('📍 Enriching results with database data...');
      const movieIds = filteredResults.map(r => parseInt(r.movieId));

      const movies = await prisma.movie.findMany({
        where: { id: { in: movieIds } },
        include: {
          categories: {
            include: { category: true }
          }
        }
      });

      // Step 5: Create mapping of results with similarity scores
      const movieMap = new Map(movies.map(m => [m.id, m]));
      const enrichedResults: MovieResult[] = filteredResults
        .map(vr => {
          const movie = movieMap.get(parseInt(vr.movieId));
          if (!movie) return null;

          return {
            id: movie.id,
            tmdbId: movie.tmdbId,
            title: movie.title,
            year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null,
            overview: movie.overview,
            genres: movie.categories.map(mc => mc.category.name),
            posterPath: movie.posterPath,
            voteAverage: movie.voteAverage ? parseFloat(movie.voteAverage.toString()) : null,
            similarityScore: vr.score
          };
        })
        .filter(Boolean) as MovieResult[];

      // Step 6: Apply additional filters (genre, year range)
      let finalResults = enrichedResults;

      if (options?.filters?.genres && options.filters.genres.length > 0) {
        console.log(`📍 Filtering by genres: ${options.filters.genres.join(', ')}`);
        finalResults = finalResults.filter(m =>
          m.genres.some(g => options.filters!.genres!.includes(g))
        );
      }

      if (options?.filters?.yearRange) {
        const [minYear, maxYear] = options.filters.yearRange;
        console.log(`📍 Filtering by year range: ${minYear}-${maxYear}`);
        finalResults = finalResults.filter(m =>
          m.year && m.year >= minYear && m.year <= maxYear
        );
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Search complete: ${finalResults.length} results in ${duration}ms\n`);

      return finalResults;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Semantic search failed: ${message}`);
      throw new Error(`Semantic search failed: ${message}`);
    }
  }

  /**
   * Find movies similar to a specific movie
   * @param movieId - Database ID of the movie
   * @param topK - Number of similar movies to return
   * @returns Array of similar movies
   */
  async searchByMovieId(movieId: number, topK: number = 5): Promise<MovieResult[]> {
    try {
      console.log(`🔍 Finding movies similar to ID ${movieId}`);

      // Step 1: Get the movie
      const movie = await prisma.movie.findUnique({
        where: { id: movieId },
        include: {
          embeddings: true,
          categories: { include: { category: true } }
        }
      });

      if (!movie) {
        throw new Error(`Movie not found: ${movieId}`);
      }

      if (!movie.embeddings || movie.embeddings.length === 0) {
        throw new Error(`No embedding found for movie: ${movieId}`);
      }

      // Step 2: Get the embedding vector
      const embedding = movie.embeddings[0].vectorId;
      if (!embedding) {
        throw new Error(`Invalid embedding for movie: ${movieId}`);
      }

      const queryEmbedding = JSON.parse(embedding) as number[];

      if (queryEmbedding.length !== 384) {
        throw new Error(`Invalid embedding dimension: ${queryEmbedding.length}`);
      }

      // Step 3: Search Pinecone for similar movies (exclude the movie itself)
      const pineconeService = getPineconeService();
      const results = await pineconeService.search(queryEmbedding, topK + 1);

      // Filter out the movie itself
      const similarResults = results
        .filter(r => parseInt(r.movieId) !== movieId)
        .slice(0, topK);

      if (similarResults.length === 0) {
        console.log('⚠️ No similar movies found');
        return [];
      }

      // Step 4: Enrich with database data
      const movieIds = similarResults.map(r => parseInt(r.movieId));
      const movies = await prisma.movie.findMany({
        where: { id: { in: movieIds } },
        include: {
          categories: { include: { category: true } }
        }
      });

      const movieMap = new Map(movies.map(m => [m.id, m]));
      const enrichedResults: MovieResult[] = similarResults
        .map(vr => {
          const m = movieMap.get(parseInt(vr.movieId));
          if (!m) return null;

          return {
            id: m.id,
            tmdbId: m.tmdbId,
            title: m.title,
            year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : null,
            overview: m.overview,
            genres: m.categories.map(mc => mc.category.name),
            posterPath: m.posterPath,
            voteAverage: m.voteAverage ? parseFloat(m.voteAverage.toString()) : null,
            similarityScore: vr.score
          };
        })
        .filter(Boolean) as MovieResult[];

      console.log(`✅ Found ${enrichedResults.length} similar movies\n`);
      return enrichedResults;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Search by movie ID failed: ${message}`);
      throw new Error(`Search failed: ${message}`);
    }
  }

  /**
   * Get search suggestions based on popular movies
   * Used as fallback when semantic search returns no results
   * Includes L1 cache optimization (30 min TTL)
   * @param topK - Number of movies to return
   * @returns Array of popular movies
   */
  async getPopularMoviesSuggestions(topK: number = 10): Promise<MovieResult[]> {
    try {
      console.log('📍 Getting popular movies as suggestions...');

      // Check cache first (30 min TTL for popular movies)
      const cached = cacheService.getPopularMovies(topK);
      if (cached) {
        console.log(`💾 Retrieved ${cached.length} popular movies from cache`);
        return cached;
      }

      const movies = await prisma.movie.findMany({
        take: topK,
        orderBy: { voteAverage: 'desc' },
        include: {
          categories: { include: { category: true } }
        }
      });

      const results: MovieResult[] = movies.map(m => ({
        id: m.id,
        tmdbId: m.tmdbId,
        title: m.title,
        year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : null,
        overview: m.overview,
        genres: m.categories.map(mc => mc.category.name),
        posterPath: m.posterPath,
        voteAverage: m.voteAverage ? parseFloat(m.voteAverage.toString()) : null,
        similarityScore: undefined
      }));

      // Cache the result
      cacheService.setPopularMovies(topK, results);

      console.log(`✅ Retrieved ${results.length} popular movies\n`);
      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to get popular suggestions: ${message}`);
      return [];
    }
  }
}

export const semanticSearchService = SemanticSearchService.getInstance();