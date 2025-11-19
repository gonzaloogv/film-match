import { PaginationParams, PaginationMeta } from '../types/index.js';

/**
 * Extrae parámetros de paginación del query string
 * @param query - Query parameters de Express
 * @returns Parámetros de paginación procesados
 */
export const getPaginationParams = (query: any): PaginationParams => {
  const page = Math.max(parseInt(query.page as string) || 1, 1);
  const limit = Math.min(parseInt(query.limit as string) || 20, 100); // Máximo 100 items

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Calcula los metadatos de paginación
 * @param total - Total de items
 * @param limit - Items por página
 * @param page - Página actual
 * @returns Metadatos de paginación
 */
export const getPaginationMeta = (
  total: number,
  limit: number,
  page: number
): PaginationMeta => ({
  page,
  limit,
  totalItems: total,
  totalPages: Math.ceil(total / limit),
});
