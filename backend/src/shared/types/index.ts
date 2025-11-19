/**
 * Tipos compartidos de toda la aplicación
 * Estos tipos se usarán en DTOs (Data Transfer Objects)
 */

import type { Request } from 'express';

// Auth DTOs
export interface RegisterDTO {
  email: string;
  password: string;
  username?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    username?: string;
  };
  token: string;
  refreshToken?: string;
}

// JWT Payload
export interface JWTPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Movie DTOs (Preview de Fase 1)
export interface MovieDTO {
  id: number;
  title: string;
  overview: string;
  releaseDate?: string;
  posterPath?: string;
  backdropPath?: string;
  voteAverage: number;
}

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
}

export interface UserRatingDTO {
  id: number;
  movieId: number;
  rating: number;
  review?: string;
  watchedAt?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  meta: {
    timestamp: string;
  };
}

// API Response
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error handling
export interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
}

// Chat (Preview de Fase 3)
export interface ChatMessageDTO {
  id?: string;
  message: string;
  role: 'user' | 'assistant';
  contextMovieIds?: number[];
  timestamp?: string;
}

// Collections
export enum CollectionType {
  FAVORITES = 'favorites',
  WATCHLIST = 'watchlist',
  WATCHED = 'watched',
  MATCHED = 'matched',
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
