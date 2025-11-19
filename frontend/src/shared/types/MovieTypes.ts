/**
 * Movie Domain Types
 */

export enum MovieGenre {
  Action = 'Action',
  Adventure = 'Adventure',
  Crime = 'Crime',
  Drama = 'Drama',
  SciFi = 'Sci-Fi',
  Thriller = 'Thriller',
  Romance = 'Romance',
}

export interface IMovie {
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

export interface IUserRating {
  movieId: number;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

export type MovieDTO = IMovie;
