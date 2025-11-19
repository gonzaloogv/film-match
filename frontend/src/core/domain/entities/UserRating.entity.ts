/**
 * UserRating Entity
 * Represents a user's rating and comment for a movie
 * Implements Value Object Pattern with immutability
 */

export class UserRating {
  /**
   * Creates a new UserRating entity
   * Use UserRating.create() factory method instead of constructor directly
   */
  private constructor(
    public readonly movieId: number,
    public readonly rating: number,
    public readonly comment: string | undefined,
    public readonly createdAt: Date,
  ) {}

  /**
   * Factory method to create a UserRating entity with validation
   *
   * @param data - Rating data
   * @returns UserRating instance
   * @throws Error if data is invalid
   *
   * @example
   * ```typescript
   * const rating = UserRating.create({
   *   movieId: 1,
   *   rating: 4,
   *   comment: "Amazing movie!",
   * });
   * ```
   */
  static create(data: {
    movieId: number;
    rating: number;
    comment?: string;
    createdAt?: Date;
  }): UserRating {
    UserRating.validate(data);

    return new UserRating(
      data.movieId,
      data.rating,
      data.comment,
      data.createdAt || new Date(),
    );
  }

  /**
   * Validates rating data
   *
   * @param data - Rating data to validate
   * @throws Error if validation fails
   */
  private static validate(data: any): void {
    if (!data.movieId || typeof data.movieId !== 'number' || data.movieId <= 0) {
      throw new Error('MovieId must be a valid positive number');
    }

    if (typeof data.rating !== 'number') {
      throw new Error('Rating must be a number');
    }

    if (data.rating < 0 || data.rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    if (!Number.isInteger(data.rating)) {
      throw new Error('Rating must be a whole number');
    }

    if (data.comment !== undefined && typeof data.comment !== 'string') {
      throw new Error('Comment must be a string');
    }

    if (data.comment && data.comment.length > 500) {
      throw new Error('Comment cannot exceed 500 characters');
    }

    if (data.createdAt && !(data.createdAt instanceof Date)) {
      throw new Error('CreatedAt must be a Date instance');
    }
  }

  /**
   * Checks if this rating has a comment
   *
   * @returns true if rating has a non-empty comment
   */
  hasComment(): boolean {
    return !!this.comment && this.comment.trim().length > 0;
  }

  /**
   * Gets the comment or a default message
   *
   * @returns Comment or default message
   */
  getComment(): string {
    return this.comment || 'No comment provided';
  }

  /**
   * Checks if rating is valid
   *
   * @returns true if rating is valid
   */
  isValid(): boolean {
    return (
      this.movieId > 0 &&
      this.rating >= 0 &&
      this.rating <= 5 &&
      Number.isInteger(this.rating) &&
      this.createdAt instanceof Date
    );
  }

  /**
   * Gets how old this rating is in days
   *
   * @returns Number of days since rating was created
   */
  getDaysOld(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Checks if this rating is recent (within specified days)
   *
   * @param days - Number of days to check against
   * @returns true if rating is within specified days
   */
  isRecent(days: number = 7): boolean {
    return this.getDaysOld() <= days;
  }

  /**
   * Gets a formatted date string
   *
   * @param locale - Locale for formatting (default: es-ES)
   * @returns Formatted date string
   *
   * @example
   * ```typescript
   * const rating = UserRating.create({ movieId: 1, rating: 4 });
   * console.log(rating.getFormattedDate()); // "25 de octubre de 2024"
   * ```
   */
  getFormattedDate(locale: string = 'es-ES'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(this.createdAt);
  }

  /**
   * Gets formatted date and time
   *
   * @param locale - Locale for formatting (default: es-ES)
   * @returns Formatted date and time string
   */
  getFormattedDateTime(locale: string = 'es-ES'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(this.createdAt);
  }

  /**
   * Gets the rating as star representation
   *
   * @returns String like "★★★★☆" for rating of 4
   */
  getStarRepresentation(): string {
    const fullStars = '★'.repeat(this.rating);
    const emptyStars = '☆'.repeat(5 - this.rating);
    return fullStars + emptyStars;
  }

  /**
   * Checks if user gave a positive rating (4-5 stars)
   *
   * @returns true if rating is 4 or 5
   */
  isPositive(): boolean {
    return this.rating >= 4;
  }

  /**
   * Checks if user gave a negative rating (0-2 stars)
   *
   * @returns true if rating is 0, 1, or 2
   */
  isNegative(): boolean {
    return this.rating <= 2;
  }

  /**
   * Checks if user gave a neutral rating (3 stars)
   *
   * @returns true if rating is 3
   */
  isNeutral(): boolean {
    return this.rating === 3;
  }

  /**
   * Gets sentiment of the rating
   *
   * @returns 'positive' | 'negative' | 'neutral'
   */
  getSentiment(): 'positive' | 'negative' | 'neutral' {
    if (this.isPositive()) return 'positive';
    if (this.isNegative()) return 'negative';
    return 'neutral';
  }

  /**
   * Updates the rating (creates a new instance, maintains immutability)
   *
   * @param newRating - New rating value
   * @param newComment - Optional new comment
   * @returns New UserRating instance
   */
  update(newRating: number, newComment?: string): UserRating {
    return UserRating.create({
      movieId: this.movieId,
      rating: newRating,
      comment: newComment,
      createdAt: this.createdAt,
    });
  }

  /**
   * Gets a string representation of the rating
   *
   * @returns Formatted string like "Movie #1: ★★★★☆ 4/5"
   */
  toString(): string {
    return `Movie #${this.movieId}: ${this.getStarRepresentation()} ${this.rating}/5`;
  }

  /**
   * Gets a detailed summary
   *
   * @returns Detailed summary string
   */
  toDetailedString(): string {
    const base = this.toString();
    if (this.hasComment()) {
      return `${base} - "${this.comment}"`;
    }
    return base;
  }

  /**
   * Converts rating to JSON
   *
   * @returns JSON object representation
   */
  toJSON(): {
    movieId: number;
    rating: number;
    comment?: string;
    createdAt: string;
    sentiment: string;
  } {
    return {
      movieId: this.movieId,
      rating: this.rating,
      comment: this.comment,
      createdAt: this.createdAt.toISOString(),
      sentiment: this.getSentiment(),
    };
  }
}
