// ============================================
// TMDB API Response Types
// ============================================

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TMDBMovieDetail extends TMDBMovie {
  genres: TMDBGenre[];
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  homepage: string | null;
  imdb_id: string | null;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  iso_639_1: string;
  name: string;
  english_name: string;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchParams {
  query: string;
  page?: number;
  language?: string;
  include_adult?: boolean;
  year?: number;
}

export interface TMDBDiscoverParams {
  page?: number;
  language?: string;
  sort_by?: string;
  with_genres?: string;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  year?: number;
  'release_date.gte'?: string;
  'release_date.lte'?: string;
}

// ============================================
// Internal Types
// ============================================

export interface TMDBSyncOptions {
  maxPages?: number;
  delayBetweenRequests?: number;
  categories?: string[];
  minVoteCount?: number;
  minVoteAverage?: number;
}

export interface TMDBSyncResult {
  totalProcessed: number;
  totalSaved: number;
  totalSkipped: number;
  errors: string[];
  duration: number;
}

// ============================================
// Genre Mapping (TMDB ID → Local Category Slug)
// ============================================

export const TMDB_GENRE_MAPPING: Record<number, string> = {
  28: 'action',
  12: 'adventure',
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  14: 'fantasy',
  36: 'history',
  27: 'horror',
  10402: 'music',
  9648: 'mystery',
  10749: 'romance',
  878: 'sci-fi',
  10770: 'tv-movie',
  53: 'thriller',
  10752: 'war',
  37: 'western'
};

export const LOCAL_CATEGORIES = [
  'action',
  'adventure',
  'animation',
  'comedy',
  'crime',
  'documentary',
  'drama',
  'family',
  'fantasy',
  'history',
  'horror',
  'music',
  'mystery',
  'romance',
  'sci-fi',
  'thriller',
  'war',
  'western'
];