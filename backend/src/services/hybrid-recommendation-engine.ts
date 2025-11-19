/**
 * HybridRecommendationEngine
 * Combines vector search + metadata search for hybrid recommendations
 * Main orchestration for Fase 3B.2
 */

import { prisma } from '../lib/prisma';
import { semanticSearchService } from './semantic-search.service';
import { metadataSearchEngine } from './metadata-search-engine';
import { userMetadataExtractor } from './user-metadata-extractor';
import { getPineconeService } from '../config/pinecone.config';
import {
  UserMetadataProfile,
  ScoreWeights,
  RecommendationResult,
  MovieResult,
  HybridRecommendationOptions
} from '../types/rag.types';

export class HybridRecommendationEngine {
  private static instance: HybridRecommendationEngine;

  // Default score weights
  private defaultWeights: ScoreWeights = {
    vector: 0.3,        // 30% vector similarity
    genre: 0.2,         // 20% genre matching
    popularity: 0.15,   // 15% popularity
    genreBoost: 0.25,   // 25% genre boost
    recencyBoost: 0.1   // 10% recency bonus
  };

  private constructor() {}

  static getInstance(): HybridRecommendationEngine {
    if (!HybridRecommendationEngine.instance) {
      HybridRecommendationEngine.instance = new HybridRecommendationEngine();
    }
    return HybridRecommendationEngine.instance;
  }

  /**
   * Get hybrid recommendations for user
   * Combines: Vector search + Genre search + Metadata scoring
   *
   * @param userId - User ID
   * @param options - Recommendation options
   * @returns Array of recommended movies
   */
  async getRecommendations(
    userId: number,
    options: HybridRecommendationOptions = {}
  ): Promise<RecommendationResult[]> {
    const startTime = Date.now();

    try {
      const topK = options.topK || 10;
      const excludeRated = options.excludeRated !== false;
      const minUserRating = options.minUserRating || 3;
      const weights = { ...this.defaultWeights, ...(options.weights || {}) };

      console.log(
        `\n🎬 Hybrid Recommendations for User ${userId} (topK: ${topK})\n`
      );

      // Step 1: Extract user metadata
      console.log('📊 Step 1: Extracting user metadata...');
      const userProfile = await userMetadataExtractor.extractUserMetadata(
        userId,
        minUserRating
      );

      // Step 2: Handle cold start
      if (userMetadataExtractor.isUserColdStart(userProfile)) {
        console.log('❄️  Cold start detected: returning popular movies');
        const popularMovies = await semanticSearchService.getPopularMoviesSuggestions(topK);
        // Convert MovieResult to RecommendationResult for cold start
        return popularMovies.map(movie => ({
          ...movie,
          recommendationScore: 0.5, // Neutral score for cold start
          scoreBreakdown: {
            vector: 0,
            genre: 0,
            popularity: 0.5
          },
          matchedGenres: [],
          matchReason: 'Popular movie for new users'
        }));
      }

      // Step 3: Get rated movie IDs for exclusion
      let excludeMovieIds: number[] = [];
      if (excludeRated) {
        excludeMovieIds = await metadataSearchEngine.getRatedMovieIds(userId);
      }

      // Step 4: Perform vector search
      console.log('📍 Step 2: Performing vector search...');
      const userVector = await this.generateUserVector(userProfile);
      const pineconeResults = await getPineconeService().search(
        userVector,
        topK * 2 // Get more candidates for filtering
      );
      console.log(`   Found ${pineconeResults.length} vector matches`);

      // Convert Pinecone SearchResult to MovieResult with similarity scores
      const vectorResults = await this.convertSearchResultsToMovieResults(
        pineconeResults
      );

      // Step 5: Perform genre search
      console.log('📍 Step 3: Performing genre search...');
      const genreResults = await metadataSearchEngine.searchByGenres(
        userProfile,
        excludeMovieIds,
        topK * 2
      );
      console.log(`   Found ${genreResults.length} genre matches`);

      // Step 6: Merge and score results
      console.log('📍 Step 4: Merging and scoring results...');
      const combined = await this.combineAndScore(
        vectorResults,
        genreResults,
        userProfile,
        excludeMovieIds,
        weights
      );

      // Step 7: Sort and limit results
      const recommendations = combined
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, topK);

      const duration = Date.now() - startTime;
      console.log(`\n✅ Recommendations complete: ${recommendations.length} results in ${duration}ms`);
      console.log(
        `   Top match: "${recommendations[0]?.title}" (score: ${(
          recommendations[0]?.recommendationScore * 100
        ).toFixed(1)}%)\n`
      );

      return recommendations;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Hybrid recommendation failed: ${message}`);
      throw new Error(`Recommendation generation failed: ${message}`);
    }
  }

  /**
   * Generate user vector by averaging top-rated movie embeddings
   *
   * @param userProfile - User metadata profile
   * @returns Averaged embedding vector
   */
  private async generateUserVector(userProfile: UserMetadataProfile): Promise<number[]> {
    if (userProfile.topRatedMovieIds.length === 0) {
      throw new Error('Cannot generate user vector: no top-rated movies');
    }

    console.log('   Fetching embeddings for top-rated movies...');
    const embeddings = await metadataSearchEngine.getMovieEmbeddings(
      userProfile.topRatedMovieIds
    );

    if (embeddings.length === 0) {
      throw new Error('No embeddings available for user vector generation');
    }

    const userVector = metadataSearchEngine.averageEmbeddings(embeddings);
    console.log('   User vector created (averaged from top movies)');
    return userVector;
  }

  /**
   * Convert Pinecone SearchResult to MovieResult by enriching with database data
   * Adds full movie information and preserves similarity scores
   *
   * @param searchResults - Results from Pinecone search
   * @returns Array of MovieResult with similarity scores from Pinecone
   */
  private async convertSearchResultsToMovieResults(
    searchResults: any[]
  ): Promise<MovieResult[]> {
    if (searchResults.length === 0) {
      return [];
    }

    // Extract movie IDs from search results
    const movieIds = searchResults.map(r => parseInt(r.movieId));

    // Fetch full movie data from database
    const movies = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
      include: {
        categories: {
          include: { category: true }
        }
      }
    });

    // Create a map for quick lookup with similarity scores
    const movieMap = new Map(movies.map(m => [m.id, m]));
    const resultMap = new Map(searchResults.map(r => [parseInt(r.movieId), r]));

    // Convert to MovieResult, preserving similarity scores
    const results: MovieResult[] = [];
    for (const movie of movies) {
      const searchResult = resultMap.get(movie.id);
      if (searchResult) {
        results.push({
          id: movie.id,
          tmdbId: movie.tmdbId,
          title: movie.title,
          year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null,
          overview: movie.overview,
          genres: movie.categories.map(mc => mc.category.name),
          posterPath: movie.posterPath,
          voteAverage: movie.voteAverage ? parseFloat(movie.voteAverage.toString()) : null,
          similarityScore: searchResult.score // Preserve Pinecone similarity score
        });
      }
    }

    return results;
  }

  /**
   * Combine vector and genre results, apply scoring
   *
   * @param vectorResults - Results from Pinecone vector search
   * @param genreResults - Results from genre-based search
   * @param userProfile - User metadata profile
   * @param excludeMovieIds - Movies to exclude
   * @param weights - Scoring weights
   * @returns Array of scored recommendation results
   */
  private async combineAndScore(
    vectorResults: MovieResult[],
    genreResults: MovieResult[],
    userProfile: UserMetadataProfile,
    excludeMovieIds: number[],
    weights: ScoreWeights
  ): Promise<RecommendationResult[]> {
    // Create a map to deduplicate and merge results
    const movieMap = new Map<number, RecommendationResult>();

    // Add vector results
    for (const movie of vectorResults) {
      if (excludeMovieIds.includes(movie.id)) continue;

      const vectorScore = movie.similarityScore || 0;
      const genreScore = metadataSearchEngine.calculateGenreScore(
        movie.genres,
        userProfile.favoriteGenres
      );
      const popularityScore = metadataSearchEngine.calculatePopularityScore(
        movie.voteAverage as number
      );

      const finalScore = this.calculateHybridScore(
        vectorScore,
        genreScore,
        popularityScore,
        weights
      );

      movieMap.set(movie.id, {
        ...movie,
        recommendationScore: finalScore,
        scoreBreakdown: {
          vector: vectorScore,
          genre: genreScore,
          popularity: popularityScore
        },
        matchedGenres: movie.genres.filter(g =>
          userProfile.favoriteGenres.some(fg => fg.genre === g)
        ),
        matchReason: this.generateMatchReason(movie, genreScore, vectorScore)
      });
    }

    // Add/update with genre results
    for (const movie of genreResults) {
      if (excludeMovieIds.includes(movie.id)) continue;

      const existing = movieMap.get(movie.id);
      if (existing) {
        // Boost score if in genre results
        existing.recommendationScore *= 1.15;
      } else {
        const vectorScore = movie.similarityScore || 0;
        const genreScore = metadataSearchEngine.calculateGenreScore(
          movie.genres,
          userProfile.favoriteGenres
        );
        const popularityScore = metadataSearchEngine.calculatePopularityScore(
          movie.voteAverage as number
        );

        const finalScore = this.calculateHybridScore(
          vectorScore,
          genreScore,
          popularityScore,
          weights
        );

        movieMap.set(movie.id, {
          ...movie,
          recommendationScore: finalScore,
          scoreBreakdown: {
            vector: vectorScore,
            genre: genreScore,
            popularity: popularityScore
          },
          matchedGenres: movie.genres.filter(g =>
            userProfile.favoriteGenres.some(fg => fg.genre === g)
          ),
          matchReason: this.generateMatchReason(movie, genreScore, vectorScore)
        });
      }
    }

    return Array.from(movieMap.values());
  }

  /**
   * Calculate final hybrid score
   *
   * @param vectorScore - Vector similarity (0-1)
   * @param genreScore - Genre match (0-1)
   * @param popularityScore - Popularity (0-1)
   * @param weights - Scoring weights
   * @returns Final score (0-1)
   */
  private calculateHybridScore(
    vectorScore: number,
    genreScore: number,
    popularityScore: number,
    weights: ScoreWeights
  ): number {
    return (
      vectorScore * weights.vector +
      genreScore * weights.genreBoost +
      popularityScore * weights.popularity
    );
  }

  /**
   * Generate human-readable match reason
   *
   * @param movie - Movie result
   * @param genreScore - Genre match score
   * @param vectorScore - Vector similarity score
   * @returns String describing why this movie was recommended
   */
  private generateMatchReason(
    movie: MovieResult,
    genreScore: number,
    vectorScore: number
  ): string {
    const reasons: string[] = [];

    if (vectorScore >= 0.7) {
      reasons.push('similar to your favorite movies');
    } else if (vectorScore >= 0.5) {
      reasons.push('related to your taste');
    }

    if (genreScore >= 0.7) {
      reasons.push(`matches your favorite genres`);
    }

    if (!reasons.length) {
      reasons.push('recommended based on your profile');
    }

    return reasons.join(', ');
  }
}

export const hybridRecommendationEngine = HybridRecommendationEngine.getInstance();