/**
 * MovieReviewsModal Component
 * Modal that displays all reviews for a movie with star filtering
 * Uses React Portal to render outside the DOM hierarchy
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Star } from 'lucide-react';
import type { Movie } from '@core';
import { MOCK_MOVIE_REVIEWS, type MockReview } from '../../shared/mocks/userReviews';

interface MovieReviewsModalProps {
  movie: Movie;
  onClose: () => void;
}

const MovieReviewsModal: React.FC<MovieReviewsModalProps> = ({ movie, onClose }) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);

  // Crear contenedor portal si no existe
  useEffect(() => {
    let container = document.getElementById('movie-reviews-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'movie-reviews-modal-root';
      document.body.appendChild(container);
    }
    setPortalElement(container);
  }, []);

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (!portalElement) return null;

  // Obtener reseñas de la película
  const allReviews = MOCK_MOVIE_REVIEWS[movie.id] || [];

  // Filtrar por estrellas seleccionadas
  const filteredReviews = selectedStars
    ? allReviews.filter((review) => review.rating === selectedStars)
    : allReviews;

  // Contar reseñas por estrella
  const starCounts = {
    5: allReviews.filter((r) => r.rating === 5).length,
    4: allReviews.filter((r) => r.rating === 4).length,
    3: allReviews.filter((r) => r.rating === 3).length,
    2: allReviews.filter((r) => r.rating === 2).length,
    1: allReviews.filter((r) => r.rating === 1).length,
  };

  const modalContent = (
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6"
      >
        <div className="relative w-full max-w-xs xs:max-w-sm sm:max-w-md bg-dark-card rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-80px)]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10 p-1.5 xs:p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all"
          >
            <X className="w-4 xs:w-5 h-4 xs:h-5" />
          </button>

          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-500/20 to-transparent p-2 xs:p-3 sm:p-4 text-center flex-shrink-0">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-0.5 xs:mb-1 line-clamp-2">
              {movie.title}
            </h2>
            <p className="text-xs xs:text-xs sm:text-sm text-gray-400">
              {allReviews.length} reseña{allReviews.length !== 1 ? 's' : ''} en total
            </p>
          </div>

          {/* Star Filter */}
          <div className="p-2 xs:p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
            <p className="text-xs xs:text-xs sm:text-sm text-gray-400 mb-2 xs:mb-2.5">Filtrar por calificación:</p>
            <div className="flex flex-col gap-1 xs:gap-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedStars(selectedStars === star ? null : star)}
                  className={`w-full px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-xs xs:text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
                    selectedStars === star
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-hover hover:bg-dark-hover/80 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1 xs:gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 xs:w-3.5 h-3 xs:h-3.5 ${
                          i < star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs">({starCounts[star as keyof typeof starCounts]})</span>
                </button>
              ))}
            </div>
            {selectedStars && (
              <button
                onClick={() => setSelectedStars(null)}
                className="w-full mt-2 xs:mt-2 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-xs xs:text-xs sm:text-sm text-gray-300 transition-all"
              >
                Limpiar filtro
              </button>
            )}
          </div>

          {/* Reviews List */}
          <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-2.5 overflow-y-auto flex-1">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-4 xs:py-6">
                <p className="text-xs xs:text-sm text-gray-400">
                  No hay reseñas con {selectedStars} estrella{selectedStars !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              filteredReviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-2 xs:p-2.5 rounded-lg bg-dark-hover/50 border border-white/5"
                >
                  {/* User and Rating */}
                  <div className="flex items-center justify-between mb-1 xs:mb-1.5">
                    <p className="text-xs xs:text-sm font-semibold text-white truncate flex-1">
                      {review.userName || 'Usuario'}
                    </p>
                    <div className="flex gap-0.5 ml-2 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 xs:w-3.5 h-3 xs:h-3.5 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 mb-1 xs:mb-1.5">
                    {new Date(review.ratedAt).toLocaleDateString('es-ES')}
                  </p>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-xs xs:text-xs sm:text-sm text-gray-300 line-clamp-3">
                      {review.comment}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </>
  );

  return createPortal(modalContent, portalElement);
};

export default MovieReviewsModal;
