/**
 * ProtectedRoute Component
 *
 * Envuelve rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/api';

/**
 * Props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Verifica si el usuario está autenticado antes de renderizar la ruta
 *
 * Uso:
 * <ProtectedRoute>
 *   <HomePage />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoadingUser } = useAuth();

  // Mostrar loading mientras verificamos autenticación
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar la ruta protegida
  return <>{children}</>;
};

export default ProtectedRoute;
