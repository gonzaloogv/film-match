import { apiClient } from '@/api/client';
import {
  ChatRequestDTO,
  ChatResponseDTO,
  SemanticSearchDTO,
  SemanticSearchResultDTO,
  RecommendationDTO,
} from '@/api/types/rag.types';
import { MovieDTO } from '@/api/types/movie.types';
import { ApiResponse } from '@/api/types/common.types';

/**
 * Servicio RAG (Retrieval-Augmented Generation)
 * Maneja: chat con IA, búsqueda semántica, recomendaciones
 */
class RAGService {
  private basePath = '/rag';

  /**
   * Enviar mensaje al chat con contexto híbrido
   */
  async chat(request: ChatRequestDTO): Promise<ChatResponseDTO> {
    const response = await apiClient.post<ApiResponse<ChatResponseDTO>>(
      `${this.basePath}/chat`,
      request
    );
    return response.data.data;
  }

  /**
   * Verificar si el servicio de chat está disponible
   */
  async checkChatStatus(): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ ready: boolean }>>(
        `${this.basePath}/chat/status`
      );
      return response.data.data.ready;
    } catch {
      return false;
    }
  }

  /**
   * Búsqueda semántica de películas
   */
  async semanticSearch(search: SemanticSearchDTO): Promise<SemanticSearchResultDTO> {
    const response = await apiClient.post<ApiResponse<SemanticSearchResultDTO>>(
      `${this.basePath}/search`,
      search
    );
    return response.data.data;
  }

  /**
   * Obtener películas similares por ID
   */
  async getSimilarMovies(movieId: number, topK: number = 5): Promise<MovieDTO[]> {
    const response = await apiClient.get<ApiResponse<MovieDTO[]>>(
      `${this.basePath}/similar/${movieId}`,
      { params: { topK } }
    );
    return response.data.data;
  }

  /**
   * Obtener recomendaciones personalizadas
   */
  async getRecommendations(topK: number = 10): Promise<RecommendationDTO[]> {
    const response = await apiClient.get<ApiResponse<RecommendationDTO[]>>(
      `${this.basePath}/recommendations`,
      { params: { topK } }
    );
    return response.data.data;
  }

  /**
   * Obtener sugerencias de películas populares
   */
  async getPopularSuggestions(topK: number = 10): Promise<MovieDTO[]> {
    const response = await apiClient.get<ApiResponse<MovieDTO[]>>(
      `${this.basePath}/suggestions`,
      { params: { topK } }
    );
    return response.data.data;
  }
}

export const ragService = new RAGService();
