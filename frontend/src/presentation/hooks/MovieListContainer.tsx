/**
 * MovieListContainer Component
 * Refactored version using custom hooks instead of AppContext
 *
 * Manages the main movie discovery flow with swiping functionality
 * Uses custom hooks for all state and data management
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovies, useRatings } from '@/hooks/api';
import { useMovieMatches, useFilterMovies } from '@/hooks';
import { useUI } from '../../context/ui';
import type { Movie } from '@core';
import type { CreateRatingDTO } from '@/api/types';
import MovieCardComponent from './MovieCard';
import MatchModalComponent from './MatchModal';
import FiltersSidebarComponent from './FiltersSidebar';

/**
 * Movie List Container Component
 * Main component for discovering and swiping through movies
 * Now uses React Query for server state management
 *
 * @example
 * ```typescript
 * <MovieListContainer />
 * ```
 */
const MovieListContainer: React.FC = () => {
  const navigate = useNavigate();

  // Filter state
  const [filterParams, setFilterParams] = React.useState<{
    genres: string[];
    year: number | null;
    minRating: number;
  }>({
    genres: [],
    year: null,
    minRating: 0,
  });

  // Get movies from React Query hook with current filters
  const queryParams = React.useMemo(() => {
    const params: any = {};

    // Solo incluir parámetros que tienen valores reales
    if (filterParams.genres.length > 0) {
      params.category = filterParams.genres[0]; // Backend uses 'category' parameter, already receives slug
      console.log('🎯 Filter by category:', params.category);
    }
    if (filterParams.year) {
      params.year = filterParams.year;
      console.log('🎯 Filter by year:', params.year);
    }
    if (filterParams.minRating > 0) {
      params.minRating = filterParams.minRating;
      console.log('🎯 Filter by minRating:', params.minRating);
    }

    console.log('📤 queryParams:', params);
    return Object.keys(params).length > 0 ? params : undefined;
  }, [filterParams]);

  const { movies: allMovies, isLoadingMovies, moviesError } = useMovies(queryParams, true);

  // Get ratings hook for submitting ratings (don't load all ratings to avoid rate limiting)
  const { createOrUpdateRating, isCreatingRating } = useRatings(false);

  // State management using custom hooks
  const { matches, addMatch } = useMovieMatches();

  // Use filtered movies from API
  const filteredMovies = allMovies;

  // Filter callbacks
  const applyFilters = (filters: { genre: string; year: number | null; minRating: number }) => {
    console.log('✅ Applying filters:', filters);
    setFilterParams(prev => ({
      genres: filters.genre ? [filters.genre] : [],
      year: filters.year,
      minRating: filters.minRating,
    }));
  };

  // UI Context
  const { filtersSidebar, closeFiltersSidebar } = useUI();

  // Local UI state
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Reset movie index when filters change
  React.useEffect(() => {
    setCurrentMovieIndex(0);
  }, [queryParams]);

  /**
   * Get current movie to display
   */
  const currentMovie = filteredMovies[currentMovieIndex] || null;

  /**
   * Handle match action - Like the movie and send rating to backend
   */
  const handleMatch = async () => {
    if (currentMovie) {
      try {
        setIsSubmittingRating(true);

        // Create rating with 5 stars (like)
        const ratingData: CreateRatingDTO = {
          movieId: currentMovie.id,
          rating: 5,
          review: null
        };

        // Send rating to backend
        await createOrUpdateRating(ratingData);
        console.log(`✅ Rated movie ${currentMovie.id} with 5 stars`);

        // Add to matches
        await addMatch(currentMovie);
        setMatchedMovie(currentMovie);
        setShowMatchModal(true);
      } catch (err) {
        console.error('Error adding match:', err);
      } finally {
        setIsSubmittingRating(false);
      }
    }
  };

  /**
   * Handle skip action - Dislike the movie and send rating to backend
   */
  const handleSkip = async () => {
    if (currentMovie) {
      try {
        setIsSubmittingRating(true);

        // Create rating with 1 star (dislike)
        const ratingData: CreateRatingDTO = {
          movieId: currentMovie.id,
          rating: 1,
          review: null
        };

        // Send rating to backend
        await createOrUpdateRating(ratingData);
        console.log(`⊘ Rated movie ${currentMovie.id} with 1 star`);
      } catch (err) {
        console.error('Error submitting skip rating:', err);
      } finally {
        setIsSubmittingRating(false);
        advanceToNextMovie();
      }
    }
  };

  /**
   * Advance to next movie
   */
  const advanceToNextMovie = () => {
    setCurrentMovieIndex((prev) => prev + 1);
  };

  /**
   * Handle view details
   */
  const handleViewDetails = () => {
    if (currentMovie) {
      navigate(`/movie/${currentMovie.id}`);
    }
  };

  /**
   * Handle close match modal
   */
  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setMatchedMovie(null);
    advanceToNextMovie();
  };

  /**
   * Handle view details from modal
   */
  const handleViewDetailsFromModal = () => {
    setShowMatchModal(false);
    handleViewDetails();
  };

  /**
   * Reset to first movie
   */
  const handleResetMovies = () => {
    setCurrentMovieIndex(0);
  };

  // Loading state
  if (isLoadingMovies) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando películas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (moviesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar películas: {moviesError.message || 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-[80px] pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full sm:max-w-6xl lg:max-w-7xl mx-auto h-[calc(100vh-80px-48px)]">
          {/* Movie Cards Stack */}
          <div className="flex justify-center items-center h-full relative">
            {allMovies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center w-full max-w-sm sm:max-w-md"
              >
                <h2 className="text-2xl font-bold mb-4">No hay películas disponibles</h2>
                <p className="text-gray-400 mb-6">
                  Intenta ajustar tus filtros para encontrar películas.
                </p>
                <button
                  onClick={() => {
                    // Reset filters
                    setFilterParams({ genres: [], year: null, minRating: 0 });
                  }}
                  className="btn-primary"
                >
                  Limpiar Filtros
                </button>
              </motion.div>
            ) : currentMovieIndex >= filteredMovies.length ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center w-full max-w-sm sm:max-w-md"
              >
                <h2 className="text-2xl font-bold mb-4">
                  ¡No hay más películas para mostrar!
                </h2>
                <p className="text-gray-400 mb-6">
                  Has visto {filteredMovies.length} películas. Intenta ajustar tus filtros o vuelve más tarde.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      // Use the Filters button from Navbar instead
                      handleResetMovies();
                    }}
                    className="btn-primary flex-1"
                  >
                    Ajustar Filtros
                  </button>
                  <button
                    onClick={handleResetMovies}
                    className="btn-secondary flex-1"
                  >
                    Comenzar de Nuevo
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Stack preview of next movies */}
                {filteredMovies.slice(currentMovieIndex + 1, currentMovieIndex + 3).map((movie, index) => (
                  <div
                    key={movie.id}
                    className="absolute w-full max-w-[90vw] sm:max-w-md lg:max-w-lg xl:max-w-xl"
                    style={{
                      transform: `translateY(${(index + 1) * 12}px) scale(${1 - (index + 1) * 0.05})`,
                      zIndex: -index - 1,
                    }}
                  >
                    <div className="rounded-3xl bg-dark-card overflow-hidden shadow-2xl" style={{ height: 'clamp(280px, calc(100vh - 160px), 700px)' }} />
                  </div>
                ))}

                {/* Main card */}
                {currentMovie && (
                  <MovieCardComponent
                    key={currentMovie.id}
                    movie={currentMovie}
                    onMatch={handleMatch}
                    onSkip={handleSkip}
                    onShowDetails={handleViewDetails}
                    isLoading={isSubmittingRating}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && matchedMovie && (
        <MatchModalComponent
          movie={matchedMovie}
          onClose={handleCloseMatchModal}
          onViewDetails={handleViewDetailsFromModal}
        />
      )}

      {/* Filters Sidebar */}
      <AnimatePresence>
        {filtersSidebar.isOpen && (
          <FiltersSidebarComponent
            onClose={closeFiltersSidebar}
            onApplyFilters={applyFilters}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieListContainer;
