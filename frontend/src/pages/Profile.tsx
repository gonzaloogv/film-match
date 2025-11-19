/**
 * Profile Page
 * Página de perfil del usuario con información personal y reseñas
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Edit2, Twitter, Instagram, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../presentation/components/ui/Button/Button';
import { ProfileEditModal } from '../presentation/components/ProfileEditModal';
import { useUser } from '../context/user/useUser';
import { useUI } from '../context/ui';
import { useUserReviews } from '../hooks/api/useUserReviews';
import { getAvatarImage } from '../shared/utils/avatarHelpers';
import type { Movie } from '@core';

interface MovieReview {
  id: number;
  rating: number;
  review?: string | null;
  createdAt: string;
  movie: {
    id: number;
    title: string;
    overview: string | null;
    posterPath: string | null;
    releaseDate: string | null;
    categories: Array<{ name: string }>;
  };
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useUser();
  const { profileEditModalOpen, openProfileEditModal, closeProfileEditModal } = useUI();

  // Enable reviews fetching only when user is fully loaded and authenticated
  const { reviews, isLoading: isLoadingReviews, isError: isErrorReviews } = useUserReviews(10, !!user && !loading);

  // Redirect to login only if explicitly not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't render if still loading or user is not available
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const avatarImage = getAvatarImage(user.avatar);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      {/* Main Content */}
      <div className="pt-24 pb-12 px-3 xs:px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-card rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-gray-800 mb-6 xs:mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 xs:gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 xs:w-28 sm:w-32 h-24 xs:h-28 sm:h-32 rounded-full overflow-hidden ring-4 ring-primary-pink/30"
              >
                <img
                  src={avatarImage}
                  alt={user.nickname || user.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl xs:text-3xl sm:text-3xl font-bold text-white mb-1 xs:mb-2 truncate">
                {user.nickname || user.name}
              </h1>
              <p className="text-gray-400 mb-3 xs:mb-4 max-w-xl text-xs xs:text-sm sm:text-base line-clamp-3">
                {user.bio || 'Amante del cine'}
              </p>

              {/* Social Links */}
              <div className="flex gap-2 xs:gap-4 justify-center md:justify-start flex-wrap">
                {user.twitterUrl && (
                  <a
                    href={user.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 xs:gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-xs xs:text-sm"
                  >
                    <Twitter className="w-4 xs:w-5 h-4 xs:h-5" />
                    <span className="hidden xs:inline">Twitter</span>
                  </a>
                )}
                {user.instagramUrl && (
                  <a
                    href={user.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 xs:gap-2 text-pink-400 hover:text-pink-300 transition-colors text-xs xs:text-sm"
                  >
                    <Instagram className="w-4 xs:w-5 h-4 xs:h-5" />
                    <span className="hidden xs:inline">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-2 sm:gap-3 lg:gap-4 mt-3 xs:mt-4 sm:mt-6 lg:mt-8">
            <Button
              onClick={openProfileEditModal}
              variant="primary"
              size="md"
              className="w-full xs:flex-1 flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm sm:text-base"
            >
              <Edit2 className="w-4 xs:w-4 h-4 xs:h-4 flex-shrink-0" />
              <span className="truncate">Personalizar Perfil</span>
            </Button>
            <Button
              onClick={() => navigate('/preferences')}
              variant="secondary"
              size="md"
              className="w-full xs:flex-1 flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm sm:text-base"
            >
              <Settings className="w-4 xs:w-4 h-4 xs:h-4 flex-shrink-0" />
              <span className="truncate">Preferencias</span>
            </Button>
          </div>
        </motion.div>

        {/* My Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl xs:text-2xl font-bold text-white mb-4 xs:mb-6">Mis Últimas Reseñas</h2>

          {isLoadingReviews ? (
            <div className="bg-dark-card rounded-2xl p-12 border border-gray-800 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-pink"></div>
              </div>
              <p className="text-gray-400 mt-4">Cargando reseñas...</p>
            </div>
          ) : isErrorReviews ? (
            <div className="bg-dark-card rounded-2xl p-12 border border-gray-800 text-center">
              <p className="text-red-400">Error al cargar las reseñas</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-dark-card rounded-2xl p-12 border border-gray-800 text-center">
              <p className="text-gray-400">
                Aún no has calificado ninguna película. ¡Comienza a explorar!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {reviews.map((review, index) => {
                // Get release year from releaseDate
                const releaseYear = review.movie.releaseDate
                  ? new Date(review.movie.releaseDate).getFullYear()
                  : 'N/A';

                // Get poster URL from posterPath (add TMDB image base URL)
                const posterUrl = review.movie.posterPath
                  ? `https://image.tmdb.org/t/p/w154${review.movie.posterPath}`
                  : 'https://via.placeholder.com/154x231?text=No+Image';

                // Convert rating from 1-10 scale to 1-5 scale for star display
                const ratingStars = Math.round((review.rating / 10) * 5);

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-dark-card rounded-2xl overflow-hidden border border-gray-800 hover:border-primary-pink/30 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {/* Movie Poster */}
                      <div className="flex-shrink-0 w-24 sm:w-32 mx-auto sm:mx-0">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-800">
                          <img
                            src={posterUrl}
                            alt={review.movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </div>

                      {/* Movie Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-2 truncate">
                          {review.movie.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {releaseYear} • {review.movie.categories.map(c => c.name).join(', ') || 'Sin género'}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= ratingStars
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-white font-semibold">
                            {review.rating}/10
                          </span>
                        </div>

                        {/* Overview */}
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {review.movie.overview || 'Sin descripción disponible'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {profileEditModalOpen && <ProfileEditModal onClose={closeProfileEditModal} />}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
