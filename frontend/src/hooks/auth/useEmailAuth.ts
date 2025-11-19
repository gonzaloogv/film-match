import { authService } from '@/api/services';
import { TokenManager } from '@/lib/auth/token-manager';
import { useState } from 'react';

/**
 * Hook para autenticación con email y contraseña
 * Maneja registro e inicio de sesión
 */
export const useEmailAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Registra un nuevo usuario con email y contraseña
   */
  const register = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.registerWithEmail({
        email,
        password,
        username,
      });

      if (response.user && response.accessToken) {
        // Guardar token y datos del usuario
        TokenManager.setTokens(
          response.accessToken,
          response.refreshToken || undefined
        );

        return {
          success: true,
          user: response.user,
          token: response.accessToken,
        };
      } else {
        throw new Error('No se recibió token de autenticación');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setError(message);
      console.error('Registration error:', err);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia sesión con email y contraseña
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.loginWithEmail({
        email,
        password,
      });

      if (response.user && response.accessToken) {
        // Guardar token y datos del usuario
        TokenManager.setTokens(
          response.accessToken,
          response.refreshToken || undefined
        );

        return {
          success: true,
          user: response.user,
          token: response.accessToken,
        };
      } else {
        throw new Error('No se recibió token de autenticación');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      console.error('Login error:', err);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
