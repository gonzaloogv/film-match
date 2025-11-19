import { prisma } from '../lib/prisma';
import { GoogleUserData } from '../types/auth.types';
import { generateToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Genera tokens de acceso y refresh, y almacena el refresh en BD
 */
async function generateTokenPair(userId: number, email: string) {
  // Generar access token (corta duración - 15 min)
  const accessToken = generateAccessToken({
    userId: userId.toString(),
    email
  });

  // Generar refresh token (larga duración - 30 días)
  const refreshTokenId = crypto.randomUUID();
  const refreshToken = generateRefreshToken({
    userId: userId.toString(),
    tokenId: refreshTokenId
  });

  // Almacenar hash del refresh token en BD
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    }
  });

  return { accessToken, refreshToken };
}

/**
 * Autentica o registra un usuario con datos de Google
 * @param googleData - Datos del usuario de Google
 * @returns Usuario y JWT generado
 */
export async function authenticateWithGoogle(googleData: GoogleUserData) {
  try {
    // Extraer el prefijo del email (texto antes del @) para usar como apodo automático
    const emailPrefix = googleData.email.split('@')[0];

    // Buscar usuario existente por googleId
    let user = await prisma.user.findUnique({
      where: { email: googleData.email }
    });

    // Si encontramos usuario por email pero sin googleId, actualizar
    if (user && !user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleData.googleId,
          username: googleData.name,
          nickname: user.nickname || emailPrefix, // Mantener apodo si existe, si no usar prefijo de email
          profilePicture: googleData.picture
        }
      });
    }

    // Si no existe, crear nuevo usuario
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: googleData.googleId,
          email: googleData.email,
          username: googleData.name,
          nickname: emailPrefix, // Auto-generar apodo del prefijo del email
          passwordHash: 'google-oauth', // No usamos contraseña con Google OAuth
          profilePicture: googleData.picture
        }
      });

      console.log(`✅ Google Auth - New user created with auto-generated nickname: ${emailPrefix}`);
    }

    // Generar par de tokens (access + refresh)
    const { accessToken, refreshToken } = await generateTokenPair(user.id, user.email);

    console.log('✅ Google Auth - tokens generated');

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name || user.username,
        nickname: user.nickname,
        profilePicture: user.profilePicture,
        bio: user.bio,
        twitterUrl: user.twitterUrl,
        instagramUrl: user.instagramUrl,
        googleId: user.googleId,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication failed');
  }
}

/**
 * Registra un nuevo usuario con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña en texto plano
 * @param username - Nombre de usuario (opcional)
 * @returns Usuario y JWT generado
 */
export async function registerWithEmail(email: string, password: string, username?: string) {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username: username || email.split('@')[0],
        authProvider: 'local'
      }
    });

    // Generar par de tokens (access + refresh)
    const { accessToken, refreshToken } = await generateTokenPair(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Registration error:', error);
    throw new Error('Registration failed');
  }
}

/**
 * Inicia sesión con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña en texto plano
 * @returns Usuario y JWT generado
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar que tenga passwordHash (para usuarios local)
    if (!user.passwordHash) {
      throw new Error('Esta cuenta está registrada con Google. Por favor inicia sesión con Google');
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Generar par de tokens (access + refresh)
    const { accessToken, refreshToken } = await generateTokenPair(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
}

/**
 * Renueva los tokens usando un refresh token válido
 * @param refreshToken - Token de refresh
 * @returns Nuevos tokens y datos del usuario
 */
export async function refreshTokens(refreshToken: string) {
  // 1. Verificar JWT para obtener userId
  const payload = verifyRefreshToken(refreshToken);
  const userId = parseInt(payload.userId);

  // 2. Buscar TODOS los tokens del usuario y verificar contra cada hash
  const storedTokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() }
    }
  });

  // 3. Encontrar el token que coincide con el hash
  let validToken = null;
  for (const token of storedTokens) {
    if (await bcrypt.compare(refreshToken, token.tokenHash)) {
      validToken = token;
      break;
    }
  }

  if (!validToken) {
    // Posible robo de token - invalidar TODOS los tokens del usuario
    await prisma.refreshToken.deleteMany({ where: { userId } });
    throw new Error('Invalid refresh token - all sessions revoked');
  }

  // 4. Obtener usuario
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // 5. Rotación: eliminar el token usado
  await prisma.refreshToken.delete({ where: { id: validToken.id } });

  // 6. Generar nuevos tokens
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokenPair(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

/**
 * Cierra sesión revocando refresh tokens
 * @param userId - ID del usuario
 * @param refreshToken - Token específico a revocar (opcional)
 * @returns Cantidad de tokens revocados
 */
export async function logout(userId: number, refreshToken?: string) {
  if (refreshToken) {
    // Revocar token específico
    const tokens = await prisma.refreshToken.findMany({
      where: { userId }
    });

    for (const token of tokens) {
      if (await bcrypt.compare(refreshToken, token.tokenHash)) {
        await prisma.refreshToken.delete({ where: { id: token.id } });
        return { revokedCount: 1 };
      }
    }
  }

  // Revocar todos los tokens (logout de todos los dispositivos)
  const result = await prisma.refreshToken.deleteMany({ where: { userId } });
  return { revokedCount: result.count };
}