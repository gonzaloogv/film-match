import { useCallback } from 'react';
import { type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/api';

/**
 * useGoogleLogin hook
 *
 * Encapsula la logica de login con Google.
 * Maneja la respuesta del SDK de Google y llama al backend.
 */
export const useGoogleLogin = () => {
  const { loginWithGoogle, isLoggingIn, loginError, isAuthenticated } = useAuth();

  /**
   * Maneja el exito del login de Google
   * Se llama cuando el usuario completa exitosamente el login con Google
   *
   * @param credentialResponse - Respuesta del Google Sign-In
   */
  const handleGoogleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      // El token JWT viene en credentialResponse.credential
      // Lo enviamos al backend para verificarlo y crear la sesion
      return loginWithGoogle(credentialResponse.credential);
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
