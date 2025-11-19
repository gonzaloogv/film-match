/**
 * UserStatsPanel Component
 * Refactored version using custom hooks
 *
 * Displays user statistics about movies they've watched and rated
 * Integrates with useMovieStats hook
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Film, Star, Zap } from 'lucide-react';
import { useMovieStats } from '@/hooks';

interface UserStatsPanelProps {
  expanded?: boolean;
}

/**
 * UserStatsPanel Component
 * Displays aggregated statistics about user's movie interactions
 *
 * @param expanded - Whether to show expanded view
 *
 * @example
 * ```typescript
 * <UserStatsPanel expanded={true} />
 * ```
 */
const UserStatsPanel: React.FC<UserStatsPanelProps> = ({ expanded = false }) => {
  const { stats, getMostRatedGenres, getRatingPattern, hasStrongPreferences, loading } =
    useMovieStats();
  const [showDetails, setShowDetails] = useState(expanded);

  if (loading) {
    return (
      <div className="p-6 rounded-lg bg-dark-card animate-pulse">
        <div className="h-12 bg-dark-hover rounded mb-4" />
        <div className="space-y-3">
          <div className="h-6 bg-dark-hover rounded" />
          <div className="h-6 bg-dark-hover rounded" />
        </div>
      </div>
    );
  }

  const topGenres = getMostRatedGenres(3);
  const ratingPattern = getRatingPattern();
  const hasPreferences = hasStrongPreferences();

  return (
    <motion.div className="w-full">
      {/* Compact View */}
      <motion.div
        onClick={() => setShowDetails(!showDetails)}
        className="p-6 rounded-lg bg-dark-card hover:bg-dark-hover transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Your Stats
          </h3>
          <span className="text-xs text-gray-400">
            {showDetails ? 'Hide' : 'Show'} details
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalMatches}</p>
            <p className="text-xs text-gray-400 mt-1">Matched</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.totalRatings}</p>
            <p className="text-xs text-gray-400 mt-1">Rated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.averageRating}⭐</p>
            <p className="text-xs text-gray-400 mt-1">Average</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {stats.mostCommonGenre?.slice(0, 3) || 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Favorite</p>
          </div>
        </div>
      </motion.div>

      {/* Expanded View */}
      <motion.div
        initial={false}
        animate={{ height: showDetails ? 'auto' : 0, opacity: showDetails ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-6 rounded-lg bg-dark-card border-t border-white/10 mt-4 space-y-6">
          {/* Highest and Lowest Rated */}
          <div className="grid grid-cols-2 gap-4">
            {stats.highestRatedMovie && (
              <div className="p-4 rounded-lg bg-dark-hover border border-green-500/20">
                <p className="text-xs text-gray-400 mb-2">Highest Rated</p>
                <p className="font-semibold text-sm text-green-400">
                  {stats.highestRatedMovie.title}
                </p>
              </div>
            )}
            {stats.lowestRatedMovie && (
              <div className="p-4 rounded-lg bg-dark-hover border border-red-500/20">
                <p className="text-xs text-gray-400 mb-2">Lowest Rated</p>
                <p className="font-semibold text-sm text-red-400">
                  {stats.lowestRatedMovie.title}
                </p>
              </div>
            )}
          </div>

          {/* Rating Distribution */}
          <div>
            <p className="text-sm font-semibold mb-3">Rating Distribution</p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-12">{stars}⭐</span>
                  <div className="flex-1 h-2 rounded-full bg-dark-hover overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.ratingDistribution[stars] / stats.totalRatings) * 100 || 0
                        }%`,
                      }}
                      transition={{ duration: 0.5, delay: stars * 0.1 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8">
                    {stats.ratingDistribution[stars]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Genres */}
          <div>
            <p className="text-sm font-semibold mb-3">Top Genres</p>
            <div className="flex flex-wrap gap-2">
              {topGenres.map((item, index) => (
                <div
                  key={item.genre}
                  className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center gap-2"
                >
                  <span className="text-lg">#{index + 1}</span>
                  {item.genre}
                  <span className="text-gray-400">({item.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Average Years */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-dark-hover">
              <p className="text-xs text-gray-400 mb-1">Avg Year Matched</p>
              <p className="text-2xl font-bold text-primary">{stats.averageYearMatched}</p>
            </div>
            <div className="p-4 rounded-lg bg-dark-hover">
              <p className="text-xs text-gray-400 mb-1">Avg Year Rated</p>
              <p className="text-2xl font-bold text-primary">{stats.averageYearRated}</p>
            </div>
          </div>

          {/* Insights */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              Insights
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                • Your rating pattern is{' '}
                <span className="font-semibold text-blue-400">{ratingPattern}</span>
                {ratingPattern === 'optimistic' && ' - you tend to rate movies highly!'}
                {ratingPattern === 'critical' && ' - you have high standards!'}
                {ratingPattern === 'neutral' && ' - you have balanced opinions!'}
              </p>
              {hasPreferences && (
                <p>
                  • You have <span className="font-semibold text-blue-400">strong preferences</span>{' '}
                  for {stats.mostCommonGenre} movies
                </p>
              )}
              <p>
                • You've matched with <span className="font-semibold text-green-400">{stats.totalMatches}</span> movies
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserStatsPanel;
