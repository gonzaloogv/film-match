import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors } from './interceptors';

/**
 * Obtiene la URL base de la API desde variables de entorno
 */
const getBaseURL = (): string => {
  const isDevelopment = !import.meta.env.PROD;
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (isDevelopment) {
    // En desarrollo, usar la URL del entorno o /api (proxy de Vite)
    return envBaseUrl || '/api';
  }

  // En producción, DEBE estar configurado en Vercel Dashboard
  if (!envBaseUrl) {
    console.error('❌ VITE_API_BASE_URL is not configured in Vercel!');
    console.error('Go to Vercel Dashboard → Settings → Environment Variables');
    console.error('Add: VITE_API_BASE_URL = https://film-match-backend.onrender.com/api');
    console.error('Then redeploy your application');
    // Fallback a la URL de producción conocida
    return 'https://film-match-backend.onrender.com/api';
  }

  return envBaseUrl;
};

/**
 * Obtiene el timeout configurado o usa 30 segundos por defecto
 */
const getTimeout = (): number => {
  const timeout = import.meta.env.VITE_API_TIMEOUT;
  return timeout ? Number(timeout) : 30000;
};

/**
 * Crea y configura la instancia de Axios
 *
 * Configuración:
 * - baseURL: URL del backend (desde .env)
 * - timeout: Máximo tiempo de espera por request
 * - headers: Headers por defecto (Content-Type, etc)
 * - withCredentials: false (usamos JWT en headers, no cookies)
 *
 * @returns Instancia configurada de Axios
 */
const createApiClient = (): AxiosInstance => {
  const baseURL = getBaseURL();
  const timeout = getTimeout();

  const config: AxiosRequestConfig = {
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: false, // No usar cookies, usamos JWT
  };

  console.log(`📡 API Client inicializado:`, {
    baseURL,
    timeout: `${timeout}ms`,
    environment: import.meta.env.PROD ? 'production' : 'development',
  });

  const client = axios.create(config);

  // Aplicar interceptors (request y response)
  setupInterceptors(client);

  return client;
};

/**
 * Instancia única del cliente HTTP para toda la aplicación
 * Exportada para uso en servicios y hooks
 */
export const apiClient = createApiClient();
