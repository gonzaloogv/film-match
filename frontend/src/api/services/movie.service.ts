import { apiClient } from '@/api/client';
import { MovieDTO, MovieQueryParams } from '@/api/types/movie.types';
import { PaginatedResponse, ApiResponse } from '@/api/types/common.types';

/**
 * Servicio de películas
 * Maneja: listar, búsqueda, detalles
 */
class MovieService {
  private basePath = '/movies';

  /**
   * Listar películas con filtros y paginación
   */
  async getMovies(params?: MovieQueryParams): Promise<PaginatedResponse<MovieDTO>> {
    const response = await apiClient.get<PaginatedResponse<MovieDTO>>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  /**
   * Obtener película por ID
   */
  async getMovieById(id: number): Promise<MovieDTO> {
    const response = await apiClient.get<ApiResponse<MovieDTO>>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  /**
   * Obtener película por TMDB ID
   */
  async getMovieByTmdbId(tmdbId: number): Promise<MovieDTO> {
    const response = await apiClient.get<ApiResponse<MovieDTO>>(
      `${this.basePath}/tmdb/${tmdbId}`
    );
    return response.data.data;
  }

  /**
   * Obtener películas por categoría
   */
  async getMoviesByCategory(
    slug: string,
    params?: MovieQueryParams
  ): Promise<PaginatedResponse<MovieDTO>> {
    const response = await apiClient.get<PaginatedResponse<MovieDTO>>(
      `${this.basePath}/category/${slug}`,
      { params }
    );
    return response.data;
  }

  /**
   * Buscar películas por query
   */
  async searchMovies(
    query: string,
    params?: MovieQueryParams
  ): Promise<PaginatedResponse<MovieDTO>> {
    const response = await apiClient.get<PaginatedResponse<MovieDTO>>(
      this.basePath,
      {
        params: {
          ...params,
          search: query,
        },
      }
    );
    return response.data;
  }
}

export const movieService = new MovieService();
