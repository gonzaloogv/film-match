import { MovieDTO } from './movie.types';

/**
 * Tipos de colecciones de usuario
 */
export type CollectionType = 'watchlist' | 'watched' | 'favorites';

/**
 * Datos de una película en una colección
 */
export interface CollectionDTO {
  id: number;
  userId: number;
  movieId: number;
  type: CollectionType;
  createdAt: string;
  movie?: MovieDTO;
}

/**
 * Payload para agregar película a colección
 */
export interface AddToCollectionDTO {
  movieId: number;
  type: CollectionType;
}

/**
 * Estado de una película en colecciones
 * Indica si está en watchlist, watched, favorites
 */
export interface CollectionStatusDTO {
  watchlist: boolean;
  watched: boolean;
  favorites: boolean;
}
