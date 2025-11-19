/**
 * MovieFilter Entity
 * Represents filtering criteria and provides filtering logic
 * Implements Value Object Pattern
 */

import type { Movie } from './Movie.entity';

export interface MovieFilterCriteria {
  search: string;
  genres: string[];
  yearRange: [number, number];
  minRating: number;
}

export class MovieFilter {
  /**
   * Creates a new MovieFilter entity
   */
  private constructor(public readonly criteria: MovieFilterCriteria) {
    MovieFilter.validate(criteria);
  }

  /**
   * Factory method to create a MovieFilter
   *
   * @param criteria - Filter criteria
   * @returns MovieFilter instance
   * @throws Error if criteria is invalid
   *
   * @example
   * ```typescript
   * const filter = MovieFilter.create({
   *   search: 'inception',
   *   genres: ['Sci-Fi'],
   *   yearRange: [2000, 2023],
   *   minRating: 7
   * });
   * ```
   */
  static create(criteria: MovieFilterCriteria): MovieFilter {
    return new MovieFilter(criteria);
  }

  /**
   * Validates filter criteria
   *
   * @param criteria - Criteria to validate
   * @throws Error if validation fails
   */
  private static validate(criteria: any): void {
    if (typeof criteria.search !== 'string') {
      throw new Error('Search must be a string');
    }

    if (!Array.isArray(criteria.genres)) {
      throw new Error('Genres must be an array');
    }

    if (!Array.isArray(criteria.yearRange) || criteria.yearRange.length !== 2) {
      throw new Error('Year range must be a 2-element array');
    }

    const [minYear, maxYear] = criteria.yearRange;
    if (minYear < 1900 || maxYear > 2100 || minYear > maxYear) {
      throw new Error('Year range must be valid (1900-2100)');
    }

    if (typeof criteria.minRating !== 'number' || criteria.minRating < 0 || criteria.minRating > 10) {
      throw new Error('Min rating must be between 0 and 10');
    }
  }

  /**
   * Checks if a movie matches this filter
   *
   * @param movie - Movie to check
   * @returns true if movie matches all filter criteria
   */
  matches(movie: Movie): boolean {
    return movie.matchesAllCriteria(
      this.criteria.search,
      this.criteria.genres,
      this.criteria.yearRange[0],
      this.criteria.yearRange[1],
      this.criteria.minRating,
    );
  }

  /**
   * Filters an array of movies
   *
   * @param movies - Array of movies to filter
   * @returns Filtered array of movies
   *
   * @example
   * ```typescript
   * const filter = MovieFilter.create({ ... });
   * const filtered = filter.filterMovies(allMovies);
   * ```
   */
  filterMovies(movies: Movie[]): Movie[] {
    return movies.filter((movie) => this.matches(movie));
  }

  /**
   * Counts how many movies match this filter
   *
   * @param movies - Array of movies to check
   * @returns Number of matching movies
   */
  countMatches(movies: Movie[]): number {
    return this.filterMovies(movies).length;
  }

  /**
   * Checks if this filter has any criteria applied
   *
   * @returns true if no filtering criteria is applied
   */
  isEmpty(): boolean {
    const hasSearch = this.criteria.search.trim().length > 0;
    const hasGenres = this.criteria.genres.length > 0;
    const hasYearFilter =
      this.criteria.yearRange[0] !== 1970 || this.criteria.yearRange[1] !== 2025;
    const hasRatingFilter = this.criteria.minRating > 0;

    return !hasSearch && !hasGenres && !hasYearFilter && !hasRatingFilter;
  }

  /**
   * Gets array of applied filters
   *
   * @returns Array of human-readable filter descriptions
   *
   * @example
   * ```typescript
   * const filters = filter.getAppliedFilters();
   * // Result: ['Search: inception', 'Genres: Sci-Fi', 'Year: 2000-2023', 'Rating: 7+']
   * ```
   */
  getAppliedFilters(): string[] {
    const applied: string[] = [];

    if (this.criteria.search.trim().length > 0) {
      applied.push(`Search: "${this.criteria.search}"`);
    }

    if (this.criteria.genres.length > 0) {
      applied.push(`Genres: ${this.criteria.genres.join(', ')}`);
    }

    if (
      this.criteria.yearRange[0] !== 1970 ||
      this.criteria.yearRange[1] !== 2025
    ) {
      applied.push(`Year: ${this.criteria.yearRange[0]}-${this.criteria.yearRange[1]}`);
    }

    if (this.criteria.minRating > 0) {
      applied.push(`Rating: ${this.criteria.minRating}+`);
    }

    return applied;
  }

  /**
   * Gets a human-readable description of the filter
   *
   * @returns Description string
   *
   * @example
   * ```typescript
   * console.log(filter.describe());
   * // "2 filters applied: Genres: Sci-Fi, Year: 2000-2023"
   * ```
   */
  describe(): string {
    const applied = this.getAppliedFilters();

    if (applied.length === 0) {
      return 'No filters applied';
    }

    if (applied.length === 1) {
      return `1 filter applied: ${applied[0]}`;
    }

    return `${applied.length} filters applied: ${applied.join(', ')}`;
  }

  /**
   * Resets a specific filter type
   *
   * @param filterType - Type of filter to reset
   * @returns New MovieFilter with that filter reset
   */
  resetFilter(filterType: 'search' | 'genres' | 'yearRange' | 'minRating'): MovieFilter {
    const newCriteria = { ...this.criteria };

    switch (filterType) {
      case 'search':
        newCriteria.search = '';
        break;
      case 'genres':
        newCriteria.genres = [];
        break;
      case 'yearRange':
        newCriteria.yearRange = [1970, 2025];
        break;
      case 'minRating':
        newCriteria.minRating = 0;
        break;
    }

    return MovieFilter.create(newCriteria);
  }

  /**
   * Resets all filters
   *
   * @returns New MovieFilter with all criteria reset
   */
  resetAll(): MovieFilter {
    return MovieFilter.create({
      search: '',
      genres: [],
      yearRange: [1970, 2025],
      minRating: 0,
    });
  }

  /**
   * Adds a genre to the filter
   *
   * @param genre - Genre to add
   * @returns New MovieFilter with genre added
   */
  addGenre(genre: string): MovieFilter {
    const newGenres = this.criteria.genres.includes(genre)
      ? this.criteria.genres
      : [...this.criteria.genres, genre];

    return MovieFilter.create({
      ...this.criteria,
      genres: newGenres,
    });
  }

  /**
   * Removes a genre from the filter
   *
   * @param genre - Genre to remove
   * @returns New MovieFilter with genre removed
   */
  removeGenre(genre: string): MovieFilter {
    return MovieFilter.create({
      ...this.criteria,
      genres: this.criteria.genres.filter((g) => g !== genre),
    });
  }

  /**
   * Toggles a genre (adds if not present, removes if present)
   *
   * @param genre - Genre to toggle
   * @returns New MovieFilter with genre toggled
   */
  toggleGenre(genre: string): MovieFilter {
    return this.criteria.genres.includes(genre) ? this.removeGenre(genre) : this.addGenre(genre);
  }

  /**
   * Clones this filter
   *
   * @returns New MovieFilter with same criteria
   */
  clone(): MovieFilter {
    return MovieFilter.create({
      ...this.criteria,
      genres: [...this.criteria.genres],
      yearRange: [...this.criteria.yearRange] as [number, number],
    });
  }

  /**
   * Compares this filter with another
   *
   * @param other - Other filter to compare
   * @returns true if filters have identical criteria
   */
  equals(other: MovieFilter): boolean {
    return (
      this.criteria.search === other.criteria.search &&
      JSON.stringify(this.criteria.genres) === JSON.stringify(other.criteria.genres) &&
      this.criteria.yearRange[0] === other.criteria.yearRange[0] &&
      this.criteria.yearRange[1] === other.criteria.yearRange[1] &&
      this.criteria.minRating === other.criteria.minRating
    );
  }

  /**
   * Gets string representation
   *
   * @returns String description of filter
   */
  toString(): string {
    return this.describe();
  }

  /**
   * Converts filter to JSON
   *
   * @returns JSON object representation
   */
  toJSON(): MovieFilterCriteria {
    return { ...this.criteria };
  }
}
