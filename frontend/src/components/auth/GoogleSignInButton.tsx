/**
 * GoogleSignInButton Component
 *
 * Botón de Sign-In con Google
 * Renderiza el botón nativo de Google OAuth
 */

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLogin } from '@/hooks/auth/useGoogleLogin';

/**
 * Props
 */
interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: () => void;
  disabled?: boolean;
}

/**
 * GoogleSignInButton Component
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const { handleGoogleSuccess, handleGoogleError, isLoading } = useGoogleLogin();

  const handleSuccess = (credentialResponse: any) => {
    handleGoogleSuccess(credentialResponse);
    onSuccess?.();
  };

  const handleError = () => {
    handleGoogleError();
    onError?.();
  };

  return (
    <div className="flex justify-center opacity-100">
      {(disabled || isLoading) ? (
        <div className="opacity-50 pointer-events-none">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
          />
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={true}
        />
      )}
    </div>
  );
};

export default GoogleSignInButton;
