/**
 * RatingModal Component
 * Refactored version using custom hooks
 *
 * Modal for rating and reviewing movies
 * Integrates with useMovieRatings hook
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { useMovieRatings } from '@/hooks';
import type { Movie, UserRating } from '@core';

interface RatingModalProps {
  movie: Movie;
  onClose: () => void;
  onRatingSubmit?: (rating: UserRating) => void;
}

/**
 * RatingModal Component
 * Modal for rating and commenting on movies
 *
 * @param movie - Movie to rate
 * @param onClose - Callback to close modal
 * @param onRatingSubmit - Optional callback when rating is submitted
 *
 * @example
 * ```typescript
 * {showRatingModal && (
 *   <RatingModal
 *     movie={movie}
 *     onClose={handleClose}
 *     onRatingSubmit={handleRatingSubmit}
 *   />
 * )}
 * ```
 */
const RatingModal: React.FC<RatingModalProps> = ({ movie, onClose, onRatingSubmit }) => {
  const { addRating } = useMovieRatings();

  // Local state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle rating submission
   */
  const handleSubmitRating = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const newRating: UserRating = {
        movieId: movie.id,
        rating,
        comment: comment || undefined,
      };

      await addRating(newRating);

      if (onRatingSubmit) {
        onRatingSubmit(newRating);
      }

      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al enviar la calificación';
      setError(errorMsg);
      console.error('Error submitting rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-40"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-sm sm:max-w-md bg-dark-card rounded-2xl overflow-hidden shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-transparent p-4 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Califica Esta Película</h2>
            <p className="text-sm sm:text-base text-gray-400">¿Qué piensas sobre {movie.title}?</p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Movie Info */}
            <div className="flex gap-4">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-20 h-28 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold mb-2">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.year}</p>
                <p className="text-xs text-gray-500 mt-2">{movie.genres.join(', ')}</p>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="text-center">
              <label className="block text-sm font-semibold mb-4">Tu Calificación</label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    onClick={() => setRating(star)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`transition-all ${
                      star <= rating
                        ? 'text-yellow-400 scale-110'
                        : 'text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    <Star
                      className="w-12 h-12"
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-3 text-sm text-gray-400">
                  {rating === 1 && 'No es mi tipo'}
                  {rating === 2 && 'Podría ser mejor'}
                  {rating === 3 && 'Bastante buena'}
                  {rating === 4 && 'Me gustó mucho'}
                  {rating === 5 && '¡La amé!'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold mb-3">Comentario (Opcional)</label>
              <textarea
                placeholder="Comparte tus pensamientos sobre esta película..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-3 bg-dark-hover rounded-lg border border-white/10 focus:border-primary outline-none resize-none text-sm"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">{comment.length}/500</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-lg bg-dark-hover hover:bg-dark-hover/80 font-semibold transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={isSubmitting || rating === 0}
                className="flex-1 px-4 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 font-semibold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default RatingModal;
