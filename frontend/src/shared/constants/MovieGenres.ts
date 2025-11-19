/**
 * Movie Genres Constants
 */

import { MovieGenre } from '../types';

export const ALL_GENRES: MovieGenre[] = [
  MovieGenre.Action,
  MovieGenre.Adventure,
  MovieGenre.Crime,
  MovieGenre.Drama,
  MovieGenre.SciFi,
  MovieGenre.Thriller,
  MovieGenre.Romance,
];

export const GENRE_LABELS: Record<MovieGenre, string> = {
  [MovieGenre.Action]: 'Acción',
  [MovieGenre.Adventure]: 'Aventura',
  [MovieGenre.Crime]: 'Crimen',
  [MovieGenre.Drama]: 'Drama',
  [MovieGenre.SciFi]: 'Ciencia Ficción',
  [MovieGenre.Thriller]: 'Suspenso',
  [MovieGenre.Romance]: 'Romance',
};
