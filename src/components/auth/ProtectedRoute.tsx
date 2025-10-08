import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = true }: ProtectedRouteProps) => {
  const location = useLocation();

  // Development helper: allow bypassing auth when running locally to debug UI
  const isDev = import.meta.env.DEV;
  if (isDev) {
    // Log for visibility when debugging
    // eslint-disable-next-line no-console
    console.log('[ProtectedRoute] DEV bypass active — rendering children without auth');
    return <>{children}</>;
  }

  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;