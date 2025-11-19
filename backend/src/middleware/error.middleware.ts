import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';

/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Middleware global de manejo de errores
 * DEBE ir al final de todos los middlewares
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log del error
  console.error('Error:', error);

  // Error operacional conocido
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }

  // Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, res);
  }

  // Error genérico (no exponer detalles en producción)
  return res.status(500).json({
    success: false,
    error: env.nodeEnv === 'production'
      ? 'Internal server error'
      : error.message
  });
}

/**
 * Maneja errores específicos de Prisma
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  res: Response
) {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'Resource already exists'
      });

    case 'P2025': // Record not found
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });

    case 'P2003': // Foreign key constraint
      return res.status(400).json({
        success: false,
        error: 'Invalid reference'
      });

    default:
      return res.status(500).json({
        success: false,
        error: 'Database error'
      });
  }
}

/**
 * Middleware para rutas no encontradas
 */
export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
}
