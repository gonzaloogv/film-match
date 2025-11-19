import { Router } from 'express';
import { googleAuth, getGoogleAuthUrl, googleCallback, register, login, refresh, logoutUser } from '../controllers/auth.controller';
import { env } from '../config/env';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Registrar nuevo usuario con email y contraseña
 * Rate limited: 5 intentos cada 15 minutos
 */
router.post('/register', authRateLimit, register);

/**
 * POST /api/auth/login
 * Login con email y contraseña
 * Rate limited: 5 intentos cada 15 minutos
 */
router.post('/login', authRateLimit, login);

/**
 * POST /api/auth/refresh
 * Renovar tokens usando refresh token
 * Rate limited: 5 intentos cada 15 minutos
 */
router.post('/refresh', authRateLimit, refresh);

/**
 * POST /api/auth/logout
 * Cerrar sesión (requiere autenticación)
 */
router.post('/logout', authenticate, logoutUser);

/**
 * Google OAuth routes - solo si está habilitado
 */
if (env.googleAuthEnabled) {
  /**
   * GET /api/auth/google
   * Obtener URL de autorización de Google
   */
  router.get('/google', getGoogleAuthUrl);

  /**
   * POST /api/auth/google
   * Login con token de Google
   */
  router.post('/google', googleAuth);

  /**
   * GET /api/auth/google/callback
   * Callback de OAuth (recibe código de autorización)
   */
  router.get('/google/callback', googleCallback);
} else {
  // Endpoint informativo cuando Google OAuth está deshabilitado
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Google OAuth is not configured on this server'
    });
  });

  router.post('/google', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Google OAuth is not configured on this server'
    });
  });
}

export default router;
