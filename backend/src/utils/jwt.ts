import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JWTPayload, RefreshTokenPayload } from '../types/auth.types';

/**
 * Genera un JWT para un usuario
 * @param payload - Datos del usuario a incluir en el token
 * @returns Token firmado
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // @ts-ignore - jsonwebtoken typing issue
  const token: string = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  console.log('📝 generateToken - Generated JWT:', {
    payload: payload,
    tokenLength: token.length,
    parts: token.split('.').length,
    startsCorrect: token.startsWith('eyJ'),
    preview: token.substring(0, 50) + '...',
    expiresIn: env.jwtExpiresIn
  });

  return token;
}

/**
 * Verifica y decodifica un JWT
 * @param token - Token a verificar
 * @returns Payload decodificado si es válido
 * @throws Error si el token es inválido o expiró
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Extrae el token del header Authorization
 * @param authHeader - Header Authorization (formato: "Bearer <token>")
 * @returns Token extraído o null
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Genera un Refresh Token
 * @param payload - Datos a incluir en el refresh token
 * @returns Token firmado (30 días de duración)
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  // @ts-ignore - jsonwebtoken typing issue
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '30d'
  });
}

/**
 * Verifica y decodifica un Refresh Token
 * @param token - Token a verificar
 * @returns Payload decodificado si es válido
 * @throws Error si el token es inválido o expiró
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Genera un Access Token con duración corta (15 minutos)
 * @param payload - Datos del usuario
 * @returns Access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // @ts-ignore - jsonwebtoken typing issue
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '15m'
  });
}