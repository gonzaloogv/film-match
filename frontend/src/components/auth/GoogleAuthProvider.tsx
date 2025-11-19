/**
 * GoogleAuthProvider
 *
 * Wraps the application with Google OAuth configuration
 * Initializes Google Sign-In SDK and provides credential handler
 */

import React, { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

/**
 * Props
 */
interface GoogleAuthProviderProps {
  children: ReactNode;
}

/**
 * GoogleAuthProvider Component
 * Wraps app with Google OAuth context
 *
 * **IMPORTANTE:** Debes configurar la variable de entorno:
 * - VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
 *
 * Obtén el Client ID en: https://console.cloud.google.com/
 */
export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({ children }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Debug logging
  console.log('🔍 GoogleAuthProvider Debug:', {
    clientId: clientId ? `${clientId.substring(0, 20)}...` : 'UNDEFINED',
    env_vars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
  });

  // Validate that Google Client ID is configured
  if (!clientId) {
    console.error(
      '❌ Google Client ID no está configurado. Por favor, configura VITE_GOOGLE_CLIENT_ID en tu archivo .env.local'
    );
    console.error('📋 Variables disponibles:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
    return <>{children}</>;
  }

  console.log('✅ GoogleAuthProvider inicializado con Client ID');
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthProvider;
