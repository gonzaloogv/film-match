/**
 * Filter Domain Types
 */

export interface MovieFilterCriteria {
  search: string;
  genres: string[];
  yearRange: [number, number];
  minRating: number;
}

export type FilterUpdate = Partial<MovieFilterCriteria>;
