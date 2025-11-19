/**
 * useMovieStats Hook
 * Provides statistical information about user's movie interactions
 *
 * Aggregates data from matches and ratings to provide insights
 * like average ratings, most rated genres, etc.
 */

import { useCallback, useMemo } from 'react';
import { useMovieMatches } from './useMovieMatches';
import { useMovieRatings } from './useMovieRatings';
import { useMovieRepository } from './useMovieRepository';
import type { Movie } from '@core';

/**
 * Movie statistics interface
 */
interface MovieStats {
  totalMatches: number;
  totalRatings: number;
  averageRating: number;
  highestRatedMovie: Movie | null;
  lowestRatedMovie: Movie | null;
  mostCommonGenre: string | null;
  averageYearMatched: number;
  averageYearRated: number;
  ratingDistribution: Record<number, number>;
  genreDistribution: Record<string, number>;
}

/**
 * Hook for getting movie statistics
 *
 * Provides computed statistics including:
 * - Total matches and ratings count
 * - Average rating
 * - Highest/lowest rated movies
 * - Genre distribution
 * - Year distribution
 *
 * @returns Object with computed statistics
 *
 * @example
 * ```typescript
 * const {
 *   stats,
 *   loading,
 *   getMostRatedGenres,
 *   getAverageRatingByGenre
 * } = useMovieStats()
 *
 * console.log(`You've rated ${stats.totalRatings} movies`)
 * console.log(`Your average rating is ${stats.averageRating}`)
 * ```
 */
export function useMovieStats() {
  const { matches, loading: matchesLoading } = useMovieMatches();
  const { ratings, loading: ratingsLoading } = useMovieRatings();
  const { getById } = useMovieRepository();

  /**
   * Compute statistics
   */
  const stats = useMemo((): MovieStats => {
    const genreDistribution: Record<string, number> = {};
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalYearMatched = 0;
    let totalYearRated = 0;
    let highestRatedMovie: Movie | null = null;
    let highestRating = 0;
    let lowestRatedMovie: Movie | null = null;
    let lowestRating = 5;

    // Process matches
    matches.forEach((movie) => {
      totalYearMatched += movie.year;
      movie.genres.forEach((genre) => {
        genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
      });
    });

    // Process ratings
    ratings.forEach((rating) => {
      const matchedMovie = matches.find((m) => m.id === rating.movieId);
      if (matchedMovie) {
        totalYearRated += matchedMovie.year;
      }

      if (rating.rating >= 1 && rating.rating <= 5) {
        ratingDistribution[rating.rating]++;
      }

      // Track highest rated
      if (rating.rating > highestRating) {
        highestRating = rating.rating;
        highestRatedMovie = matchedMovie || null;
      }

      // Track lowest rated
      if (rating.rating < lowestRating) {
        lowestRating = rating.rating;
        lowestRatedMovie = matchedMovie || null;
      }
    });

    // Find most common genre
    let mostCommonGenre: string | null = null;
    let maxCount = 0;
    Object.entries(genreDistribution).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonGenre = genre;
      }
    });

    return {
      totalMatches: matches.length,
      totalRatings: ratings.length,
      averageRating:
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) *
                10
            ) / 10
          : 0,
      highestRatedMovie,
      lowestRatedMovie,
      mostCommonGenre,
      averageYearMatched:
        matches.length > 0 ? Math.round(totalYearMatched / matches.length) : 0,
      averageYearRated:
        ratings.length > 0 ? Math.round(totalYearRated / ratings.length) : 0,
      ratingDistribution,
      genreDistribution,
    };
  }, [matches, ratings]);

  /**
   * Get average rating by genre
   */
  const getAverageRatingByGenre = useCallback(
    (genre: string): number => {
      const genreRatings = ratings.filter((r) => {
        const movie = matches.find((m) => m.id === r.movieId);
        return movie?.genres.includes(genre);
      });

      if (genreRatings.length === 0) return 0;
      const sum = genreRatings.reduce((acc, r) => acc + r.rating, 0);
      return Math.round((sum / genreRatings.length) * 10) / 10;
    },
    [ratings, matches]
  );

  /**
   * Get movies from a specific genre
   */
  const getMoviesByGenre = useCallback(
    (genre: string): Movie[] => {
      return matches.filter((m) => m.genres.includes(genre));
    },
    [matches]
  );

  /**
   * Get rating count for a genre
   */
  const getRatingCountByGenre = useCallback(
    (genre: string): number => {
      return matches.filter((m) => m.genres.includes(genre)).length;
    },
    [matches]
  );

  /**
   * Get most rated genres
   */
  const getMostRatedGenres = useCallback(
    (limit: number = 5): Array<{ genre: string; count: number }> => {
      return Object.entries(stats.genreDistribution)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },
    [stats.genreDistribution]
  );

  /**
   * Get rating percentage
   */
  const getRatingPercentage = useCallback(
    (rating: number): number => {
      if (stats.totalRatings === 0) return 0;
      return Math.round(
        ((stats.ratingDistribution[rating] || 0) / stats.totalRatings) * 100
      );
    },
    [stats]
  );

  /**
   * Check if user has strong preferences (heavily rated one genre)
   */
  const hasStrongPreferences = useCallback((): boolean => {
    if (stats.totalRatings === 0) return false;
    const maxCount = Math.max(...Object.values(stats.genreDistribution));
    return maxCount > stats.totalRatings * 0.4; // More than 40% in one genre
  }, [stats]);

  /**
   * Get user rating pattern (if they prefer high or low ratings)
   */
  const getRatingPattern = useCallback(
    (): 'optimistic' | 'neutral' | 'critical' => {
      if (stats.averageRating >= 4) return 'optimistic';
      if (stats.averageRating <= 2.5) return 'critical';
      return 'neutral';
    },
    [stats.averageRating]
  );

  return {
    stats,
    loading: matchesLoading || ratingsLoading,
    getAverageRatingByGenre,
    getMoviesByGenre,
    getRatingCountByGenre,
    getMostRatedGenres,
    getRatingPercentage,
    hasStrongPreferences,
    getRatingPattern,
  };
}
