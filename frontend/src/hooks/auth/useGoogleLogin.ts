/**
 * useGoogleLogin hook
 *
 * Encapsula la lógica de login con Google
 * Maneja la respuesta del SDK de Google y llama al backend
 */

import { useCallback } from 'react';
import { useAuth } from '@/hooks/api';

/**
 * useGoogleLogin hook
 *
 * @returns Object con funciones y estado de login
 */
export const useGoogleLogin = () => {
  const { loginWithGoogle, isLoggingIn, loginError, isAuthenticated } = useAuth();

  /**
   * Maneja el éxito del login de Google
   * Se llama cuando el usuario completa exitosamente el login con Google
   *
   * @param credentialResponse - Respuesta del Google Sign-In
   */
  const handleGoogleSuccess = useCallback(
    async (credentialResponse: any) => {
      try {
        if (!credentialResponse.credential) {
          throw new Error('No credential received from Google');
        }

        // El token JWT viene en credentialResponse.credential
        // Lo enviamos al backend para verificarlo y crear la sesión
        loginWithGoogle(credentialResponse.credential);
      } catch (error) {
        console.error('Error en Google login:', error);
      }
    },
    [loginWithGoogle]
  );

  /**
   * Maneja el error del login de Google
   */
  const handleGoogleError = useCallback(() => {
    console.error('Google Sign-In failed');
  }, []);

  return {
    handleGoogleSuccess,
    handleGoogleError,
    isLoading: isLoggingIn,
    error: loginError,
    isAuthenticated,
  };
};

export default useGoogleLogin;
