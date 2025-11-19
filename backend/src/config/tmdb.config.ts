import { env } from './env';

export interface TMDBConfig {
  apiKey: string;
  baseUrl: string;
  imageBaseUrl: string;
  rateLimitMax: number;
  rateLimitWindow: number;
  defaultLanguage: string;
  imageSize: {
    poster: string;
    backdrop: string;
    profile: string;
  };
}

export const tmdbConfig: TMDBConfig = {
  apiKey: env.tmdbApiKey || '',
  baseUrl: env.tmdbBaseUrl || 'https://api.themoviedb.org/3',
  imageBaseUrl: env.tmdbImageBaseUrl || 'https://image.tmdb.org/t/p',
  rateLimitMax: parseInt(process.env.TMDB_RATE_LIMIT_MAX || '40', 10),
  rateLimitWindow: parseInt(process.env.TMDB_RATE_LIMIT_WINDOW || '10000', 10),
  defaultLanguage: 'es-ES',
  imageSize: {
    poster: 'w500',
    backdrop: 'w1280',
    profile: 'w185'
  }
};

/**
 * Valida que la configuración de TMDB sea correcta
 */
export function validateTMDBConfig(): void {
  if (!tmdbConfig.apiKey) {
    throw new Error(
      'TMDB_API_KEY is not configured. Please add it to your .env file.\n' +
      'Get your API key at: https://www.themoviedb.org/settings/api'
    );
  }
}

/**
 * Construye URL completa de imagen
 */
export function buildImageUrl(path: string | null, type: 'poster' | 'backdrop' | 'profile' = 'poster'): string | null {
  if (!path) return null;
  const size = tmdbConfig.imageSize[type];
  return `${tmdbConfig.imageBaseUrl}/${size}${path}`;
}