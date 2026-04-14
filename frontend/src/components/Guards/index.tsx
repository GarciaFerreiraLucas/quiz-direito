import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require any authenticated user (including guests).
 * Redirects to login if not authenticated at all.
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

interface RequireRoleProps {
  children: React.ReactNode;
  roles: UserRole[];
}

/**
 * Protects routes that require specific roles.
 * Redirects to dashboard if user doesn't have the required role.
 * Must be used inside PrivateRoute (assumes user is authenticated).
 */
export function RequireRole({ children, roles }: RequireRoleProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/**
 * Protects routes that require a registered user (not guest).
 * Redirects to dashboard if user is a guest.
 */
export function RegisteredOnly({ children }: { children: React.ReactNode }) {
  const { isGuest } = useAuth();

  if (isGuest) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
