import { Request, Response, NextFunction } from 'express';
import { verifyGoogleToken, getGoogleAuthURL, getGoogleTokens } from '../services/google-auth.service';
import { authenticateWithGoogle, registerWithEmail, loginWithEmail, refreshTokens, logout } from '../services/auth.service';
import { validateRegisterInput, validateLoginInput } from '../validators/auth.validator';
import { AppError } from '../middleware/error.middleware';
import { env } from '../config/env';
import { AuthRequest } from '../types/auth.types';

/**
 * GET /api/auth/google
 * Devuelve URL de autorización de Google
 */
export async function getGoogleAuthUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const url = getGoogleAuthURL();

    res.json({
      success: true,
      data: { url }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/google
 * Autentica usuario con token de Google
 */
export async function googleAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError(400, 'Token is required');
    }

    console.log('🔐 googleAuth controller - Received Google token');

    // Verificar token de Google
    const googleData = await verifyGoogleToken(token);

    console.log('🔐 googleAuth controller - Google token verified, authenticating user');

    // Autenticar/registrar usuario
    const result = await authenticateWithGoogle(googleData);

    console.log('🔐 googleAuth controller - Response to be sent:', {
      hasAccessToken: !!result.accessToken,
      accessTokenLength: result.accessToken?.length,
      accessTokenParts: result.accessToken?.split('.').length,
      hasUser: !!result.user,
      userEmail: result.user?.email
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Google authentication failed'));
    }
  }
}

/**
 * GET /api/auth/google/callback
 * Callback de Google OAuth (recibe código de autorización)
 */
export async function googleCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      throw new AppError(400, 'Authorization code missing');
    }

    // Intercambiar código por tokens
    const tokens = await getGoogleTokens(code);

    if (!tokens.id_token) {
      throw new AppError(400, 'ID token missing');
    }

    // Verificar token
    const googleData = await verifyGoogleToken(tokens.id_token);

    // Autenticar usuario
    const result = await authenticateWithGoogle(googleData);

    // Redirigir al frontend con el token
    const redirectUrl = new URL('/auth/callback', env.frontendUrl);
    redirectUrl.searchParams.set('token', result.accessToken);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/register
 * Registra un nuevo usuario con email y contraseña
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, username } = req.body;

    // Validar input
    const validation = validateRegisterInput({ email, password, username });
    if (!validation.success) {
      const errorMessage = validation.errors?.[0]?.message || 'Validation failed';
      throw new AppError(400, errorMessage);
    }

    // Registrar usuario
    const result = await registerWithEmail(
      validation.data!.email,
      validation.data!.password,
      validation.data!.username
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error && error.message.includes('ya está registrado')) {
      next(new AppError(409, error.message));
    } else if (error instanceof Error) {
      next(new AppError(400, error.message));
    } else {
      next(new AppError(500, 'Registration failed'));
    }
  }
}

/**
 * POST /api/auth/login
 * Inicia sesión con email y contraseña
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    // Validar input
    const validation = validateLoginInput({ email, password });
    if (!validation.success) {
      const errorMessage = validation.errors?.[0]?.message || 'Validation failed';
      throw new AppError(400, errorMessage);
    }

    // Login usuario
    const result = await loginWithEmail(
      validation.data!.email,
      validation.data!.password
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error && error.message.includes('registrada con Google')) {
      next(new AppError(401, error.message));
    } else if (error instanceof Error && error.message.includes('incorrectos')) {
      next(new AppError(401, error.message));
    } else if (error instanceof Error) {
      next(new AppError(400, error.message));
    } else {
      next(new AppError(500, 'Login failed'));
    }
  }
}

/**
 * POST /api/auth/refresh
 * Renueva tokens usando refresh token
 */
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required');
    }

    const result = await refreshTokens(refreshToken);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error) {
      // Manejar errores específicos de refresh token
      if (error.message.includes('expired')) {
        next(new AppError(401, 'Refresh token expired'));
      } else if (error.message.includes('Invalid') || error.message.includes('revoked')) {
        next(new AppError(401, error.message));
      } else {
        next(new AppError(400, error.message));
      }
    } else {
      next(new AppError(500, 'Token refresh failed'));
    }
  }
}

/**
 * POST /api/auth/logout
 * Cierra sesión revocando refresh tokens
 */
export async function logoutUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userIdStr = req.user?.userId;

    if (!userIdStr) {
      throw new AppError(401, 'Not authenticated');
    }

    const userId = parseInt(userIdStr);
    const { refreshToken, allDevices } = req.body;

    const result = await logout(
      userId,
      allDevices ? undefined : refreshToken
    );

    res.json({
      success: true,
      data: {
        message: allDevices
          ? `Sesión cerrada en ${result.revokedCount} dispositivo(s)`
          : 'Sesión cerrada exitosamente'
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error) {
      next(new AppError(400, error.message));
    } else {
      next(new AppError(500, 'Logout failed'));
    }
  }
}
