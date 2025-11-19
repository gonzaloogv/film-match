/**
 * SearchResults Component
 *
 * Grid display of search results with responsive layout
 * Shows empty state when no results found
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SearchMovieCard } from './SearchMovieCard';
import type { Movie } from '@core';

interface SearchResultsProps {
  movies: Movie[];
  totalResults: number;
  isLoading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  movies,
  totalResults,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-400">Cargando películas...</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="bg-dark-card rounded-2xl p-12 border border-gray-800 text-center">
        <p className="text-gray-400 text-sm xs:text-base">
          No se encontraron películas que coincidan con tus criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 xs:space-y-6">
      {/* Results count */}
      <div className="text-gray-400 text-xs xs:text-sm">
        Se encontraron <span className="text-primary-pink font-semibold">{totalResults}</span> películas
      </div>

      {/* Movie grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SearchMovieCard movie={movie} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
