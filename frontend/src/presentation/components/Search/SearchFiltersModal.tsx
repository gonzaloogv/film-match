/**
 * SearchFiltersModal Component
 *
 * Modal for search filters
 * Contains all 5 filter controls in a clean modal layout
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { Backdrop } from '../ui/Backdrop/Backdrop';
import { useFiltersContext } from '../../../context/filters/useFiltersContext';

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Genre translations from English to Spanish
const GENRE_TRANSLATIONS: Record<string, string> = {
  'Action': 'Acción',
  'Adventure': 'Aventura',
  'Animation': 'Animación',
  'Comedy': 'Comedia',
  'Crime': 'Crimen',
  'Drama': 'Drama',
  'Fantasy': 'Fantasía',
  'Horror': 'Terror',
  'Mystery': 'Misterio',
  'Romance': 'Romance',
  'Sci-Fi': 'Ciencia Ficción',
  'Thriller': 'Suspenso',
  'Western': 'Occidental',
};

// Available genres (static list based on common movie genres)
const AVAILABLE_GENRES = Object.keys(GENRE_TRANSLATIONS).sort((a, b) =>
  (GENRE_TRANSLATIONS[a] || a).localeCompare(GENRE_TRANSLATIONS[b] || b)
);

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { criteria, decade, trend, sortBy, updateGenres, updateMinRating, setDecade, setTrend, setSortBy } =
    useFiltersContext();

  // Get available genres with Spanish translations
  const availableGenres = AVAILABLE_GENRES.map(genre => GENRE_TRANSLATIONS[genre] || genre);

  const handleGenreChange = (spanishGenre: string) => {
    // Convert Spanish genre back to English for storage
    const englishGenre = Object.entries(GENRE_TRANSLATIONS).find(
      ([_, spanish]) => spanish === spanishGenre
    )?.[0] || spanishGenre;

    const newGenres = criteria.genres.includes(englishGenre)
      ? criteria.genres.filter((g) => g !== englishGenre)
      : [...criteria.genres, englishGenre];
    updateGenres(newGenres);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={onClose} zIndex={40} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[90vh] bg-dark-card rounded-2xl border border-gray-800 flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-4 xs:p-6 border-b border-primary-pink/30 bg-dark-card z-10">
                <h2 className="text-xl xs:text-2xl font-bold text-white">Filtros</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-dark-input rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X size={24} className="text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 xs:p-6 space-y-5 xs:space-y-6">
                {/* Row 1: Decades and Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5">
                  {/* Decades Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2 xs:mb-2.5">
                      Décadas
                    </label>
                    <div className="relative">
                      <select
                        value={decade}
                        onChange={(e) => setDecade(e.target.value as any)}
                        className="input-field appearance-none pr-10 xs:pr-12 text-xs xs:text-sm sm:text-base w-full cursor-pointer"
                      >
                        <option value="all">Todas</option>
                        <option value="70s">70s</option>
                        <option value="80s">80s</option>
                        <option value="90s">90s</option>
                        <option value="00s">00s</option>
                        <option value="10s">10s</option>
                        <option value="20s">20s</option>
                      </select>
                      <ChevronDown className="absolute right-3 xs:right-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2 xs:mb-2.5">
                      Calificación Mínima
                    </label>
                    <div className="relative">
                      <select
                        value={criteria.minRating}
                        onChange={(e) => updateMinRating(parseFloat(e.target.value))}
                        className="input-field appearance-none pr-10 xs:pr-12 text-xs xs:text-sm sm:text-base w-full cursor-pointer"
                      >
                        <option value="0">Cualquier calificación</option>
                        <option value="1">★+ (1 estrella)</option>
                        <option value="2">★★+ (2 estrellas)</option>
                        <option value="3">★★★+ (3 estrellas)</option>
                        <option value="4">★★★★+ (4 estrellas)</option>
                      </select>
                      <ChevronDown className="absolute right-3 xs:right-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Genres (multi-select) */}
                <div>
                  <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2.5 xs:mb-3">
                    Géneros
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-2.5">
                    {availableGenres.map((spanishGenre) => {
                      // Get English version to check if selected
                      const englishGenre = Object.entries(GENRE_TRANSLATIONS).find(
                        ([_, spanish]) => spanish === spanishGenre
                      )?.[0] || spanishGenre;
                      const isSelected = criteria.genres.includes(englishGenre);

                      return (
                        <button
                          key={spanishGenre}
                          onClick={() => handleGenreChange(spanishGenre)}
                          className={`px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl text-xs xs:text-sm font-medium transition-all border ${
                            isSelected
                              ? 'bg-primary-pink border-primary-pink text-white'
                              : 'bg-dark-card border-gray-700 text-gray-300 hover:border-primary-pink'
                          }`}
                        >
                          {spanishGenre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 3: Trend and Sort */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5">
                  {/* Trend Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2 xs:mb-2.5">
                      Tendencia
                    </label>
                    <div className="relative">
                      <select
                        value={trend}
                        onChange={(e) => setTrend(e.target.value as any)}
                        className="input-field appearance-none pr-10 xs:pr-12 text-xs xs:text-sm sm:text-base w-full cursor-pointer"
                      >
                        <option value="all">Todas</option>
                        <option value="trending">Tendencias</option>
                        <option value="recent">Recientes</option>
                        <option value="oldest">Antiguas</option>
                      </select>
                      <ChevronDown className="absolute right-3 xs:right-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2 xs:mb-2.5">
                      Ordenar por
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="input-field appearance-none pr-10 xs:pr-12 text-xs xs:text-sm sm:text-base w-full cursor-pointer"
                      >
                        <option value="title">A-Z</option>
                        <option value="rating">Rating</option>
                        <option value="date">Fecha</option>
                      </select>
                      <ChevronDown className="absolute right-3 xs:right-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-4 xs:pt-6 border-t border-gray-700">
                  <button
                    onClick={onClose}
                    className="w-full px-4 xs:px-6 py-2.5 xs:py-3 bg-primary-pink hover:bg-primary-pink/90 text-white font-semibold rounded-lg xs:rounded-xl transition-colors text-xs xs:text-sm sm:text-base"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
