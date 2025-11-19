import { apiClient } from '@/api/client';
import {
  UserMatchDTO,
  MatchlistResponse,
  MatchStats,
  CreateMatchPayload,
  MatchQueryParams,
  MatchStatus,
} from '@/api/types/match.types';
import { MovieDTO } from '@/api/types/movie.types';
import { ApiResponse } from '@/api/types/common.types';

/**
 * Servicio de matches
 * Maneja: crear matches, listar matches, discover, estadísticas
 */
class MatchService {
  private basePath = '/matches';

  /**
   * Crear un match (like/dislike/superlike)
   *
   * @param movieId - ID de la película
   * @param status - Estado del match
   * @returns Match creado
   */
  async createMatch(movieId: number, status: MatchStatus): Promise<UserMatchDTO> {
    const payload: CreateMatchPayload = { movieId, status };
    const response = await apiClient.post<ApiResponse<UserMatchDTO>>(
      this.basePath,
      payload
    );
    return response.data.data;
  }

  /**
   * Obtener matchlist del usuario
   *
   * @param params - Parámetros de filtrado y paginación
   * @returns Lista paginada de matches
   */
  async getMatchlist(params?: MatchQueryParams): Promise<MatchlistResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = queryParams.toString()
      ? `${this.basePath}?${queryParams}`
      : this.basePath;

    const response = await apiClient.get<ApiResponse<MatchlistResponse>>(url);
    return response.data.data;
  }

  /**
   * Obtener películas para discover (no vistas aún)
   *
   * @param limit - Cantidad de películas a obtener
   * @returns Array de películas
   */
  async getDiscoverMovies(limit = 10): Promise<MovieDTO[]> {
    const response = await apiClient.get<ApiResponse<MovieDTO[]>>(
      `${this.basePath}/discover?limit=${limit}`
    );
    return response.data.data;
  }

  /**
   * Obtener estadísticas de matches del usuario
   *
   * @returns Estadísticas (likes, dislikes, superlikes, total)
   */
  async getMatchStats(): Promise<MatchStats> {
    const response = await apiClient.get<ApiResponse<MatchStats>>(
      `${this.basePath}/stats`
    );
    return response.data.data;
  }

  /**
   * Obtener estado de match para una película específica
   *
   * @param movieId - ID de la película
   * @returns Match o null si no existe
   */
  async getMatchStatus(movieId: number): Promise<UserMatchDTO | null> {
    const response = await apiClient.get<ApiResponse<UserMatchDTO | null>>(
      `${this.basePath}/status/${movieId}`
    );
    return response.data.data;
  }

  /**
   * Eliminar un match
   *
   * @param movieId - ID de la película
   */
  async deleteMatch(movieId: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${movieId}`);
  }

  /**
   * Hacer like a una película
   * Convenience method
   */
  async like(movieId: number): Promise<UserMatchDTO> {
    return this.createMatch(movieId, 'like');
  }

  /**
   * Hacer dislike a una película
   * Convenience method
   */
  async dislike(movieId: number): Promise<UserMatchDTO> {
    return this.createMatch(movieId, 'dislike');
  }

  /**
   * Hacer superlike a una película
   * Convenience method
   */
  async superlike(movieId: number): Promise<UserMatchDTO> {
    return this.createMatch(movieId, 'superlike');
  }
}

export const matchService = new MatchService();
