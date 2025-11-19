import { AxiosError } from 'axios';

/**
 * Interface estándar para errores de API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

/**
 * Clase personalizada de errores de aplicación
 * Extiende Error para compatibilidad con try/catch
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';

    // Mantener la cadena de prototipos correcta para instanceof
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Convierte un error de Axios en AppError
 *
 * Casos:
 * 1. El servidor respondió con error (4xx, 5xx)
 * 2. Request fue enviado pero no hay respuesta (network error)
 * 3. Error en la configuración del request
 *
 * @param error - Error de Axios
 * @returns AppError con detalles estructurados
 */
export const handleApiError = (error: AxiosError): AppError => {
  // Caso 1: El servidor respondió con error
  if (error.response) {
    const data = error.response.data as any;

    // Backend returns { success: false, error: "message" }
    const errorMessage = data?.error || data?.message || 'An error occurred on the server';

    return new AppError(
      data?.code || 'SERVER_ERROR',
      errorMessage,
      error.response.status,
      data?.details
    );
  }

  // Caso 2: Request enviado pero sin respuesta (network error)
  if (error.request) {
    return new AppError(
      'NETWORK_ERROR',
      'Unable to connect to server. Please check your internet connection.',
      0
    );
  }

  // Caso 3: Error en la configuración
  return new AppError(
    'REQUEST_ERROR',
    error.message || 'An error occurred while processing your request',
    0
  );
};

/**
 * Obtiene un mensaje de error amigable para mostrar al usuario
 *
 * @param error - Error desconocido
 * @returns String con el mensaje de error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Determina si un error es de autenticación (401)
 * Usado para hacer logout automático
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.statusCode === 401;
  }
  return false;
};

/**
 * Determina si un error es de red
 * Usado para mostrar mensajes de retry
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.code === 'NETWORK_ERROR';
  }
  return false;
};

/**
 * Determina si se debe reintentar la request
 * No reintentar en: 401, 403, 404, 422 (problemas del cliente)
 */
export const shouldRetry = (error: unknown): boolean => {
  if (error instanceof AppError) {
    const status = error.statusCode;
    const NO_RETRY_STATUSES = [401, 403, 404, 422];
    return !NO_RETRY_STATUSES.includes(status || 0);
  }
  return true;
};
