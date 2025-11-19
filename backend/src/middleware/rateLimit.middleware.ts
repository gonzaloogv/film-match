import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para endpoints de autenticación
 * Protege contra ataques de fuerza bruta
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: {
    success: false,
    error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter general para API
 * 100 requests por minuto
 */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter más estricto para operaciones sensibles
 * 10 intentos por hora
 */
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: {
    success: false,
    error: 'Has excedido el límite de intentos. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
