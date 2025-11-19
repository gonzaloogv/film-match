import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

/**
 * Middleware de logging básico
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Capturar cuando se envía la respuesta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path;

    console.log(
      `[${new Date().toISOString()}] ${method} ${path} - ${statusCode} (${duration}ms)`
    );
  });

  next();
};

/**
 * Configuración de CORS
 */
export const corsOptions = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export * from './errorHandler.js';
