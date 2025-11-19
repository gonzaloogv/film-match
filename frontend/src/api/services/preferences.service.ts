import { apiClient } from '@/api/client';
import { ApiResponse } from '@/api/types/common.types';

/**
 * DTO para preferencias
 */
export interface PreferencesDTO {
  favoriteGenres: string[];
  favoriteMovieIds: number[];
}

/**
 * Servicio de preferencias
 * Maneja: get, update de preferencias del usuario
 */
class PreferencesService {
  private basePath = '/preferences';

  /**
   * Obtener preferencias del usuario
   */
  async getPreferences(): Promise<PreferencesDTO> {
    const response = await apiClient.get<ApiResponse<PreferencesDTO>>(this.basePath);
    return response.data.data;
  }

  /**
   * Actualizar preferencias del usuario
   */
  async updatePreferences(preferences: PreferencesDTO): Promise<PreferencesDTO> {
    const response = await apiClient.put<ApiResponse<PreferencesDTO>>(
      this.basePath,
      preferences
    );
    return response.data.data;
  }
}

export const preferencesService = new PreferencesService();
