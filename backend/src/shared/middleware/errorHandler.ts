import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/index.js';

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Middleware centralizado de manejo de errores
 * Debe ser el último middleware registrado en Express
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[ERROR]', error);

  // Error conocido de la aplicación
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    } as ErrorResponse);
    return;
  }

  // Error de validación de Zod (si lo usamos)
  if (error.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      details: (error as any).errors,
    });
    return;
  }

  // Error desconocido
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  } as ErrorResponse);
};
