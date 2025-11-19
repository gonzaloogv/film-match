/**
 * SearchMovieCard Component
 *
 * Movie card for search results
 * Displays poster, title, rating, year, genres, and director
 * Matches design pattern from Matches.tsx
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@core';

interface SearchMovieCardProps {
  movie: Movie;
}

export const SearchMovieCard: React.FC<SearchMovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer flex flex-col h-full border border-gray-700 rounded-xl xs:rounded-2xl overflow-hidden hover:border-primary-pink transition-all"
    >
      {/* Poster with overlay */}
      <div className="aspect-[2/3] overflow-hidden relative">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Footer with solid color */}
      <div className="flex-1 bg-dark-card border-t border-gray-700 p-2 xs:p-3 sm:p-4 flex flex-col justify-between">
        {/* Title */}
        <h3 className="text-white font-semibold text-xs xs:text-sm line-clamp-2 mb-2 xs:mb-2.5">
          {movie.title}
        </h3>

        {/* Rating */}
        <div className="space-y-1.5 xs:space-y-2 mb-2 xs:mb-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xs ${
                    star <= Math.floor(movie.rating)
                      ? '★ text-yellow-400'
                      : '☆ text-gray-500'
                  }`}
                >
                  {star <= Math.floor(movie.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-gray-400 text-xs font-semibold">{movie.rating.toFixed(1)}</span>
          </div>

          {/* Year */}
          <p className="text-gray-400 text-xs">{movie.year}</p>
        </div>

        {/* Genres */}
        <div className="mb-2 xs:mb-2.5">
          <p className="text-gray-500 text-xs line-clamp-1">{movie.genres.join(', ')}</p>
        </div>

        {/* Director */}
        <p className="text-gray-500 text-xs line-clamp-1">Dir: {movie.director}</p>
      </div>
    </div>
  );
};
