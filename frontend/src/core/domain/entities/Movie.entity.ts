/**
 * Movie Entity
 * Pure domain entity representing a movie with business logic
 * Implements Value Object Pattern with immutability
 */

export class Movie {
  /**
   * Creates a new Movie entity
   * Use Movie.create() factory method instead of constructor directly
   */
  private constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly year: number,
    public readonly genres: string[],
    public readonly duration: string,
    public readonly rating: number,
    public readonly overview: string,
    public readonly director: string,
    public readonly cast: string[],
    public readonly poster: string,
  ) { }


  /**
   * Factory method to create a Movie entity with validation
   *
   * @param data - Movie data
   * @returns Movie instance
   * @throws Error if data is invalid
   *
   * @example
   * ```typescript
   * const movie = Movie.create({
   *   id: 1,
   *   title: "Inception",
   *   year: 2010,
   *   genres: ["Sci-Fi", "Action"],
   *   duration: "148",
   *   rating: 8.8,
   *   overview: "A skilled thief...",
   *   director: "Christopher Nolan",
   *   cast: ["Leonardo DiCaprio", "Ellen Page"],
   *   poster: "https://..."
   * });
   * ```
   */
  static create(data: {
    id: number;
    title: string;
    year: number;
    genres: string[];
    duration: string;
    rating: number;
    overview: string;
    director: string;
    cast: string[];
    poster: string;
  }): Movie {
    Movie.validate(data);
    return new Movie(
      data.id,
      data.title,
      data.year,
      data.genres,
      data.duration,
      data.rating,
      data.overview,
      data.director,
      data.cast,
      data.poster,
    );
  }

  /**
   * Validates movie data
   *
   * @param data - Movie data to validate
   * @throws Error if validation fails
   */
  private static validate(data: any): void {
    if (!data.id || typeof data.id !== 'number') {
      throw new Error('Movie ID must be a valid number');
    }

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Movie title is required and must be a non-empty string');
    }

    if (!data.year || typeof data.year !== 'number' || data.year < 1900 || data.year > 2100) {
      throw new Error('Movie year must be between 1900 and 2100');
    }

    if (!Array.isArray(data.genres) || data.genres.length === 0) {
      throw new Error('Movie must have at least one genre');
    }

    if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 10) {
      throw new Error('Movie rating must be between 0 and 10');
    }

    // director, cast, and duration are optional (may not be provided by backend)
    // No validation needed for these fields
  }

  /**
   * Checks if movie matches a search query
   *
   * @param searchTerm - Search term to match
   * @returns true if movie matches search
   */
  matchesSearch(searchTerm: string): boolean {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return true;
    }

    const search = searchTerm.toLowerCase();

    return (
      this.title.toLowerCase().includes(search) ||
      this.director.toLowerCase().includes(search) ||
      this.cast.some((actor) => actor.toLowerCase().includes(search)) ||
      this.overview.toLowerCase().includes(search)
    );
  }

  /**
   * Checks if movie belongs to selected genres
   *
   * @param genres - Array of genre names to match
   * @returns true if movie has at least one matching genre
   */
  matchesGenres(genres: string[]): boolean {
    if (!genres || genres.length === 0) {
      return true;
    }

    return genres.some((genre) => this.genres.includes(genre));
  }

  /**
   * Checks if movie year falls within a range
   *
   * @param minYear - Minimum year (inclusive)
   * @param maxYear - Maximum year (inclusive)
   * @returns true if movie year is within range
   */
  matchesYearRange(minYear: number, maxYear: number): boolean {
    return this.year >= minYear && this.year <= maxYear;
  }

  /**
   * Checks if movie rating meets minimum threshold
   *
   * @param minRating - Minimum rating threshold
   * @returns true if movie rating >= minRating
   */
  matchesMinRating(minRating: number): boolean {
    return this.rating >= minRating;
  }

  /**
   * Checks if movie matches all criteria in a multi-filter scenario
   *
   * @param searchTerm - Search query
   * @param genres - Genre filter
   * @param minYear - Year range minimum
   * @param maxYear - Year range maximum
   * @param minRating - Rating threshold
   * @returns true if movie matches ALL criteria
   */
  matchesAllCriteria(
    searchTerm: string,
    genres: string[],
    minYear: number,
    maxYear: number,
    minRating: number,
  ): boolean {
    return (
      this.matchesSearch(searchTerm) &&
      this.matchesGenres(genres) &&
      this.matchesYearRange(minYear, maxYear) &&
      this.matchesMinRating(minRating)
    );
  }

  /**
   * Gets primary cast members
   *
   * @param limit - Maximum number of cast members to return
   * @returns Array of cast members (limited)
   */
  getPrimaryCast(limit: number = 3): string[] {
    return this.cast.slice(0, limit);
  }

  /**
   * Checks if movie is from a specific year
   *
   * @param year - Year to check
   * @returns true if movie is from that year
   */
  isFromYear(year: number): boolean {
    return this.year === year;
  }

  /**
   * Checks if movie is from a specific decade
   *
   * @param decade - Decade start year (e.g., 2000 for 2000-2009)
   * @returns true if movie is from that decade
   */
  isFromDecade(decade: number): boolean {
    return this.year >= decade && this.year < decade + 10;
  }

  /**
   * Gets a formatted string representation of the movie
   *
   * @returns Formatted string like "Title (2023)"
   */
  toString(): string {
    return `${this.title} (${this.year})`;
  }

  /**
   * Gets a formatted title with director
   *
   * @returns Formatted string like "Title by Director"
   */
  getTitleWithDirector(): string {
    return `${this.title} by ${this.director}`;
  }

  /**
   * Checks if movie is older than specified years
   *
   * @param years - Number of years to check against
   * @returns true if movie is older than specified years
   */
  isOlderThan(years: number): boolean {
    const currentYear = new Date().getFullYear();
    return currentYear - this.year >= years;
  }

  /**
   * Checks if movie is recent (last 5 years by default)
   *
   * @param yearsBack - Number of years to consider as "recent"
   * @returns true if movie is from recent years
   */
  isRecent(yearsBack: number = 5): boolean {
    const currentYear = new Date().getFullYear();
    return this.year >= currentYear - yearsBack;
  }
}
