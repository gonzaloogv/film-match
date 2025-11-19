import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieService } from '@/api/services';
import { queryKeys, QUERY_CACHE_TIMES } from '@/lib/cache/query-cache';
import type { MovieDTO, MovieQueryParams } from '@/api/types';
import { MovieMapper } from '@/api/mappers';
import type { Movie } from '@/core/domain/entities';

/**
 * useMovies hook
 * Manages movie data fetching with pagination and filters
 * - listMovies: Paginated movie list with filters
 * - getMovieById: Single movie details
 * - getMovieByTmdbId: Get by TMDB ID
 * - searchMovies: Search functionality
 * - getMoviesByCategory: Filter by category
 */
export const useMovies = (initialParams?: MovieQueryParams, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  // Query: List movies with pagination and filters
  const {
    data: moviesData,
    isLoading: isLoadingMovies,
    error: moviesError,
    isError: isMoviesError,
    isFetching: isFetchingMovies,
  } = useQuery({
    queryKey: queryKeys.movies.list(initialParams),
    queryFn: () => movieService.getMovies(initialParams),
    staleTime: QUERY_CACHE_TIMES.MOVIES,
    enabled: enabled, // Allow disabling queries
  });

  // Query: Get single movie by ID
  const getMovieById = (movieId: number) => {
    return useQuery({
      queryKey: queryKeys.movies.detail(movieId),
      queryFn: () => movieService.getMovieById(movieId),
      staleTime: QUERY_CACHE_TIMES.MOVIE_DETAILS,
      enabled: !!movieId,
    });
  };

  // Query: Get movie by TMDB ID
  const getMovieByTmdbId = (tmdbId: number) => {
    return useQuery({
      queryKey: queryKeys.movies.byTmdbId(tmdbId),
      queryFn: () => movieService.getMovieByTmdbId(tmdbId),
      staleTime: QUERY_CACHE_TIMES.MOVIE_DETAILS,
      enabled: !!tmdbId,
    });
  };

  // Query: Search movies
  const searchMovies = (query: string, params?: MovieQueryParams) => {
    return useQuery({
      queryKey: queryKeys.movies.search(query),
      queryFn: () => movieService.searchMovies(query, params),
      staleTime: QUERY_CACHE_TIMES.SEARCH_RESULTS,
      enabled: !!query && query.length > 0,
    });
  };

  // Query: Get movies by category
  const getMoviesByCategory = (slug: string, params?: MovieQueryParams) => {
    return useQuery({
      queryKey: queryKeys.movies.byCategory(slug),
      queryFn: () => movieService.getMoviesByCategory(slug, params),
      staleTime: QUERY_CACHE_TIMES.MOVIES,
      enabled: !!slug && slug.length > 0,
    });
  };

  // Mutation: Prefetch movie details
  const prefetchMovieDetails = async (movieId: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.movies.detail(movieId),
      queryFn: () => movieService.getMovieById(movieId),
      staleTime: QUERY_CACHE_TIMES.MOVIE_DETAILS,
    });
  };

  // Mutation: Prefetch search results
  const prefetchSearch = async (query: string, params?: MovieQueryParams) => {
    if (query && query.length > 0) {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.movies.search(query),
        queryFn: () => movieService.searchMovies(query, params),
        staleTime: QUERY_CACHE_TIMES.SEARCH_RESULTS,
      });
    }
  };

  // Mutation: Refetch movies with new params
  const refetchMovies = (newParams: MovieQueryParams) => {
    return queryClient.refetchQueries({
      queryKey: queryKeys.movies.list(newParams),
    });
  };

  // Map DTOs to Movie entities
  const mappedMovies: Movie[] = (moviesData?.data || []).map(dto => MovieMapper.toDomain(dto));

  return {
    // List data
    moviesData,
    movies: mappedMovies,
    pagination: moviesData?.pagination,
    isLoadingMovies,
    isMoviesError,
    moviesError,
    isFetchingMovies,

    // Individual queries (functions that return hooks)
    getMovieById,
    getMovieByTmdbId,
    searchMovies,
    getMoviesByCategory,

    // Prefetching
    prefetchMovieDetails,
    prefetchSearch,

    // Refetching
    refetchMovies,
  };
};

export default useMovies;
