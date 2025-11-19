import { useQuery } from '@tanstack/react-query';
import { authService } from '@/api/services/auth.service';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';

/**
 * Hook para obtener las reseñas del usuario autenticado
 * Utiliza React Query para caché y sincronización automática
 *
 * @param limit - Cantidad máxima de reseñas a traer (default: 10)
 * @param enabled - Si el query debe ejecutarse (default: true)
 *
 * @example
 * ```typescript
 * const { reviews, isLoading, error } = useUserReviews(10);
 * ```
 */
export function useUserReviews(limit: number = 10, enabled: boolean = true) {
  const {
    data: reviews = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: queryKeys.user.reviews(limit),
    queryFn: () => authService.getUserReviews(limit),
    staleTime: QUERY_CACHE_TIMES.USER_REVIEWS,
    enabled,
    retry: (failureCount, error: any) => {
      // Stop retrying if auth error
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    reviews,
    isLoading,
    error: isError ? (error as Error) : null,
    isError,
  };
}
