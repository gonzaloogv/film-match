/**
 * Data Transfer Objects (DTOs)
 * Raw data structures for storage and transmission
 */

/**
 * MovieDTO - Raw movie data as stored/transmitted
 */
export interface MovieDTO {
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
}

/**
 * UserRatingDTO - Raw rating data as stored/transmitted
 */
export interface UserRatingDTO {
  movieId: number;
  rating: number;
  comment?: string;
  createdAt: string; // ISO string
}

/**
 * Represents serialized user data
 */
export interface UserDataDTO {
  matches: MovieDTO[];
  ratings: UserRatingDTO[];
}
