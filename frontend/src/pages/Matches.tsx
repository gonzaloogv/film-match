/**
 * Matches Page
 * Página que muestra todas las películas que el usuario ha hecho match
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Heart, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useMatches } from '@/hooks/api/useMatches';
import type { Movie } from '@core';

type SortOption = 'fecha' | 'rating' | 'a-z';

const Matches: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('fecha');
  const [showOnlyUnwatched, setShowOnlyUnwatched] = useState(false);

  // Get matched movies from API
  const { getMatchlist } = useMatches();
  const { data: matchlistData, isLoading: isLoadingMatches } = getMatchlist({ status: 'like' });

  // Convert API response to Movie format
  const matchedMovies: Movie[] = useMemo(() => {
    if (!matchlistData?.matches) return [];
    return matchlistData.matches.map((match: any) => ({
      id: match.movie.id,
      title: match.movie.title,
      overview: match.movie.overview || '',
      poster: match.movie.posterPath || '',
      rating: match.movie.voteAverage ? Number(match.movie.voteAverage) / 2 : 0, // Convert from 0-10 to 0-5
      year: match.movie.releaseDate ? new Date(match.movie.releaseDate).getFullYear() : 0,
      genres: match.movie.genres || [],
      director: '', // Not available in API response
      cast: [], // Not available in API response
    }));
  }, [matchlistData]);

  // Filter by search query
  const filteredMovies = useMemo(() => {
    return matchedMovies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [matchedMovies, searchQuery]);

  // Sort movies
  const sortedMovies = useMemo(() => {
    const sorted = [...filteredMovies];

    switch (sortBy) {
      case 'fecha':
        // Ordenar por ID descendente (más recientes primero)
        return sorted.sort((a, b) => b.id - a.id);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'a-z':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [filteredMovies, sortBy]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      {/* Header */}
      <div className="pt-20 px-3 xs:px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3 xs:gap-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 xs:p-3 rounded-full bg-dark-card hover:bg-dark-card/80 transition-colors"
          >
            <ArrowLeft className="w-5 xs:w-6 h-5 xs:h-6" />
          </button>
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-10 xs:w-12 h-10 xs:h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 xs:w-6 h-5 xs:h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">Mis Matches</h1>
              <p className="text-gray-400 text-xs xs:text-sm">{matchedMovies.length} películas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 xs:px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6 xs:mb-8">
            <div className="relative">
              <Search className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-gray-500 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en mis matches..."
                className="w-full pl-10 xs:pl-12 pr-4 py-3 xs:py-3.5 bg-dark-card border border-gray-700 rounded-2xl text-xs xs:text-sm sm:text-base focus:border-primary-pink outline-none transition-colors"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mb-8 xs:mb-10 space-y-3 xs:space-y-4">
            {/* Toggle Switch */}
            <div className="flex items-center gap-2 bg-dark-card px-3 py-2.5 xs:px-4 xs:py-3 rounded-2xl border border-gray-700 w-full xs:w-auto">
              <div
                onClick={() => setShowOnlyUnwatched(!showOnlyUnwatched)}
                className={`w-12 h-7 rounded-full transition-all cursor-pointer flex items-center flex-shrink-0 ${
                  showOnlyUnwatched ? 'bg-primary-pink' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    showOnlyUnwatched ? 'translate-x-[26px]' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className="text-xs xs:text-sm font-medium truncate">Mostrar solo no vistas</span>
            </div>

            {/* Sort Buttons */}
            <div className="flex gap-1.5 xs:gap-3 flex-wrap xs:flex-nowrap">
              <button
                onClick={() => setSortBy('fecha')}
                className={`flex-1 xs:flex-none px-2 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold text-xs xs:text-sm transition-all border ${
                  sortBy === 'fecha'
                    ? 'bg-gradient-primary text-white border-primary-pink'
                    : 'bg-dark-card text-gray-300 border-gray-700 hover:border-gray-600'
                }`}
              >
                Fecha
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`flex-1 xs:flex-none px-2 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold text-xs xs:text-sm transition-all border flex items-center justify-center gap-1 xs:gap-1.5 ${
                  sortBy === 'rating'
                    ? 'bg-dark-card text-white border-gray-600'
                    : 'bg-dark-card text-gray-300 border-gray-700 hover:border-gray-600'
                }`}
              >
                <span>★</span>
                <span className="hidden xs:inline">Rating</span>
              </button>
              <button
                onClick={() => setSortBy('a-z')}
                className={`flex-1 xs:flex-none px-2 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold text-xs xs:text-sm transition-all border ${
                  sortBy === 'a-z'
                    ? 'bg-dark-card text-white border-gray-600'
                    : 'bg-dark-card text-gray-300 border-gray-700 hover:border-gray-600'
                }`}
              >
                A-Z
              </button>
            </div>
          </div>

          {/* Movies Grid or Empty State */}
          {isLoadingMatches ? (
            <div className="flex flex-col items-center justify-center py-16 xs:py-20 sm:py-24">
              <Loader2 className="w-12 h-12 text-primary-pink animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Cargando tus matches...</p>
            </div>
          ) : sortedMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 xs:py-20 sm:py-24">
              <div className="w-20 xs:w-24 h-20 xs:h-24 rounded-full bg-gradient-to-br from-primary-pink/20 to-primary-purple/20 flex items-center justify-center mb-6 xs:mb-8">
                <Heart className="w-10 xs:w-12 h-10 xs:h-12 text-primary-pink opacity-50" />
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-3 xs:mb-4 text-center">Tu Match List está vacía</h2>
              <p className="text-gray-400 text-xs xs:text-sm sm:text-base text-center max-w-md mb-8 xs:mb-10">
                Comienza a hacer match con películas para agregarlas a tu lista y llevar un registro de lo que quieres ver.
              </p>
              <button
                onClick={() => navigate('/home')}
                className="btn-primary px-6 xs:px-8 py-2 xs:py-3 text-xs xs:text-sm sm:text-base rounded-lg xs:rounded-xl"
              >
                Ir a Descubrir
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
              {sortedMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="group cursor-pointer flex flex-col h-full border border-gray-700 rounded-xl xs:rounded-2xl overflow-hidden hover:border-primary-pink transition-all"
                >
                  {/* Poster Image */}
                  <div className="aspect-[2/3] overflow-hidden relative">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                      <div className="w-full p-2 xs:p-3 sm:p-4 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-semibold text-xs xs:text-sm line-clamp-2">{movie.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Movie Info */}
                  <div className="flex-1 bg-dark-card border-t border-gray-700 p-2 xs:p-3 sm:p-4 flex flex-col justify-between">
                    {/* Title */}
                    <h3 className="text-white font-semibold text-xs xs:text-sm line-clamp-2 mb-2 xs:mb-2.5">{movie.title}</h3>

                    {/* Rating and Year */}
                    <div className="space-y-1.5 xs:space-y-2 mb-2 xs:mb-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < Math.floor(movie.rating) ? '★ text-yellow-400' : '☆ text-gray-500'
                              }`}
                            >
                              {i < Math.floor(movie.rating) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-400 text-xs font-semibold">{movie.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{movie.year}</p>
                    </div>

                    {/* Genres */}
                    <div className="mb-2 xs:mb-2.5">
                      <p className="text-gray-500 text-xs line-clamp-1">{movie.genres.join(', ')}</p>
                    </div>

                    {/* Director */}
                    <p className="text-gray-500 text-xs line-clamp-1">Dir: {movie.director}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;
