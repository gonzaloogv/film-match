/**
 * UserContext
 *
 * Context for managing user authentication and profile
 * Persists auth state across sessions
 *
 * @responsibility Manage authentication state and user profile
 * @architecture_layer Presentation - State Management
 */

import { createContext } from 'react';

/**
 * User Profile Interface
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  nickname?: string; // Apodo del usuario
  avatar?: string; // Path al avatar seleccionado
  bio?: string; // Descripción/biografía
  twitterUrl?: string; // URL de Twitter
  instagramUrl?: string; // URL de Instagram
  createdAt: Date;
}

/**
 * User State Interface
 */
export interface UserState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * User Actions Interface
 */
export interface UserActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

/**
 * Combined Context Interface
 */
export interface UserContextValue extends UserState, UserActions {}

/**
 * Initial State
 */
export const initialUserState: UserState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

/**
 * User Context
 */
export const UserContext = createContext<UserContextValue | undefined>(undefined);
