/**
 * MatchModal Component
 * Refactored version using custom hooks
 *
 * Modal displayed when user matches with a movie
 * Allows user to view details or continue swiping
 * Uses React Portal to render outside the DOM hierarchy
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import type { Movie } from '@core';

interface MatchModalProps {
  movie: Movie;
  onClose: () => void;
  onViewDetails: () => void;
}

/**
 * MatchModal Component
 * Celebratory modal for movie matches
 *
 * @param movie - Matched movie
 * @param onClose - Callback to close modal
 * @param onViewDetails - Callback to view movie details
 *
 * @example
 * ```typescript
 * {showMatchModal && (
 *   <MatchModal
 *     movie={movie}
 *     onClose={handleClose}
 *     onViewDetails={handleDetails}
 *   />
 * )}
 * ```
 */
const MatchModal: React.FC<MatchModalProps> = ({ movie, onClose, onViewDetails }) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  // Crear contenedor portal si no existe
  useEffect(() => {
    let container = document.getElementById('match-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'match-modal-root';
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

          {/* Header with celebration */}
          <div className="relative bg-gradient-to-br from-green-500/20 to-transparent p-2 xs:p-3 sm:p-4 text-center flex-shrink-0">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 3 }}
              className="text-3xl xs:text-4xl sm:text-5xl mb-1 xs:mb-1.5"
            >
              💚
            </motion.div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-0.5 xs:mb-1">¡Es un Match!</h2>
            <p className="text-xs xs:text-xs sm:text-sm text-gray-400">Agregada a tus matches</p>
          </div>

          {/* Movie Preview */}
          <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-2.5 overflow-y-auto flex-1">
            <div className="relative rounded-lg overflow-hidden h-20 xs:h-24 sm:h-28 flex-shrink-0">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* Movie Info */}
            <div className="space-y-1">
              <h3 className="text-sm xs:text-base sm:text-lg font-bold line-clamp-2">{movie.title}</h3>
              <div className="flex items-center space-x-1 xs:space-x-1.5 text-xs text-gray-400">
                <span>{movie.year}</span>
                <span>•</span>
                <span className="line-clamp-1">{movie.genres[0]}</span>
              </div>
              <p className="text-gray-300 text-xs line-clamp-2">{movie.overview}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-1 xs:gap-2 py-2 border-t border-white/10 flex-shrink-0">
              <div className="text-center">
                <p className="text-xs text-gray-400">Cal.</p>
                <p className="text-sm xs:text-base font-bold">{movie.rating}⭐</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Dur.</p>
                <p className="text-sm xs:text-base font-bold">{movie.duration}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Año</p>
                <p className="text-sm xs:text-base font-bold">{movie.year}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 xs:gap-2 p-2 xs:p-3 sm:p-4 flex-shrink-0 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-dark-hover hover:bg-dark-hover/80 font-semibold text-xs xs:text-sm transition-all"
            >
              Continuar
            </button>
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center gap-1 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-xs xs:text-sm transition-all"
            >
              <ExternalLink className="w-3 xs:w-4 h-3 xs:h-4" />
              <span className="hidden xs:inline">Ver</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );

  return createPortal(modalContent, portalElement);
};

export default MatchModal;
