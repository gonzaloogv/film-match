import { useQuery } from '@tanstack/react-query';
import { movieService } from '@/api/services';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';
import type { MovieDTO } from '@/api/types';

/**
 * Hook para buscar películas
 * @param searchTerm - Término de búsqueda
 * @param enabled - Si la búsqueda está habilitada
 */
export function useMovieSearch(searchTerm: string, enabled: boolean = true) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.movies.search(searchTerm),
    queryFn: () => movieService.searchMovies(searchTerm),
    staleTime: QUERY_CACHE_TIMES.MOVIE_SEARCH,
    enabled: enabled && searchTerm.trim().length > 0,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });

  // La respuesta viene como { data: [...], meta: {...} }
  const movies: MovieDTO[] = (data as any)?.data || data?.results || [];

  return { movies, isLoading, isError };
}
