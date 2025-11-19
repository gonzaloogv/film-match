import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import RatingModal from '../presentation/hooks/RatingModal';
import MovieReviewsModal from '../presentation/hooks/MovieReviewsModal';
import { useMovie } from '@/hooks/api';
import type { MovieDTO } from '@/api/types';

// Helper function to convert Decimal to number
const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value && typeof value === 'object' && 'toString' in value) return parseFloat(value.toString());
  return 0;
};

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const movieId = parseInt(id || '0');
  const { movie, isLoading, isError } = useMovie(movieId || undefined, movieId > 0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  // Memoize converted vote average to avoid recalculating
  const voteAverage = useMemo(() => movie ? toNumber(movie.voteAverage) : null, [movie]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando película...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !movie) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Película no encontrada</h2>
          <button onClick={() => navigate('/home')} className="btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      <div className="pt-16 xs:pt-20 pb-12">
        {/* Hero Section */}
        <div className="relative h-56 xs:h-72 sm:h-96 overflow-hidden">
          <img
            src={movie.backdropPath ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}` : (movie.posterPath ? `https://image.tmdb.org/t/p/w1280${movie.posterPath}` : '')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/70 to-transparent" />

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 xs:top-4 sm:top-6 left-3 xs:left-4 sm:left-6 z-10 w-10 xs:w-12 h-10 xs:h-12 bg-dark-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-dark-card transition-all"
          >
            <ArrowLeft className="w-5 xs:w-6 h-5 xs:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 -mt-24 xs:-mt-28 sm:-mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 xs:space-y-4 sm:space-y-6"
            >
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-2 xs:mb-3 line-clamp-2">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-gray-400 text-xs xs:text-sm sm:text-base">
                  {movie.releaseDate && (
                    <>
                      <span>{new Date(movie.releaseDate).getFullYear()}</span>
                      <span>•</span>
                    </>
                  )}
                  {movie.categories && movie.categories.length > 0 && (
                    <>
                      <span className="line-clamp-1">{movie.categories.map(c => c.name).join(', ')}</span>
                      <span>•</span>
                    </>
                  )}
                  {voteAverage && (
                    <span>{voteAverage.toFixed(1)}/10</span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-2 xs:gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-0.5 xs:gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 xs:w-6 h-5 xs:h-6 ${
                          voteAverage && i < Math.floor(voteAverage / 2)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {voteAverage ? (voteAverage / 2).toFixed(1) : 'N/A'} / 5.0
                  </span>
                  {movie.userRatingsAverage && (
                    <span className="text-xs xs:text-sm text-gray-400">
                      ({movie.userRatingsCount} reseñas de usuarios)
                    </span>
                  )}
                </div>

                <div className="flex gap-2 xs:gap-3 flex-wrap">
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="flex-1 xs:flex-auto flex items-center justify-center gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-gradient-primary rounded-lg xs:rounded-xl hover:opacity-90 transition-opacity text-xs xs:text-sm sm:text-base font-semibold min-w-0"
                  >
                    <Star className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" />
                    <span className="truncate">Calificar</span>
                  </button>
                  <button
                    onClick={() => setShowReviewsModal(true)}
                    className="flex-1 xs:flex-auto flex items-center justify-center gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-dark-input hover:bg-dark-input/80 rounded-lg xs:rounded-xl transition-colors text-xs xs:text-sm sm:text-base font-semibold min-w-0"
                  >
                    <MessageCircle className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" />
                    <span className="truncate">Reseñas</span>
                  </button>
                </div>
              </div>

              {/* Overview */}
              <div className="card p-3 xs:p-4 sm:p-6">
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-2 xs:mb-3 sm:mb-4">Overview</h2>
                <p className="text-gray-300 leading-relaxed text-sm xs:text-base">{movie.overview}</p>
              </div>

              {/* Categories Grid */}
              {movie.categories && movie.categories.length > 0 && (
                <div className="card p-3 xs:p-4 sm:p-6">
                  <h3 className="text-base xs:text-lg sm:text-xl font-bold mb-2 xs:mb-3">Géneros</h3>
                  <div className="flex flex-wrap gap-1.5 xs:gap-2">
                    {movie.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2 xs:px-3 py-1 xs:py-1.5 bg-dark-input rounded-lg text-xs xs:text-sm font-medium"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="text-center py-4 xs:py-6 sm:py-8">
                <button
                  onClick={() => navigate('/home')}
                  className="btn-secondary px-4 xs:px-6 sm:px-8 py-2 xs:py-3 text-sm xs:text-base"
                >
                  Volver a Recomendaciones
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <RatingModal
            movie={movie}
            onClose={() => setShowRatingModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Reviews Modal */}
      <AnimatePresence>
        {showReviewsModal && (
          <MovieReviewsModal
            movie={movie}
            onClose={() => setShowReviewsModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetailsPage;
