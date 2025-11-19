/**
 * FiltersSidebar Component
 * Refactored version using custom hooks
 *
 * Sidebar for filtering movies by various criteria
 * Integrates with useFilterMovies hook
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sliders } from 'lucide-react';

interface FiltersSidebarProps {
  onClose: () => void;
  onApplyFilters: (filters: { genre: string; year: number | null; minRating: number }) => void;
}

const GENRES = [
  'Acción',
  'Comedia',
  'Drama',
  'Terror',
  'Ciencia Ficción',
  'Suspenso',
  'Romance',
  'Animación',
];

// Mapeo de géneros a slugs (para enviar al backend)
const GENRE_SLUGS: Record<string, string> = {
  'Acción': 'accion',
  'Comedia': 'comedia',
  'Drama': 'drama',
  'Terror': 'terror',
  'Ciencia Ficción': 'ciencia-ficcion',
  'Suspenso': 'suspenso',
  'Romance': 'romance',
  'Animación': 'animacion',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS_LIST = Array.from(
  { length: CURRENT_YEAR - 1970 + 1 },
  (_, i) => CURRENT_YEAR - i
).sort((a, b) => a - b);

const RATINGS = [4, 6, 8, 9];

/**
 * FiltersSidebar Component
 * Sidebar with various movie filter options
 *
 * @param onClose - Callback to close sidebar
 * @param onGenreToggle - Callback when genre is toggled
 * @param onYearRangeChange - Callback when year range changes
 * @param onMinRatingChange - Callback when min rating changes
 *
 * @example
 * ```typescript
 * {showFilters && (
 *   <FiltersSidebar
 *     onClose={handleClose}
 *     onGenreToggle={handleGenreToggle}
 *     onYearRangeChange={handleYearChange}
 *     onMinRatingChange={handleRatingChange}
 *   />
 * )}
 * ```
 */
const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  onClose,
  onApplyFilters,
}) => {
  // Local state for filter values
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);

  /**
   * Handle genre toggle - Solo actualiza estado local
   */
  const handleGenreToggle = (genre: string) => {
    const isSelected = selectedGenres.includes(genre);
    const updated = isSelected
      ? selectedGenres.filter((g) => g !== genre)
      : [genre];
    setSelectedGenres(updated);
  };

  /**
   * Handle year change - Solo actualiza estado local
   */
  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
  };

  /**
   * Handle rating change - Solo actualiza estado local
   */
  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
  };

  /**
   * Handle apply filters - Aplica los filtros y cierra el sidebar
   */
  const handleApplyFilters = () => {
    const genreSlug = selectedGenres.length > 0
      ? (GENRE_SLUGS[selectedGenres[0]] || selectedGenres[0].toLowerCase())
      : '';

    onApplyFilters({
      genre: genreSlug,
      year: selectedYear,
      minRating: minRating,
    });

    onClose();
  };

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSelectedYear(null);
    setMinRating(0);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        className="fixed left-0 top-0 bottom-0 w-full sm:w-96 md:w-[400px] bg-dark-card z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-card border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Filtros</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-hover transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="p-6 space-y-8">
          {/* Genres */}
          <div>
            <label className="block text-sm font-semibold mb-3">Géneros</label>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-4 py-2 rounded-lg transition-all border ${
                    selectedGenres.includes(genre)
                      ? 'bg-primary text-white border-primary-pink'
                      : 'bg-dark-hover hover:bg-dark-hover/80 text-gray-300 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Año: {selectedYear ? selectedYear : 'Cualquiera'}
            </label>
            <select
              value={selectedYear || ''}
              onChange={(e) => handleYearChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 rounded-lg bg-dark-hover text-white border border-gray-600 focus:border-primary-pink focus:outline-none transition-colors"
            >
              <option value="">Todos los años</option>
              {YEARS_LIST.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Calificación Mínima: {minRating > 0 ? `Más de ${minRating}` : 'Cualquiera'}⭐
            </label>
            <div className="flex gap-2">
              {[0, ...RATINGS].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-all border ${
                    minRating === rating
                      ? 'bg-yellow-500 text-white border-yellow-400'
                      : 'bg-dark-hover hover:bg-dark-hover/80 text-gray-300 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {rating === 0 ? 'Cualquiera' : `${rating}+⭐`}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={handleResetFilters}
              className="flex-1 px-4 py-3 rounded-lg bg-dark-hover hover:bg-dark-hover/80 font-semibold transition-all border border-gray-600 hover:border-gray-500"
            >
              Restablecer
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-3 rounded-lg bg-primary hover:bg-primary/80 font-semibold transition-all border border-primary-pink"
            >
              Aplicar
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FiltersSidebar;
