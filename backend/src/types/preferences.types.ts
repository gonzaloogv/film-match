/**
 * DTO para preferencias del usuario
 */
export interface PreferencesDTO {
  favoriteGenres: string[];
  favoriteMovieIds: number[];
}

/**
 * Interfaz para actualizar preferencias
 */
export interface UpdatePreferencesDTO {
  favoriteGenres?: string[];
  favoriteMovieIds?: number[];
}
