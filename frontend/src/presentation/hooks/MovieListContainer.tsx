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
import { useMatches } from '@/hooks/api';
import type { Movie } from '@core';
import MovieCardComponent from './MovieCard';
import MatchModalComponent from './MatchModal';

/**
 * Movie List Container Component
 * Main component for discovering and swiping through movies
 * 
 * Uses /api/matches/discover endpoint which:
 * - Excludes already matched movies
 * - Returns movies in random order (shuffled in backend)
 * - Automatically refreshes after each match
 * 
 * Note: Filters are NOT available in this component - they belong in Search page.
 * This is a pure swipe/discover flow (like Tinder).
 *
 * @example
 * ```typescript
 * <MovieListContainer />
 * ```
 */
const MovieListContainer: React.FC = () => {
  const navigate = useNavigate();

  // ✅ Use useMatches for discover flow (random movies, excludes matches)
  const {
    discoverMovies = [],
    isLoadingDiscover,
    discoverError,
    createMatch,
    isCreatingMatch,
  } = useMatches();

  // Local UI state
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);

  /**
   * Get current movie to display
   */
  const currentMovie = discoverMovies[currentMovieIndex] || null;

  /**
   * Handle match action - Like the movie
   */
  const handleMatch = async () => {
    if (!currentMovie) return;

    try {
      // createMatch automatically invalidates cache and fetches new movies
      createMatch(currentMovie.id, 'like');
      setMatchedMovie(currentMovie);
      setShowMatchModal(true);
    } catch (err) {
      console.error('Error adding match:', err);
    }
  };

  /**
   * Handle skip action - Dislike the movie
   */
  const handleSkip = async () => {
    if (!currentMovie) return;

    try {
      // createMatch with 'dislike' status
      createMatch(currentMovie.id, 'dislike');
      advanceToNextMovie();
    } catch (err) {
      console.error('Error submitting skip:', err);
      advanceToNextMovie(); // Still advance even if error
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
    if (matchedMovie) {
      setShowMatchModal(false);
      setMatchedMovie(null);
      // Navigate to the matched movie, not the current one
      navigate(`/movie/${matchedMovie.id}`);
    }
  };

  /**
   * Reset to first movie
   */
  const handleResetMovies = () => {
    setCurrentMovieIndex(0);
  };

  // Loading state
  if (isLoadingDiscover) {
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
  if (discoverError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar películas</p>
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
            {discoverMovies.length === 0 ? (
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
                  onClick={() => navigate('/search')}
                  className="btn-primary"
                >
                  Ir a Búsqueda Avanzada
                </button>
              </motion.div>
            ) : currentMovieIndex >= discoverMovies.length ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center w-full max-w-sm sm:max-w-md"
              >
                <h2 className="text-2xl font-bold mb-4">
                  ¡No hay más películas para mostrar!
                </h2>
                <p className="text-gray-400 mb-6">
                  Has visto {discoverMovies.length} películas. Recarga para ver más.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Cargar Más Películas
                </button>
              </motion.div>
            ) : (
              <>
                {/* Stack preview of next movies */}
                {discoverMovies.slice(currentMovieIndex + 1, currentMovieIndex + 3).map((movie: any, index: number) => (
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
                    isLoading={isCreatingMatch}
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

      {/* Filters removed - use Search page for filtering */}
    </div>
  );
};

export default MovieListContainer;
