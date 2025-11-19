/**
 * UserMetadataExtractor
 * Analyzes user ratings to extract preference metadata
 * Used in Hybrid Recommendation System (Fase 3B.2)
 * Includes L1 in-memory caching (5 min TTL) for performance
 */

import { prisma } from '../lib/prisma';
import { UserMetadataProfile } from '../types/rag.types';
import { cacheService } from './cache.service';

export class UserMetadataExtractor {
  private static instance: UserMetadataExtractor;

  private constructor() {}

  static getInstance(): UserMetadataExtractor {
    if (!UserMetadataExtractor.instance) {
      UserMetadataExtractor.instance = new UserMetadataExtractor();
    }
    return UserMetadataExtractor.instance;
  }

  /**
   * Extract user metadata profile from their ratings
   * Analyzes: favorite genres, average rating, top movies
   * Uses L1 cache (5 min TTL) to avoid repeated extractions
   *
   * @param userId - User ID
   * @param minRating - Only consider ratings >= this value (default: 3)
   * @returns UserMetadataProfile with preferences
   */
  async extractUserMetadata(userId: number, minRating: number = 3): Promise<UserMetadataProfile> {
    try {
      // Check cache first
      const cached = cacheService.getUserMetadata(userId);
      if (cached) {
        console.log(`💾 Using cached metadata for user ${userId}`);
        return cached;
      }

      console.log(`📊 Extracting metadata for user ${userId} (minRating: ${minRating})...`);

      // Fetch all user ratings with movie details
      const ratings = await prisma.userRating.findMany({
        where: { userId },
        include: {
          movie: {
            include: {
              categories: {
                include: { category: true }
              }
            }
          }
        }
      });

      if (ratings.length === 0) {
        console.log(`⚠️  User ${userId} has no ratings`);
        return this.getEmptyProfile(userId);
      }

      // Calculate average rating
      const totalRatings = ratings.length;
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

      // Get top-rated movies (for vector averaging later)
      const topRatedMovies = ratings
        .filter(r => r.rating >= minRating)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5) // Top 5 movies
        .map(r => r.movie.id);

      // Extract and weight favorite genres
      const genreMap = new Map<string, { count: number; ratings: number[] }>();

      ratings.forEach(rating => {
        rating.movie.categories.forEach(mc => {
          const genreName = mc.category.name;
          if (!genreMap.has(genreName)) {
            genreMap.set(genreName, { count: 0, ratings: [] });
          }
          const genre = genreMap.get(genreName)!;
          genre.count++;
          genre.ratings.push(rating.rating);
        });
      });

      // Calculate genre weights based on frequency and average rating
      const favoriteGenres = Array.from(genreMap.entries())
        .map(([genre, data]) => {
          const avgRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
          const weight = (data.count / ratings.length) * (avgRating / 5); // Normalized 0-1
          return { genre, weight, count: data.count };
        })
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10); // Top 10 genres

      const profile: UserMetadataProfile = {
        userId,
        favoriteGenres,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRatings,
        topRatedMovieIds: topRatedMovies
      };

      // Cache the extracted metadata (5 min TTL)
      cacheService.setUserMetadata(userId, profile);

      console.log(`✅ Metadata extracted for user ${userId}`);
      console.log(`   - Total ratings: ${totalRatings}`);
      console.log(`   - Average rating: ${profile.averageRating}/5`);
      console.log(`   - Top genres: ${favoriteGenres.slice(0, 3).map(g => `${g.genre} (${(g.weight * 100).toFixed(0)}%)`).join(', ')}`);
      console.log(`   - Top movies for vector: ${topRatedMovies.join(', ')}`);

      return profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to extract user metadata: ${message}`);
      throw new Error(`User metadata extraction failed: ${message}`);
    }
  }

  /**
   * Get empty profile for users with no ratings (cold start)
   */
  private getEmptyProfile(userId: number): UserMetadataProfile {
    return {
      userId,
      favoriteGenres: [],
      averageRating: 0,
      totalRatings: 0,
      topRatedMovieIds: []
    };
  }

  /**
   * Check if user has enough ratings to generate meaningful recommendations
   */
  isUserColdStart(profile: UserMetadataProfile): boolean {
    return profile.totalRatings < 3; // Less than 3 ratings = cold start
  }

  /**
   * Get top N favorite genres for user
   */
  getTopGenres(profile: UserMetadataProfile, limit: number = 3): string[] {
    return profile.favoriteGenres
      .slice(0, limit)
      .map(g => g.genre);
  }

  /**
   * Get user rating statistics
   */
  getRatingStats(profile: UserMetadataProfile) {
    return {
      totalRatings: profile.totalRatings,
      averageRating: profile.averageRating,
      topMovies: profile.topRatedMovieIds.length,
      topGenres: profile.favoriteGenres.length
    };
  }
}

export const userMetadataExtractor = UserMetadataExtractor.getInstance();