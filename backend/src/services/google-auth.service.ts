import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { GoogleUserData } from '../types/auth.types';

/**
 * Cliente de Google OAuth
 */
const googleClient = new OAuth2Client(
  env.googleClientId,
  env.googleClientSecret,
  env.googleRedirectUri
);

/**
 * Verifica el ID Token de Google y extrae datos del usuario
 * @param token - ID Token de Google
 * @returns Datos del usuario verificados
 * @throws Error si el token es inválido
 */
export async function verifyGoogleToken(token: string): Promise<GoogleUserData> {
  try {
    // Verificar token con Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.googleClientId
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    // Extraer datos relevantes
    return {
      googleId: payload.sub,           // ID único de Google
      email: payload.email!,
      name: payload.name || 'User',
      picture: payload.picture
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Failed to verify Google token');
  }
}

/**
 * Genera URL de autorización de Google
 * @returns URL para redirigir al usuario
 */
export function getGoogleAuthURL(): string {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

/**
 * Intercambia código de autorización por tokens
 * @param code - Código de autorización de Google
 * @returns Tokens de acceso
 */
export async function getGoogleTokens(code: string) {
  try {
    const { tokens } = await googleClient.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Failed to get Google tokens:', error);
    throw new Error('Failed to exchange authorization code');
  }
}