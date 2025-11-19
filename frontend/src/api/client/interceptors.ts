import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from '@/lib/auth/token-manager';
import { handleApiError, isAuthError } from '@/lib/utils/error-handler';

/**
 * Queue para requests pendientes durante un token refresh
 * Evita múltiples refresh requests simultanea
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error?: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Configura los interceptors de Axios
 *
 * Request Interceptor:
 * - Agrega el JWT token a cada request si existe
 * - Headers: Authorization: Bearer {token}
 *
 * Response Interceptor:
 * - Maneja errores
 * - Si 401 (token expirado), intenta renovarlo
 * - Si renewal falla, hace logout
 *
 * @param client - Instancia de Axios para aplicar interceptors
 */
export const setupInterceptors = (client: AxiosInstance): void => {
  /**
   * REQUEST INTERCEPTOR
   * Se ejecuta ANTES de enviar cada request
   */
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = TokenManager.getAccessToken();

      if (token && config.headers) {
        // Agregar token a headers
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      // Si hay error configurando el request, rechazar
      return Promise.reject(error);
    }
  );

  /**
   * RESPONSE INTERCEPTOR
   * Se ejecuta DESPUÉS de recibir la respuesta del servidor
   */
  client.interceptors.response.use(
    // Success - pasar response como está
    (response) => response,

    // Error - manejar según tipo
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Error 401: Token expirado o inválido
      // No intentar refresh si es el mismo endpoint de refresh (evita loop infinito)
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
        // Si ya estamos renovando, agregar este request a la queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => resolve(client(originalRequest)),
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('🔄 Token expirado, intentando renovar...');

          // Obtener refresh token
          const refreshToken = TokenManager.getRefreshToken();

          if (!refreshToken) {
            // No hay refresh token, hacer logout
            console.log('❌ No hay refresh token');
            TokenManager.clearTokens();
            // Redirigir a login
            window.location.href = '/login?expired=true';
            return Promise.reject(error);
          }

          // Llamar al endpoint de refresh token del backend
          const refreshResponse = await client.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            refreshResponse.data.data;

          // Guardar nuevos tokens
          TokenManager.setTokens(accessToken, newRefreshToken);

          console.log('✅ Token renovado exitosamente');

          // Agregar nuevo token al request original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Procesar queue de requests pendientes
          processQueue();

          // Reintentar request original con nuevo token
          return client(originalRequest);
        } catch (refreshError) {
          // Error al renovar token, hacer logout
          console.error('❌ Error renovando token:', refreshError);
          TokenManager.clearTokens();

          // Procesar queue con error
          processQueue(refreshError);

          // Redirigir a login
          window.location.href = '/login?error=token_refresh_failed';

          return Promise.reject(refreshError);
        }
      }

      // Otros errores: convertir a AppError estructurado
      const appError = handleApiError(error);

      // Si es error de auth, hacer logout
      if (isAuthError(appError)) {
        TokenManager.clearTokens();
        window.location.href = '/login?error=unauthorized';
      }

      // Si es error de red, loguear para debugging
      if (appError.code === 'NETWORK_ERROR') {
        console.warn('⚠️  Network error:', appError.message);
      }

      return Promise.reject(appError);
    }
  );
};
