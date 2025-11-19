/**
 * Datos del usuario autenticado
 */
export interface UserDTO {
  id: number;
  email: string;
  username?: string | null;
  name?: string | null;
  nickname?: string | null;
  picture?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta del login/OAuth
 */
export interface LoginResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Payload para login con Google
 */
export interface GoogleAuthPayload {
  token: string; // ID token de Google
}

/**
 * Payload para refresh token
 */
export interface RefreshTokenPayload {
  refreshToken: string;
}

/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}
