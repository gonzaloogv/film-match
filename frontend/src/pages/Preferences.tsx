/**
 * Preferences Page
 * Página de preferencias de recomendación del usuario
 * - Solo con Géneros Favoritos y Películas Favoritas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Search, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { preferencesService } from '@/api/services';
import { useMovieSearch } from '@/hooks/api/useMovieSearch';
import type { MovieDTO } from '@/api/types';

const GENRES = [
  'Acción',
  'Comedia',
  'Ciencia Ficción',
  'Drama',
  'Terror',
  'Romance',
  'Thriller',
  'Aventura',
  'Animación',
  'Crimen',
  'Fantasía',
  'Documental',
  'Musical',
  'Misterio',
  'Western',
  'Guerra',
];

const Preferences: React.FC = () => {
  const navigate = useNavigate();

  // Genre preferences
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Acción', 'Ciencia Ficción']);

  // Favorite movies
  const [movieSearch, setMovieSearch] = useState('');
  const [favoriteMovies, setFavoriteMovies] = useState<MovieDTO[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Movie search hook
  const { movies: searchResults, isLoading: isSearching } = useMovieSearch(movieSearch, movieSearch.length > 2);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferences = await preferencesService.getPreferences();
        if (preferences.favoriteGenres.length > 0) {
          setSelectedGenres(preferences.favoriteGenres);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Handle genre toggle
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  // Handle adding favorite movie
  const addFavoriteMovie = (movie: MovieDTO) => {
    if (!favoriteMovies.find(m => m.id === movie.id)) {
      setFavoriteMovies([...favoriteMovies, movie]);
      setMovieSearch('');
    }
  };

  // Handle removing favorite movie
  const removeFavoriteMovie = (movieId: number) => {
    setFavoriteMovies(favoriteMovies.filter(m => m.id !== movieId));
  };

  // Handle saving preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await preferencesService.updatePreferences({
        favoriteGenres: selectedGenres,
        favoriteMovieIds: favoriteMovies.map(m => m.id)
      });

      console.log('✅ Preferences saved:', response);
      setSaveMessage('✅ Preferencias guardadas exitosamente');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error) {
      setSaveMessage('❌ Error al guardar preferencias');
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      {/* Header */}
      <div className="pt-20 px-3 xs:px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3 xs:gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 xs:p-3 rounded-full bg-dark-card hover:bg-dark-card/80 transition-colors"
          >
            <ArrowLeft className="w-5 xs:w-6 h-5 xs:h-6" />
          </button>
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-10 xs:w-12 h-10 xs:h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs xs:text-sm">⚙️</span>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">Preferencias de Recomendación</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 xs:px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Géneros Favoritos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card rounded-2xl p-4 xs:p-6 border-2 border-gray-700"
          >
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-4 xs:mb-6">Géneros Favoritos</h2>
            <div className="p-4 xs:p-6 border border-gray-700 rounded-xl flex flex-wrap gap-2 xs:gap-3">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 xs:px-4 py-2 rounded-full font-semibold text-xs xs:text-sm transition-all border ${
                    selectedGenres.includes(genre)
                      ? 'bg-gradient-primary text-white border-primary-pink'
                      : 'bg-dark-hover hover:bg-dark-hover/80 text-gray-300 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Películas Favoritas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-card rounded-2xl p-4 xs:p-6 border-2 border-gray-700"
          >
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-4 xs:mb-6">Películas Favoritas</h2>

            {/* Search Input */}
            <div className="mb-4 xs:mb-6">
              <div className="relative">
                <Search className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-gray-500 z-10" />
                <input
                  type="text"
                  value={movieSearch}
                  onChange={(e) => setMovieSearch(e.target.value)}
                  placeholder="Busca películas por título (mín. 3 caracteres)..."
                  className="input-field pl-10 xs:pl-12 text-xs xs:text-sm w-full"
                />
                {isSearching && (
                  <Loader className="absolute right-3 xs:right-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-primary-pink animate-spin" />
                )}

                {/* Dropdown Results */}
                <AnimatePresence>
                  {movieSearch.length > 2 && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-gray-700 rounded-lg overflow-hidden z-20 max-h-64 overflow-y-auto"
                    >
                      {searchResults.map(movie => (
                        <button
                          key={movie.id}
                          onClick={() => addFavoriteMovie(movie)}
                          disabled={favoriteMovies.find(m => m.id === movie.id) !== undefined}
                          className="w-full text-left px-4 py-3 hover:bg-dark-hover transition-colors text-gray-300 text-xs xs:text-sm border-b border-gray-800 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                          {movie.posterPath && (
                            <img
                              src={`https://image.tmdb.org/t/p/w45${movie.posterPath}`}
                              alt={movie.title}
                              className="w-8 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold">{movie.title}</div>
                            <div className="text-xs text-gray-500">
                              {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                            </div>
                          </div>
                          {favoriteMovies.find(m => m.id === movie.id) && (
                            <span className="text-green-400 text-sm">✓</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Selected Movies */}
            <div className="flex flex-wrap gap-2 xs:gap-3">
              {favoriteMovies.length === 0 ? (
                <p className="text-gray-400 text-sm w-full">No hay películas seleccionadas. Busca y añade tus favoritas.</p>
              ) : (
                favoriteMovies.map(movie => (
                  <div
                    key={movie.id}
                    className="bg-dark-hover px-3 xs:px-4 py-2 rounded-lg flex items-center gap-2 text-xs xs:text-sm border border-gray-600 relative group"
                  >
                    {movie.posterPath && (
                      <img
                        src={`https://image.tmdb.org/t/p/w45${movie.posterPath}`}
                        alt={movie.title}
                        className="w-8 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{movie.title}</div>
                      <div className="text-xs text-gray-500">
                        {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavoriteMovie(movie.id)}
                      className="ml-2 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 xs:w-5 h-4 xs:h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Messages */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-4 xs:px-6 py-3 xs:py-4 rounded-lg text-sm xs:text-base ${
                saveMessage.includes('✅')
                  ? 'bg-green-900/20 text-green-300 border border-green-700'
                  : 'bg-red-900/20 text-red-300 border border-red-700'
              }`}
            >
              {saveMessage}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 xs:gap-4 pt-4 xs:pt-6"
          >
            <button
              onClick={() => navigate('/profile')}
              disabled={isSaving}
              className="flex-1 btn-secondary py-3 xs:py-4 text-xs xs:text-sm sm:text-base rounded-lg xs:rounded-xl font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="flex-1 btn-primary py-3 xs:py-4 text-xs xs:text-sm sm:text-base rounded-lg xs:rounded-xl font-semibold disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
