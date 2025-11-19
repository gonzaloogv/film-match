import { jwtDecode } from 'jwt-decode';

/**
 * Interface para el payload del JWT
 */
interface TokenPayload {
  userId: number;
  email: string;
  exp: number;      // Timestamp de expiración (segundos)
  iat: number;      // Timestamp de emisión (segundos)
  [key: string]: any;
}

/**
 * Interface para datos del usuario extraídos del token
 */
export interface UserDataFromToken {
  userId: number;
  email: string;
  expiresAt: number;  // Timestamp en milisegundos
}

/**
 * Gestor centralizado de JWT tokens
 * Maneja:
 * - Guardar/leer tokens del localStorage
 * - Decodificar y validar tokens
 * - Verificar expiración
 */
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'film_match_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'film_match_refresh_token';
  private static readonly USER_DATA_KEY = 'film_match_user_data';

  /**
   * Guarda los tokens en localStorage
   * También decodifica y guarda datos del usuario
   *
   * @param accessToken - JWT token de acceso
   * @param refreshToken - JWT token de refresco (opcional)
   */
  static setTokens(accessToken: string, refreshToken?: string): void {
    console.log('💾 TokenManager.setTokens - received token:', {
      length: accessToken.length,
      startsCorrect: accessToken.startsWith('eyJ'),
      parts: accessToken.split('.').length,
      preview: accessToken.substring(0, 50) + '...',
      fullToken: accessToken // Log full token for debugging
    });

    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    // Extraer datos del usuario del token
    try {
      const payload = jwtDecode<TokenPayload>(accessToken);
      const userData: UserDataFromToken = {
        userId: payload.userId,
        email: payload.email,
        expiresAt: payload.exp * 1000, // Convertir segundos a milisegundos
      };
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
      console.log('✅ Tokens guardados:', userData.email);
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      console.error('❌ Token that failed to decode:', accessToken);
      // Aún así guardar el token si la decodificación falla
    }
  }

  /**
   * Obtiene el access token del localStorage
   * @returns Access token o null si no existe
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Obtiene el refresh token del localStorage
   * @returns Refresh token o null si no existe
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Limpia todos los tokens del localStorage
   * Se llamaa durante logout
   */
  static clearTokens(): void {
    console.log('🔓 Limpiando tokens...');
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Verifica si el token ha expirado
   *
   * Considera el token expirado si:
   * - No existe
   * - Faltan menos de 5 minutos para expirar
   *
   * @returns true si está expirado, false si es válido
   */
  static isTokenExpired(): boolean {
    const token = this.getAccessToken();

    if (!token) {
      return true;
    }

    try {
      const payload = jwtDecode<TokenPayload>(token);
      const now = Date.now();
      const expiresAt = payload.exp * 1000; // Convertir a milisegundos
      const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos

      // Expirado si faltan menos de 5 minutos
      return now >= (expiresAt - REFRESH_THRESHOLD);
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return true;
    }
  }

  /**
   * Obtiene los datos del usuario guardados en localStorage
   *
   * @returns Datos del usuario o null si no existen
   */
  static getUserData(): UserDataFromToken | null {
    const data = localStorage.getItem(this.USER_DATA_KEY);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as UserDataFromToken;
    } catch (error) {
      console.error('❌ Error parseando datos del usuario:', error);
      return null;
    }
  }

  /**
   * Decodifica un token y retorna su payload
   * Útil para inspeccionar datos del token
   *
   * @param token - JWT token
   * @returns Payload decodificado
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Verifica si hay un usuario autenticado
   * Chequea si existen tokens y no están expirados
   *
   * @returns true si hay un usuario autenticado válido
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }
}
