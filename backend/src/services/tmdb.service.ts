import axios, { AxiosInstance } from 'axios';
import { tmdbConfig, validateTMDBConfig } from '../config/tmdb.config';
import { RateLimiter } from '../utils/rate-limiter';
import {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBPaginatedResponse,
  TMDBSearchParams,
  TMDBDiscoverParams,
  TMDBGenre
} from '../types/tmdb.types';
import { AppError } from '../middleware/error.middleware';

export class TMDBService {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private genresCache: TMDBGenre[] | null = null;

  constructor() {
    validateTMDBConfig();

    // Inicializar cliente HTTP
    this.client = axios.create({
      baseURL: tmdbConfig.baseUrl,
      params: {
        api_key: tmdbConfig.apiKey,
        language: tmdbConfig.defaultLanguage
      },
      timeout: 10000
    });

    // Inicializar rate limiter (40 req/10s)
    this.rateLimiter = new RateLimiter(
      tmdbConfig.rateLimitMax,
      tmdbConfig.rateLimitWindow
    );

    // Interceptor para logging
    this.client.interceptors.request.use(config => {
      console.log(`[TMDB] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Interceptor para manejo de errores
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          throw new AppError(
            error.response.status,
            `TMDB API Error: ${error.response.data.status_message || error.message}`
          );
        }
        throw new AppError(503, `TMDB Network Error: ${error.message}`);
      }
    );
  }

  /**
   * Buscar películas por título
   */
  async searchMovies(params: TMDBSearchParams): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    await this.rateLimiter.waitForToken();

    const response = await this.client.get<TMDBPaginatedResponse<TMDBMovie>>('/search/movie', {
      params: {
        query: params.query,
        page: params.page || 1,
        language: params.language || tmdbConfig.defaultLanguage,
        include_adult: params.include_adult || false,
        year: params.year
      }
    });

    return response.data;
  }

  /**
   * Descubrir películas con filtros
   */
  async discoverMovies(params: TMDBDiscoverParams): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    await this.rateLimiter.waitForToken();

    const response = await this.client.get<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', {
      params: {
        page: params.page || 1,
        language: params.language || tmdbConfig.defaultLanguage,
        sort_by: params.sort_by || 'popularity.desc',
        with_genres: params.with_genres,
        'vote_average.gte': params['vote_average.gte'],
        'vote_count.gte': params['vote_count.gte'] || 100,
        year: params.year,
        'release_date.gte': params['release_date.gte'],
        'release_date.lte': params['release_date.lte']
      }
    });

    return response.data;
  }

  /**
   * Obtener detalles completos de una película
   */
  async getMovieDetails(tmdbId: number): Promise<TMDBMovieDetail> {
    await this.rateLimiter.waitForToken();

    const response = await this.client.get<TMDBMovieDetail>(`/movie/${tmdbId}`, {
      params: {
        language: tmdbConfig.defaultLanguage
      }
    });

    return response.data;
  }

  /**
   * Obtener películas populares
   */
  async getPopularMovies(page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    await this.rateLimiter.waitForToken();

    const response = await this.client.get<TMDBPaginatedResponse<TMDBMovie>>('/movie/popular', {
      params: { page }
    });

    return response.data;
  }

  /**
   * Obtener películas mejor calificadas
   */
  async getTopRatedMovies(page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    await this.rateLimiter.waitForToken();

    const response = await this.client.get<TMDBPaginatedResponse<TMDBMovie>>('/movie/top_rated', {
      params: { page }
    });

    return response.data;
  }

  /**
   * Obtener películas que se están reproduciendo ahora
   */
  async getNowPlayingMovies(page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    await this.rateLimiter.waitForToken();

    const response = await this.client.get<TMDBPaginatedResponse<TMDBMovie>>('/movie/now_playing', {
      params: { page }
    });

    return response.data;
  }

  /**
   * Obtener próximas películas
   */
  async getUpcomingMovies(page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    await this.rateLimiter.waitForToken();

    const response = await this.client.get<TMDBPaginatedResponse<TMDBMovie>>('/movie/upcoming', {
      params: { page }
    });

    return response.data;
  }

  /**
   * Obtener lista de géneros de TMDB (con cache)
   */
  async getGenres(): Promise<TMDBGenre[]> {
    if (this.genresCache) {
      return this.genresCache;
    }

    await this.rateLimiter.waitForToken();

    const response = await this.client.get<{ genres: TMDBGenre[] }>('/genre/movie/list');

    this.genresCache = response.data.genres;
    return this.genresCache;
  }

  /**
   * Obtener número de tokens disponibles en rate limiter
   */
  getAvailableTokens(): number {
    return this.rateLimiter.getAvailableTokens();
  }
}

export const tmdbService = new TMDBService();