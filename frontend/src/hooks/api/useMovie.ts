import { useQuery } from '@tanstack/react-query';
import { movieService } from '@/api/services';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';
import type { MovieDTO } from '@/api/types';

/**
 * Hook para obtener detalles de una película por ID
 * @param movieId - ID de la película
 * @param enabled - Si la consulta está habilitada
 */
export function useMovie(movieId: number | undefined, enabled: boolean = true) {
  const { data: movie, isLoading, isError, error } = useQuery({
    queryKey: movieId ? queryKeys.movies.detail(movieId) : queryKeys.movies.all,
    queryFn: async () => {
      if (!movieId) throw new Error('Movie ID is required');
      return movieService.getMovieById(movieId);
    },
    staleTime: QUERY_CACHE_TIMES.MOVIE_DETAILS, // 10 minutes
    enabled: enabled && !!movieId,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });

  return { movie, isLoading, isError, error };
}
