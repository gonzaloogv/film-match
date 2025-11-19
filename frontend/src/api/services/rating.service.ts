import { apiClient } from '@/api/client';
import { RatingDTO, CreateRatingDTO, RatingStatsDTO } from '@/api/types/rating.types';
import { ApiResponse } from '@/api/types/common.types';

/**
 * Servicio de calificaciones
 * Maneja: crear/actualizar, obtener, estadísticas
 */
class RatingService {
  private basePath = '/ratings';

  /**
   * Crear o actualizar calificación de película
   */
  async createOrUpdateRating(data: CreateRatingDTO): Promise<RatingDTO> {
    const response = await apiClient.post<ApiResponse<RatingDTO>>(
      this.basePath,
      data
    );
    return response.data.data;
  }

  /**
   * Obtener todas las calificaciones del usuario autenticado
   */
  async getUserRatings(): Promise<RatingDTO[]> {
    const response = await apiClient.get<ApiResponse<RatingDTO[]>>(
      this.basePath
    );
    return response.data.data;
  }

  /**
   * Obtener calificación de una película específica
   * Retorna null si no existe
   */
  async getRatingForMovie(movieId: number): Promise<RatingDTO | null> {
    try {
      const response = await apiClient.get<ApiResponse<RatingDTO>>(
        `${this.basePath}/movie/${movieId}`
      );
      return response.data.data;
    } catch (error: any) {
      // 404 es normal si no existe calificación
      if (error?.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de calificaciones del usuario
   */
  async getRatingStats(): Promise<RatingStatsDTO> {
    const response = await apiClient.get<ApiResponse<RatingStatsDTO>>(
      `${this.basePath}/stats`
    );
    return response.data.data;
  }

  /**
   * Eliminar calificación
   */
  async deleteRating(ratingId: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${ratingId}`);
  }
}

export const ratingService = new RatingService();
