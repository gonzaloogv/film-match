/**
 * MovieCard Component
 * Refactored version using custom hooks
 *
 * Displays a single movie with swipe/drag interactions
 * Handles match and skip actions through callbacks
 */

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Star, ExternalLink } from 'lucide-react';
import type { Movie } from '@core';

interface MovieCardProps {
  movie: Movie;
  onMatch: () => void;
  onSkip: () => void;
  onShowDetails: () => void;
  isLoading?: boolean;
}

/**
 * MovieCard Component
 * Draggable card for swiping through movies
 *
 * @param movie - Movie to display
 * @param onMatch - Callback when user swipes right
 * @param onSkip - Callback when user swipes left
 * @param onShowDetails - Callback when user clicks details button
 *
 * @example
 * ```typescript
 * <MovieCard
 *   movie={movie}
 *   onMatch={handleMatch}
 *   onSkip={handleSkip}
 *   onShowDetails={handleViewDetails}
 * />
 * ```
 */
const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onMatch,
  onSkip,
  onShowDetails,
  isLoading = false,
}) => {
  // Drag animation values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Exit animation state
  const [exitX, setExitX] = useState(0);
  const [imageError, setImageError] = useState(false);

  /**
   * Reset exit animation when movie changes
   * This ensures each new movie starts with a fresh state
   */
  useEffect(() => {
    setExitX(0);
    setImageError(false);
  }, [movie.id]);

  /**
   * Handle drag end event
   */
  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 500 : -500);
      if (info.offset.x > 0) {
        onMatch();
      } else {
        onSkip();
      }
    }
  };

  /**
   * Handle button click match
   */
  const handleMatch = () => {
    setExitX(500);
    setTimeout(onMatch, 200);
  };

  /**
   * Handle button click skip
   */
  const handleSkip = () => {
    setExitX(-500);
    setTimeout(onSkip, 200);
  };

  return (
    <motion.div
      className="absolute w-full max-w-[90vw] sm:max-w-md lg:max-w-lg xl:max-w-xl cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity, height: 'clamp(280px, calc(100vh - 160px), 700px)' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gray-800">
        {/* Movie Poster Background */}
        {!imageError && (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Fallback when image fails to load */}
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-gray-400">Sin imagen disponible</p>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <span>{movie.year || 'N/A'}</span>
                <span>•</span>
                <span>{(movie.genres as any)?.join(', ') || 'Sin género'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold">{movie.rating}</span>
            </div>
          </div>


          {/* Description */}
          {(movie as any).overview && (
            <div>
              <p className="text-sm text-gray-300 line-clamp-2">{(movie as any).overview}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400"></div>
              ) : (
                <X className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">{isLoading ? 'Enviando...' : 'Rechazar'}</span>
            </button>
            <button
              onClick={handleMatch}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-green-400/30 border-t-green-400"></div>
              ) : (
                <Heart className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">{isLoading ? 'Enviando...' : 'Match'}</span>
            </button>
            <button
              onClick={onShowDetails}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="hidden sm:inline">Detalles</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
