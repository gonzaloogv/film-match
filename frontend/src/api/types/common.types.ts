/**
 * Respuesta paginada genérica del backend
 * Usada en endpoints que devuelven listas (películas, ratings, etc)
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Respuesta estándar del backend para datos únicos
 * Usada cuando un endpoint devuelve un único objeto
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Respuesta de error del backend
 * Estructura esperada de errores
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: any;
}
