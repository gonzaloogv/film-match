// Client
export { apiClient } from '@/api/client';

// Services
export { authService, movieService, ratingService, collectionService, ragService } from '@/api/services';

// Types
export type {
  // Common
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  // Auth
  UserDTO,
  LoginResponse,
  GoogleAuthPayload,
  RefreshTokenPayload,
  RefreshTokenResponse,
  // Movie
  MovieDTO,
  MovieQueryParams,
  // Rating
  RatingDTO,
  CreateRatingDTO,
  RatingStatsDTO,
  // Collection
  CollectionDTO,
  CollectionType,
  AddToCollectionDTO,
  CollectionStatusDTO,
  // RAG
  ChatMessageDTO,
  ChatRequestDTO,
  ChatResponseDTO,
  SemanticSearchDTO,
  SemanticSearchResultDTO,
  RecommendationDTO,
} from '@/api/types';
