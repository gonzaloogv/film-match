/**
 * FilterMovies Use Case
 * Implements filtering business logic using MovieFilter entity
 */

import type { Movie, MovieFilter } from '../entities';

/**
 * Use case for filtering movies based on criteria
 * Pure business logic - no side effects
 */
export class FilterMoviesUseCase {
  /**
   * Filters movies based on criteria
   *
   * @param movies - Array of movies to filter
   * @param filter - MovieFilter entity with filtering criteria
   * @returns Filtered array of movies
   *
   * @example
   * ```typescript
   * const useCase = new FilterMoviesUseCase();
   * const filter = MovieFilter.create({
   *   search: 'inception',
   *   genres: ['Sci-Fi'],
   *   yearRange: [2000, 2023],
   *   minRating: 7
   * });
   * const filtered = useCase.execute(movies, filter);
   * ```
   */
  execute(movies: Movie[], filter: MovieFilter): Movie[] {
    if (!movies || movies.length === 0) {
      return [];
    }

    return filter.filterMovies(movies);
  }

  /**
   * Filters movies and returns count
   *
   * @param movies - Array of movies to filter
   * @param filter - MovieFilter entity
   * @returns Number of filtered movies
   */
  executeAndCount(movies: Movie[], filter: MovieFilter): number {
    return this.execute(movies, filter).length;
  }

  /**
   * Filters movies and checks if any match
   *
   * @param movies - Array of movies to filter
   * @param filter - MovieFilter entity
   * @returns true if at least one movie matches
   */
  hasMatches(movies: Movie[], filter: MovieFilter): boolean {
    return this.executeAndCount(movies, filter) > 0;
  }

  /**
   * Gets percentage of movies matching filter
   *
   * @param movies - Array of movies to filter
   * @param filter - MovieFilter entity
   * @returns Percentage as decimal (0-1)
   */
  getMatchPercentage(movies: Movie[], filter: MovieFilter): number {
    if (movies.length === 0) return 0;
    const matchCount = this.executeAndCount(movies, filter);
    return matchCount / movies.length;
  }

  /**
   * Finds the first movie matching filter
   *
   * @param movies - Array of movies to search
   * @param filter - MovieFilter entity
   * @returns First matching movie or null
   */
  findFirst(movies: Movie[], filter: MovieFilter): Movie | null {
    const filtered = this.execute(movies, filter);
    return filtered.length > 0 ? filtered[0] : null;
  }

  /**
   * Finds the best-rated movie matching filter
   *
   * @param movies - Array of movies to search
   * @param filter - MovieFilter entity
   * @returns Movie with highest rating or null
   */
  findTopRated(movies: Movie[], filter: MovieFilter): Movie | null {
    const filtered = this.execute(movies, filter);
    if (filtered.length === 0) return null;
    return filtered.reduce((top, current) => (current.rating > top.rating ? current : top));
  }

  /**
   * Finds the most recent movie matching filter
   *
   * @param movies - Array of movies to search
   * @param filter - MovieFilter entity
   * @returns Movie with most recent year or null
   */
  findMostRecent(movies: Movie[], filter: MovieFilter): Movie | null {
    const filtered = this.execute(movies, filter);
    if (filtered.length === 0) return null;
    return filtered.reduce((recent, current) => (current.year > recent.year ? current : recent));
  }

  /**
   * Groups filtered movies by genre
   *
   * @param movies - Array of movies to filter and group
   * @param filter - MovieFilter entity
   * @returns Map of genre to movies
   */
  executeAndGroupByGenre(movies: Movie[], filter: MovieFilter): Map<string, Movie[]> {
    const filtered = this.execute(movies, filter);
    const grouped = new Map<string, Movie[]>();

    filtered.forEach((movie) => {
      movie.genres.forEach((genre) => {
        if (!grouped.has(genre)) {
          grouped.set(genre, []);
        }
        grouped.get(genre)!.push(movie);
      });
    });

    return grouped;
  }

  /**
   * Groups filtered movies by year
   *
   * @param movies - Array of movies to filter and group
   * @param filter - MovieFilter entity
   * @returns Map of year to movies
   */
  executeAndGroupByYear(movies: Movie[], filter: MovieFilter): Map<number, Movie[]> {
    const filtered = this.execute(movies, filter);
    const grouped = new Map<number, Movie[]>();

    filtered.forEach((movie) => {
      if (!grouped.has(movie.year)) {
        grouped.set(movie.year, []);
      }
      grouped.get(movie.year)!.push(movie);
    });

    return grouped;
  }

  /**
   * Sorts filtered movies
   *
   * @param movies - Array of movies to filter
   * @param filter - MovieFilter entity
   * @param sortBy - Sort criteria: 'rating' | 'year' | 'title'
   * @param ascending - Sort direction (default: descending)
   * @returns Sorted array of filtered movies
   */
  executeAndSort(
    movies: Movie[],
    filter: MovieFilter,
    sortBy: 'rating' | 'year' | 'title',
    ascending: boolean = false,
  ): Movie[] {
    const filtered = this.execute(movies, filter);

    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'year':
          comparison = a.year - b.year;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return ascending ? comparison : -comparison;
    });
  }

  /**
   * Gets statistics about filtered results
   *
   * @param movies - Array of movies to filter
   * @param filter - MovieFilter entity
   * @returns Object with filtering statistics
   */
  getStatistics(movies: Movie[], filter: MovieFilter): {
    totalMovies: number;
    filteredCount: number;
    matchPercentage: number;
    averageRating: number;
    minYear: number;
    maxYear: number;
  } {
    const filtered = this.execute(movies, filter);

    const averageRating =
      filtered.length > 0 ? filtered.reduce((sum, m) => sum + m.rating, 0) / filtered.length : 0;

    const years = filtered.map((m) => m.year);
    const minYear = years.length > 0 ? Math.min(...years) : 0;
    const maxYear = years.length > 0 ? Math.max(...years) : 0;

    return {
      totalMovies: movies.length,
      filteredCount: filtered.length,
      matchPercentage: movies.length > 0 ? (filtered.length / movies.length) * 100 : 0,
      averageRating: Math.round(averageRating * 10) / 10,
      minYear,
      maxYear,
    };
  }
}
