import { apiClient } from '@/api/client';
import {
  CollectionDTO,
  CollectionType,
  AddToCollectionDTO,
  CollectionStatusDTO,
} from '@/api/types/collection.types';
import { ApiResponse } from '@/api/types/common.types';

/**
 * Servicio de colecciones
 * Maneja: agregar/eliminar de watchlist, favorites, watched
 */
class CollectionService {
  private basePath = '/collections';

  /**
   * Agregar película a colección
   */
  async addToCollection(data: AddToCollectionDTO): Promise<CollectionDTO> {
    const response = await apiClient.post<ApiResponse<CollectionDTO>>(
      this.basePath,
      data
    );
    return response.data.data;
  }

  /**
   * Obtener todas las colecciones del usuario
   */
  async getUserCollections(): Promise<CollectionDTO[]> {
    const response = await apiClient.get<ApiResponse<CollectionDTO[]>>(
      this.basePath
    );
    return response.data.data;
  }

  /**
   * Obtener películas de una colección específica
   */
  async getCollectionByType(type: CollectionType): Promise<CollectionDTO[]> {
    const response = await apiClient.get<ApiResponse<CollectionDTO[]>>(
      `${this.basePath}/${type}`
    );
    return response.data.data;
  }

  /**
   * Verificar estado de una película en todas las colecciones
   */
  async checkMovieInCollections(movieId: number): Promise<CollectionStatusDTO> {
    const response = await apiClient.get<ApiResponse<CollectionStatusDTO>>(
      `${this.basePath}/check/${movieId}`
    );
    return response.data.data;
  }

  /**
   * Eliminar película de colección
   */
  async removeFromCollection(collectionId: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${collectionId}`);
  }

  /**
   * Helper: Agregar a watchlist
   */
  async addToWatchlist(movieId: number): Promise<CollectionDTO> {
    return this.addToCollection({ movieId, type: 'watchlist' });
  }

  /**
   * Helper: Agregar a favorites
   */
  async addToFavorites(movieId: number): Promise<CollectionDTO> {
    return this.addToCollection({ movieId, type: 'favorites' });
  }

  /**
   * Helper: Marcar como visto
   */
  async markAsWatched(movieId: number): Promise<CollectionDTO> {
    return this.addToCollection({ movieId, type: 'watched' });
  }
}

export const collectionService = new CollectionService();
